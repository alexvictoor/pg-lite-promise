import { PGlite } from "@electric-sql/pglite";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildPgLitePromiseClient } from ".";
import { IDatabase } from "pg-promise";

describe("pg-lite-promise", () => {
  let db: PGlite;
  let pgpLite: IDatabase<unknown>;

  beforeEach(async () => {
    db = new PGlite();
    await db.exec(`create table data(id text primary key, data jsonb, num integer, var varchar(10));
                        insert into data values ('str', '{"data": true}', 42, 'varchar')`);
    pgpLite = buildPgLitePromiseClient(db);
  });

  afterEach(async () => {
    await db.close();
  });

  it("should open connection", async () => {
    const got = await pgpLite.any("select * from data");
    expect(got).toEqual([
      {
        id: "str",
        data: { data: true },
        num: 42, 
        var: "varchar",
      },
    ]);
  });

  it("should throw errors when query is invalid", async () => {
    await expect(() =>  pgpLite.none(
      "INSERT INTO imaginary_table(first_name, last_name, age) VALUES('toto', 'titi', 42)")).rejects.toThrowError();
  });

  it("should use parameters", async () => {
    await db.exec(
      `create table users(first_name text, last_name text, age integer);`
    );

    pgpLite.none('CREATE SCHEMA $[schema~] AUTHORIZATION CURRENT_USER;', { schema: 'test' });
    await pgpLite.none(
      `create table $[schema~].users(first_name text, last_name text, age integer);`, { schema: 'test' }
    );
    await pgpLite.none(
      "INSERT INTO $[schema~].users(first_name, last_name, age) VALUES(${name.first}, $<name.last>, $/age/)",
      {
        name: { first: "John", last: "Dow" },
        age: 30,
        schema: 'test'
      }
    );
    const got = await pgpLite.any("select * from test.users");
    expect(got).toHaveLength(1);

  });

  it("should simulate query latency", async () => {
    pgpLite = buildPgLitePromiseClient(db, { queryLatency: 100 });
    const got = await pgpLite.any("select * from data");
    expect(got).toEqual([
      {
        id: "str",
        data: { data: true },
        num: 42, 
        var: "varchar",
      },
    ]);
  });

});