[Index](README.md) | [Fase berikutnya: 02 API Dasar](02-api-dasar.md)

---

# Fase 01: Setup Environment

## Masalah

Tool recon (subfinder, httpx, nmap) paling enak dan stabil jalan di Linux, dan nanti kalau di-deploy servernya juga pasti Linux. Jadi aku butuh mesin development Linux yang rapi, terpisah dari VM Ubuntu-Victim yang memang aku pakai buat lab pentest.

## Pengerjaan

- Bikin VM baru di VirtualBox pakai ISO Ubuntu 24.04.4 Desktop: 8 GB RAM, 4 core, disk 40 GB (VDI dynamic, jadi nggak langsung makan 40 GB)
- Instalasi sempat nyangkut di layar "Copying files". Aku power off paksa lewat menu Machine, start ulang, dan ternyata langsung masuk desktop
- Fullscreen nggak jalan karena Guest Additions belum aktif. Aku install `virtualbox-guest-utils` dan `virtualbox-guest-x11` dari apt. Setelah reboot VM malah stuck di boot dari CD-ROM, ternyata ISO Guest Additions masih ter-attach. Aku eject lewat Settings, Storage, lalu normal lagi
- Bikin struktur folder project dan folder screenshot per tahap
- Install VS Code dari repo Microsoft, dan Flameshot buat screenshot
- Bikin Python venv di folder `backend`, lalu install `fastapi` dan `uvicorn`

Struktur folder yang dipakai:

```
projek2/
├── backend/
├── frontend/
└── docs/screenshots/
    ├── 1-setup/
    ├── 2-backend/
    ├── 3-frontend/
    ├── 4-testing/
    └── 5-deployment/
```

<img src="../docs/screenshots/1-setup/01-setup-projek.png" width="750">

<img src="../docs/screenshots/1-setup/02-struktur-projek.png" width="600">

<img src="../docs/screenshots/2-backend/01-venv-aktif.png" width="600">

<img src="../docs/screenshots/2-backend/02-install-fastapi-uvicorn.png" width="600">

## Temuan

- `python3 -m venv` gagal di Ubuntu karena paket `python3.12-venv` belum ada. Pesannya jelas, tinggal `apt install python3.12-venv`
- Flameshot error "Unable to capture screen" karena Ubuntu 24.04 default pakai Wayland. Cek pakai `echo $XDG_SESSION_TYPE`
- Prompt berubah jadi `(venv)` itu tandanya venv aktif. Paket Python (FastAPI, uvicorn) hanya ada di dalam venv, sedangkan tools seperti subfinder, nmap, whois itu terinstall di level sistem

## Kesimpulan

Environment development sudah siap. Pelajaran terpenting di fase ini: bedain mana yang di dalam venv (paket Python) dan mana yang global (tools sistem), karena ini yang bikin bingung waktu uvicorn nggak ketemu di terminal yang venv-nya belum aktif.

---

[Index](README.md) | [Fase berikutnya: 02 API Dasar](02-api-dasar.md)
