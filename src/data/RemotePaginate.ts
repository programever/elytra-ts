import { RemoteData, success } from './RemoteData';

/**
 * Represents the remote state of a paginated resource.
 *
 * It wraps a `Paginate` structure inside a `RemoteData`, combining:
 * - the network request lifecycle (`RemoteData`)
 * - the paginated list structure (`Paginate`)
 *
 * @template E - The error type.
 * @template T - The item type.
 * @template M - Optional metadata type.
 * @template S - The custom status type, defaults to `PaginateStatus<E>`.
 */
export type RemotePaginate<E, T, M = undefined, S = PaginateStatus<E>> = RemoteData<
  E,
  Paginate<E, T, M, S>
>;

/**
 * A generic representation of a paginated list.
 *
 * - `value`: The current list of items.
 * - `status`: The current status of pagination (customizable).
 * - `meta`: Optional metadata (e.g., cursor, total count).
 *
 * @template E - The error type for default status.
 * @template T - The item type.
 * @template M - Metadata type.
 * @template S - Status type.
 */
export type Paginate<E, T, M = undefined, S = PaginateStatus<E>> = {
  readonly value: T[];
  readonly status: S;
  readonly meta?: M;
};

/**
 * A default status type for paginated operations.
 *
 * Can be overridden with a custom status type when needed.
 *
 * - `Loaded`: Items are loaded and idle.
 * - `LoadingMore`: More items are being loaded (e.g. infinite scroll).
 * - `Error`: An error occurred while fetching.
 * - `NoMore`: All available data has been loaded.
 *
 * @template E - The error type.
 */
export type PaginateStatus<E> =
  | { readonly _t: 'Loaded' }
  | { readonly _t: 'LoadingMore' }
  | { readonly _t: 'Error'; readonly error: E }
  | { readonly _t: 'NoMore' };

/**
 * Creates a `RemotePaginate` in the `Success` state.
 *
 * @param value - The list of items.
 * @param status - A custom status value.
 * @param meta - Optional metadata.
 * @returns A successful `RemotePaginate`.
 */
export function createRP<E, T, M = undefined, S = unknown>(
  value: T[],
  status: S,
  meta?: M
): RemotePaginate<E, T, M, S> {
  return success({
    value,
    status,
    meta
  });
}

/**
 * Transforms the values of a `RemotePaginate` if it is in the `Success` state.
 *
 * @param remote - The original `RemotePaginate`.
 * @param fn - The function to map each value.
 * @returns A new `RemotePaginate` with transformed values, or the original state otherwise.
 */
export function mapRPValue<E, T, U, M, S>(
  remote: RemotePaginate<E, T, M, S>,
  fn: (t: T) => U
): RemotePaginate<E, U, M, S> {
  if (remote._t !== 'Success') return remote;

  const { value, status, meta } = remote.data;
  return success({ value: value.map(fn), status, meta });
}

/**
 * Transforms the metadata of a `RemotePaginate` if it is in the `Success` state.
 *
 * @param remote - The original `RemotePaginate`.
 * @param fn - The function to transform the metadata.
 * @returns A new `RemotePaginate` with transformed meta, or the original state otherwise.
 */
export function mapRPMeta<E, T, M, N, S>(
  remote: RemotePaginate<E, T, M, S>,
  fn: (m: M) => N
): RemotePaginate<E, T, N, S> {
  if (remote._t !== 'Success') return remote;

  const { value, status, meta } = remote.data;
  const newMeta = meta !== undefined ? fn(meta) : undefined;

  return success({ value, status, meta: newMeta });
}

/**
 * Transforms the status of a `RemotePaginate` if it is in the `Success` state.
 *
 * @param remote - The original `RemotePaginate`.
 * @param fn - The function to transform the status.
 * @returns A new `RemotePaginate` with transformed status, or the original state otherwise.
 */
export function mapRPStatus<E, T, M, S, R>(
  remote: RemotePaginate<E, T, M, S>,
  fn: (s: S) => R
): RemotePaginate<E, T, M, R> {
  if (remote._t !== 'Success') return remote;

  const { value, status, meta } = remote.data;
  return success({ value, status: fn(status), meta });
}

/**
 * Appends new items to the end of the value array in a `RemotePaginate`.
 *
 * @param remote - The original `RemotePaginate`.
 * @param items - Items to append.
 * @returns A new `RemotePaginate` with appended values, or the original state otherwise.
 */
export function appendRP<E, T, M, S>(
  remote: RemotePaginate<E, T, M, S>,
  items: T[]
): RemotePaginate<E, T, M, S> {
  if (remote._t !== 'Success') return remote;

  const { value, status, meta } = remote.data;
  return success({ value: [...value, ...items], status, meta });
}

/**
 * Prepends new items to the beginning of the value array in a `RemotePaginate`.
 *
 * @param remote - The original `RemotePaginate`.
 * @param items - Items to prepend.
 * @returns A new `RemotePaginate` with prepended values, or the original state otherwise.
 */
export function prependRP<E, T, M, S>(
  remote: RemotePaginate<E, T, M, S>,
  items: T[]
): RemotePaginate<E, T, M, S> {
  if (remote._t !== 'Success') return remote;

  const { value, status, meta } = remote.data;
  return success({ value: [...items, ...value], status, meta });
}
