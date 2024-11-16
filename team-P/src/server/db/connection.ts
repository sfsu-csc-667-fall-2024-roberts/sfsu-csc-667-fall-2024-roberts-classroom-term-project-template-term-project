import pgp from "pg-promise";
import dotenv from 'dotenv';
dotenv.config();

const db = pgp()(String (process.env.DATABASE_URL!));
console.log("Connection details:", process.env.DATABASE_URL);

export default db;