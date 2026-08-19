import type { JsonValue } from './JSONValue';

/** An opaque type is a type where coders cannot create or edit it
 * thereby guaranteeing the integrity of the value
 * Use it after validation, sanitisation or to hide inner value
 *
 * Coder must pass in a unique symbol for K in order to work
 * else if T is the same between two opaque types,
 * the two opaque types are considered equal in TS
 * Eg. Text256 == Email (if T is the same)
 *
 * Code Example:
 * const emailKey: unique symbol = Symbol(); // Do NOT export this key
 * type Email = Opaque<string, typeof emailKey>;
 * type EmailError = 'INVALID_EMAIL';
 * export function createEmailE(value: string): Result<EmailError, Email> {
 *   const isValid = validateEmail(value);
 *   if (isValid === true) {
 *     const opaqueType = {
 *       [emailKey]: value,
 *       unwrap: () => value,
 *       toJSON: () => value
 *     };
 *     return ok(opaqueType);
 *   } else {
 *     return err('INVALID_EMAIL');
 *   }
 * }
 *
 **/
export type Opaque<T, K extends symbol, Unwrapped = T> = {
  [key in K]: T;
} & {
  readonly unwrap: () => Unwrapped;
  readonly toJSON: () => JsonValue;
};

/**
 * A factory to create opaque type if the wrapped value is a kind of JSONValue.
 *
 * `unwrap` and `toJSON` close over the wrapped value, so they remain correct
 * when detached from the object (destructured, or passed as a callback).
 */
export function jsonValueCreate<T extends JsonValue, K extends symbol>(
  key: K
): (v: T) => Opaque<T, K> {
  return (value: T) => {
    return {
      [key]: value,
      unwrap: () => value,
      toJSON: () => value
    };
  };
}
