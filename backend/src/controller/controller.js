import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, '..');

// ==================== AUTH CONTROLLERS ====================

export const register = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const avatarFile = req.files?.file;

        if (!username || !password || !avatarFile) {
            return res.status(400).json({
                status: 400,
                message: 'Iltimos, barcha maydonlarni to\'ldiring va avatar faylini yuklang!'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                status: 400,
                message: 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak!'
            });
        }

        // 1. Bazada foydalanuvchi bor-yo'qligini tekshiramiz
        const checkUser = await pool.query(
            'SELECT * FROM users WHERE LOWER(name) = LOWER($1)',
            [username.trim()]
        );
        if (checkUser.rows.length > 0) {
            return res.status(400).json({
                status: 400,
                message: 'Bu foydalanuvchi nomi allaqachon mavjud!'
            });
        }

        // 2. Avatar faylini saqlash
        const cleanFileName = `${Date.now()}_${avatarFile.name.replace(/\s+/g, '_')}`;
        const uploadPath = path.join(SRC_DIR, 'upload', 'avatars', cleanFileName);
        await avatarFile.mv(uploadPath);

        const hashedPassword = await bcrypt.hash(password, 10);
        const profileImg = `/upload/avatars/${cleanFileName}`;

        // 3. PostgreSQL ga yangi foydalanuvchini kiritamiz
        const insertResult = await pool.query(
            'INSERT INTO users (name, password, profile_img) VALUES ($1, $2, $3) RETURNING id, name, profile_img',
            [username.trim(), hashedPassword, profileImg]
        );

        const newUser = {
            userId: insertResult.rows[0].id,
            username: insertResult.rows[0].name,
            profileImg: insertResult.rows[0].profile_img
        };

        const secret = process.env.JWT_SECRET || 'youtube_imtihon_secret_key_2026';
        const token = jwt.sign(
            { userId: newUser.userId, username: newUser.username },
            secret,
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            status: 201,
            message: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz!',
            token,
            data: {
                userId: newUser.userId,
                username: newUser.username,
                profileImg: newUser.profileImg
            }
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                status: 400,
                message: 'Iltimos, username va parolni kiriting!'
            });
        }

        const { rows } = await pool.query(
            'SELECT id AS "userId", name AS "username", password, profile_img AS "profileImg" FROM users WHERE LOWER(name) = LOWER($1)',
            [username.trim()]
        );
        const user = rows[0];

        if (!user) {
            return res.status(400).json({
                status: 400,
                message: 'Login yoki parol noto\'g\'ri!'
            });
        }

        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(password, user.password);
        } catch {
            isMatch = false;
        }

        if (!isMatch && user.password === password) {
            isMatch = true;
        }

        if (!isMatch) {
            return res.status(400).json({
                status: 400,
                message: 'Login yoki parol noto\'g\'ri!'
            });
        }

        const secret = process.env.JWT_SECRET || 'youtube_imtihon_secret_key_2026';
        const token = jwt.sign(
            { userId: user.userId, username: user.username },
            secret,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            status: 200,
            message: 'Tizimga muvaffaqiyatli kirildi!',
            token,
            data: {
                userId: user.userId,
                username: user.username,
                profileImg: user.profileImg
            }
        });
    } catch (error) {
        next(error);
    }
};

// ==================== USER CONTROLLERS ====================

export const getUsers = async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            'SELECT id AS "userId", name AS "username", profile_img AS "profileImg" FROM users ORDER BY id ASC'
        );

        return res.status(200).json({
            status: 200,
            data: rows
        });
    } catch (error) {
        next(error);
    }
};

// ==================== FILE CONTROLLERS ====================

export const getFiles = async (req, res, next) => {
    try {
        const { rows } = await pool.query(`
            SELECT 
                v.id AS "fileId",
                v.title AS "videoInput",
                v.view_file AS "viewFile",
                CONCAT('/download/', v.id) AS "downloadLink",
                v.size AS "size",
                TO_CHAR(v.created_at, 'DD/MM/YYYY') AS "data",
                TO_CHAR(v.created_at, 'HH24:MI') AS "time",
                json_build_object(
                    'userId', u.id,
                    'username', u.name,
                    'profileImg', u.profile_img
                ) AS "user"
            FROM videos v
            LEFT JOIN users u ON v.user_id = u.id
            ORDER BY v.id DESC
        `);

        return res.status(200).json({
            status: 200,
            data: rows
        });
    } catch (error) {
        next(error);
    }
};

export const getMyFiles = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { rows } = await pool.query(`
            SELECT 
                v.id AS "fileId",
                v.title AS "videoInput",
                v.view_file AS "viewFile",
                CONCAT('/download/', v.id) AS "downloadLink",
                v.size AS "size",
                TO_CHAR(v.created_at, 'DD/MM/YYYY') AS "data",
                TO_CHAR(v.created_at, 'HH24:MI') AS "time",
                json_build_object(
                    'userId', u.id,
                    'username', u.name,
                    'profileImg', u.profile_img
                ) AS "user"
            FROM videos v
            LEFT JOIN users u ON v.user_id = u.id
            WHERE v.user_id = $1
            ORDER BY v.id DESC
        `, [userId]);

        return res.status(200).json({
            status: 200,
            data: rows
        });
    } catch (error) {
        next(error);
    }
};

export const uploadFile = async (req, res, next) => {
    try {
        const { videoInput } = req.body;
        const videoFile = req.files?.file;

        if (!videoInput || !videoFile) {
            return res.status(400).json({
                status: 400,
                message: 'Iltimos, video sarlavhasi va video faylini tanlang!'
            });
        }

        const { rows: userRows } = await pool.query(
            'SELECT id AS "userId", name AS "username", profile_img AS "profileImg" FROM users WHERE id = $1',
            [req.user.userId]
        );
        const currentUser = userRows[0];

        if (!currentUser) {
            return res.status(404).json({
                status: 404,
                message: 'Foydalanuvchi topilmadi!'
            });
        }

        const cleanFileName = `${Date.now()}_${videoFile.name.replace(/\s+/g, '_')}`;
        const uploadPath = path.join(SRC_DIR, 'upload', 'videos', cleanFileName);

        await videoFile.mv(uploadPath);

        const sizeMb = (videoFile.size / (1024 * 1024)).toFixed(1);
        const viewFile = `/upload/videos/${cleanFileName}`;

        const { rows: videoRows } = await pool.query(
            'INSERT INTO videos (title, view_file, size, user_id) VALUES ($1, $2, $3, $4) RETURNING id, title, view_file, size, created_at',
            [videoInput.trim(), viewFile, sizeMb, req.user.userId]
        );

        const savedVideo = videoRows[0];
        const now = new Date(savedVideo.created_at);
        const dateStr = now.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

        const newVideo = {
            fileId: savedVideo.id,
            videoInput: savedVideo.title,
            viewFile: savedVideo.view_file,
            downloadLink: `/download/${savedVideo.id}`,
            size: savedVideo.size,
            data: dateStr,
            time: timeStr,
            user: {
                userId: currentUser.userId,
                username: currentUser.username,
                profileImg: currentUser.profileImg
            }
        };

        return res.status(200).json({
            status: 200,
            message: 'Video muvaffaqiyatli yuklandi!',
            data: newVideo
        });
    } catch (error) {
        next(error);
    }
};

export const updateFile = async (req, res, next) => {
    try {
        const { fileId, value } = req.body;
        const userId = req.user.userId;

        if (!fileId || !value) {
            return res.status(400).json({
                status: 400,
                message: 'fileId va yangi sarlavha (value) kiritilishi shart!'
            });
        }

        const { rows } = await pool.query('SELECT * FROM videos WHERE id = $1', [fileId]);

        if (rows.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'Video topilmadi!'
            });
        }

        if (Number(rows[0].user_id) !== Number(userId)) {
            return res.status(403).json({
                status: 403,
                message: 'Siz ushbu videoni o\'zgartirish huquqiga ega emassiz!'
            });
        }

        await pool.query('UPDATE videos SET title = $1 WHERE id = $2', [value.trim(), fileId]);

        return res.status(200).json({
            status: 200,
            message: 'Video sarlavhasi muvaffaqiyatli yangilandi!'
        });
    } catch (error) {
        next(error);
    }
};

export const deleteFile = async (req, res, next) => {
    try {
        const { fileId } = req.body;
        const userId = req.user.userId;

        if (!fileId) {
            return res.status(400).json({
                status: 400,
                message: 'fileId kiritilishi shart!'
            });
        }

        const { rows } = await pool.query('SELECT * FROM videos WHERE id = $1', [fileId]);

        if (rows.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'Video topilmadi!'
            });
        }

        const file = rows[0];

        if (Number(file.user_id) !== Number(userId)) {
            return res.status(403).json({
                status: 403,
                message: 'Siz ushbu videoni o\'chirish huquqiga ega emassiz!'
            });
        }

        // Faylni xotiradan ham o'chirish (agar mavjud bo'lsa)
        if (file.view_file) {
            const actualPath = path.join(SRC_DIR, file.view_file);
            if (fs.existsSync(actualPath)) {
                try {
                    fs.unlinkSync(actualPath);
                } catch (e) {
                    console.error('Faylni o\'chirishda xatolik:', e);
                }
            }
        }

        await pool.query('DELETE FROM videos WHERE id = $1', [fileId]);

        return res.status(200).json({
            status: 200,
            message: 'Video muvaffaqiyatli o\'chirildi!'
        });
    } catch (error) {
        next(error);
    }
};

export const downloadFile = async (req, res, next) => {
    try {
        const { fileId } = req.params;
        const { rows } = await pool.query('SELECT * FROM videos WHERE id = $1', [fileId]);

        if (rows.length === 0 || !rows[0].view_file) {
            return res.status(404).send('Fayl topilmadi!');
        }

        const file = rows[0];
        const filePath = path.join(SRC_DIR, file.view_file);
        if (!fs.existsSync(filePath)) {
            return res.status(404).send('Video fayli diskda topilmadi!');
        }

        return res.download(filePath, `${file.title || 'video'}.mp4`);
    } catch (error) {
        next(error);
    }
};

// ==================== DEFAULT EXPORT ====================

const Controller = {
    register,
    login,
    getUsers,
    getFiles,
    getMyFiles,
    uploadFile,
    updateFile,
    deleteFile,
    downloadFile
};

export default Controller;
