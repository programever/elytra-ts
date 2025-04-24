/**
 * A tuple-like data structure that guarantees at least one item.
 *
 * `first` is the first element, and `rest` contains any additional elements (may be empty).
 */
export type NonEmptyArray<T> = {
  first: T;
  rest: T[];
};

/**
 * Constructs a `NonEmptyArray<T>` from a head element and optional rest.
 *
 * @param first - The first (required) element.
 * @param rest - An optional array of additional elements.
 * @returns A `NonEmptyArray<T>`.
 */
export function nonEmptyArray<T>(first: T, rest: T[] = []): NonEmptyArray<T> {
  return { first, rest };
}

/**
 * Converts a `NonEmptyArray<T>` to a standard array.
 *
 * @param nea - The non-empty array to convert.
 * @returns A standard array containing all elements.
 */
export function toArray<T>(nea: NonEmptyArray<T>): T[] {
  return [nea.first, ...nea.rest];
}

/**
 * Transforms all elements in the `NonEmptyArray` using a given function.
 *
 * @param nea - The input `NonEmptyArray<T>`.
 * @param fn - A function to transform each element.
 * @returns A new `NonEmptyArray<U>` with transformed values.
 */
export function mapNEA<T, U>(nea: NonEmptyArray<T>, fn: (x: T) => U): NonEmptyArray<U> {
  return {
    first: fn(nea.first),
    rest: nea.rest.map(fn)
  };
}

/**
 * Returns the last element in the `NonEmptyArray`.
 *
 * @param nea - The input `NonEmptyArray<T>`.
 * @returns The last element.
 */
export function lastNEA<T>(nea: NonEmptyArray<T>): T {
  return nea.rest.length > 0 ? nea.rest[nea.rest.length - 1] : nea.first;
}

/**
 * Returns the total number of elements in the `NonEmptyArray`.
 *
 * @param nea - The input `NonEmptyArray<T>`.
 * @returns The length (always ≥ 1).
 */
export function lengthNEA<T>(nea: NonEmptyArray<T>): number {
  return 1 + nea.rest.length;
}

/**
 * Returns the first element in the `NonEmptyArray`.
 *
 * @param nea - The input `NonEmptyArray<T>`.
 * @returns The first element.
 */
export function headNEA<T>(nea: NonEmptyArray<T>): T {
  return nea.first;
}

/**
 * Returns all elements except the first one.
 *
 * @param nea - The input `NonEmptyArray<T>`.
 * @returns An array containing the tail elements.
 */
export function tailNEA<T>(nea: NonEmptyArray<T>): T[] {
  return nea.rest;
}

/**
 * Appends an item to the end of a `NonEmptyArray`.
 *
 * @param nea - The input `NonEmptyArray<T>`.
 * @param item - The item to append.
 * @returns A new `NonEmptyArray<T>` with the item added at the end.
 */
export function appendNEA<T>(nea: NonEmptyArray<T>, item: T): NonEmptyArray<T> {
  return {
    first: nea.first,
    rest: [...nea.rest, item]
  };
}

/**
 * Prepends an item to the beginning of a `NonEmptyArray`.
 *
 * @param nea - The input `NonEmptyArray<T>`.
 * @param item - The item to prepend.
 * @returns A new `NonEmptyArray<T>` with the item added at the start.
 */
export function prependNEA<T>(nea: NonEmptyArray<T>, item: T): NonEmptyArray<T> {
  return {
    first: item,
    rest: [nea.first, ...nea.rest]
  };
}
