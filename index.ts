import { PGlite } from "@electric-sql/pglite";
import pgPromise, { IDatabase } from 'pg-promise';

const buildPgLiteAdapter = (db: PGlite, queryLatency?: number): unknown => {
    /**
     * This is where the adaption for pg-promise is done.
     * There are many eslint issues because this class needs to implement
     * an implicit interface (pg-promise is written in vanilla js)
     */
    class PgLiteClient {
        public on() {
            // nop
        }

        
        public release() {}
        
        public removeListener() {}

       
        public connect(callback: Function) {
            if (callback) {
                
                callback(null, this, () => {});
                return null;
            } else {
                return Promise.resolve(this);
            }
        }

        public async query(query: string, valuesOrCallback: unknown, callbackParam: unknown): Promise<unknown> {
            
            let callback: Function = callbackParam as never;
            if (callback == null && typeof valuesOrCallback === 'function') {
                callback = valuesOrCallback;
            }

            if (queryLatency) {
               await new Promise(resolve => setTimeout(resolve, queryLatency));
            }

            try {
                const result = await db.exec(query);

                if (callback) {
                    // setTimeout(() => callback(null, result), 0);
                    callback(null, result);
                    return null;
                } else {
                    return await new Promise(res => res(0));
                }
            } catch (e) {
                if (callback) {
                    setTimeout(() => callback(e), 0);
                    return null;
                } else {
                    return new Promise((_, reject) => reject(e));
                }
            }
        }
    }
    return {
        Pool: PgLiteClient,
        Client: PgLiteClient,
    };
};


let count = 0;
export function buildPgLitePromiseClient(db: PGlite, options: pgPromise.IInitOptions & { queryLatency?: number } = {}): IDatabase<unknown>  & { end: () => void } {
    const { queryLatency, ...pgInitOptions } = options;
    const pgp = pgPromise(pgInitOptions);

    (pgp as any).pg = buildPgLiteAdapter(db, queryLatency);

    const pgDatabase = pgp('pg-lite-ftw #' + count++);

    return pgDatabase as IDatabase<unknown>  & { end: () => void };
}
