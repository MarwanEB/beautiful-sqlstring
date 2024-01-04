import type { SqlParameter, SqlKey } from './types'
import { sqlKey } from './sql-key'
import { sql } from './sql'

/**
 * Converts an object of n elements into a string containing valid SQL UPDATE CASE statement to be injected and the associated values.
 * If a value is set to `undefined`, the field will be skipped.
 * @example
 * ```ts
 * const [ids, statement] = sqlUpdateStatement([
 *   { id: 1, name: 'John', age: 1 },
 *   { id: 2, age: null },
 * ])
 * const query = sql`
 *   UPDATE users
 *   SET ${statement}
 *   WHERE
 *     id IN (${ids})`
 * const rows = await mysql.query(query)
 *
 * getSqlUpdateField([{ id: 1, name: 'John', age: 1 }, { id: 2, age: 2 }], 'id') === sql`
 *   name = CASE
 *     WHEN id = 1 THEN 'John'
 *     ELSE name
 *   END,
 *   age = CASE
 *     WHEN id = 1 THEN 1
 *     WHEN id = 2 THEN NULL
 *     ELSE age
 *   END`
 * ```
 */
export const sqlUpdateStatement = <Id extends string>(
  elements: ({ [key: string]: SqlParameter } & Record<Id, (string|number)>)[],
  idKey: Id,
): [ids: (string|number)[], SqlKey] => {
  const resultByKey: {
    [key: string]: [
      id: string | number,
      value: SqlParameter,
    ][],
  } = {}
  const ids: (string| number)[] = []

  for (const element of elements) {
    const id = element[idKey]

    if (!id) {
      throw new Error(`Invalid empty key ${idKey} for the object ${JSON.stringify(element)}`)
    }

    ids.push(id)
    for (const key in element) {
      const value = element[key]
      if (value !== undefined) {
        resultByKey[key] = [
          ...resultByKey?.[key] ?? [],
          [id, value],
        ]
      }
    }
  }

  const result: string[] = []

  for (const key in resultByKey) {
    let resultKey = ''
    for (const [id, value] of resultByKey[key] ?? []) {
      resultKey += sql`WHEN ${sqlKey(id)} THEN ${value}\n`
    }
    result.push(resultKey + `ELSE ${sqlKey(key)}\nEND\n`)
  }

  return [ids, sqlKey(result.join(', '))]
}
