import { Layer } from 'react-konva';
import { useGame } from 'src/pages/hooks/useGame';
import { Player } from '../Entity/Player';

type Props = {
  displayPosition: number | null;
};

export const PlayerLayer = ({ displayPosition }: Props) => {
  const { players } = useGame({ displayPosition });

  return (
    <Layer>
      {players.map((player) => (
        <Player displayPosition={displayPosition ?? 0} player={player} key={player.id} />
      ))}
    </Layer>
  );
};
