import { useCallback, useEffect, useState } from 'react';
import { hslToHex } from 'src/utils/hueToRGB';
import styles from './traffic.module.css';

type props = {
  traffic: number | undefined;
  left: number;
  length: number;
  text: string;
  zIndex?: number;
  isTimeDisplay?: boolean;
};

export const Traffic = ({
  traffic,
  left,
  length,
  text,
  zIndex = 99,
  isTimeDisplay = true,
}: props) => {
  const [traffics, setTraffics] = useState([0]);
  const [update, setUpdate] = useState(true);

  const updateTraffic = useCallback(() => {
    if (traffic !== undefined) setTraffics((prev) => [...prev.slice(-length + 1), traffic]);
  }, [traffic, length]);

  useEffect(() => {
    if (update) updateTraffic();
  }, [update, updateTraffic]);

  const MAX = 1000;

  const getColor = (score: number): string => {
    const maxColor = 0;
    const minColor = 200;
    const color = minColor + Math.min(score / MAX, 1) * -(minColor - maxColor);
    return hslToHex(color, 1, 0.5);
  };

  return (
    <div
      className={styles.container}
      style={{ left, gridTemplateRows: `repeat(${traffics.length + 1}, 1fr)`, zIndex }}
    >
      <p>{text}</p>
      {/* <div
        className={styles.stop}
        style={{ backgroundColor: update ? '#f0f' : '#0f0', zIndex: zIndex + 1 }}
        onClick={() => setUpdate(!update)}
      >
        stop
      </div> */}
      {traffics.map((traffic, index) => (
        <div className={styles.trafficRow} key={index}>
          <div
            className={styles.traffic}
            style={{
              width: `${Math.min(1, Math.max(0, traffic) / MAX) * 100}%`,
              backgroundColor: traffic > MAX ? '#800' : getColor(traffic),
            }}
          />
          {isTimeDisplay && <p>{`${String(traffic).split('').slice(0, 5).join('')}ms`}</p>}
        </div>
      ))}
    </div>
  );
};
