import { Maybe, just, nothing } from './Maybe';

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
  return result._t === 'Ok' ? just(result.value) : nothing();
}

/**
 * Extracts the error from a `Result` as a `Maybe<E>`.
 *
 * @param result - The input `Result`.
 * @returns `just(error)` if `Err`, otherwise `nothing()`.
 */
export function fromErr<E, T>(result: Result<E, T>): Maybe<E> {
  return result._t === 'Err' ? just(result.error) : nothing();
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
  return results.reduce(
    (accum: { oks: T[]; errs: E[] }, result) => {
      const { oks, errs } = accum;
      return result._t === 'Ok'
        ? { oks: [...oks, result.value], errs }
        : { oks, errs: [...errs, result.error] };
    },
    { oks: [], errs: [] }
  );
}
