import { Result, ok, err } from './Result';

/**
 * Represents an nullable value.
 *
 * A `Maybe<T>` can be either:
 * - a value of type `T` (`Just`)
 * - or `null` (`Nothing`)
 */
export type Maybe<T> = T | null;

/**
 * Represents a present value of type `T`.
 * Used internally as a semantic alias.
 */
export type Just<T> = T;

/**
 * Represents the absence of a value.
 * Used internally as a semantic alias.
 */
export type Nothing = null;

/**
 * Wraps a value in a `Just<T>`, i.e. a present `Maybe`.
 *
 * @param value - A non-null value of type `T`.
 * @returns The value itself, treated as a `Maybe<T>`.
 */
export function just<T>(value: T): Just<T> {
  return value;
}

/**
 * Returns a `Nothing` (`null`) to represent the absence of a value.
 *
 * @returns `null`
 */
export function nothing(): Nothing {
  return null;
}

/**
 * Converts a possibly `null` or `undefined` value into a `Maybe<T>`.
 *
 * @param value - A value that may be `null` or `undefined`.
 * @returns A `Just<T>` if the value is present, or `Nothing` otherwise.
 */
export function maybe<T>(value: T | null | undefined): Maybe<T> {
  return value == null ? nothing() : just(value);
}

/**
 * Extracts the value from a `Maybe<T>`, falling back to a default if it's `Nothing`.
 *
 * @param m - A `Maybe<T>` value.
 * @param defaultValue - The value to return when `m` is `Nothing`.
 * @returns The inner value if present, otherwise `defaultValue`.
 */
export function fromMaybe<T>(m: Maybe<T>, defaultValue: T): T {
  return m == null ? defaultValue : m;
}

/**
 * Converts a `Result<E, T>` into a `Maybe<T>`.
 *
 * @param m - A result value.
 * @returns `Just<T>` if the result is `Ok`, otherwise `Nothing`.
 */
export function fromResult<E, T>(m: Result<E, T>): T | null {
  return m._t === 'Ok' ? m.value : nothing();
}

/**
 * Applies a function to a `Maybe<T>`, producing a `Maybe<U>`.
 *
 * @param m - The input `Maybe<T>`.
 * @param fn - A function to transform the value if present.
 * @returns A new `Maybe<U>` with the transformed value, or `Nothing`.
 */
export function mapMaybe<T, U>(m: Maybe<T>, fn: (a: T) => U): Maybe<U> {
  return m == null ? nothing() : fn(m);
}

/**
 * Chains a computation that itself returns a `Maybe`, flattening the nesting.
 *
 * @param m - The input `Maybe<T>`.
 * @param fn - A function producing the next `Maybe` from the present value.
 * @returns The callback's `Maybe` if present, otherwise `Nothing`.
 */
export function andThenMaybe<T, U>(m: Maybe<T>, fn: (a: T) => Maybe<U>): Maybe<U> {
  return m == null ? nothing() : fn(m);
}

/**
 * Collapses a `Maybe` into a single value by handling both cases.
 *
 * @param m - The input `Maybe<T>`.
 * @param onNothing - Handler for the absent case.
 * @param onJust - Handler for the present case.
 * @returns The value produced by whichever handler ran.
 */
export function foldMaybe<T, R>(m: Maybe<T>, onNothing: () => R, onJust: (a: T) => R): R {
  return m == null ? onNothing() : onJust(m);
}

/**
 * Returns the first `Maybe` if present, otherwise the fallback `Maybe`.
 *
 * Unlike `fromMaybe`, the fallback may itself be absent.
 *
 * @param m - The preferred `Maybe<T>`.
 * @param fallback - The `Maybe<T>` to use when `m` is `Nothing`.
 * @returns `m` if present, otherwise `fallback`.
 */
export function orElseMaybe<T>(m: Maybe<T>, fallback: Maybe<T>): Maybe<T> {
  return m == null ? fallback : m;
}

/**
 * Converts a `Maybe<T>` into a `Result<E, T>`, supplying the error for the absent case.
 *
 * The inverse of `fromResult`.
 *
 * @param m - The input `Maybe<T>`.
 * @param error - The error to use when `m` is `Nothing`.
 * @returns `Ok` with the value if present, otherwise `Err` with `error`.
 */
export function toResult<E, T>(m: Maybe<T>, error: E): Result<E, T> {
  return m == null ? err(error) : ok(m);
}

/**
 * Drops the absent entries from an array of `Maybe`s, keeping order.
 *
 * @param ms - The input array of `Maybe<T>`.
 * @returns The present values, narrowed to `T`.
 */
export function catMaybes<T>(ms: ReadonlyArray<Maybe<T>>): T[] {
  const values: T[] = [];

  for (const m of ms) {
    if (m != null) {
      values.push(m);
    }
  }

  return values;
}
