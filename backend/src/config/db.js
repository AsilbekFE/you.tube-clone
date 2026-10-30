import dotenv from "dotenv";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });
dotenv.config();

const { Pool } = pg;

const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
          }
        : {
            user: process.env.PG_USER,
            port: process.env.PG_PORT ? Number(process.env.PG_PORT) : 5432,
            host: process.env.PG_HOST || '127.0.0.1',
            database: process.env.PG_DATABASE,
            password: String(process.env.PG_PASSWORD || '')
          }
);

// Baza jadvallarini avtomatik tekshirish va yaratish
export const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                phone TEXT,
                password VARCHAR(255),
                profile_img VARCHAR(255)
            );

            CREATE TABLE IF NOT EXISTS videos (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                view_file VARCHAR(255) NOT NULL,
                size VARCHAR(50),
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ PostgreSQL jadvallari tayyor!');
    } catch (err) {
        console.error('⚠️ DB Init xatolik:', err.message);
    }
};

export default pool;
