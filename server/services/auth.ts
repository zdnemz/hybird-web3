import JWT from "@/lib/app/jwt";
import redis from "@/lib/app/redis";
import { Context } from "hono";
import { getCookie } from "hono/cookie";

export async function authService(c: Context) {
  const token = getCookie(c, "auth-token");
  if (!token) return null;

  const payload = JWT.verify<{ address: string; chainId: number }>(token);
  if (!payload) return null;

  const sessionKey = `session:${payload.address}`;
  const sessionExists = await redis.get(sessionKey);

  if (!sessionExists) return null;

  return payload;
}
