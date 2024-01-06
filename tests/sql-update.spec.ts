import { sql, sqlUpdate } from '../src/index'

describe ('sqlUpdate', () => {
  it ('should return number ids and associated SQL statement', () => {
    const [ids, statement] = sqlUpdate([
      { id: 1, name: 'John', age: 1 },
      { id: 2, age: null },
    ], 'id')
    expect(sql`
UPDATE users
SET ${statement}
WHERE id IN (${ids})`
).toBe(`
UPDATE users
SET name = CASE
WHEN id = 1 THEN 'John'
ELSE name
END,
age = CASE
WHEN id = 1 THEN 1
WHEN id = 2 THEN NULL
ELSE age
END
WHERE id IN (1, 2)`)
  })
  it ('should return string ids and associated SQL statement', () => {
    const [ids, statement] = sqlUpdate([
      { id: 'a', name: 'John', age: 1 },
      { id: 'b', age: null },
    ], 'id')
    expect(ids).toEqual(['a', 'b'])
    expect(statement.toSqlString()).toEqual(
`name = CASE
WHEN id = 'a' THEN 'John'
ELSE name
END,
age = CASE
WHEN id = 'a' THEN 1
WHEN id = 'b' THEN NULL
ELSE age
END`)
  })
  it ('should throw an error if an object has an empty id', () => {
    expect(() => {
      sqlUpdate([
        { id: 1, name: 'John', age: 1 },
        // @ts-expect-error
        { id: null, age: null },
      ], 'id')
    }
    ).toThrow()
  })
})
