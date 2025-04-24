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
 * @param fn - A function to transform the success value.
 * @param remoteData - The input `RemoteData`.
 * @returns A new `RemoteData` with the transformed success value.
 */
export function mapRD<E, T, U>(fn: (t: T) => U, remoteData: RemoteData<E, T>): RemoteData<E, U> {
  return remoteData._t === 'Success' ? { ...remoteData, data: fn(remoteData.data) } : remoteData;
}

/**
 * Transforms the `Failure` error value of a `RemoteData`, leaving other states unchanged.
 *
 * @param fn - A function to transform the error value.
 * @param remoteData - The input `RemoteData`.
 * @returns A new `RemoteData` with the transformed error, if in failure state.
 */
export function mapRDError<E, X, T>(
  fn: (e: E) => X,
  remoteData: RemoteData<E, T>
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
