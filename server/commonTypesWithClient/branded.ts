import type { z } from 'zod';

type Branded<T extends string> = string & z.BRAND<T>;

export type UserId = Branded<'UserId'>;

export type TaskId = Branded<'TaskId'>;

export type EnemyId = Branded<'EnemyId'>;

export type BulletId = Branded<'BulletId'>;

export type GameId = Branded<'GameId'>;
