import { z } from "zod";

export type ApiResponse<T> = {
  result: T;
  errors?: Record<string, string[]>;
};
