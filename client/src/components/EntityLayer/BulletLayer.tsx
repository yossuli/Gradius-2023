import { Layer } from 'react-konva';
import { useGame } from 'src/pages/hooks/useGame';
import { Bullet } from '../Entity/Bullet';

type Props = {
  displayPosition: number | null;
};

export const BulletLayer = ({ displayPosition }: Props) => {
  const { bullets } = useGame({ displayPosition });

  return (
    <Layer>
      {bullets.map((bullet) => (
        <Bullet displayPosition={displayPosition ?? 0} bullet={bullet} key={bullet.id} />
      ))}
    </Layer>
  );
};
