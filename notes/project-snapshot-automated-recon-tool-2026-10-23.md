## 🗂️ Project Snapshot: Automated Recon Tool

> Deskripsi project lengkap, siap dipakai sebagai context di LinkedIn, CV, resume, atau web portofolio.

**Nama Project:** Automated Recon Tool dengan Web Interface
**Periode:** Juni 2026 sampai Juli 2026 (backend, frontend, dan UI final selesai). Deployment dibatalkan, README masih tahap draft.
**Kategori:** Cybersecurity / Reconnaissance Automation / Web Development
**Stack/Tools:** Python 3.12, FastAPI, Uvicorn, Pydantic, SQLAlchemy, SQLite, slowapi, React (Vite), Tailwind CSS, subfinder, httpx, nmap, whois, Go, Node.js, VirtualBox (Ubuntu 24.04), VS Code Remote-SSH

**Deskripsi:**
Aplikasi web yang mengotomatiskan tahap reconnaissance terhadap sebuah domain target. User cukup memasukkan domain, lalu backend FastAPI menjalankan subfinder, httpx, nmap, dan whois secara berurutan, menyimpan hasilnya ke SQLite, dan menampilkannya di antarmuka React yang rapi. Project ini dibuat sebagai portofolio KP dan menerapkan dasar secure coding berupa input validation, rate limiting, dan CORS.

**Yang sudah dikerjakan:**
- Menyiapkan environment development di VM Ubuntu 24.04 (VirtualBox) yang diakses lewat VS Code Remote-SSH
- Membangun REST API FastAPI dengan 3 endpoint: `GET /`, `POST /scan`, `GET /history`
- Mengintegrasikan 4 tools recon lewat `subprocess` dengan alur subfinder, httpx, nmap, lalu whois dari domain utama
- Menyimpan setiap hasil scan ke SQLite dan menampilkan riwayat scan di frontend
- Menerapkan input validation domain (regex via Pydantic `field_validator`), rate limiting 3 request per menit per IP (slowapi), dan CORS whitelist
- Membangun frontend React + Vite + Tailwind: layout dua kolom, modal hasil dengan 4 tab, card nmap per host dengan popup detail port, ringkasan WHOIS, dan animasi fade-in
- Mendiagnosis dan memperbaiki masalah DNS VM (nmap lambat) dengan DNS permanen 8.8.8.8 lewat NetworkManager
- Membuat `requirements.txt` dan membersihkan debug print dari kode

**Angka & bukti konkret:**
- 3 endpoint API, 4 tools recon terintegrasi, 1 tabel database (`scan_results`)
- hackerone.com: 19 subdomain, 10 live host. intigriti.com: 40 subdomain, 21 live host. tesla.com: sekitar 917 subdomain, 195 live host
- Nmap dibatasi 10 host pertama per scan, rate limit 3 scan per menit per IP
- Rate limit terbukti berfungsi: request ke-4 dalam 1 menit mendapat response 429
- Nmap tanpa `-sV` selesai dalam 2,5 detik untuk 1 host setelah DNS diperbaiki
- 40 dari 50 item checklist selesai (80%)

**5 Screenshot Terpenting:**
*(5 screenshot yang paling merepresentasikan hasil project, paling layak ditampilkan di portofolio)*

| No | Nama File (dengan path folder) | Apa yang ditunjukkan |
|---|---|---|
| 1 | `docs/screenshots/2-backend/22-all-tools-integrated` | Response `/scan` berisi hasil nmap dan whois, bukti 4 tools jalan dalam satu endpoint |
| 2 | `docs/screenshots/2-backend/27-database-query-result` | Query SQLite yang membuktikan hasil scan tersimpan ke database |
| 3 | `docs/screenshots/2-backend/30-rate-limit-test` | Test curl yang memicu response 429 "Rate limit exceeded: 3 per 1 minute" |
| 4 | `docs/screenshots/3-frontend/08-scan-berhasil` | Hasil scan tampil di frontend setelah CORS diperbaiki |
| 5 | `docs/screenshots/3-frontend/08-ui-final` | Tampilan akhir UI dua kolom dengan form scan dan riwayat scan |

*Catatan: nama file di atas mengikuti penomoran di sesi chat. Cek ulang nama dan ekstensi aslinya di folder `docs/screenshots/`, karena beberapa nomor sempat dobel.*

---

## 📋 Project Progress Checklist: Automated Recon Tool

**Terakhir diupdate:** 23 Oktober 2026

### Setup & Environment

| Status | Item | Catatan |
|---|---|---|
| ✅ | VM Ubuntu Desktop 24.04 untuk development | 8 GB RAM, 4 core, 40 GB disk |
| ✅ | Struktur folder `projek2` + `docs/screenshots` per tahap | backend, frontend, docs |
| ✅ | Python venv di folder backend | Perlu `python3.12-venv` |
| ✅ | Install VS Code | Lewat repo Microsoft |
| ✅ | Install Flameshot untuk screenshot | Sempat error capture di Wayland |
| ✅ | Install Go | golang-go 1.22.2 |
| ✅ | Install Node.js 20 | Lewat nvm, karena Node 18 terlalu lama untuk Vite |
| ✅ | Konfigurasi DNS permanen 8.8.8.8 | Lewat nmcli pada koneksi `netplan-enp0s3` |
| ✅ | VS Code Remote-SSH ke VM | Terminal dan VS Code dijalankan dari Windows |
| ✅ | Install subfinder, httpx, nmap, whois, sqlite3 | subfinder dan httpx lewat `go install`, PATH `~/go/bin` |

### Backend

| Status | Item | Catatan |
|---|---|---|
| ✅ | FastAPI + Uvicorn | Dijalankan dengan `uvicorn main:app --reload` |
| ✅ | Endpoint `GET /` | Health check `{"status": "on"}` |
| ✅ | Endpoint `POST /scan` + model Pydantic `ScanRequest` | Diuji lewat Swagger `/docs` |
| ✅ | Integrasi subfinder | Path lengkap `/home/aufa/go/bin/subfinder` |
| ✅ | Integrasi httpx | Input lewat stdin (`input=`) |
| ✅ | Integrasi nmap | Maksimal 10 host, flag `--open -F` (tanpa `-sV -sC`) |
| ✅ | Integrasi whois | Hanya untuk domain utama |
| ✅ | Database SQLite + SQLAlchemy | File `database.py`, tabel `scan_results` |
| ✅ | Endpoint `GET /history` | 10 scan terakhir |
| ✅ | CORS middleware | Origin localhost dan 127.0.0.1 port 5173/5174 |
| ✅ | Input validation domain | Regex + batas 253 karakter |
| ✅ | Rate limiting | 3/menit per IP, slowapi |
| ✅ | Hapus debug print | Dikonfirmasi selesai |
| ✅ | `requirements.txt` | Dibuat dengan `pip freeze` |

### Frontend

| Status | Item | Catatan |
|---|---|---|
| ✅ | Init React dengan Vite | Setelah upgrade Node |
| ✅ | Install dan konfigurasi Tailwind | Plugin `@tailwindcss/vite` |
| ✅ | Form input domain + loading state | Tombol disabled saat scanning |
| ✅ | Modal hasil dengan 4 tab dan ukuran fixed | Subdomains, Live Hosts, Nmap, Domain Info |
| ✅ | Card nmap per host + popup detail port | |
| ✅ | Ringkasan WHOIS | Registrar, tanggal, nameserver, status |
| ✅ | Live hosts dipisah HTTPS dan HTTP | |
| ✅ | Riwayat scan dari `/history` | |
| ✅ | Animasi fade-in modal | |
| ✅ | Layout dua kolom (penjelasan kiri, tool kanan) | Dibuat sendiri oleh user |
| ✅ | Handling error 429 dan 422 di frontend | |

### Testing

| Status | Item | Catatan |
|---|---|---|
| ✅ | Test manual tiap tool di terminal | |
| ✅ | Test endpoint lewat Swagger | |
| ✅ | Test end-to-end dari frontend | |
| ✅ | Test rate limit dengan curl | Request ke-4 dapat 429 |
| ⬜ | Test input domain tidak valid (misal `google;com`) | Belum dikonfirmasi, validator sudah terpasang |
| ⬜ | Nmap dengan `-sV -sC` | Ditunda, sangat lambat di VM NAT, hasil kosong saat `--host-timeout` pendek |

### Deployment & Dokumentasi

| Status | Item | Catatan |
|---|---|---|
| ⬜ | Deploy backend ke VPS (Oracle Cloud Free Tier) | Dibatalkan, sign up gagal |
| ⬜ | Deploy frontend ke Vercel | Bergantung backend, ikut dibatalkan |
| 🔄 | README repo GitHub | Draft sudah dibuat di sesi ini, belum di-push |
| ⬜ | Penjelasan regex domain untuk writeup | Ditunda user sampai project selesai |
| ⬜ | Writeup final dari screenshot per tahap | |
| ⬜ | Video demo singkat sebagai pengganti link live | Saran, belum disepakati |
| ⬜ | Scan async dengan polling status | Rencana lanjutan, untuk mengatasi timeout browser pada scan lama |
| ⬜ | Aktifkan kembali `-sV` di environment dengan jaringan lebih baik | Rencana lanjutan |

---

### 📊 Summary

| Metric | Jumlah |
|---|---|
| ✅ Selesai | 40 item |
| 🔄 Sedang berjalan | 1 item |
| ⬜ Belum dimulai | 9 item |
| **Total** | **50 item** |
| **Progress** | **80%** |

**Terakhir selesai di:** UI frontend final (layout dua kolom, nmap card + popup) dan pembersihan debug print, `requirements.txt`, serta DNS permanen. Deployment ke Oracle Cloud gagal di tahap sign up lalu dibatalkan.
**Selanjutnya:** Push README ke GitHub, lalu test input domain tidak valid dan ambil screenshot yang masih kurang untuk writeup.
