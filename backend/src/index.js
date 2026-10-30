import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import router from './router/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import pool, { initDb } from './config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB gacha video yuklash
    abortOnLimit: true
}));

// Upload fayllar va statik resurslarni ulash
const uploadDir = path.resolve(__dirname, 'upload');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/upload', express.static(uploadDir));
app.use('/uploads', express.static(uploadDir));

// Frontend statik fayllarini ulash (agar frontend papkasi mavjud bo'lsa)
const frontendDir = path.resolve(__dirname, '..', '..', 'frontend');
if (fs.existsSync(frontendDir)) {
    app.use(express.static(frontendDir));

    app.get('/', (req, res) => {
        res.sendFile(path.join(frontendDir, 'index.html'));
    });
    app.get('/login', (req, res) => {
        res.sendFile(path.join(frontendDir, 'login.html'));
    });
    app.get('/register', (req, res) => {
        res.sendFile(path.join(frontendDir, 'register.html'));
    });
    app.get('/admin', (req, res) => {
        res.sendFile(path.join(frontendDir, 'admin.html'));
    });
}

// API marshrutlari
app.use(router);

// Xatoliklarni ushlovchi middleware
app.use(errorHandler);

// Serverni tinglash
app.listen(PORT, async () => {
    await initDb();
    console.log(`🚀 Server is running http://localhost:${PORT} portida muvaffaqiyatli ishga tushdi!`);
});
