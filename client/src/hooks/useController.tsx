import type { UserId } from 'commonTypesWithClient/branded';
import type { PlayerModel } from 'commonTypesWithClient/models';
import { useRouter } from 'next/router';
import type { MouseEvent, TouchEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { IJoystickUpdateEvent } from 'react-joystick-component/build/lib/Joystick';
import styles from 'src/pages/controller/index.module.css';
import { staticPath } from 'src/utils/$path';
import { apiClient } from 'src/utils/apiClient';
import { getUserIdFromLocalStorage } from 'src/utils/loginWithLocalStorage';
import { usePerformanceTimer } from './useTimer';

type MoveTo = {
  x: number;
  y: number;
};

export const useController = () => {
  //ANCHOR - state
  const [userId, setUserId] = useState<UserId>('' as UserId);
  const [playerStatus, setPlayerStatus] = useState<PlayerModel>();

  const [moveIntervalId, setMoveIntervalId] = useState<NodeJS.Timeout[]>([]);
  const moveDirection = useRef<MoveTo>({ x: 0, y: 0 });

  const [shootIntervalId, setShootIntervalId] = useState<NodeJS.Timeout[]>([]);

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

  const router = useRouter();

  //ANCHOR - constants
  const MOVE_INTERVAL_TIME = 20;
  const SHOOT_INTERVAL_TIME = 50;

  //ANCHOR - player
  const getUserId = useCallback(async () => {
    const localStorageUserId = getUserIdFromLocalStorage();
    if (!(playerStatus?.isPlaying ?? true)) return;
    if (localStorageUserId === null) {
      alert('ログインがまだ行われておりません');
      return router.push('/login');
    }
    setUserId(localStorageUserId);
  }, [router, playerStatus?.isPlaying]);

  const fetchPlayerStatus = useCallback(async () => {
    start();
    const res = await apiClient.player.control.$get({ query: { userId } });
    end();
    if (res === null) return;
    setPlayerStatus(res);
  }, [userId, start, end]);

  //ANCHOR - shoot
  const startShoot = async (e: TouchEvent<HTMLButtonElement> | MouseEvent<HTMLButtonElement>) => {
    const target = e.target as HTMLElement;
    const button = target.tagName === 'BUTTON' ? target : target.parentElement;
    button?.classList.add(styles.buttonActive);

    start2();
    const shootIntervalId = setInterval(async () => {
      await apiClient.bullet
        .$post({
          body: {
            userId,
          },
        })
        .then(() => end2());

      const audio = new Audio(staticPath.sounds.shot_mp3);
      audio.play();
    }, SHOOT_INTERVAL_TIME);
    setShootIntervalId((prev) => [...prev, shootIntervalId]);
  };

  const stopShoot = (e: TouchEvent<HTMLButtonElement> | MouseEvent<HTMLButtonElement>) => {
    const target = e.target as HTMLElement;
    const button = target.tagName === 'BUTTON' ? target : target.parentElement;
    button?.classList.remove(styles.buttonActive);

    shootIntervalId.forEach((id) => clearInterval(id));
    setShootIntervalId([]);
  };

  //ANCHOR - move
  const handleMove = (e: IJoystickUpdateEvent) => {
    moveDirection.current = {
      x: e.x ?? 0,
      y: (e.y ?? 0) * -1,
    };
  };

  const startMove = () => {
    start3();
    const moveIntervalId = setInterval(async () => {
      await apiClient.player.control
        .$post({
          body: {
            userId,
            MoveDirection: moveDirection.current,
          },
        })
        .then(() => end3());
    }, MOVE_INTERVAL_TIME);
    setMoveIntervalId((prev) => [...prev, moveIntervalId]);
  };

  const stopMove = () => {
    moveDirection.current = { x: 0, y: 0 };
    moveIntervalId.forEach((id) => clearInterval(id));
    setMoveIntervalId([]);
  };

  //ANCHOR - effect
  useEffect(() => {
    const playerStatusIntervalId = setInterval(() => {
      fetchPlayerStatus();
    }, 500);

    return () => {
      clearInterval(playerStatusIntervalId);
    };
  }, [fetchPlayerStatus]);

  useEffect(() => {
    const userIdIntervalId = setInterval(() => {
      getUserId();
    }, 2000);

    return () => {
      clearInterval(userIdIntervalId);
    };
  }, [getUserId]);

  const time1 = startTime - endTime;
  const time2 = startTime2 - endTime2;
  const time3 = startTime3 - endTime3;
  console.log(userId);
  //ANCHOR - return
  return {
    playerStatus,
    startMove,
    handleMove,
    stopMove,
    startShoot,
    stopShoot,
    time1,
    time2,
    time3,
  };
};
