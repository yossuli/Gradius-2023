import { useEffect, useMemo, useState } from 'react';
import { Joystick } from 'react-joystick-component';
import GameClear from 'src/components/GameClear/GameClear';
import { Traffic } from 'src/components/traffic/traffic';
import { useController } from 'src/hooks/useController';
import { logoutWithLocalStorage } from 'src/utils/loginWithLocalStorage';
import styles from './index.module.css';

const Home = () => {
  //ANCHOR - state
  const [windowsize, setWindowsize] = useState<{ width: number; height: number }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  //ANCHOR -hooks
  const {
    playerStatus,
    startMove,
    handleMove,
    stopMove,
    startShoot,
    stopShoot,
    time1,
    time2,
    time3,
  } = useController();

  //ANCHOR - memo
  const joystickSize = useMemo(() => {
    const aspectRatio = windowsize.width / windowsize.height;
    if (aspectRatio > 3 / 4) {
      return Math.min(windowsize.height, windowsize.width) * 0.5;
    } else {
      return windowsize.width * 0.5 * 0.64;
    }
  }, [windowsize]);

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

  //ANCHOR - earlyReturn
  if (!(playerStatus?.isPlaying ?? true)) return <GameClear />;

  const logout = () => {
    alert('ログアウトします');
    logoutWithLocalStorage();
  };

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
