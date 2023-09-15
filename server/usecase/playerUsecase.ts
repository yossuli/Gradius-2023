import { randomUUID } from 'crypto';
import { DISPLAY_COUNT, SCREEN_HEIGHT, SCREEN_WIDTH } from '../commonConstantsWithClient';
import type { UserId } from '../commonTypesWithClient/branded';
import type { MoveDirection, PlayerModel } from '../commonTypesWithClient/models';
import { playerRepository } from '../repository/playerRepository';
import { userIdParser } from '../service/idParsers';

type TimeModel = {
  userId: UserId;
  baseTime: null | number;
};

const updateIntervalId: NodeJS.Timeout[] = [];

const PLAYER_UPDATE_INTERVAL = 100;

const baseTimes: TimeModel[] = [];

const diffToBaseTime = (userId: UserId) =>
  Math.floor(
    (Date.now() -
      (baseTimes.find((baseTime) => (baseTime.userId = userId))?.baseTime ?? Date.now())) /
      1000
  );

export const playerUseCase = {
  init: () => {
    updateIntervalId.push(
      setInterval(() => {
        playerUseCase.update();
      }, PLAYER_UPDATE_INTERVAL)
    );
  },

  stop: () => {
    if (updateIntervalId.length > 0) {
      updateIntervalId.forEach(clearInterval);
    }
  },

  update: async () => {
    const currentPlayers = await playerRepository.findAll();
    await Promise.all(
      currentPlayers.map((player) => {
        const newPlayer: PlayerModel = {
          ...player,
          pos: {
            ...player.pos,
            x: Math.max(
              10 * diffToBaseTime(player.id) - 150,
              Math.min(10 * diffToBaseTime(player.id) + 150, player.pos.x)
            ),
          },
        };
        return playerRepository.save(newPlayer);
      })
    );
  },

  create: async (name: string): Promise<PlayerModel> => {
    const [leftCount, rightCount] = await Promise.all([
      playerRepository.countInSide('left'),
      playerRepository.countInSide('right'),
    ]);
    const side = 'left';
    // leftCount <= rightCount ? 'left' : 'right';
    const x = side === 'left' ? 50 : SCREEN_WIDTH * DISPLAY_COUNT - 50;

    const playerData: PlayerModel = {
      id: userIdParser.parse(randomUUID()),
      pos: { x, y: SCREEN_HEIGHT / 2 },
      name,
      score: 0,
      Items: [],
      side,
      isPlaying: true,
    };

    return await playerRepository.save(playerData);
  },

  move: async (moveDirection: MoveDirection, userId: UserId): Promise<PlayerModel | null> => {
    if (!baseTimes.map((timeModel) => timeModel.userId).includes(userId)) {
      baseTimes.push({ userId, baseTime: Date.now() });
    }

    const isOutOfDisplay = (
      pos: { x: number; y: number },
      side: 'left' | 'right',
      displayNumber: number
    ) => {
      const terms = [
        side === 'left' && pos.x >= SCREEN_WIDTH * displayNumber,
        side === 'right' && pos.x <= 0,
      ];
      return terms.some(Boolean);
    };

    const currentPlayer = await playerRepository.find(userId);
    if (currentPlayer === null) return null;

    const newPos = {
      x: Math.max(
        10 * diffToBaseTime(userId) - 150,
        Math.min(
          10 * diffToBaseTime(userId) + 150,
          Math.min(
            Math.max(currentPlayer.pos.x + moveDirection.x * 5, 0),
            SCREEN_WIDTH * DISPLAY_COUNT
          )
        )
      ),
      y: Math.min(Math.max(currentPlayer.pos.y + moveDirection.y * 5, 0), SCREEN_HEIGHT),
    };

    if (isOutOfDisplay(newPos, currentPlayer.side, DISPLAY_COUNT)) {
      await playerUseCase.finishGame(currentPlayer);
      return null;
    }
    const updatePlayerInfo: PlayerModel = {
      ...currentPlayer,
      pos: newPos,
    };

    return await playerRepository.save(updatePlayerInfo);
  },

  addScore: async (userId: UserId, score: number): Promise<PlayerModel | null> => {
    const currentPlayer = await playerRepository.find(userId);
    if (currentPlayer === null) return null;

    return await playerRepository.saveScore(userId, currentPlayer.score + score);
  },

  finishGame: async (currentPlayerInfo: PlayerModel) => {
    const updatePlayerInfo: PlayerModel = {
      ...currentPlayerInfo,
      isPlaying: false,
    };

    return await playerRepository.save(updatePlayerInfo);
  },

  getPlayersByDisplay: async (displayNumber: number) => {
    const isInDisplay = (posX: number, displayNumber: number) => {
      return Math.floor(posX / SCREEN_WIDTH) === displayNumber;
    };
    const players = await playerRepository.findAll();

    const playersInDisplay = players.filter((player) => {
      return isInDisplay(player.pos.x, displayNumber) && player.isPlaying;
    });

    return playersInDisplay;
  },
};
