# Laporan Belanja Harian — SMTH

Aplikasi web satu halaman untuk crew purchasing mencatat belanja harian
(DAPUR, BAR, SERVER, KASIR, OPERASIONAL) dan mengirim laporannya lewat WhatsApp.
Tidak butuh server atau database: semua data tersimpan di browser HP pemakai
(localStorage).

## Struktur

```
index.html            Hasil build. File inilah yang di-upload ke GitHub Pages.
src/app.html          Tampilan, gaya (CSS) dan logika aplikasi.
src/parser.js         Pembaca teks laporan gaya WA (jumlah, satuan, harga, kelompok).
build.py              Menggabungkan src/ menjadi index.html.
tests/parser.test.js  Uji cepat parser dengan laporan contoh 17 Nov.
```

## Mengubah lalu membangun ulang

1. Edit `src/app.html` atau `src/parser.js`.
2. Jalankan `python build.py`, hasilnya `index.html` yang baru.
3. Uji parser (opsional): `node tests/parser.test.js`
4. Commit dan push ke GitHub. GitHub Pages memperbarui situs dalam 1–2 menit.

## Bagian penting di src/app.html

| Yang ingin diubah | Cari di kode |
|---|---|
| Daftar item bawaan (kelompok, sub-kelompok, nama, satuan, isi) | `const SEED=[` |
| Contoh laporan 17 Nov (sumber harga awal) | `const SAMPLE=` |
| Daftar satuan | `const BASE_UNITS=` |
| Satuan kemasan (menanyakan isi per ctn) | `const PACK=` |
| Item tanpa harga tetap (bensin, parkir) | `const NOPRICE=` |
| Item yang dipaksa masuk OPERASIONAL | `const FORCE=` |
| Warna kelompok | `const CC=` |
| Warna tema | `:root{` di bagian `<style>` |
| Angka tombol cepat jumlah | `[1,2,3,5,10,12,24,48]` |
| Format teks laporan WA | `function report()` |

Format baris `SEED`: `['KELOMPOK','Sub-kelompok','Nama Item','satuan', isiPerKemasan]`.
`isiPerKemasan` boleh dikosongkan.

## Penyimpanan data (localStorage)

| Kunci | Isi |
|---|---|
| `lbh-draft-v1` | Laporan yang sedang dikerjakan |
| `lbh-reports-v1` | Riwayat laporan tersimpan |
| `lbh-items-v1` | Item baru yang ditambahkan crew |
| `lbh-isi-v1` | Perubahan isi per kemasan |
| `lbh-unitov-v1` | Perubahan satuan item |
| `lbh-units-v1` | Satuan baru buatan crew |
| `lbh-unitren-v1` | Satuan yang diganti nama (lama → baru) |
| `lbh-unithide-v1` | Satuan bawaan yang disembunyikan |
| `lbh-unitold-v1` | Satuan yang dihapus (tetap dikenali di laporan lama) |
| `lbh-judul-v1` | Nama laporan terakhir |

Data ini hanya ada di browser masing-masing perangkat. Ganti nama repository
berarti ganti alamat situs, dan data crew di alamat lama tidak ikut pindah.
