import type { UserId } from '../commonTypesWithClient/branded';
import type { TimeModel } from '../commonTypesWithClient/models';

export const diffToBaseTimeSec = (userId: UserId, baseTimes: TimeModel[]) =>
  Math.floor(
    (Date.now() -
      (baseTimes.find((baseTime) => (baseTime.userId = userId))?.baseTime ?? Date.now())) /
      1000
  );
