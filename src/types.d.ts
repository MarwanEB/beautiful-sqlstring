/**
 * Values used to return the raw SQL. They can be to create custom SQL statements or to include SQL tables for example.
 *
 * ```ts
 * const tableName = SqlKey('main.user')
 *
 * const query = sql`SELECT * FROM ${tableName}`
 * // Output: SELECT * FROM main.user
 *
 * const ids = [1, 2, 3]
 *
 * const query = sql`SELECT * FROM main.user WHERE ${SqlKey(ids.length ? sql`id IN (${ids})` : '1 = 1')}`
 * // Output: SELECT * FROM main.user WHERE id IN (1, 2, 3)
 * // If `ids` is empty: SELECT * FROM main.user WHERE 1 = 1
 * ```
 */
export type SqlKey = {
  toSqlString: () => string | number
}

/**
 * Value to be escaped by the `format` method of the NPM library `sqlstring`.
 * @link https://www.npmjs.com/package/sqlstring#usage
 */
export type SqlParameter =
  number // Numbers are left untouched
  | boolean // Booleans are converted to "true" / "false"
  | Date // Date objects are converted to 'YYYY-mm-dd HH:ii:ss'
  | Buffer // Buffers are converted to hex strings, e.g. X'0fa5'
  | string // Strings are escaped
  | SqlParameter[] // Arrays are turned into list, e.g. ['a', 'b'] turns into 'a', 'b'
  | SqlParameter[][] // Nested arrays are turned into grouped lists (for bulk inserts), e.g. [['a', 'b'], ['c', 'd']] turns into ('a', 'b'), ('c', 'd')
  | SqlKey // Objects that have a toSqlString method will have .toSqlString() called and the returned value is used as the raw SQL.
  | undefined | null // undefined / null are converted to NULL
  | {
      [key: string]: SqlParameter,
    } // Objects are turned into key-value pairs, e.g. {a: 1, b: 2} turns into `a`=1, `b`=2
