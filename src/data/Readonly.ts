/**
 * Recursively makes all properties of an object type `readonly`, including nested objects and arrays.
 *
 * - Functions are left unchanged.
 * - Tuples and arrays are deeply wrapped.
 * - All nested fields of objects are also made readonly.
 *
 * @example
 * type Config = {
 *   user: {
 *     name: string;
 *     tags: string[];
 *   };
 * };
 *
 * // ReadonlyConfig:
 * // {
 * //   readonly user: {
 * //     readonly name: string;
 * //     readonly tags: readonly string[];
 * //   };
 * // }
 * type ReadonlyConfig = Readonly<Config>;
 */
export type Readonly<T> = T extends (...args: unknown[]) => unknown
  ? T // Leave functions unchanged
  : T extends readonly [infer _A, ...infer _B]
    ? { readonly [K in keyof T]: Readonly<T[K]> } // Handle tuples
    : T extends ReadonlyArray<infer U>
      ? ReadonlyArray<Readonly<U>> // Handle arrays
      : T extends object
        ? { readonly [K in keyof T]: Readonly<T[K]> } // Handle objects
        : T; // Leave primitives unchanged
