import type { SqlParameter } from './types'
import { format } from 'sqlstring'

/**
 * Allows to write an escaped SQL query as a string template.
 * @example
 * sql`SELECT * FROM users WHERE id = ${1} and name = ${"name"}`
 * // "SELECT * FROM users WHERE id = 1 and name = 'name'"
 */
export const sql = (
  queryParts: TemplateStringsArray,
  ...values: SqlParameter[]
): string => format(
  queryParts.join('?'),
  values,
)
