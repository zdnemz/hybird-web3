import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { ApiResponse } from "@/types/index";
import { Logger } from "./logger";
import toast from "react-hot-toast";

const logger = new Logger("fetcher");

export type HTTPMethod = "get" | "post" | "put" | "delete" | "patch";

export interface FetcherOptions<TResponse = unknown, TData = unknown> {
  url: string;
  method?: HTTPMethod;
  data?: TData;
  config?: AxiosRequestConfig<TResponse>;
}

export async function fetcher<TResponse = unknown, TData = unknown>({
  url,
  method = "get",
  data,
  config = {},
}: FetcherOptions<TResponse, TData>): Promise<ApiResponse<TResponse>> {
  try {
    const response: AxiosResponse<ApiResponse<TResponse>> = await axios({
      url,
      method,
      data,
      ...config,
    });

    return response.data;
  } catch (error) {
    logger.error((error as Error).message);

    if (error instanceof AxiosError) {
      const message =
        ((error.response?.data as ApiResponse)?.error as string) ||
        "Something went wrong!";

      throw new Error(message);
    }

    throw new Error((error as Error).message || "Something went wrong!");
  }
}
