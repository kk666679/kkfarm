export const transformer = {
  serialize: (data: unknown) => data,
  deserialize: <T>(data: string): T => JSON.parse(data) as T,
};

export type Transformer = typeof transformer;
