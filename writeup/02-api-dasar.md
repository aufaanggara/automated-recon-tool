[Index](README.md) | [Fase sebelumnya: 01 Setup](01-setup-environment.md) | [Fase berikutnya: 03 Integrasi Tools](03-integrasi-tools-recon.md)

---

# Fase 02: API Dasar

## Masalah

Sebelum nyambungin tools recon, backend harus bisa hidup dulu dan bisa nerima data domain dari luar. Aku mulai dari yang paling sederhana.

## Pengerjaan

- Bikin `main.py` dengan endpoint `GET /` yang cuma balikin `{"status": "on"}`, buat mastiin server hidup
- Jalanin server pakai `uvicorn main:app --reload`. `main` itu nama file, `app` nama variabel FastAPI, dan `--reload` bikin server restart otomatis tiap kode berubah
- Bikin class `ScanRequest` (Pydantic) dengan satu field `domain: str`, lalu endpoint `POST /scan` yang nerima data itu. Pakai POST karena aku ngirim data yang akan diproses, bukan cuma minta data
- Test lewat Swagger di `/docs`

```python
@app.post("/scan")
def scan_domain(request: ScanRequest):
    return {"message": f"Scanning domain: {request.domain}"}
```

<img src="../docs/screenshots/2-backend/03-main-py-basic.png" width="600">

<img src="../docs/screenshots/2-backend/04-uvicorn-running.png" width="600">

<img src="../docs/screenshots/2-backend/05-bowser-status-on.png" width="450">

<img src="../docs/screenshots/2-backend/06-swagger-docs.png" width="750">

<img src="../docs/screenshots/2-backend/07-test-scan-endpoint-success.png" width="750">

## Temuan

- Buka `/scan` langsung di browser hasilnya `Method Not Allowed`. Bukan error kode, tapi browser selalu kirim GET sedangkan endpoint-nya cuma terima POST
- Swagger UI dibuat otomatis oleh FastAPI dari kode, dan `ScanRequest` langsung muncul di bagian Schemas
- Pydantic otomatis validasi bentuk data. Kalau field `domain` nggak ada atau bukan string, FastAPI balas 422

## Kesimpulan

Jalur komunikasi frontend ke backend sudah jalan: kirim JSON `{"domain": "..."}`, dapat respons. Tinggal isi logic recon-nya.

---

[Index](README.md) | [Fase sebelumnya: 01 Setup](01-setup-environment.md) | [Fase berikutnya: 03 Integrasi Tools](03-integrasi-tools-recon.md)
