import type { SqlKey } from './types.d'

/**
 * Value to be escaped by the `sql` method.
 */
export const sqlKey = (key: string | number): SqlKey => ({
  toSqlString: () => key,
})
