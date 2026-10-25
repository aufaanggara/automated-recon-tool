# Writeup: Automated Recon Tool

**Periode:** Juni sampai Juli 2026
**Platform:** Home lab (VM Ubuntu 24.04 di VirtualBox, diakses lewat VS Code Remote-SSH)
**Kategori:** Cybersecurity, reconnaissance automation, web development
**Tools:** FastAPI, Uvicorn, Pydantic, SQLAlchemy, SQLite, slowapi, React (Vite), Tailwind, subfinder, httpx, nmap, whois

---

## Ringkasan

Project ini aku bikin buat portofolio KP. Idenya simpel: aku nggak mau ngetik subfinder, httpx, nmap, sama whois satu-satu di terminal tiap kali recon. Jadi aku sambungin semuanya lewat backend FastAPI, hasilnya ditampilin di web React, dan tiap scan disimpan ke SQLite sebagai riwayat.

Tool recon-nya bukan aku bikin dari nol. Nilai project ini ada di otomasi dan integrasinya, plus aku sekalian belajar dasar secure coding: input validation, rate limiting, dan CORS.

Writeup ini aku pecah per fase biar gampang diikuti. Catatan: ini project development, bukan investigasi insiden, jadi tiap fase pakai pola Masalah, Pengerjaan, Temuan, Kesimpulan.

## Daftar Fase

| Fase | Isi | Link |
|---|---|---|
| 01 | Setup environment VM, venv, install FastAPI | [01-setup-environment.md](01-setup-environment.md) |
| 02 | API dasar: endpoint GET dan POST, test lewat Swagger | [02-api-dasar.md](02-api-dasar.md) |
| 03 | Integrasi subfinder, httpx, nmap, whois | [03-integrasi-tools-recon.md](03-integrasi-tools-recon.md) |
| 04 | Database SQLite untuk riwayat scan | [04-database.md](04-database.md) |
| 05 | Frontend React, Tailwind, dan masalah CORS | [05-frontend.md](05-frontend.md) |
| 06 | Input validation dan rate limiting | [06-keamanan.md](06-keamanan.md) |

## Highlight Hasil

- 3 endpoint API, 4 tools terintegrasi, 1 tabel database
- hackerone.com: 19 subdomain dan 10 live host. intigriti.com: 40 subdomain dan 21 live host. tesla.com: sekitar 917 subdomain dan 195 live host
- Rate limit 3 scan per menit per IP, terbukti dengan response 429 di request ke-4
- Nmap dibatasi 10 host pertama per scan

<img src="../docs/screenshots/2-backend/22-all-tools-integrated.png" width="750">

## Yang Belum

- Deployment: sempat mau pakai Oracle Cloud Free Tier, tapi sign up gagal terus, jadi aku batalin
- Nmap jalan tanpa `-sV` dan `-sC` karena terlalu lambat di VM NAT
- Scan masih sinkron, jadi scan yang terlalu lama bisa kena timeout browser. Rencananya diganti scan async dengan polling status

## Disclaimer

Dibuat untuk belajar dan portofolio. Pakai hanya di domain milik sendiri atau target yang jelas ngasih izin, misalnya program bug bounty yang scope-nya mengizinkan.
