import { SCREEN_HEIGHT, SCREEN_WIDTH } from 'commonConstantsWithClient';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Image, Layer, Stage } from 'react-konva';
import Boom from 'src/components/Effect/Boom';
import { Bullet } from 'src/components/Entity/Bullet';
import { Enemy } from 'src/components/Entity/Enemy';
import { Player } from 'src/components/Entity/Player';
import { Traffic } from 'src/components/traffic/traffic';
import { useGame } from 'src/hooks/useGame';
import { staticPath } from 'src/utils/$path';
import { apiClient } from 'src/utils/apiClient';
import useImage from 'use-image';
import styles from './index.module.css';

type WindowSize = {
  width: number;
  height: number;
};

const Game = () => {
  const router = useRouter();
  let displayPosition: number | null = null;
  if (typeof router.query.displayPosition === 'string') {
    const parsed = Number(router.query.displayPosition);
    if (!isNaN(parsed)) {
      displayPosition = parsed;
    }
  }
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [backgroundImage] = useImage(staticPath.images.odaiba_jpg);

  const { bullets, players, enemies, effectPosition, time1, time2, time3, time4, time5 } = useGame({
    displayPosition,
  });

  useEffect(() => {
    const redirectToLobby = async () => {
      const res = await apiClient.config.$get();
      if (Number(displayPosition) >= (res ?? 1)) {
        router.push('/game');
      }
    };
    redirectToLobby();
  }, [router, displayPosition]);

  useEffect(() => {
    const set = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', set);
    return () => window.removeEventListener('resize', set);
  }, []);

  return (
    <div className={styles.canvasContainer}>
      <Traffic traffic={time1} left={0} length={20} text="BEとの通信" />
      <Traffic traffic={time4} left={200} length={20} text="fetch player" />
      <Traffic traffic={time5} left={400} length={20} text="fetch bullet" />
      <Traffic traffic={time2} left={600} length={20} text="fetch enemies" />
      <Traffic traffic={time3} left={800} length={20} text="爆発エフェクト計算" />
      <Stage
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        style={{
          transform: `
              scale(${windowSize.width / SCREEN_WIDTH}, ${windowSize.height / SCREEN_HEIGHT})
              translateX(${(windowSize.width - SCREEN_WIDTH) / 2}px)
              translateY(${(windowSize.height - SCREEN_HEIGHT) / 2}px)
              `,
        }}
      >
        <Layer>
          <Image
            image={backgroundImage}
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            x={0}
            y={0}
            opacity={0.8}
          />
        </Layer>
        <Layer>
          {bullets.map((bullet) => (
            <Bullet displayPosition={displayPosition ?? 0} bullet={bullet} key={bullet.id} />
          ))}
        </Layer>
        <Layer>
          {players.map((player) => (
            <Player displayPosition={displayPosition ?? 0} player={player} key={player.id} />
          ))}
        </Layer>
        <Layer>
          {enemies.map((enemy) => (
            <Enemy displayPosition={displayPosition ?? 0} enemy={enemy} key={enemy.id} />
          ))}
        </Layer>
        <Layer>
          {effectPosition.flat().map((position, index) => (
            <Boom displayPosition={displayPosition ?? 0} position={position} key={index} />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Game;
