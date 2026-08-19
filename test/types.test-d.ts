/**
 * Type-level regression tests. These are never executed — they pass by
 * compiling cleanly under `npm run tsc`. Each `@ts-expect-error` is itself an
 * assertion: if the error stops happening, compilation fails.
 */
import type { DeepReadonly } from '../src/data/DeepReadonly';
import { createRP } from '../src/data/RemotePaginate';
import type { RemotePaginate } from '../src/data/RemotePaginate';

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

export type { };
export { _z, _o, _t, _n, _d1, _d2, annotated, _reuse };
