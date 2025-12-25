import { Hono } from "hono";
import handler from "@/lib/app/handler";
import { response } from "@/lib/app/response";
import { generateNonce, SiweMessage } from "siwe";
import redis from "@/lib/app/redis";
import z from "zod";
import { validate } from "@/lib/app/validate";
import JWT from "@/lib/app/jwt";
import { deleteCookie, setCookie } from "hono/cookie";
import env from "@/configs/env";
import { authService } from "../services/auth";

export const auth = new Hono();

auth.get(
  "/nonce",
  handler(
    async (c) => {
      const nonce = generateNonce();

      await redis.setex(`nonce:${nonce}`, 300, "pending");

      return response(c, 200, { nonce });
    },
    { name: "auth-nonce" },
  ),
);

auth.post(
  "/verify",
  handler(
    async (c) => {
      const schema = z.object({
        message: z.string({ message: "message must be string" }),
        signature: z.string({ message: "signature must be string" }),
      });

      const data = await c.req.json();

      const validated = await validate(schema, data);
      if (!validated.success) return response(c, 400, validated.error);

      const { message, signature } = validated.data;

      const siweMessage = new SiweMessage(message);
      const result = await siweMessage.verify({ signature });

      if (!result.success) return response(c, 401, "Signature is not valid");

      const nonceKey = `nonce:${siweMessage.nonce}`;
      const nonce = await redis.get(nonceKey);

      if (!nonce) return response(c, 401, "Nonce is expired");

      await redis.del(nonceKey);

      const token = JWT.sign(
        {
          address: result.data.address,
          chainId: result.data.chainId,
        },
        { expiresIn: "1d" },
      );

      const sessionKey = `session:${result.data.address}`;
      await redis.setex(sessionKey, 60 * 60 * 24, token);

      setCookie(c, "auth-token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24,
        secure: env.APP.NODE_ENV === "production",
      });

      return response(c, 200, { address: result.data.address });
    },
    { name: "auth-verify" },
  ),
);

auth.delete(
  "/logout",
  handler(
    async (c) => {
      const authData = await authService(c);
      if (authData) {
        const { address } = authData;
        await redis.del(`session:${address}`);
      }

      deleteCookie(c, "auth-token");

      return response(c, 200);
    },
    { name: "auth-logout" },
  ),
);

auth.get(
  "/session",
  handler(
    async (c) => {
      const authData = await authService(c);
      if (!authData) return response(c, 401, "Token is expired");

      return response(c, 200, authData);
    },
    {
      name: "auth-session",
    },
  ),
);
