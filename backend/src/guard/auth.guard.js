import jwt from 'jsonwebtoken';

export const authGuard = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                status: 401,
                message: 'Token taqdim etilmadi! Iltimos, tizimga kiring.'
            });
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        if (!token) {
            return res.status(401).json({
                status: 401,
                message: "Token formati notog'ri!"
            });
        }

        const secret = process.env.JWT_SECRET || 'youtube_imtihon_secret_key_2026';
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            status: 403,
            message: 'Yaroqsiz yoki muddati o\'tgan token!'
        });
    }
};
