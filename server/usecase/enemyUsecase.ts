import type { EnemyModel } from '$/commonTypesWithClient/models';
import { enemyRepository } from '$/repository/enemyRepository';
import { enemyIdParser } from '$/service/idParsers';
import { randomUUID } from 'crypto';

let intervalId: NodeJS.Timeout | null = null;
export const enemyUsecase = {
  init: () => {
    intervalId = setInterval(() => {
      enemyUsecase.update();
    }, 500);
  },
  stop: () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  },
  create: async (): Promise<EnemyModel | null> => {
    const enemyData: EnemyModel = {
      enemyId: enemyIdParser.parse(randomUUID()),
      pos: { x: 1000, y: 300 },
      score: 100,
      vector: { x: 5, y: 5 },
      type: 0,
    };
    await enemyRepository.save(enemyData);
    return enemyData;
  },
  findAll: async (): Promise<EnemyModel[]> => {
    const enemies = await enemyRepository.findAll();
    return enemies.length > 0 ? enemies : [];
  },
  move: async (enemyModel: EnemyModel): Promise<EnemyModel | null> => {
    const currentEnemyInfo = await enemyRepository.find(enemyModel.enemyId);
    if (currentEnemyInfo === null) return null;
    const updateEnemyInfo: EnemyModel = {
      ...currentEnemyInfo,
      pos: {
        x: currentEnemyInfo.pos.x - currentEnemyInfo.vector.x,
        y: currentEnemyInfo.pos.y,
      },
    };
    await enemyRepository.save(updateEnemyInfo);
    return updateEnemyInfo;
  },
  delete: async (enemyModel: EnemyModel): Promise<EnemyModel | null> => {
    const currentEnemyInfo = await enemyRepository.find(enemyModel.enemyId);
    if (currentEnemyInfo === null) return null;
    await enemyRepository.delete(enemyModel.enemyId);
    return currentEnemyInfo;
  },
  update: async () => {
    const currentEnemyInfos = await enemyRepository.findAll();
    const promises = currentEnemyInfos.map((enemy) => {
      if (enemy.pos.x > 1920 || enemy.pos.y < 0) {
        return enemyUsecase.delete(enemy);
      } else {
        return enemyUsecase.move(enemy);
      }
    });
    await Promise.all(promises);
  },
};
