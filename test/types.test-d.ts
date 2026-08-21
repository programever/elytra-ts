/**
 * Type-level regression tests. These are never executed — they pass by
 * compiling cleanly under `npm run tsc`. Each `@ts-expect-error` is itself an
 * assertion: if the error stops happening, compilation fails.
 */
import type { DeepReadonly } from '../src/data/DeepReadonly';
import { createRP } from '../src/data/RemotePaginate';
import type { RemotePaginate } from '../src/data/RemotePaginate';
import { andThenResult, tryCatch } from '../src/data/Result';
import type { Result } from '../src/data/Result';
import { andThenRD, combineRD, foldRD } from '../src/data/RemoteData';
import type { RemoteData } from '../src/data/RemoteData';
import { fromArrayNEA } from '../src/data/NonEmptyArray';
import type { NonEmptyArray } from '../src/data/NonEmptyArray';
import type { Tuple } from '../src/data/Tuple';

// --- DeepReadonly must leave functions callable, whatever their arity ---
declare const zeroArg: DeepReadonly<() => number>;
const _z: number = zeroArg();

declare const oneArg: DeepReadonly<(s: string) => number>;
const _o: number = oneArg('x');

declare const threeArg: DeepReadonly<(a: string, b: number, c: boolean) => string>;
const _t: string = threeArg('a', 1, true);

// ...including functions nested inside objects, and methods with parameters
declare const nested: DeepReadonly<{ handler: (s: string) => number; name: string }>;
const _n: number = nested.handler('x');

declare const withDate: DeepReadonly<{ when: Date }>;
const _d1: number = withDate.when.getTime();
const _d2: number = withDate.when.setTime(0);

// --- DeepReadonly still deeply freezes data ---
declare const cfg: DeepReadonly<{ user: { name: string; tags: string[] } }>;
// @ts-expect-error - nested property is readonly
cfg.user.name = 'nope';
// @ts-expect-error - nested array is readonly
cfg.user.tags.push('nope');

// --- createRP: E is not inferable from arguments, so it needs an annotation ---
declare const item: { id: number };

const annotated: RemotePaginate<string, { id: number }, { total: number }> = createRP(
  [item],
  { _t: 'Loaded' },
  { total: 10 }
);

const unannotated = createRP([item], { _t: 'Loaded' }, { total: 10 });
// @ts-expect-error - without an annotation E widens to `unknown`; annotate the
// binding (as `annotated` above does) so the error type is known.
const _reuse: RemotePaginate<string, { id: number }, { total: number }> = unannotated;

// --- andThenResult widens the error type to the union of both steps ---
declare const parsed: Result<'PARSE', number>;
declare const validate: (n: number) => Result<'RANGE', number>;
const widened: Result<'PARSE' | 'RANGE', number> = andThenResult(parsed, validate);
// @ts-expect-error - the callback's error type is part of the result
const _narrowed: Result<'PARSE', number> = andThenResult(parsed, validate);

// --- tryCatch: unknown error without a mapper, a known one with ---
const _raw: Result<unknown, number> = tryCatch(() => 1);
const _mapped: Result<string, number> = tryCatch(() => 1, String);
// @ts-expect-error - without a mapper the error is `unknown`, not `string`
const _unmapped: Result<string, number> = tryCatch(() => 1);

// --- andThenRD widens the error type like andThenResult ---
declare const fetched: RemoteData<'NETWORK', number>;
declare const check: (n: number) => RemoteData<'INVALID', string>;
const _rdWidened: RemoteData<'NETWORK' | 'INVALID', string> = andThenRD(fetched, check);

// --- foldRD requires a handler for every state ---
declare const rd: RemoteData<string, number>;
const _folded: string = foldRD(rd, {
  notAsked: () => '',
  loading: () => '',
  failure: (e) => e,
  success: (n) => String(n)
});
// @ts-expect-error - a missing `loading` handler is a compile error, not a runtime one
foldRD(rd, { notAsked: () => '', failure: (e) => e, success: (n) => String(n) });

// --- combineRD yields a readonly pair ---
declare const rdA: RemoteData<string, number>;
declare const rdB: RemoteData<string, boolean>;
const _pair: RemoteData<string, Tuple<number, boolean>> = combineRD(rdA, rdB);
declare const rdNumErr: RemoteData<number, boolean>;
// @ts-expect-error - both sides must share the error type
combineRD(rdA, rdNumErr);

// --- fromArrayNEA is a Maybe: the null case must be handled ---
declare const xs: number[];
const _maybeNea: NonEmptyArray<number> | null = fromArrayNEA(xs);
// @ts-expect-error - the empty case is not erased
const _definite: NonEmptyArray<number> = fromArrayNEA(xs);

export type { };
export {
  _z, _o, _t, _n, _d1, _d2, annotated, _reuse,
  widened, _narrowed, _raw, _mapped, _unmapped, _rdWidened, _folded, _pair, _maybeNea, _definite
};
