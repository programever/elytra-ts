/**
 * Represents a fixed-length tuple of two values: `[A, B]`.
 *
 * This is an immutable, readonly structure.
 *
 * @template A - The type of the first element.
 * @template B - The type of the second element.
 */
export type Tuple<A, B> = readonly [A, B];

/**
 * Constructs a tuple from two values.
 *
 * @param a - The first value.
 * @param b - The second value.
 * @returns A readonly tuple `[a, b]`.
 */
export function tuple<A, B>(a: A, b: B): Tuple<A, B> {
  return [a, b];
}

/**
 * Returns the first element of a tuple.
 *
 * @param tuple - A tuple `[A, B]`.
 * @returns The first value (`A`).
 */
export function fst<A, B>(tuple: Tuple<A, B>): A {
  return tuple[0];
}

/**
 * Returns the second element of a tuple.
 *
 * @param tuple - A tuple `[A, B]`.
 * @returns The second value (`B`).
 */
export function snd<A, B>(tuple: Tuple<A, B>): B {
  return tuple[1];
}

/**
 * Transforms the first value of a tuple using a function.
 *
 * @param tuple - The input tuple `[A, B]`.
 * @param fn - A function to map the first value.
 * @returns A new tuple `[C, B]` with the first value transformed.
 */
export function mapFst<A, B, C>(tuple: Tuple<A, B>, fn: (a: A) => C): Tuple<C, B> {
  return [fn(tuple[0]), tuple[1]];
}

/**
 * Transforms the second value of a tuple using a function.
 *
 * @param tuple - The input tuple `[A, B]`.
 * @param fn - A function to map the second value.
 * @returns A new tuple `[A, C]` with the second value transformed.
 */
export function mapSnd<A, B, C>(tuple: Tuple<A, B>, fn: (b: B) => C): Tuple<A, C> {
  return [tuple[0], fn(tuple[1])];
}
