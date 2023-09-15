import { diffToBaseTimeSec } from '$/service/diffToBaseTimeSec';
import { maxMin } from '$/service/maxMin';
import { sideToDirectionX } from '$/service/sideToDirectionX';
import { randomUUID } from 'crypto';
import { DISPLAY_COUNT, SCREEN_HEIGHT, SCREEN_WIDTH } from '../commonConstantsWithClient';
import type { UserId } from '../commonTypesWithClient/branded';
import type { PlayerModel, TimeModel } from '../commonTypesWithClient/models';
import { playerRepository } from '../repository/playerRepository';
import { userIdParser } from '../service/idParsers';

export type MoveDirection = { x: number; y: number };

export const baseTimes: TimeModel[] = [];

export const ALLOW_MOVE_HALF_WIDTH = 300;

export const ALLOW_MOVE_SPEED = 5;

export const playerUseCase = {
  create: async (name: string): Promise<PlayerModel> => {
    const [leftCount, rightCount] = await Promise.all([
      playerRepository.countInSide('left'),
      playerRepository.countInSide('right'),
    ]);
    const side =
      // leftCount <= rightCount ?
      'left';
    //  : 'right';
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

    const currentPlayer = await playerRepository.find(userId);
    if (currentPlayer === null) return null;

    const newPos = {
      x: maxMin(
        ALLOW_MOVE_HALF_WIDTH +
          SCREEN_WIDTH * DISPLAY_COUNT * -Math.min(0, sideToDirectionX(currentPlayer.side)) +
          diffToBaseTimeSec(currentPlayer.id, baseTimes) *
            50 *
            sideToDirectionX(currentPlayer.side),
        -ALLOW_MOVE_HALF_WIDTH +
          SCREEN_WIDTH * DISPLAY_COUNT * -Math.min(0, sideToDirectionX(currentPlayer.side)) +
          diffToBaseTimeSec(currentPlayer.id, baseTimes) *
            50 *
            sideToDirectionX(currentPlayer.side),
        Math.min(
          Math.max(currentPlayer.pos.x + moveDirection.x * ALLOW_MOVE_SPEED, 0),
          SCREEN_WIDTH * DISPLAY_COUNT
        )
      ),

      y: Math.min(
        Math.max(currentPlayer.pos.y + moveDirection.y * ALLOW_MOVE_SPEED, 0),
        SCREEN_HEIGHT
      ),
    };

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

  getPlayersByDisplay: async (displayNumber?: number) => {
    const isOutOfGameDisplay = (
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

    const isInThisDisplay = (posX: number, displayNumber: number) => {
      return Math.floor(posX / SCREEN_WIDTH) === displayNumber;
    };

    const players = await playerRepository.findAll();

    const diffToBaseTime = (userId: UserId) =>
      Math.floor(
        (Date.now() -
          (baseTimes.find((baseTime) => (baseTime.userId = userId))?.baseTime ?? Date.now())) /
          20
      );

    const computeScroll = (player: PlayerModel) => {
      if (player.isPlaying === false) return player;
      const newPlayer = {
        ...player,
        pos: {
          ...player.pos,
          x: maxMin(
            ALLOW_MOVE_HALF_WIDTH +
              SCREEN_WIDTH * DISPLAY_COUNT * -Math.min(0, sideToDirectionX(player.side)) +
              diffToBaseTime(player.id) * sideToDirectionX(player.side),
            -ALLOW_MOVE_HALF_WIDTH +
              SCREEN_WIDTH * DISPLAY_COUNT * -Math.min(0, sideToDirectionX(player.side)) +
              diffToBaseTime(player.id) * sideToDirectionX(player.side),
            player.pos.x
          ),
        },
      };
      return newPlayer;
    };

    const playersInDisplay = players.reduce((prev, curr) => {
      if (
        curr.isPlaying === false &&
        displayNumber !== undefined &&
        !isInThisDisplay(curr.pos.x, displayNumber)
      )
        return [...prev];

      const newPlayer = computeScroll(curr);

      if (isOutOfGameDisplay(newPlayer.pos, newPlayer.side, DISPLAY_COUNT)) {
        playerUseCase.finishGame(curr);
        return [...prev];
      }
      return [...prev, newPlayer];
    }, [] as PlayerModel[]);

    return playersInDisplay;
  },
};
