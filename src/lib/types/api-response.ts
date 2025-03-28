export type ApiResponse<T> = {
  result: T;
  errors?: Record<string, string[]>;
};
