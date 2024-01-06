# beautiful-sqlstring

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](https://badge.fury.io/js/beautiful-sqlstring.svg)](https://badge.fury.io/js/beautiful-sqlstring)
[![Build Status](https://github.com/MarwanEB/beautiful-sqlstring/actions/workflows/main.yaml/badge.svg)](https://github.com/MarwanEB/beautiful-sqlstring/actions/workflows/main.yaml)
[![Code coverage](https://codecov.io/gh/MarwanEB/beautiful-sqlstring/graph/badge.svg?token=ZFK2TXK7D1)](https://codecov.io/gh/MarwanEB/beautiful-sqlstring)

Lightweight MySQL escaping library providing helpers to write readable TypeScript MySQL queries.

## How to use 📦

Starting by adding the library in your project.

```sh
npm install --save beautiful-sqlstring
yarn add beautiful-sqlstring
pnpm add beautiful-sqlstring
```

`beautiful-sqlstring` provides 3 main functions to escape and format your SQL queries:

- `sql` allows you to escape a MySQL query using string templates
- `sqlUpdate` allows to write bulk update queries from a list of objects.
- `sqlKey` transforms a string into a MySQL key (table name, column name, etc.) that will be left untouched by the `sql` function

### Select query

Use `sqlKey` to escape table, column names, etc. that you want to store as variables.

```ts
import { sql, sqlKey } from 'beautiful-sqlstring';

const TABLE_NAME = 'users';

const query1 = sql`
  SELECT id, name
  FROM ${sqlKey('users')}
  WHERE name LIKE ${"%john%"}
`;
// SELECT id, name FROM users WHERE name LIKE "%john%"

function getUsers(shouldIncludeName: boolean) {
  const query2 = sql`
    SELECT
      id
      ${sqlKey(shouldIncludeName ? ', name' : '')}
    FROM
      ${sqlKey(TABLE_NAME)}
    WHERE
      createdAt > ${new Date("2023-01-01")}`;
  // ...
}
```

### Insert query

You can directly pass a list of elements to `sql` to generate a bulk insert query.

```ts
import { sql, sqlKey } from 'beautiful-sqlstring';

const TABLE_NAME = 'users';

const query = sql`
  INSERT INTO ${sqlKey(TABLE_NAME)} (name, age)
  VALUES ${[
    ['John', 20],
    ['Jane', 21],
  ]}`;
// INSERT INTO users (name, age) VALUES ("John", 20), ("Jane", 21)

function insertUsers(users: { name: string; age: number }[]) {
  const query = sql`
    INSERT INTO ${sqlKey(TABLE_NAME)} (name, age)
    VALUES ${users.map((user) => [user.name, user.age])}
  `;
  // ...
}
```

### Update query

#### Simple update query

For simple update queries, you can provide a list of object to `sql` to generate the query.

```ts
import { sql, sqlKey } from 'beautiful-sqlstring';

const TABLE_NAME = 'users';

const query = sql`
  UPDATE ${sqlKey(TABLE_NAME)}
  SET ${{ name: 'John', age: 20 }}
  WHERE id = ${1}`;

function updateUser(user: { name: string, age: number, id: number }) {
  const {id, ...rest } = user
  const query = sql`
    UPDATE ${sqlKey(TABLE_NAME)}
    SET ${rest}
    WHERE id = ${id}`;
}
```

#### Bulk update query

For bulk update queries, you'll probably want to run an `UPDATE CASE` statement that can end up being tricky to write. `sqlUpdate` allows you to write a bulk update query from a list of objects.

```ts
import { sql, sqlUpdate, sqlKey } from 'beautiful-sqlstring';

const [ids, statement] = sqlUpdate(
  [
    { id: 1, name: 'John', age: 20 },
    { id: 2, name: 'Jane', age: 21 },
  ],
  'id',
);
const query = sql`
  UPDATE ${sqlKey(TABLE_NAME)}
  SET ${statement}
  WHERE id IN (${ids})`;
// Output:
// UPDATE users
// SET name = CASE id WHEN 1 THEN "John" WHEN 2 THEN "Jane" END,
//     age = CASE id WHEN 1 THEN 20 WHEN 2 THEN 21 END
// WHERE id IN (1, 2)

function updateUsers(users: { name: string; age: number; id: number }[]) {
  const [ids, statement] = sqlUpdate(users, 'id');
  const query = sql`
    UPDATE ${sqlKey(TABLE_NAME)}
    SET ${statement}
    WHERE id IN (${ids})`;
  return mysql.query(query);
}
```

### Escaping rules

| Input type           | Description                                                    | Example                                                  |
| -------------------- | -------------------------------------------------------------- | -------------------------------------------------------- |
| `string`             | Strings are escaped                                            | `${'string'}` ➡️ `"string"`                               |
| `number`             | Numbers are left untouched                                     | `${1}` ➡️ `1`                                             |
| `boolean`            | Booleans are converted to `true` or `false`                    | `${true}` ➡️ `1`                                          |
| `Date`               | Dates are converted to MySQL date format                       | `${new Date('2021-01-01')}` ➡️ `"2021-01-01 00:00:00"`    |
| `null` / `undefined` | `null` and `undefined` are converted to `NULL`                 | `${null}` ➡️ `NULL`                                       |
| `Buffer`             | Buffers are converted to hex strings                           | `${Buffer.from('test')}` ➡️ `X'74657374'`                 |
| `Param[]`            | Arrays are converted to a list of escaped values               | `${[1, 2, 3]}` ➡️ `1, 2, 3`                               |
| `Param[][]`          | Nested arrays are turned into grouped lists (for bulk inserts) | `${[['a', 'b'], ['c', 'd']]}` ➡️ `('a', 'b'), ('c', 'd')` |
| `Object`             | Objects are converted to a list of escaped key / value pairs   | `${{ a: 1, b: 2 }}` ➡️ `a = 1, b = 2`                     |
| `sqlKey`             | `sqlKey` is used to escape table, column names, etc.           | `${sqlKey('users')}` ➡️ `users`                           |

## Development 🧑🏼‍💻

To bundle this project you first need to install [nvm](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) (this will allow you to install and use the correct version of Node.js / npm for this project).

1. Install the right version of node / npm

```sh
nvm install && nvm use
```

2. Install dependencies

```sh
npm ci
```

3. You can run your tests with the following commands

```sh
npm run test
npm run test:watch
```

4. You can build your code with the following command (once the command works properly, you will see `dist` folder)
5. To publish your package to npm, you'll need to push your version in `package.json`, push your changes to your branch and open / merge a Pull Request to `main` branch.

```sh
npm version patch | minor | major
git push origin your-branch
```

## TODO 📝

- [ ] Remove `sqlstring` dependency
