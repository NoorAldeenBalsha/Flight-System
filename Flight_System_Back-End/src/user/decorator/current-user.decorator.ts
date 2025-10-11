import { createParamDecorator,ExecutionContext } from "@nestjs/common";
import { CURRNET_USER_KEY } from "utilitis/constants";

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request[CURRNET_USER_KEY];
  },
);

