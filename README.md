# 🪶 elytra-ts

**elytra-ts** is a lightweight functional toolkit for TypeScript, focused on modeling data with precision, safety, and composability. It provides a set of generic, reusable types and helpers such as `Maybe`, `Result`, `RemoteData`, `Opaque`, and more — built for functional programming lovers.

---

## ✨ Features

- ✅ Safe, expressive types for optional and fallible data
- 🔁 Utilities for working with paginated and async state
- 🔒 Deep readonly support for immutable structures
- 🧩 Composable tuple and non-empty array helpers
- ⚡ Zero dependencies, dual ESM/CJS builds, tree-shakeable

---

## 📦 Installation

[NPM package](https://www.npmjs.com/package/elytra-ts) is available.

```bash
npm install elytra-ts
```

Or with Yarn:

```bash
yarn add elytra-ts
```

---

## 🧠 Modules Overview

### 🔹 `Maybe<T>`
Represents a value that may or may not exist.

```ts
import { Maybe, maybe, mapMaybe, fromMaybe } from 'elytra-ts';

const name: Maybe<string> = maybe(getName());
const upper = mapMaybe(name, (s) => s.toUpperCase());
const display = fromMaybe(upper, 'ANONYMOUS'); // string, never null
```

---

### 🔹 `Result<E, T>`
Represents success or failure with a value or error.

```ts
import { Result, ok, err } from 'elytra-ts';

function parseJson(s: string): Result<string, unknown> {
  try {
    return ok(JSON.parse(s));
  } catch (e) {
    return err('Invalid JSON');
  }
}
```

---

### 🔹 `RemoteData<E, T>`
Represents async/remote state: NotAsked, Loading, Failure, Success.

```ts
import { RemoteData, loading, mapRD } from 'elytra-ts';

const users: RemoteData<string, User[]> = loading();
const names = mapRD(users, (us) => us.map((u) => u.name)); // (data, fn)
```

---

### 🔹 `RemotePaginate<E, T, M = undefined, S = PaginateStatus<E>>`
A paginated wrapper around `RemoteData`, customizable with user-defined status and metadata.

```ts
import { RemotePaginate, createRP } from 'elytra-ts';

// Annotate the binding: `E` appears in no parameter, so it cannot be inferred
// from the arguments (the same is true of `notAsked()` and `loading()`).
const page: RemotePaginate<string, Item, { total: number }> = createRP(
  [item1],
  { _t: 'Loaded' },
  { total: 10 }
);
```

---

### 🔹 `DeepReadonly<T>`
A deep-readonly recursive type utility. Functions are left callable at any arity.

```ts
import { DeepReadonly } from 'elytra-ts';

type Config = DeepReadonly<{
  user: { name: string; preferences: string[] };
}>;
```

---

### 🔹 `Tuple<A, B>`
Immutable two-value tuple helpers.

```ts
import { tuple, fst, snd } from 'elytra-ts';

const t = tuple(1, 'a');
fst(t); // 1
snd(t); // 'a'
```

---

### 🔹 `NonEmptyArray<T>`
An array-like structure that guarantees at least one element at the type level.

```ts
import { nonEmptyArray, mapNEA, toArrayNEA } from 'elytra-ts';

const nea = nonEmptyArray(1, [2, 3]);
const doubled = mapNEA(nea, (x) => x * 2); // { first: 2, rest: [4, 6] }
toArrayNEA(doubled); // [2, 4, 6]
```

---

### 🔹 `JSONValue`
Strict type for representing any JSON-compatible value + safe parser.

```ts
import { JsonValue, parseJsonValue } from 'elytra-ts';

const result = parseJsonValue('{ "foo": 1 }');
```

---

### 🔹 `Opaque<Type, Token>`
Build opaque types for safety.

```ts
// Email.ts
import { Opaque, err, ok, Result} from 'elytra-ts';
const emailKey: unique symbol = Symbol(); // Do NOT export this key
type Email = Opaque<string, typeof emailKey>;
type EmailError = 'INVALID_EMAIL';
export function createEmailE(value: string): Result<EmailError, Email> {
  const isValid = validateEmail(value);
  if (isValid === true) {
    const opaqueType = {
      [emailKey]: value,
      unwrap: () => value,
      toJSON: () => value
    };
    return ok(opaqueType);
  } else {
    return err('INVALID_EMAIL');
  }
}

// Other.ts
import { createEmailE, Email } from './Email';
const emailE = createEmailE('validEmail@example.com')
```

---

## 📁 Full Exports

```ts
import {
  // Maybe
  Maybe, Just, Nothing, just, nothing, maybe,
  fromMaybe, fromResult, mapMaybe,

  // Result
  Result, Ok, Err, ok, err, mapResult, mapResultErr,
  fromOk, fromErr, partitionResult,

  // RemoteData
  RemoteData, NotAsked, Loading, Failure, Success,
  notAsked, loading, failure, success, mapRD,
  mapRDError, fromFailure, fromSuccess,

  // RemotePaginate
  RemotePaginate, Paginate, PaginateStatus,
  createRP, mapRPValue, mapRPMeta, mapRPStatus,
  appendRP, prependRP,

  // DeepReadonly
  DeepReadonly,

  // Tuple
  Tuple, tuple, fst, snd, mapFst, mapSnd,

  // NonEmptyArray
  NonEmptyArray, nonEmptyArray, toArrayNEA, mapNEA, lastNEA,
  lengthNEA, headNEA, tailNEA, appendNEA, prependNEA,

  // JSONValue
  JsonValue, parseJsonValue,

  // Opaque
  Opaque, jsonValueCreate
} from 'elytra-ts';
```

---

## 🧪 Philosophy

elytra-ts is built for developers who value:

- Type-level guarantees
- Functional programming ergonomics
- Readable, intention-revealing code
- Full editor support (hover, docs, autocomplete)

No classes, no inheritance, no hidden state — just types and small pure functions.

---

## ⚠️ Migrating to 0.2.0

0.2.0 fixes several bugs that required breaking changes. All of them are mechanical:

| 0.1.x | 0.2.0 | Why |
|---|---|---|
| `Readonly<T>` | `DeepReadonly<T>` | The old name shadowed TypeScript's built-in `Readonly` on import. The type also silently reduced any function taking **one or more arguments** to `{}`; it now leaves functions callable at any arity. |
| `fromMaybe(m)` | `fromMaybe(m, default)` | It used to be an identity function. It now unwraps with a fallback, matching what the name means everywhere else. |
| `mapRD(fn, data)` | `mapRD(data, fn)` | Argument order now matches `mapResult`, `mapMaybe` and every `mapRP*`. |
| `mapRDError(fn, data)` | `mapRDError(data, fn)` | As above. |
| `toArray(nea)` | `toArrayNEA(nea)` | Matches the `NEA` suffix used by the other eight helpers. |
| `NonEmptyArray.first` / `.rest` mutable | both `readonly` | Consistent with the rest of the library. |

Also fixed, with no API change:

- `Opaque` values built by `jsonValueCreate` used `this` internally, so a destructured `unwrap` threw a `TypeError` and one passed as a callback silently returned `undefined`. Both now work.
- `partitionResult` was quadratic; it is now linear.
- `createRP` defaulted its status type to `unknown` rather than `PaginateStatus<E>`.

## 🤝 Contributing

PRs and feedback welcome!  
If you have suggestions or want to help expand this tool (e.g., monorepo support, GitHub Actions), open an issue or pull request.

Development uses the Node version in `.nvmrc` (24). The published package
supports Node >= 20, and CI runs the full suite on 20, 22 and 24 to keep that
promise honest.

```bash
nvm use
npm install
npm run lint     # eslint
npm run tsc      # typecheck src and tests
npm test         # node:test suite + type-level regression tests
npm run build    # dual ESM/CJS output into dist/
```

Type-level behaviour is tested in `test/types.test-d.ts`, which is never executed —
it passes by compiling cleanly, and each `@ts-expect-error` there is an assertion.

---

## 🚀 Releasing

Releases are automated. Pushing or merging to `main` runs
[`.github/workflows/publish.yml`](.github/workflows/publish.yml), which:

## 📜 License

MIT — feel free to use, fork, or remix.

---

## 🧙 Author

**Iker (aka programever)**  
BedrockTS, PureScript lover, FP warrior  
🌐 [github.com/programever](https://github.com/programever)
