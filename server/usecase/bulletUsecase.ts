import {
  DISPLAY_COUNT,
  PLAYER_HALF_WIDTH,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from '$/commonConstantsWithClient';
import type { UserId } from '$/commonTypesWithClient/branded';
import { bulletRepository } from '$/repository/bulletRepository';
import { playerRepository } from '$/repository/playerRepository';
import { computePosition } from '$/service/computePositions';
import { diffToBaseTimeSec } from '$/service/diffToBaseTimeSec';
import { entityChangeWithPos } from '$/service/entityChangeWithPos';
import { bulletIdParser } from '$/service/idParsers';
import { maxMin } from '$/service/maxMin';
import { sideToDirectionX } from '$/service/sideToDirectionX';
import { randomUUID } from 'crypto';
import type { BulletModel, BulletModelWithPos } from '../commonTypesWithClient/models';
import { ALLOW_MOVE_HALF_WIDTH, baseTimes } from './playerUsecase';

let intervalId: NodeJS.Timeout | null = null;
const BULLET_UPDATE_INTERVAL = 25;

export const bulletUseCase = {
  init: () => {
    intervalId = setInterval(() => {
      bulletUseCase.update();
    }, BULLET_UPDATE_INTERVAL);
  },

  stop: () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  },

  create: async (shooterId: UserId): Promise<BulletModel | null> => {
    const shooterInfo = await playerRepository.find(shooterId);
    if (shooterInfo === null) return null;

    const newBullet: BulletModel = {
      id: bulletIdParser.parse(randomUUID()),
      direction: {
        x: sideToDirectionX(shooterInfo.side),
        y: 0,
      },
      createdPos: {
        x:
          maxMin(
            ALLOW_MOVE_HALF_WIDTH +
              SCREEN_WIDTH * DISPLAY_COUNT * -Math.min(0, sideToDirectionX(shooterInfo.side)) +
              diffToBaseTimeSec(shooterInfo.id, baseTimes) *
                50 *
                sideToDirectionX(shooterInfo.side),
            -ALLOW_MOVE_HALF_WIDTH +
              SCREEN_WIDTH * DISPLAY_COUNT * -Math.min(0, sideToDirectionX(shooterInfo.side)) +
              diffToBaseTimeSec(shooterInfo.id, baseTimes) *
                50 *
                sideToDirectionX(shooterInfo.side),
            shooterInfo.pos.x
          ) +
          PLAYER_HALF_WIDTH * sideToDirectionX(shooterInfo.side),
        y: shooterInfo.pos.y,
      },
      createdAt: Date.now(),
      side: shooterInfo.side,
      shooterId,
    };

    return await bulletRepository.create(newBullet);
  },

  delete: async (bulletModel: BulletModel) => {
    await bulletRepository.delete(bulletModel.id);
  },

  update: async () => {
    const currentBulletList = await bulletRepository.findAll();

    const outOfDisplay = (pos: { x: number; y: number }) => {
      const terms = [
        pos.x < 0,
        pos.y < 0,
        pos.x > DISPLAY_COUNT * SCREEN_WIDTH,
        pos.y > SCREEN_HEIGHT,
      ];

      return terms.some(Boolean);
    };

    await Promise.all(
      currentBulletList
        .filter((bullet) => {
          const pos = computePosition(bullet);
          return outOfDisplay(pos);
        })
        .map(bulletUseCase.delete)
    );
  },

  getBulletsByDisplay: async (displayNumber: number): Promise<BulletModelWithPos[]> => {
    const bullets = await bulletRepository.findAll();

    const getBulletsByDisplay = bullets.map(entityChangeWithPos).filter((bullet) => {
      return Math.floor(bullet.pos.x / SCREEN_WIDTH) === displayNumber;
    }) as BulletModelWithPos[];

    return getBulletsByDisplay;
  },
};
