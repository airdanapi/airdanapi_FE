# airdanapi_FE

Integrator Console frontend untuk API Gateway / Integrator Ekosistem Ekonomi UMKM.

## Status Sprint 0

Fitur yang sudah tersedia:

- Next.js 14 dengan App Router.
- TypeScript.
- Tailwind CSS.
- Shell halaman awal Integrator Console.
- Design token dasar sesuai PRD:
  - primary `#EA580C`
  - monetary `#7E22CE`
  - dark background `#0F172A`
  - surface `#1E293B`
- Environment variable untuk URL backend.

Belum termasuk Sprint 0:

- Login operator.
- Sidebar penuh.
- Dashboard operasional.
- Request Logs.
- Gateway Fees.
- Route Registry.
- Service Health.
- Security & JWT.
- Settings.
- Konfigurasi.

Halaman-halaman tersebut masuk Sprint 6 dan Sprint 7.

## Requirements

- Node.js 18.17 atau lebih baru.
- npm.
- Backend `airdanapi_BE` berjalan di `http://localhost:8080` untuk integrasi lokal.

## Instalasi

```bash
npm install
```

Salin contoh environment:

```bash
cp .env.example .env.local
```

Pada Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

## Environment Variable

| Variable | Default | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | Base URL backend Gateway. |
| `NEXT_PUBLIC_APP_ENV` | `development` | Environment label untuk UI. |

## Menjalankan Aplikasi

Pastikan backend `airdanapi_BE` sudah berjalan di:

```text
http://localhost:8080
```

Jalankan frontend di terminal lain dari workspace tugas besar:

```powershell
cd "D:\Kuli Ah S4\RPL_II new\Tugas_Besar\airdanapi_FE"
npm install
Copy-Item .env.example .env.local
npm run dev
```

Jika `node_modules` dan `.env.local` sudah ada, `npm install` dan `Copy-Item .env.example .env.local` tidak perlu diulang.

```bash
npm run dev
```

Frontend default berjalan di:

```text
http://localhost:3000
```

Buka URL tersebut di browser. Frontend akan membaca backend dari `NEXT_PUBLIC_API_URL`, default-nya:

```text
http://localhost:8080
```

Untuk menghentikan dev server, tekan `Ctrl+C` di terminal yang menjalankan `npm run dev`.

## Menjalankan Backend dan Frontend Lokal

Gunakan dua terminal terpisah.

Terminal 1 - backend:

```powershell
cd "D:\Kuli Ah S4\RPL_II new\Tugas_Besar\airdanapi_BE"
go run ./cmd/server
```

Terminal 2 - frontend:

```powershell
cd "D:\Kuli Ah S4\RPL_II new\Tugas_Besar\airdanapi_FE"
npm run dev
```

URL lokal:

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:3000`

## Build dan Validasi

```bash
npm run lint
npm run build
```

## Struktur Project

```text
src/app/           App Router pages dan layout
src/components/    Komponen UI untuk sprint berikutnya
src/lib/           API client dan helper untuk sprint berikutnya
src/styles/        Style tambahan untuk sprint berikutnya
```

## Catatan Penting

- Jangan commit `node_modules/`, `.next/`, atau `.env.local`.
- Jangan mengubah stack ke Next versi mayor lain tanpa keputusan project.
- UI harus tetap berupa console operasional, bukan landing page marketing.
- Warna, spacing, dan tone UI mengikuti `agent.md` dan PRD v2.
