[Index](README.md) | [Fase sebelumnya: 03 Integrasi Tools](03-integrasi-tools-recon.md) | [Fase berikutnya: 05 Frontend](05-frontend.md)

---

# Fase 04: Database Riwayat Scan

## Masalah

Hasil scan hilang begitu request selesai. Aku butuh riwayat supaya scan sebelumnya bisa dilihat lagi. Aku pilih SQLite karena cuma satu file `.db`, nggak perlu server database terpisah, dan cukup buat skala portofolio. Kalau nanti scale up, bisa migrasi ke PostgreSQL.

## Pengerjaan

- Install SQLAlchemy di dalam venv
- Bikin `database.py` yang isinya: `engine` (koneksi ke `recon.db`), `SessionLocal` (pembuat session), `Base` (class induk semua tabel), class `ScanResult` (tabel `scan_results`), dan `init_db()` buat bikin tabelnya
- Kolom: `id`, `domain`, `scan_time`, `subdomains`, `live_hosts`, `nmap_result`, `whois_result`. Kolom list disimpan sebagai string JSON
- Di `main.py`, `init_db()` dipanggil sekali saat start, dan setelah scan selesai hasilnya disimpan lewat session
- Tambah endpoint `GET /history` yang ngambil 10 scan terakhir (ringkasan saja: id, domain, waktu, jumlah subdomain dan live host)

```python
db = SessionLocal()
scan = ScanResult(
    domain=body.domain,
    subdomains=json.dumps(subdomains),
    live_hosts=json.dumps(live_hosts),
    nmap_result=json.dumps(nmap_result),
    whois_result=json.dumps(whois_result),
)
db.add(scan)
db.commit()
db.close()
```

<img src="../docs/screenshots/2-backend/23-install%20sqlalchemy.png" width="600">

<img src="../docs/screenshots/2-backend/24-database-py.png.png" width="600">

<img src="../docs/screenshots/2-backend/25-server-with-db.png" width="600">

<img src="../docs/screenshots/2-backend/26-install-sqlite3.png" width="600">

<img src="../docs/screenshots/2-backend/27-database-query-result.png" width="600">

## Temuan

- Server nyala tanpa error artinya `database.py` ke-import dan tabel berhasil dibuat. File `recon.db` muncul di folder backend
- Saat scan pertama, muncul `TypeError: dump() missing 1 required positional argument: 'fp'`. Cara baca error panjang: lihat baris paling bawah. Ternyata aku nulis `json.dump` padahal yang dimau `json.dumps` (dengan s, buat jadi string, bukan nulis ke file)
- Ada dua jalur data setelah scan: jalur A simpan ke database (lewat `json.dumps`), jalur B return langsung ke frontend dari variabel Python (FastAPI yang otomatis ubah jadi JSON). Frontend tidak ambil hasil scan dari database, cuma riwayatnya
- Verifikasi lewat `sqlite3`: ada baris `1 | tesla.com | 2026-07-02 03:56:17`

## Kesimpulan

Riwayat scan tersimpan dan bisa diambil lewat `/history`. Bukti paling jelas ada di query SQLite di atas.

---

[Index](README.md) | [Fase sebelumnya: 03 Integrasi Tools](03-integrasi-tools-recon.md) | [Fase berikutnya: 05 Frontend](05-frontend.md)
