import type { SqlParameter, SqlKey } from './types'
import { sqlKey } from './sql-key'
import { sql } from './sql'

/**
 * Converts an object of n elements into a string containing valid SQL UPDATE CASE statement to be injected and the associated values.
 * If a value is set to `undefined`, the field will be skipped.
 * @example
 * ```ts
 * const [ids, statement] = sqlUpdate([
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
 * sqlUpdate([{ id: 1, name: 'John', age: 1 }, { id: 2, age: 2 }], 'id') === [
 *  [1, 2],
 *  sqlString(`
 *    name = CASE
 *      WHEN id = 1 THEN 'John'
 *      ELSE name
 *    END,
 *    age = CASE
 *      WHEN id = 1 THEN 1
 *      WHEN id = 2 THEN NULL
 *      ELSE age
 *    END`)
 * ```
 * ]
 */
export const sqlUpdate = <Id extends string, IdType extends string | number>(
  elements: ({ [key: string]: SqlParameter } & Record<Id, IdType>)[],
  idKey: Id,
): [ids: IdType[], SqlKey] => {
  const resultByKey: Record<string, [id: IdType, value: SqlParameter][]> = {}
  const ids: IdType[] = []

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
    if (key !== idKey) {
      let resString = `${key} = CASE\n`
  
      for (const [id, value] of resultByKey[key]) {
        resString += sql`WHEN ${sqlKey(idKey)} = ${id} THEN ${value}\n`
      }
      result.push(resString + `ELSE ${key}\nEND`)
    }
  }

  return [ids, sqlKey(result.join(',\n'))]
}
