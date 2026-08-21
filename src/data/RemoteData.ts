import type { Result } from './Result';
import type { Tuple } from './Tuple';

/**
 * Represents the possible states of a remote data request.
 *
 * A `RemoteData<E, T>` can be one of:
 * - `NotAsked`: The request has not been initiated.
 * - `Loading`: The request is in progress.
 * - `Failure`: The request failed, containing an error `E`.
 * - `Success`: The request succeeded, containing a value `T`.
 */
export type RemoteData<E, T> = NotAsked | Loading | Failure<E> | Success<T>;

/**
 * State indicating the request has not started yet.
 */
export type NotAsked = { readonly _t: 'NotAsked' };

/**
 * State indicating the request is currently loading.
 */
export type Loading = { readonly _t: 'Loading' };

/**
 * State indicating the request failed.
 *
 * @property error - The error value associated with the failure.
 */
export type Failure<E> = { readonly _t: 'Failure'; readonly error: E };

/**
 * State indicating the request succeeded.
 *
 * @property data - The successfully loaded data.
 */
export type Success<T> = { readonly _t: 'Success'; readonly data: T };

/**
 * Constructs a `NotAsked` state.
 */
export function notAsked<E, T>(): RemoteData<E, T> {
  return { _t: 'NotAsked' };
}

/**
 * Constructs a `Loading` state.
 */
export function loading<E, T>(): RemoteData<E, T> {
  return { _t: 'Loading' };
}

/**
 * Constructs a `Failure` state with the given error.
 *
 * @param error - The error value to wrap.
 */
export function failure<E, T>(error: E): RemoteData<E, T> {
  return { _t: 'Failure', error };
}

/**
 * Constructs a `Success` state with the given data.
 *
 * @param data - The successful result to wrap.
 */
export function success<E, T>(data: T): RemoteData<E, T> {
  return { _t: 'Success', data };
}

/**
 * Transforms the `Success` value of a `RemoteData`, leaving other states unchanged.
 *
 * @param remoteData - The input `RemoteData`.
 * @param fn - A function to transform the success value.
 * @returns A new `RemoteData` with the transformed success value.
 */
export function mapRD<E, T, U>(remoteData: RemoteData<E, T>, fn: (t: T) => U): RemoteData<E, U> {
  return remoteData._t === 'Success' ? { ...remoteData, data: fn(remoteData.data) } : remoteData;
}

/**
 * Transforms the `Failure` error value of a `RemoteData`, leaving other states unchanged.
 *
 * @param remoteData - The input `RemoteData`.
 * @param fn - A function to transform the error value.
 * @returns A new `RemoteData` with the transformed error, if in failure state.
 */
export function mapRDError<E, X, T>(
  remoteData: RemoteData<E, T>,
  fn: (e: E) => X
): RemoteData<X, T> {
  return remoteData._t === 'Failure' ? { ...remoteData, error: fn(remoteData.error) } : remoteData;
}

/**
 * Extracts the error from a `Failure`, or returns `null` for other states.
 *
 * @param remoteData - The input `RemoteData`.
 * @returns The error if in `Failure`, otherwise `null`.
 */
export function fromFailure<E, T>(remoteData: RemoteData<E, T>): E | null {
  return remoteData._t === 'Failure' ? remoteData.error : null;
}

/**
 * Extracts the data from a `Success`, or returns `null` for other states.
 *
 * @param remoteData - The input `RemoteData`.
 * @returns The data if in `Success`, otherwise `null`.
 */
export function fromSuccess<E, T>(remoteData: RemoteData<E, T>): T | null {
  return remoteData._t === 'Success' ? remoteData.data : null;
}

/**
 * Chains a computation that itself returns a `RemoteData`, flattening the nesting.
 *
 * The error type widens to include the callback's error type.
 *
 * @param remoteData - The input `RemoteData`.
 * @param fn - A function producing the next `RemoteData` from the success value.
 * @returns The callback's `RemoteData` if `Success`, otherwise the original state.
 */
export function andThenRD<E, E2, T, U>(
  remoteData: RemoteData<E, T>,
  fn: (t: T) => RemoteData<E2, U>
): RemoteData<E | E2, U> {
  return remoteData._t === 'Success' ? fn(remoteData.data) : remoteData;
}

/**
 * Handlers for each `RemoteData` state, as consumed by `foldRD`.
 */
export type RemoteDataHandlers<E, T, R> = {
  readonly notAsked: () => R;
  readonly loading: () => R;
  readonly failure: (error: E) => R;
  readonly success: (data: T) => R;
};

/**
 * Collapses a `RemoteData` into a single value by handling all four states.
 *
 * @param remoteData - The input `RemoteData`.
 * @param handlers - One handler per state; all four are required.
 * @returns The value produced by the handler for the current state.
 */
export function foldRD<E, T, R>(
  remoteData: RemoteData<E, T>,
  handlers: RemoteDataHandlers<E, T, R>
): R {
  switch (remoteData._t) {
    case 'NotAsked':
      return handlers.notAsked();
    case 'Loading':
      return handlers.loading();
    case 'Failure':
      return handlers.failure(remoteData.error);
    case 'Success':
      return handlers.success(remoteData.data);
  }
}

/**
 * Lifts a settled `Result` into a `RemoteData`.
 *
 * @param result - The outcome of a completed request.
 * @returns `Success` if `Ok`, otherwise `Failure`.
 */
export function fromResultRD<E, T>(result: Result<E, T>): RemoteData<E, T> {
  return result._t === 'Ok' ? success(result.value) : failure(result.error);
}

/**
 * Combines two `RemoteData`s into one holding both values.
 *
 * The combined state is `Success` only when both are. Otherwise the first
 * `Failure` wins (left-biased), then `Loading`, then `NotAsked` — so an error
 * is surfaced even while the other request is still in flight.
 *
 * @param a - The first `RemoteData`.
 * @param b - The second `RemoteData`.
 * @returns A `RemoteData` of the pair `[a, b]`.
 */
export function combineRD<E, A, B>(
  a: RemoteData<E, A>,
  b: RemoteData<E, B>
): RemoteData<E, Tuple<A, B>> {
  if (a._t === 'Success' && b._t === 'Success') return success([a.data, b.data]);
  if (a._t === 'Failure') return a;
  if (b._t === 'Failure') return b;
  if (a._t === 'Loading' || b._t === 'Loading') return loading();
  return notAsked();
}
