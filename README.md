# Automated Recon Tool

Aplikasi web yang mengotomatiskan reconnaissance domain target dengan subfinder, httpx, nmap, dan whois dalam satu antarmuka.

---

## Deskripsi

Automated Recon Tool menerima satu domain target, lalu backend FastAPI menjalankan subdomain enumeration, live host probing, port scanning, dan WHOIS lookup secara berurutan. Hasilnya ditampilkan di antarmuka React yang rapi dan disimpan ke SQLite sebagai riwayat scan. Project ini dibuat sebagai portofolio dan menerapkan dasar secure coding: input validation, rate limiting, dan CORS.

## Alur Kerja

```
Browser (React :5173) -> FastAPI (:8000) -> subfinder -> httpx -> nmap
                                         -> whois (dari domain utama)
                                         -> SQLite (riwayat scan)
```

Hasil scan dikembalikan langsung ke frontend, dan salinannya disimpan ke database untuk endpoint `/history`.

## Tech Stack & Tools

- Python 3.12 + FastAPI: REST API dan orkestrasi tools lewat `subprocess`
- Uvicorn: ASGI server untuk FastAPI
- Pydantic: validasi input domain
- SQLAlchemy + SQLite: penyimpanan riwayat scan
- slowapi: rate limiting 3 request per menit per IP
- React (Vite) + Tailwind CSS: antarmuka web
- subfinder: passive subdomain enumeration
- httpx: HTTP probing untuk menentukan live host
- nmap: port scanning (`--open -F`, maksimal 10 host per scan)
- whois: informasi registrasi domain utama

## Fitur

- Scan domain otomatis dari satu form
- Hasil dalam modal dengan 4 tab: Subdomains, Live Hosts, Nmap, Domain Info
- Card per host untuk hasil nmap, klik untuk melihat detail port
- Ringkasan WHOIS (registrar, tanggal dibuat dan kedaluwarsa, nameserver, status)
- Riwayat scan dari database

## Keamanan

- Input validation: domain divalidasi dengan regex dan batas 253 karakter sebelum diteruskan ke tools
- `subprocess.run` memakai list argumen (bukan string shell), sehingga mengurangi risiko command injection
- Rate limiting: 3 scan per menit per IP
- CORS: hanya origin frontend lokal yang diizinkan

## Struktur Folder

```
automated-recon-tool/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── requirements.txt
│   └── recon.db            (diabaikan git)
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── index.css
│   ├── vite.config.js
│   └── package.json
├── writeups/
│   └── 01-setup-environment.md
│   └── 02-api-dasar.md
│   └── 03-integrasi-tools-recon.md
│   └── 04-database.md
│   └── 05-frontend.md
│   └── 06-keamanan.md
│   └── README.md
└── docs/
    └── screenshots/
        ├── 1-setup/
        ├── 2-backend/
        ├── 3-frontend/
        ├── 4-testing/
        └── 5-deployment/
```

## Cara Menjalankan

Prasyarat: Ubuntu, Python 3.12, Go, Node.js 20 atau lebih baru, nmap, whois, subfinder, dan httpx. Install subfinder dan httpx dengan `go install`, lalu pastikan `~/go/bin` ada di PATH.

Backend:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:5173`. Dokumentasi API otomatis tersedia di `http://127.0.0.1:8000/docs`.

Catatan: path subfinder dan httpx di `main.py` masih ditulis lengkap (`/home/aufa/go/bin/...`), sesuaikan dengan path di mesinmu.

## Progress

| Fase | Status |
|---|---|
| Setup & Environment | ✅ Selesai |
| Backend | ✅ Selesai |
| Frontend | ✅ Selesai |
| Testing | 🔄 Berjalan |
| Deployment & Dokumentasi | ⬜ Belum |

**Progress keseluruhan: 80%**

## Keterbatasan

- Nmap berjalan tanpa `-sV` dan `-sC` karena sangat lambat di VM dengan jaringan NAT
- Scan bersifat sinkron, jadi scan yang terlalu lama bisa terkena timeout browser. Rencana perbaikan: scan async dengan polling status
- Belum ada deployment publik

## Dokumentasi

Screenshot per tahap pengerjaan tersedia di folder `docs/screenshots/`.

## Disclaimer

Project ini dibuat untuk tujuan pembelajaran dan portofolio. Gunakan hanya pada domain milik sendiri atau target yang memberikan izin tertulis (misalnya program bug bounty dengan scope yang mengizinkan). Penulis tidak bertanggung jawab atas penyalahgunaan tool ini.
