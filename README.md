# 🪶 elytra-ts

**elytra-ts** is a lightweight functional toolkit for TypeScript, focused on modeling data with precision, safety, and composability. It provides a set of generic, reusable types and helpers such as `Maybe`, `Result`, `RemoteData`, `Opaque`, and more — built for functional programming lovers.

---

## ✨ Features

- ✅ Safe, expressive types for optional and fallible data
- 🔁 Utilities for working with paginated and async state
- 🔒 Deep readonly support for immutable structures
- 🧩 Composable tuple and non-empty array helpers
- ⚡ Zero dependencies, fully tree-shakeable

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
import { Maybe, maybe, mapMaybe } from 'elytra-ts';

const name: Maybe<string> = maybe(getName());
const upper = mapMaybe(name, (s) => s.toUpperCase());
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
import { RemoteData, loading } from 'elytra-ts';

const users: RemoteData<string, User[]> = loading();
```

---

### 🔹 `RemotePaginate<E, T, M = undefined, S = PaginateStatus<E>>`
A paginated wrapper around `RemoteData`, customizable with user-defined status and metadata.

```ts
import { RemotePaginate, createRP } from 'elytra-ts';

const page = createRP([item1], { _t: 'Loaded' }, { total: 10 });
```

---

### 🔹 `Readonly<T>`
A deep-readonly recursive type utility.

```ts
import { Readonly } from 'elytra-ts';

type Config = Readonly<{
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
import { nonEmptyArray, mapNEA } from 'elytra-ts';

const nea = nonEmptyArray(1, [2, 3]);
mapNEA(nea, (x) => x * 2); // [2, 4, 6]
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
import { Opaque, jsonValueCreate, err, ok, Result} from 'elytra-ts';

const emailKey: unique symbol = Symbol(); // Do NOT export this key
type Email = Opaque<string, typeof emailKey>;
type EmailError = 'INVALID_EMAIL';

export function createEmail(value: string): Result<EmailError, Email> {
  if (validateEmail(value)) {
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

export function createEmailWithHelper(value: string): Result<EmailError, Email> {
  if (validateEmail(value)) {
    return ok(jsonValueCreate<string, typeof emailKey>(emailKey)(value));
  } else {
    return err('INVALID_EMAIL');
  }
}

// Other.ts
import { createEmail, Email } from './Email';

const emailResult = createEmail('validEmail@example.com')
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

  // Readonly
  Readonly,

  // Tuple
  Tuple, tuple, fst, snd, mapFst, mapSnd,

  // NonEmptyArray
  NonEmptyArray, nonEmptyArray, toArray, mapNEA, lastNEA,
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

No runtime code. No classes. Just types and pure helpers.

---

## 🤝 Contributing

PRs and feedback welcome!  
If you have suggestions or want to help expand this tool (e.g., monorepo support, GitHub Actions), open an issue or pull request.

---

## 📜 License

MIT — feel free to use, fork, or remix.

---

## 🧙 Author

**Iker (aka programever)**  
BedrockTS, PureScript lover, FP warrior  
🌐 [github.com/programever](https://github.com/programever)
