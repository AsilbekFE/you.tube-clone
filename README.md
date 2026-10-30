# YouTube Clone (Fullstack)

YouTube Clone fullstack web ilovasi. Loyiha frontend va backend qismlariga ajratilgan bo'lib, PostgreSQL ma'lumotlar bazasi bilan integratsiya qilingan.

## 🚀 Texnologiyalar:
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla), Axios
- **Backend:** Node.js, Express.js, PostgreSQL (`pg`), JWT, bcryptjs, express-fileupload

## 📁 Loyiha tuzilishi:
```
Frontend/
├── backend/
│   ├── src/
│   │   ├── config/       # PostgreSQL ulanishi
│   │   ├── controller/   # API controllerlar
│   │   ├── router/       # API marshrutlari
│   │   ├── middleware/   # Xatoliklarni boshqarish
│   │   ├── guard/        # JWT autentifikatsiya
│   │   └── index.js      # Server kirish nuqtasi
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── css/              # Stillar
    ├── js/               # Mijoz skriptlari
    ├── img/              # Rasmlar va ikonlar
    ├── fonts/            # Shriftlar
    ├── index.html        # Asosiy sahifa
    ├── login.html        # Kirish sahifasi
    ├── register.html     # Ro'yxatdan o'tish
    └── admin.html        # Shaxsiy kabinet va video yuklash
```

## ⚙️ Ishga tushirish:

### 1. Backend:
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend:
- `http://localhost:5000` manziliga kiring yoki `frontend/index.html` faylini Live Server orqali oching.

