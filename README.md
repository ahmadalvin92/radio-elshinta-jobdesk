# Radio Elshinta Jobdesk

Radio Elshinta Jobdesk adalah aplikasi internal untuk mencatat pekerjaan harian IT Support, terutama backup, maintenance, pengecekan komputer, approval user, dan rekap PDF. Project ini dibuat dengan konsep backend dan frontend terpisah supaya lebih rapi dan mudah dikembangkan.

Develop by Alvin dan IT Support Tim 2026 with love.

## Fitur Utama

- Login admin dan user.
- Role admin dan user.
- Admin input jobdesk harian.
- Admin edit dan delete jobdesk.
- User approve atau reject jobdesk miliknya.
- Dropdown user/komputer dari data inventaris komputer.
- Dashboard dengan filter semua data, harian, mingguan, dan bulanan.
- Rekap pekerjaan dengan filter semua data, harian, mingguan, dan bulanan.
- Export rekap ke PDF dengan logo Radio Elshinta.
- Manage user khusus admin.
- Tambah, edit, hapus user.
- Reset password user ke `admin123`.
- Ubah password untuk admin dan user setelah login.
- Show/hide password di form login dan form password.
- Dashboard modern dengan tema biru Radio Elshinta.

## Struktur Project

```txt
elshinta-jobdesk/
├── backend/   # Laravel API, auth sederhana, database, PDF export
├── frontend/  # Vite frontend dashboard
├── README.md
└── .gitignore
```

## Teknologi

Backend:

- PHP 8.3+
- Laravel 13
- MySQL / MariaDB
- Spatie Laravel Permission
- Barryvdh Laravel DomPDF

Frontend:

- JavaScript
- Vite
- HTML
- CSS

Database:

- MySQL atau MariaDB
- Bisa dikelola melalui XAMPP phpMyAdmin

Development tools:

- Composer
- Node.js dan npm
- XAMPP untuk MySQL lokal

## Persyaratan Instalasi

Pastikan sudah terinstall:

- PHP 8.3 atau lebih baru
- Composer
- Node.js dan npm
- XAMPP dengan MySQL/MariaDB aktif
- Git

Untuk macOS dengan XAMPP, MySQL biasanya tersedia di:

```txt
/Applications/XAMPP/xamppfiles/bin/mysql
```

## Cara Clone Project

Clone dari GitHub:

```bash
git clone https://github.com/USERNAME/radio-elshinta-jobdesk.git
cd radio-elshinta-jobdesk
```

Ganti `USERNAME` dengan username GitHub pemilik repo.

## Setup Database MySQL

Buka XAMPP dan nyalakan MySQL.

Buat database lewat phpMyAdmin:

```txt
http://localhost/phpmyadmin
```

Nama database:

```txt
elshinta_jobdesk
```

Atau buat lewat terminal macOS:

```bash
/Applications/XAMPP/xamppfiles/bin/mysql -h127.0.0.1 -P3306 -uroot -e "CREATE DATABASE IF NOT EXISTS elshinta_jobdesk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Konfigurasi database lokal:

```txt
Database: elshinta_jobdesk
Host: 127.0.0.1
Port: 3306
Username: root
Password: kosong
```

## Setup Backend Laravel

Masuk ke folder backend:

```bash
cd backend
```

Install dependency PHP:

```bash
composer install
```

Buat file `.env`:

```bash
cp .env.example .env
```

Edit `.env` backend menjadi:

```env
APP_NAME="Elshinta Jobdesk"
APP_URL=http://127.0.0.1:8000
FRONTEND_URL=http://127.0.0.1:5173

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=elshinta_jobdesk
DB_USERNAME=root
DB_PASSWORD=
```

Generate app key:

```bash
php artisan key:generate
```

Clear config:

```bash
php artisan config:clear
```

Migrasi dan isi data awal:

```bash
php artisan migrate:fresh --seed
```

Jalankan backend:

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

Backend akan berjalan di:

```txt
http://127.0.0.1:8000
```

Cek backend:

```txt
http://127.0.0.1:8000/api/health
```

Jika port `8000` sudah dipakai, Laravel bisa jalan di `8001`. Frontend sudah dibuat bisa fallback ke `8001`.

## Setup Frontend

Buka terminal baru, lalu masuk ke folder frontend:

```bash
cd frontend
```

Install dependency:

```bash
npm install
```

Buat file `.env` frontend:

```bash
cp .env.example .env
```

Isi `.env` frontend:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Kalau backend jalan di port `8001`, ubah menjadi:

```env
VITE_API_BASE_URL=http://127.0.0.1:8001
```

Jalankan frontend:

```bash
npm run dev
```

Frontend akan berjalan di:

```txt
http://127.0.0.1:5173
```

## Cara Menjalankan Harian

Terminal 1 untuk backend:

```bash
cd /Users/macbook/elshinta-jobdesk/backend
php artisan config:clear
php artisan serve --host=127.0.0.1 --port=8000
```

Terminal 2 untuk frontend:

```bash
cd /Users/macbook/elshinta-jobdesk/frontend
npm run dev
```

Buka:

```txt
http://127.0.0.1:5173
```

## Akun Default

Password awal semua akun:

```txt
admin123
```

Admin:

```txt
alvin@elshinta.local
zulhendri@elshinta.local
badru@elshinta.local
saiful@elshinta.local
faiz@elshinta.local
```

User dibuat otomatis dari data komputer. Contoh:

```txt
medsos-2@elshinta.local
user-mushli@elshinta.local
administrator-rohmat@elshinta.local
```

Di halaman login, akun bisa dipilih dari dropdown.

## Logo Radio Elshinta

Logo frontend:

```txt
frontend/public/logo-elshinta.png
```

Logo PDF backend:

```txt
backend/public/logo-elshinta.png
```

Jika logo diganti, pastikan kedua file tersebut ikut diperbarui.

## API Utama

```txt
GET    /api/health
POST   /api/login
POST   /api/change-password
GET    /api/users
POST   /api/users
PUT    /api/users/{user}
DELETE /api/users/{user}
POST   /api/users/{user}/reset-password
GET    /api/computer-assets
GET    /api/daily-jobs
POST   /api/daily-jobs
PUT    /api/daily-jobs/{dailyJob}
DELETE /api/daily-jobs/{dailyJob}
POST   /api/daily-jobs/{dailyJob}/approve
POST   /api/daily-jobs/{dailyJob}/reject
GET    /api/daily-jobs/export-pdf
```

Contoh export PDF semua data:

```txt
http://127.0.0.1:8000/api/daily-jobs/export-pdf?period=all
```

Contoh export PDF harian:

```txt
http://127.0.0.1:8000/api/daily-jobs/export-pdf?period=day&date=2026-04-30
```

Contoh export PDF mingguan:

```txt
http://127.0.0.1:8000/api/daily-jobs/export-pdf?period=week&week=2026-W18
```

Contoh export PDF bulanan:

```txt
http://127.0.0.1:8000/api/daily-jobs/export-pdf?period=month&month=2026-04
```

## Build Production

Build frontend:

```bash
cd frontend
npm run build
```

Output frontend ada di:

```txt
frontend/dist
```

## Testing

Test backend:

```bash
cd backend
php artisan test
```

Build check frontend:

```bash
cd frontend
npm run build
```

## Troubleshooting

Jika backend gagal jalan karena port dipakai:

```bash
lsof -ti :8000 | xargs kill -9
```

Jika frontend gagal jalan karena port dipakai:

```bash
lsof -ti :5173 | xargs kill -9
```

Jika dropdown login tidak muncul:

- Pastikan backend Laravel sedang berjalan.
- Pastikan MySQL XAMPP aktif.
- Pastikan database `elshinta_jobdesk` sudah dibuat.
- Jalankan ulang:

```bash
cd backend
php artisan config:clear
php artisan migrate:fresh --seed
```

## Catatan Keamanan

Project ini memakai auth sederhana berbasis API lokal untuk kebutuhan internal. Untuk production publik, sebaiknya ditingkatkan dengan Laravel Sanctum/session auth, CSRF protection penuh, dan konfigurasi deployment yang lebih ketat.
