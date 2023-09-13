import { ENEMY_HALF_WIDTH } from 'commonConstantsWithClient';
import type { BulletModel, EnemyModel, PlayerModel } from 'commonTypesWithClient/models';
import { useCallback, useEffect, useState } from 'react';
import { apiClient } from 'src/utils/apiClient';
import { computePosition } from 'src/utils/computePosition';
import { usePerformanceTimer } from './useTimer';

export const useGame = ({ displayPosition }: { displayPosition: number | null }) => {
  //ANCHOR - state
  const [players, setPlayers] = useState<PlayerModel[]>([]);
  const [enemies, setEnemies] = useState<EnemyModel[]>([]);
  const [bullets, setBullets] = useState<BulletModel[]>([]);

  const [isFetch, setIsFetch] = useState(true);

  //TODO: もし、これ以外のエフェクトを追加する場合は、それぞれのエフェクトを区別する型を作成する
  const [effectPosition, setEffectPosition] = useState<number[][][]>([[[]]]);

  const { startTime, endTime, start, end } = usePerformanceTimer();
  
  const {
    startTime: startTime2,
    endTime: endTime2,
    start: start2,
    end: end2,
  } = usePerformanceTimer();

  const {
    startTime: startTime3,
    endTime: endTime3,
    start: start3,
    end: end3,
  } = usePerformanceTimer();

  const {
    startTime: startTime4,
    endTime: endTime4,
    start: start4,
    end: end4,
  } = usePerformanceTimer();

  const {
    startTime: startTime5,
    endTime: endTime5,
    start: start5,
    end: end5,
  } = usePerformanceTimer();

  //ANCHOR - fetch
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
    const newEffectPosition = killedEnemies.map((enemy) => {
      const pos = computePosition(enemy.createdPos, enemy.createdAt, enemy.direction);
      return [pos.x - ENEMY_HALF_WIDTH, pos.y - ENEMY_HALF_WIDTH];
    });
    setEffectPosition((prev) => [...prev.slice(-5), newEffectPosition]);
    end3();

    setEnemies(res);

    end2();
  }, [end2, start2, start3, end3, enemies]);

  const fetchBullets = useCallback(async () => {
    start5();

    const res = await apiClient.bullet.$get({
      query: { displayNumber: Number(displayPosition) },
    });

    setBullets(res);

    end5();
  }, [displayPosition, end5, start5]);

  //ANCHOR - effect
  useEffect(() => {
    if (!isFetch) return;
    start();

    const cancelId = requestAnimationFrame(async () => {
      await Promise.all([fetchPlayers(), fetchEnemies(), fetchBullets()]).then(() => end());
    });

    return () => cancelAnimationFrame(cancelId);
  }, [fetchBullets, fetchEnemies, fetchPlayers, end, start, isFetch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setEffectPosition((prev) => prev.slice(1));
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [effectPosition]);

  //ANCHOR - function
  const time1 = startTime - endTime;
  const time2 = startTime2 - endTime2;
  const time3 = startTime3 - endTime3;
  const time4 = startTime4 - endTime4;
  const time5 = startTime5 - endTime5;

  if (time1 > 1000 && isFetch) {
    console.log('a');
    setIsFetch(false);

    setTimeout(() => setIsFetch(true), 1000);
  }

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
