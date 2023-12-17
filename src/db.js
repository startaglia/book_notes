// db.js
import { pg } from "./dependencies.js";

const db = new pg.Client({
    user:       "postgres",
    host:       "localhost",
    database:   "book",
    password:   "Enomis198961!",
    port:       5432,
});

db.connect();

export { db };
