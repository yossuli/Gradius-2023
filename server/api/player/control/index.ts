import type { DefineMethods } from 'aspida';
import type { UserId } from '../../../commonTypesWithClient/branded';
import type { MoveDirection, PlayerModel } from '../../../commonTypesWithClient/models';
export type Methods = DefineMethods<{
  get: {
    query: {
      userId: UserId;
    };
    resBody: PlayerModel | null;
  };
  post: {
    reqBody: {
      MoveDirection: MoveDirection;
      userId: UserId;
    };
    resBody: PlayerModel | null;
  };
}>;
