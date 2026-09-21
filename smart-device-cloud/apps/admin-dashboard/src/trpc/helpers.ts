export type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends Promise<infer U>
    ? Promise<DeepPartial<U>>
    : T extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPartial<U>>
      : T extends object
        ? {
            [K in keyof T]?: DeepPartial<T[K]>;
          }
        : T;
