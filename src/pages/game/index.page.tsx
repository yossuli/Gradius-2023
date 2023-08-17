import type { BulletModel, EnemyModel, PlayerModel } from '$/commonTypesWithClient/models';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Layer, Stage } from 'react-konva';
import { Bullet } from 'src/components/Bullet/PlayerBullet';
import { Enemies } from 'src/components/Enemies/Enemies';
import Lobby from 'src/components/Lobby/Lobby';
import { Player } from 'src/components/Player/Player';
import { apiClient } from 'src/utils/apiClient';

const Game = () => {
  const router = useRouter();
  const display = router.query.display === undefined ? null : Number(router.query.display);
  if (display === null) {
    return <Lobby />; // Lobbyコンポーネントの呼び出し
  }

  // if (!user) return <Loading visible />;
  const GameCanvas = () => {
    const [players, setPlayers] = useState<PlayerModel[]>([]);
    const [enemies, setEnemies] = useState<EnemyModel[]>([]);
    const [playerBullets, setPlayerBullets] = useState<BulletModel[]>([]);
    const [enemyBullets, setEnemyBullets] = useState<BulletModel[]>([]);
    const [currentTime, setCurrentTime] = useState<number>(Date.now());

    const fetchPlayers = async (display: number) => {
      const res = await apiClient.player.$get({ query: { display } });
      if (res !== null) {
        setPlayers(res);
      }
    };

    const fetchEnemies = async (display: number) => {
      const res = await apiClient.enemy.$get({ query: { display } });
      if (res !== null) {
        setEnemies(res);
      }
    };

    const fetchBullets = async (display: number) => {
      const res = await apiClient.bullet.$get({ query: { display } });
      if (res !== null) {
        setPlayerBullets(res.players);
        setEnemyBullets(res.enemies);
      }
    };

    const checkCollisionPlayerBullet = async () => {
      const remainingEnemies = [];
      for (const enemy of enemies) {
        const hitBullet: BulletModel | undefined = collisionBullets(
          enemy.createdPosition,
          playerBullets,
          currentTime
        )[0];
        if (hitBullet !== undefined && hitBullet.playerId) {
          const body = {
            enemyId: enemy.id,
            playerId: hitBullet.playerId,
          };
          await apiClient.enemy.$delete({ body });
          await apiClient.bullet.$delete({ body: { bulletId: hitBullet.id } });
        } else {
          remainingEnemies.push(enemy);
        }
      }
    };

    const checkCollisionEnemyBullet = async () => {
      Promise.all(
        players
          .map((player) => {
            const hitBullets = collisionBullets(player.position, enemyBullets, currentTime);
            return hitBullets.map((bullet) =>
              apiClient.player.delete({ body: { player, bulletId: bullet.id } })
            );
          })
          .flat()
      ).then((results) =>
        results.forEach((result) => {
          result;
        })
      );
    };

    const checkCollisionPlayerAndEnemy = async () => {
      const remainingEnemies = [];
      for (const enemy of enemies) {
        const COLLISION_DISTANCE = 100;
        const hitPlayer = players.find((player) => {
          const distanceSquared =
            Math.pow(enemy.createdPosition.x - player.position.x, 2) +
            Math.pow(enemy.createdPosition.y - player.position.y, 2);
          return distanceSquared < COLLISION_DISTANCE ** 2;
        });
        if (hitPlayer !== undefined) {
          apiClient.game.$post({ body: { player: hitPlayer, enemy, display } });
        } else {
          remainingEnemies.push(enemy);
        }
      }
    };

    useEffect(() => {
      const cancelId = requestAnimationFrame(() => {
        fetchPlayers(display);
        fetchEnemies(display);
        fetchBullets(display);
        checkCollisionBullet();
        checkCollisionPlayer();
        setCurrentTime(Date.now());
      });
      return () => cancelAnimationFrame(cancelId);
    });

    return (
      <div>
        <Stage width={1920} height={1080}>
          <Layer>
            {playerBullets.map((bullet) => (
              <Bullet key={bullet.id} bullet={bullet} currentTime={currentTime} />
            ))}
          </Layer>
          <Layer>
            {enemyBullets.map((bullet) => (
              <Bullet key={bullet.id} bullet={bullet} currentTime={currentTime} />
            ))}
          </Layer>
          <Layer>
            {players.map((player) => (
              <Player key={player.id} player={player} />
            ))}
          </Layer>
          <Layer>
            {/* アニメーションの関係で、Enemyは中でmap */}
            <Enemies enemies={enemies} />
          </Layer>
        </Stage>
      </div>
    );
  };

  return <GameCanvas />;
};

export default Game;
