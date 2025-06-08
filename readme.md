# pg-promise adapter for pg-lite

This library provides seamless integration between the ultra-fast, WebAssembly-based PostgreSQL distribution [pg-lite](https://pglite.dev) and the popular PostgreSQL interface [pg-promise](https://github.com/vitaly-t/pg-promise).  
Its implementation is heavily inspired by the pg-promise adapter from the [pg-mem](https://github.com/oguimbal/pg-mem) project.

## Installation

Install via npm:

```bash
npm i pg-lite-promise
```
Or via yarn:
```bash
yarn add pg-lite-promise
```

## Getting started
Import and initialize a pg-lite database instance, then bind it to pg-promise:
```typescript
import { PGlite } from "@electric-sql/pglite";
import { buildPgLitePromiseClient } from "pg-lite-promise";

// Initialize pg-lite database
const db = new PGlite();

// Wrap pg-lite instance with pg-promise interface
const pgpLite = buildPgLitePromiseClient(db);

```

## Optional Configuration
The `buildPgLitePromiseClient` function accepts an optional second parameter of type `pgPromise.IInitOptions & { queryLatency?: number }`. You can use this to simulate query latency:
```typescript
// Introduce artificial latency of 100ms
const pgpLite = buildPgLitePromiseClient(db, { queryLatency: 100 });
```

## Example usage
```typescript
import { PGlite } from "@electric-sql/pglite";
import { buildPgLitePromiseClient } from "pg-lite-promise";

const main = async () => {
  // Initialize pg-lite database
  const db = new PGlite();
  await db.exec(`
    create table data(id text primary key, data jsonb, num integer, var varchar(10));
    insert into data values ('str', '{"data": true}', 42, 'varchar')
  `);

  // Wrap pg-lite instance with pg-promise interface
  const pgpLite = buildPgLitePromiseClient(db);

  // Use pg-promise api 
  const result = await pgpLite.any("select * from data");
  console.log(result);
}
main();
```    

## Further Documentation
- [pg-lite](https://pglite.dev/)
- [pg-promise](https://github.com/vitaly-t/pg-promise)