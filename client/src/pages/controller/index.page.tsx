import type { UserId } from 'commonTypesWithClient/branded';
import type { PlayerModel } from 'commonTypesWithClient/models';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Joystick } from 'react-joystick-component';
import GameClear from 'src/components/GameClear/GameClear';
import { Traffic } from 'src/components/traffic/traffic';
import { useController } from 'src/hooks/useController';
import { usePerformanceTimer } from 'src/hooks/useTimer';
import { apiClient } from 'src/utils/apiClient';
import { getUserIdFromLocalStorage, logoutWithLocalStorage } from 'src/utils/loginWithLocalStorage';
import styles from './index.module.css';

const Home = () => {
  //ANCHOR - state
  const [userId, setUserId] = useState<UserId>('' as UserId);
  const [playerStatus, setPlayerStatus] = useState<PlayerModel>();

  const { startTime, endTime, start, end } = usePerformanceTimer();

  const [windowsize, setWindowsize] = useState<{ width: number; height: number }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const joystickSize = useMemo(() => {
    const aspectRatio = windowsize.width / windowsize.height;
    if (aspectRatio > 3 / 4) {
      return Math.min(windowsize.height, windowsize.width) * 0.5;
    } else {
      return windowsize.width * 0.5 * 0.64;
    }
  }, [windowsize]);

  const router = useRouter();

  //ANCHOR - player
  const getUserId = useCallback(async () => {
    const localStorageUserId = getUserIdFromLocalStorage();
    console.log('a');
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

  //ANCHOR - effect
  useEffect(() => {
    const handleResize = () => {
      setWindowsize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    document.body.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );
    document.body.addEventListener(
      'touchmove',
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );

    return () => {
      document.body.removeEventListener('touchstart', (e) => {
        e.preventDefault();
      });
      document.body.removeEventListener('touchmove', (e) => {
        e.preventDefault();
      });
    };
  }, []);

  useEffect(() => {
    const userIdIntervalId = setInterval(() => {
      getUserId();
    }, 2000);

    const playerStatusIntervalId = setInterval(() => {
      fetchPlayerStatus();
    }, 500);

    return () => {
      clearInterval(userIdIntervalId);
      clearInterval(playerStatusIntervalId);
    };
  }, [getUserId, fetchPlayerStatus]);

  //ANCHOR - hooks
  const { startMove, handleMove, stopMove, startShoot, stopShoot, time2, time3 } =
    useController(userId);

  if (!(playerStatus?.isPlaying ?? true)) return <GameClear />;

  const logout = () => {
    alert('ログアウトします');
    logoutWithLocalStorage();
  };

  const time1 = startTime - endTime;

  console.log('user', userId);
  return (
    <div className={styles.controller}>
      <Traffic
        traffic={time1}
        text="player"
        left={0}
        length={10}
        isTimeDisplay={true}
        zIndex={-1}
      />
      <Traffic
        traffic={time2}
        text="shoot"
        left={100}
        length={10}
        isTimeDisplay={true}
        zIndex={-1}
      />
      <Traffic
        traffic={time3}
        text="move"
        left={200}
        length={10}
        isTimeDisplay={true}
        zIndex={-1}
      />
      <div className={styles.joystick}>
        <Joystick
          size={joystickSize}
          baseColor="#eee"
          stickColor="#d7d7d7"
          start={startMove}
          move={handleMove}
          stop={stopMove}
        />
      </div>
      <div>
        <p>Score: {playerStatus?.score ?? '-'}</p>
        <button className={styles.logout} onClick={logout} onTouchStartCapture={logout}>
          logout
        </button>
      </div>
      <button
        className={styles.button}
        onTouchStart={startShoot}
        onTouchEnd={stopShoot}
        onTouchCancel={stopShoot}
        onMouseDown={startShoot}
        onMouseUp={stopShoot}
        onMouseLeave={stopShoot}
      >
        <div>🚀</div>
      </button>
    </div>
  );
};

export default Home;
