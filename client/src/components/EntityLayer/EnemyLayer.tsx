import { Layer } from 'react-konva';
import { useGame } from 'src/pages/hooks/useGame';
import { Enemy } from '../Entity/Enemy';

type Props = {
  displayPosition: number | null;
};

export const EnemyLayer = ({ displayPosition }: Props) => {
  const { enemies } = useGame({ displayPosition });

  return (
    <Layer>
      {enemies.map((enemy) => (
        <Enemy displayPosition={displayPosition ?? 0} enemy={enemy} key={enemy.id} />
      ))}
    </Layer>
  );
};
