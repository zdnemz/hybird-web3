import { response } from "./response";
import type { Handler } from "hono";
import type { H } from "hono/types";
import { Logger } from "./logger";

export interface HandlerOptions {
  name?: string;
}

const logger = new Logger("server");

const handler = (fn: H, options?: HandlerOptions): Handler => {
  return async (c, next) => {
    try {
      return await fn(c, next);
    } catch (error) {
      const handlerName = options?.name || "UnknownHandler";
      logger.error(`[${handlerName}] Error:`, (error as Error).message);
      return response(c, 500, "Internal server error");
    }
  };
};

export default handler;
