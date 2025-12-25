import type { Context } from "hono";
import type { ApiResponse } from "@/types";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { httpDefaultMessage } from "@/constants/http";

export function response<T>(
  context: Context,
  status: ContentfulStatusCode,
  data?: T | null,
  pagination?: ApiResponse["pagination"],
) {
  const success = status >= 200 && status < 300;
  const message = httpDefaultMessage[status] || (success ? "Success" : "Error");
  let error: unknown = undefined;

  if (!success) {
    if (typeof data === "string") {
      error = data;
      data = null;
    } else if (data && typeof data === "object") {
      error = data;
      data = null;
    }
  }

  const body: ApiResponse<T> = {
    success,
    code: status,
    message,
    data: success ? data : undefined,
    error,
    pagination: success ? pagination : undefined,
  };

  return context.json(body, status);
}
