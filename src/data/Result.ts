import type { Maybe } from './Maybe';

/**
 * Represents the result of a computation that can either succeed (`Ok<T>`)
 * or fail (`Err<E>`).
 *
 * @template E - The error type.
 * @template T - The success value type.
 */
export type Result<E, T> = Err<E> | Ok<T>;

/**
 * Represents a failed computation.
 *
 * @property _t - Discriminant tag (`'Err'`).
 * @property error - The associated error value.
 */
export type Err<E> = {
  readonly _t: 'Err';
  readonly error: E;
};

/**
 * Represents a successful computation.
 *
 * @property _t - Discriminant tag (`'Ok'`).
 * @property value - The successful result value.
 */
export type Ok<T> = {
  readonly _t: 'Ok';
  readonly value: T;
};

/**
 * Constructs a successful result.
 *
 * @param value - The result value.
 * @returns An `Ok<T>` variant.
 */
export function ok<T>(value: T): Ok<T> {
  return { _t: 'Ok', value };
}

/**
 * Constructs a failed result.
 *
 * @param error - The error value.
 * @returns An `Err<E>` variant.
 */
export function err<E>(error: E): Err<E> {
  return { _t: 'Err', error };
}

/**
 * Maps the success value of a `Result` if it is `Ok`, otherwise returns the original `Err`.
 *
 * @param result - The original `Result`.
 * @param fn - A function to transform the success value.
 * @returns A new `Result` with the transformed value or the original error.
 */
export function mapResult<E, T1, T2>(result: Result<E, T1>, fn: (a: T1) => T2): Result<E, T2> {
  return result._t === 'Ok' ? ok(fn(result.value)) : result;
}

/**
 * Maps the error value of a `Result` if it is `Err`, otherwise returns the original `Ok`.
 *
 * @param result - The original `Result`.
 * @param fn - A function to transform the error value.
 * @returns A new `Result` with the transformed error or the original value.
 */
export function mapResultErr<E1, E2, T>(result: Result<E1, T>, fn: (e: E1) => E2): Result<E2, T> {
  return result._t === 'Err' ? err(fn(result.error)) : result;
}

/**
 * Extracts the success value from a `Result` as a `Maybe<T>`.
 *
 * @param result - The input `Result`.
 * @returns `just(value)` if `Ok`, otherwise `nothing()`.
 */
export function fromOk<E, T>(result: Result<E, T>): Maybe<T> {
  return result._t === 'Ok' ? result.value : null;
}

/**
 * Extracts the error from a `Result` as a `Maybe<E>`.
 *
 * @param result - The input `Result`.
 * @returns `just(error)` if `Err`, otherwise `nothing()`.
 */
export function fromErr<E, T>(result: Result<E, T>): Maybe<E> {
  return result._t === 'Err' ? result.error : null;
}

/**
 * Chains a computation that itself returns a `Result`, flattening the nesting.
 *
 * The error type widens to include the callback's error type, so steps with
 * different failure modes can be chained without an explicit `mapResultErr`.
 *
 * @param result - The original `Result`.
 * @param fn - A function producing the next `Result` from the success value.
 * @returns The callback's `Result` if `Ok`, otherwise the original `Err`.
 */
export function andThenResult<E, E2, T, U>(
  result: Result<E, T>,
  fn: (a: T) => Result<E2, U>
): Result<E | E2, U> {
  return result._t === 'Ok' ? fn(result.value) : result;
}

/**
 * Collapses a `Result` into a single value by handling both cases.
 *
 * @param result - The input `Result`.
 * @param onErr - Handler for the `Err` case.
 * @param onOk - Handler for the `Ok` case.
 * @returns The value produced by whichever handler ran.
 */
export function foldResult<E, T, R>(
  result: Result<E, T>,
  onErr: (e: E) => R,
  onOk: (t: T) => R
): R {
  return result._t === 'Ok' ? onOk(result.value) : onErr(result.error);
}

/**
 * Sequences an array of `Result`s, short-circuiting on the first `Err`.
 *
 * Use `partitionResult` instead when every error should be collected.
 *
 * @param results - The input array of `Result<E, T>`.
 * @returns `Ok` of all success values in order, or the first `Err` encountered.
 */
export function allResult<E, T>(results: ReadonlyArray<Result<E, T>>): Result<E, T[]> {
  const values: T[] = [];

  for (const result of results) {
    if (result._t === 'Err') {
      return result;
    }
    values.push(result.value);
  }

  return ok(values);
}

/**
 * Runs a function that may throw, capturing the outcome as a `Result`.
 *
 * Without `onError`, the thrown value is returned as-is (typed `unknown`);
 * pass `onError` to normalise it into a known error type at the boundary.
 *
 * @param fn - A function that may throw.
 * @param onError - Optional mapping from the thrown value to the error type.
 * @returns `Ok` with the returned value, or `Err` with the thrown value.
 */
export function tryCatch<T>(fn: () => T): Result<unknown, T>;
export function tryCatch<E, T>(fn: () => T, onError: (e: unknown) => E): Result<E, T>;
export function tryCatch<E, T>(
  fn: () => T,
  onError?: (e: unknown) => E
): Result<E | unknown, T> {
  try {
    return ok(fn());
  } catch (e) {
    return err(onError === undefined ? e : onError(e));
  }
}

/**
 * Partitions an array of `Result`s into separate arrays of successes and errors.
 *
 * @param results - The input array of `Result<E, T>`.
 * @returns An object containing two arrays: `oks` (all success values) and `errs` (all errors).
 */
export function partitionResult<E, T>(
  results: ReadonlyArray<Result<E, T>>
): {
  readonly oks: T[];
  readonly errs: E[];
} {
  const oks: T[] = [];
  const errs: E[] = [];

  for (const result of results) {
    if (result._t === 'Ok') {
      oks.push(result.value);
    } else {
      errs.push(result.error);
    }
  }

  return { oks, errs };
}
