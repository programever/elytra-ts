import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { just, nothing, maybe, fromMaybe, fromResult, mapMaybe } from '../src/data/Maybe';
import { ok, err, mapResult, mapResultErr, fromOk, fromErr, partitionResult } from '../src/data/Result';
import {
  notAsked, loading, failure, success, mapRD, mapRDError, fromFailure, fromSuccess
} from '../src/data/RemoteData';
import {
  createRP, mapRPValue, mapRPMeta, mapRPStatus, appendRP, prependRP
} from '../src/data/RemotePaginate';
import type { RemotePaginate } from '../src/data/RemotePaginate';
import {
  nonEmptyArray, toArrayNEA, mapNEA, lastNEA, lengthNEA, headNEA, tailNEA, appendNEA, prependNEA
} from '../src/data/NonEmptyArray';
import { tuple, fst, snd, mapFst, mapSnd } from '../src/data/Tuple';
import { parseJsonValue } from '../src/data/JSONValue';
import { jsonValueCreate } from '../src/data/Opaque';

describe('Maybe', () => {
  it('wraps and unwraps', () => {
    assert.equal(just(3), 3);
    assert.equal(nothing(), null);
    assert.equal(maybe(undefined), null);
    assert.equal(maybe(0), 0, '0 is present, not absent');
    assert.equal(maybe(''), '', 'empty string is present, not absent');
  });

  it('fromMaybe falls back to the default', () => {
    assert.equal(fromMaybe(null, 'fallback'), 'fallback');
    assert.equal(fromMaybe('value', 'fallback'), 'value');
    assert.equal(fromMaybe(0, 99), 0, 'falsy-but-present must not hit the default');
  });

  it('maps only when present', () => {
    assert.equal(mapMaybe(2, (n: number) => n * 2), 4);
    assert.equal(mapMaybe(null as number | null, (n: number) => n * 2), null);
  });

  it('converts from Result', () => {
    assert.equal(fromResult(ok(5)), 5);
    assert.equal(fromResult(err('boom')), null);
  });
});

describe('Result', () => {
  it('maps value and error independently', () => {
    assert.deepEqual(mapResult(ok(2), (n: number) => n + 1), ok(3));
    assert.deepEqual(mapResult(err<string>('e'), (n: number) => n + 1), err('e'));
    assert.deepEqual(mapResultErr(err('e'), (e: string) => e.toUpperCase()), err('E'));
    assert.deepEqual(mapResultErr(ok(2), (e: string) => e.toUpperCase()), ok(2));
  });

  it('extracts sides as Maybe', () => {
    assert.equal(fromOk(ok(1)), 1);
    assert.equal(fromOk(err('e')), null);
    assert.equal(fromErr(err('e')), 'e');
    assert.equal(fromErr(ok(1)), null);
  });

  it('partitions preserving order', () => {
    const rs = [ok(1), err('a'), ok(2), err('b'), ok(3)];
    assert.deepEqual(partitionResult(rs), { oks: [1, 2, 3], errs: ['a', 'b'] });
    assert.deepEqual(partitionResult([]), { oks: [], errs: [] });
  });

  it('partitions large inputs in linear time', () => {
    // Regression guard: the previous reduce-with-spread was O(n^2) and took
    // ~44ms at n=16000. Linear code does 200k in a few ms.
    const n = 200_000;
    const rs = Array.from({ length: n }, (_, i) => (i % 2 ? ok(i) : err(i)));
    const started = process.hrtime.bigint();
    const { oks, errs } = partitionResult(rs);
    const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;
    assert.equal(oks.length + errs.length, n);
    assert.ok(elapsedMs < 500, `partitionResult took ${elapsedMs.toFixed(1)}ms for ${n} items`);
  });
});

describe('RemoteData', () => {
  it('maps success with (data, fn) argument order', () => {
    assert.deepEqual(mapRD(success<string, number>(2), (n) => n + 1), success(3));
    assert.deepEqual(mapRD(loading<string, number>(), (n) => n + 1), loading());
    assert.deepEqual(mapRD(notAsked<string, number>(), (n) => n + 1), notAsked());
    assert.deepEqual(mapRD(failure<string, number>('e'), (n) => n + 1), failure('e'));
  });

  it('maps failure with (data, fn) argument order', () => {
    assert.deepEqual(mapRDError(failure<string, number>('e'), (e) => e.length), failure(1));
    assert.deepEqual(mapRDError(success<string, number>(2), (e) => e.length), success(2));
  });

  it('extracts each side', () => {
    assert.equal(fromSuccess(success('d')), 'd');
    assert.equal(fromSuccess(loading()), null);
    assert.equal(fromFailure(failure('e')), 'e');
    assert.equal(fromFailure(loading()), null);
  });
});

describe('RemotePaginate', () => {
  const page = (): RemotePaginate<string, number, { total: number }> =>
    createRP([1, 2], { _t: 'Loaded' }, { total: 2 });

  it('maps values, meta and status only when Success', () => {
    assert.deepEqual(fromSuccess(mapRPValue(page(), (n) => n * 10))?.value, [10, 20]);
    assert.deepEqual(fromSuccess(mapRPMeta(page(), (m) => ({ total: m.total + 1 })))?.meta, { total: 3 });
    assert.deepEqual(fromSuccess(mapRPStatus(page(), () => ({ _t: 'NoMore' as const })))?.status, { _t: 'NoMore' });

    const notLoaded = loading<string, never>() as RemotePaginate<string, number, { total: number }>;
    assert.deepEqual(mapRPValue(notLoaded, (n) => n * 10), loading());
  });

  it('appends and prepends', () => {
    assert.deepEqual(fromSuccess(appendRP(page(), [3]))?.value, [1, 2, 3]);
    assert.deepEqual(fromSuccess(prependRP(page(), [0]))?.value, [0, 1, 2]);
  });

  it('does not mutate the input page', () => {
    const original = page();
    appendRP(original, [99]);
    assert.deepEqual(fromSuccess(original)?.value, [1, 2]);
  });
});

describe('NonEmptyArray', () => {
  it('always holds at least one element', () => {
    const one = nonEmptyArray(1);
    assert.deepEqual(toArrayNEA(one), [1]);
    assert.equal(lengthNEA(one), 1);
    assert.equal(headNEA(one), 1);
    assert.equal(lastNEA(one), 1, 'last of a single-element NEA is its head');
    assert.deepEqual(tailNEA(one), []);
  });

  it('handles head plus rest', () => {
    const nea = nonEmptyArray(1, [2, 3]);
    assert.deepEqual(toArrayNEA(nea), [1, 2, 3]);
    assert.equal(lengthNEA(nea), 3);
    assert.equal(lastNEA(nea), 3);
    assert.deepEqual(mapNEA(nea, (n) => n * 2), nonEmptyArray(2, [4, 6]));
    assert.deepEqual(toArrayNEA(appendNEA(nea, 4)), [1, 2, 3, 4]);
    assert.deepEqual(toArrayNEA(prependNEA(nea, 0)), [0, 1, 2, 3]);
  });

  it('survives an explicitly undefined element', () => {
    const nea = nonEmptyArray<number | undefined>(1, [undefined]);
    assert.equal(lengthNEA(nea), 2);
    assert.equal(lastNEA(nea), undefined, 'a present undefined is not the head');
  });
});

describe('Tuple', () => {
  it('constructs and projects', () => {
    const t = tuple('a', 1);
    assert.equal(fst(t), 'a');
    assert.equal(snd(t), 1);
    assert.deepEqual(mapFst(t, (s) => s.toUpperCase()), ['A', 1]);
    assert.deepEqual(mapSnd(t, (n) => n + 1), ['a', 2]);
  });
});

describe('JSONValue', () => {
  it('parses valid JSON into Ok', () => {
    assert.deepEqual(parseJsonValue('{"a":[1,null,true]}'), ok({ a: [1, null, true] }));
  });

  it('returns Err rather than throwing', () => {
    const result = parseJsonValue('{nope');
    assert.equal(result._t, 'Err');
  });
});

describe('Opaque', () => {
  const emailKey: unique symbol = Symbol('email');
  const makeEmail = jsonValueCreate<string, typeof emailKey>(emailKey);

  it('unwraps when called as a method', () => {
    assert.equal(makeEmail('a@b.com').unwrap(), 'a@b.com');
  });

  it('serialises via toJSON', () => {
    assert.equal(JSON.stringify(makeEmail('a@b.com')), '"a@b.com"');
    assert.equal(JSON.stringify({ email: makeEmail('a@b.com') }), '{"email":"a@b.com"}');
  });

  it('still unwraps once detached from the object', () => {
    // Regression guard: these used `this`, so destructuring threw a TypeError
    // and passing them as callbacks silently produced `undefined`.
    const { unwrap } = makeEmail('a@b.com');
    assert.equal(unwrap(), 'a@b.com');

    const unwrapped = [makeEmail('x@y.com')].map((e) => e.unwrap).map((fn) => fn());
    assert.deepEqual(unwrapped, ['x@y.com']);
  });

  it('keeps distinct values independent', () => {
    const a = makeEmail('a@b.com');
    const b = makeEmail('c@d.com');
    assert.equal(a.unwrap(), 'a@b.com');
    assert.equal(b.unwrap(), 'c@d.com');
  });
});
