declare module 'zustand' {
  export function create<T>(initializer?: any): any;
  export const persist: any;
  export const immer: any;
}

declare module 'zustand/middleware' {
  export const devtools: any;
  export const persist: any;
  export const immer: any;
}
