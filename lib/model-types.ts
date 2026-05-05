export type QueryLike<T = unknown> = {
  sort: (criteria: Record<string, 1 | -1>) => QueryLike<T>;
  limit: (value: number) => QueryLike<T>;
  lean: () => Promise<T>;
};

export type ModelLike = {
  find: (criteria?: Record<string, unknown>) => QueryLike;
  findOneAndUpdate: (criteria: Record<string, unknown>, update: Record<string, unknown>, options?: Record<string, unknown>) => Promise<unknown>;
  findByIdAndUpdate: (id: string, update: Record<string, unknown>, options?: Record<string, unknown>) => Promise<unknown>;
  findByIdAndDelete: (id: string) => Promise<unknown>;
  create: (payload: unknown) => Promise<Record<string, unknown>>;
  countDocuments: () => Promise<number>;
  insertMany: (payload: readonly unknown[]) => Promise<unknown>;
};
