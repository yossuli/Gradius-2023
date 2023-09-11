import { ENEMY_HALF_WIDTH } from 'commonConstantsWithClient';
import type { BulletModel, EnemyModel, PlayerModel } from 'commonTypesWithClient/models';
import { useCallback, useEffect, useState } from 'react';
import { staticPath } from 'src/utils/$path';
import { apiClient } from 'src/utils/apiClient';
import { computePosition } from 'src/utils/computePosition';
import {
  usePerformanceTimer,
  usePerformanceTimer2,
  usePerformanceTimer3,
  usePerformanceTimer4,
  usePerformanceTimer5,
} from './useTimer';

export const useGame = ({ displayPosition }: { displayPosition: number | null }) => {
  const [players, setPlayers] = useState<PlayerModel[]>([]);
  const [enemies, setEnemies] = useState<EnemyModel[]>([]);
  const [bullets, setBullets] = useState<BulletModel[]>([]);
  //TODO: もし、これ以外のエフェクトを追加する場合は、それぞれのエフェクトを区別する型を作成する
  const [effectPosition, setEffectPosition] = useState<number[][]>([]);

  const { startTime, endTime, start, end } = usePerformanceTimer();
  const { startTime2, endTime2, start2, end2 } = usePerformanceTimer2();
  const { startTime3, endTime3, start3, end3 } = usePerformanceTimer3();
  const { startTime4, endTime4, start4, end4 } = usePerformanceTimer4();
  const { startTime5, endTime5, start5, end5 } = usePerformanceTimer5();

  const fetchPlayers = useCallback(async () => {
    start4();
    const res = await apiClient.player.$get({
      query: { displayNumber: Number(displayPosition) },
    });

    setPlayers(res);

    end4();
  }, [start4, end4, displayPosition]);

  const fetchEnemies = useCallback(async () => {
    start2();

    const res = await apiClient.enemy.$get();

    start3();

    const killedEnemies = enemies.filter((enemy) => !res.some((e) => e.id === enemy.id));
    if (killedEnemies.length > 0) {
      killedEnemies.forEach((enemy) => {
        const pos = computePosition(enemy.createdPos, enemy.createdAt, enemy.direction);
        setEffectPosition((prev) => [
          ...prev,
          [pos.x - ENEMY_HALF_WIDTH, pos.y - ENEMY_HALF_WIDTH],
        ]);
      });
    }

    end3();

    setEnemies(res);

    end2();
  }, [end2, start2, start3, end3, enemies]);

  const fetchBullets = useCallback(async () => {
    start5();

    const res = await apiClient.bullet.$get({
      query: { displayNumber: Number(displayPosition) },
    });
    if (res.length > bullets.length) {
      const audio = new Audio(staticPath.sounds.shot_mp3);
      audio.play();
    }

    setBullets(res);

    end5();
  }, [bullets.length, displayPosition, end5, start5]);

  useEffect(() => {
    start();

    const cancelId = requestAnimationFrame(async () => {
      await Promise.all([fetchPlayers(), fetchEnemies(), fetchBullets()]).then(() => end());
    });
    return () => cancelAnimationFrame(cancelId);
  }, [fetchBullets, fetchEnemies, fetchPlayers, end, start]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setEffectPosition((prev) => prev.slice(1));
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [effectPosition]);

  const time1 = startTime - endTime;
  const time2 = startTime2 - endTime2;
  const time3 = startTime3 - endTime3;
  const time4 = startTime4 - endTime4;
  const time5 = startTime5 - endTime5;
  return {
    bullets,
    players,
    enemies,
    effectPosition,
    displayPosition,
    time1,
    time2,
    time3,
    time4,
    time5,
  };
};
