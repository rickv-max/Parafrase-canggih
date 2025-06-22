// 1. Impor semua package yang dibutuhkan
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

// 2. Inisialisasi aplikasi Express
const app = express();
const PORT = 3000;

// 3. Konfigurasi middleware
app.use(cors());
app.use(express.json());
// Middleware untuk menyajikan file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));


// 4. Ambil API Key dari Secrets (Cara Aman di Replit)
// TIDAK PERLU FILE .env LAGI!
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 5. Buat endpoint /api/paraphrase (Jembatan Aman ke Google AI)
app.post('/api/paraphrase', async (req, res) => {
    // Cek dulu apakah kunci API sudah dimasukkan di Secrets
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: "KRITIS: Kunci API belum diatur di bagian 'Secrets'. Ikuti panduan untuk memasukkannya." });
    }

    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required from frontend' });
        }

        const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        };

        const response = await fetch(googleApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'a`pplication/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Error dari Google API:', data);
            return res.status(response.status).json(data);
        }

        res.status(200).json(data);

    } catch (error) {
        console.error('Error di Server Perantara:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 6. Jalankan server
app.listen(PORT, () => {
    console.log(`Server berhasil dijalankan!`);
});
