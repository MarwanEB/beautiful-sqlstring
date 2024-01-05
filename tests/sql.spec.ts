import { sql, sqlKey } from "../src/index"

describe("sql", () => {
  it ("should escape a string", () => {
    expect(
      sql`SELECT * FROM entity WHERE name = ${'Marwan'}`).toBe(
      "SELECT * FROM entity WHERE name = 'Marwan'")
  })
  it ("should leave a number untouched", () => {
    expect(
      sql`SELECT * FROM entity WHERE id = ${1}`).toBe(
      "SELECT * FROM entity WHERE id = 1")
  })
  it ("should convert a boolean to true/false", () => {
    expect(
      sql`SELECT * FROM entity WHERE is_active = ${true}`).toBe(
      "SELECT * FROM entity WHERE is_active = true")
    expect(
      sql`SELECT * FROM entity WHERE is_active = ${false}`).toBe(
      "SELECT * FROM entity WHERE is_active = false")
  })
  it ("should convert a date to 'YYYY-mm-dd HH:ii:ss'", () => {
    expect(
      sql`SELECT * FROM entity WHERE created_at = ${new Date('2021-01-01 00:00:00')}`).toBe(
      "SELECT * FROM entity WHERE created_at = '2021-01-01 00:00:00.000'")
  })
  it ("should convert a buffer", () => {
    expect(
      sql`SELECT * FROM entity WHERE buffer = ${Buffer.from('test')}`).toBe(
      "SELECT * FROM entity WHERE buffer = X'74657374'")
  })
  it ("should turn an array into grouped list", () => {
    expect(
      sql`SELECT * FROM entity WHERE id IN (${[1, 2, 3]})`).toBe(
      "SELECT * FROM entity WHERE id IN (1, 2, 3)")
  })
  it ("should escape a nested array", () => {
    expect(
      sql`INSERT INTO entity (id, value) VALUES ${[[1, 'haha'], [2, 'hahaha']]}`).toBe(
      "INSERT INTO entity (id, value) VALUES (1, 'haha'), (2, 'hahaha')")
  })
  it ("should turn a SqlKey into raw SQL", () => {
    expect(
      sql`SELECT * FROM ${sqlKey('entity')}`).toBe(
      "SELECT * FROM entity")
    expect(
      sql`SELECT ${sqlKey('id')} FROM ${sqlKey('entity')}`).toBe(
      "SELECT id FROM entity")
  })
  it("should turn an object into key-value pairs", () => {
    expect(
      sql`SELECT * FROM entity WHERE ${{
        'entity.id': 1,
        'entity.name': 'Marwan',
      }}`).toBe(
      "SELECT * FROM entity WHERE `entity`.`id` = 1, `entity`.`name` = 'Marwan'")
    expect(
      sql`SELECT * FROM entity WHERE ${{
        id: 1,
        name: 'Marwan',
      }}`).toBe(
      "SELECT * FROM entity WHERE `id` = 1, `name` = 'Marwan'")
  })

  // Add more test cases here...
})
