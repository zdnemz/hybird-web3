import { Hono } from "hono";
import { handle } from "hono/vercel";
import { router } from "./routers";

const app = new Hono().basePath("/api");

app.route("/", router);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
