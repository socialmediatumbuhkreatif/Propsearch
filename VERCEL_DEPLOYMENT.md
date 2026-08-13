# Panduan Deploy PropSearch ke Vercel

Aplikasi **PropSearch** telah dikonfigurasi secara lengkap agar dapat langsung di-deploy ke Vercel.

## File Konfigurasi yang Telah Disiapkan:
1. `vercel.json`: Mengatur routing frontend Vite (`dist`) dan fungsi API backend (`/api/*`).
2. `/api/index.ts`: Entry point serverless function Vercel yang membungkus Express API secara otomatis.
3. `server.ts`: Disesuaikan agar otomatis mendeteksi lingkungan Vercel serverless vs local dev.

---

## Langkah Deploy ke Vercel:

### 1. Push Kode ke GitHub
Export atau push repositori ini ke akun GitHub Anda:
- Melalui menu **Settings > Export to GitHub** di AI Studio, atau
- Menggunakan perintah git biasa ke GitHub repository Anda.

### 2. Import Project di Vercel Dashboard
1. Buka [Vercel Dashboard](https://vercel.com/dashboard) dan klik **Add New > Project**.
2. Pilih repositori GitHub `PropSearch` Anda.
3. Di bagian **Framework Preset**, Vercel akan otomatis mendeteksi **Vite**.

### 3. Konfigurasi Environment Variables di Vercel
Pada bagian **Environment Variables** di Vercel, tambahkan kunci berikut:

| Key | Deskripsi | Wajib / Opsional |
| :--- | :--- | :--- |
| `OPENAI_API_KEY` | API Key OpenAI (untuk analisis `gpt-4o-mini`) | **Sangat Disarankan** |
| `GEMINI_API_KEY` | API Key Google Gemini (untuk support & fallback) | **Opsional** |
| `SERPER_API_KEY` | API Key Serper.dev (untuk live Google Search) | **Opsional** |

### 4. Klik "Deploy"
Vercel akan secara otomatis:
- Membangun frontend Vite ke direktori `dist/`.
- Membangun backend Express sebagai Serverless Function di `/api`.
- Memberikan domain gratis seperti `https://propsearch.vercel.app`.
