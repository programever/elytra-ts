import type { Result } from './Result';

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
 * Extracts the value from a `Maybe<T>`, or returns `null` if it's `Nothing`.
 *
 * @param m - A `Maybe<T>` value.
 * @returns The inner value if present, otherwise `null`.
 */
export function fromMaybe<T>(m: Maybe<T>): T | null {
  return m == null ? null : m;
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
