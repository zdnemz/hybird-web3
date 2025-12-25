import env from "@/configs/env";
import jwt from "jsonwebtoken";

export default class JWT {
  public static sign<T extends object>(
    payload: T,
    options?: jwt.SignOptions,
  ): string {
    return jwt.sign(payload, env.APP.JWT_SECRET, {
      expiresIn: options?.expiresIn || "5m",
      ...options,
    });
  }

  public static verify<T>(token: string): T | null {
    try {
      return jwt.verify(token, env.APP.JWT_SECRET) as T;
    } catch {
      return null;
    }
  }
}
