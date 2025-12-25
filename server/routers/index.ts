import { Hono } from "hono";
import handler from "@/lib/app/handler";
import { response } from "@/lib/app/response";
import { auth } from "./auth";

export const router = new Hono();

router.get(
  "/health",
  handler((c) => {
    return response(c, 200, { health: "OK" });
  }),
);

router.route("/auth", auth);
