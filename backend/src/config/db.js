import dotenv from "dotenv";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    user: process.env.PG_USER,
    port: process.env.PG_PORT ? Number(process.env.PG_PORT) : 5432,
    host: process.env.PG_HOST || '127.0.0.1',
    database: process.env.PG_DATABASE,
    password: String(process.env.PG_PASSWORD || '')
});

export default pool;
