import { Result, err, ok } from './Result';

/**
 * Represents any valid JSON value.
 *
 * A `JsonValue` can be:
 * - a string
 * - a number
 * - a boolean
 * - null
 * - an array of `JsonValue`
 * - an object with string keys and `JsonValue` values
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Attempts to parse a string into a `JsonValue`.
 *
 * @param s - A JSON-formatted string.
 * @returns A `Result` containing the parsed `JsonValue` on success, or an error message on failure.
 */
export function parseJsonValue(s: string): Result<string, JsonValue> {
  try {
    const data = JSON.parse(s);
    return ok(data);
  } catch (error) {
    return err(String(error));
  }
}
