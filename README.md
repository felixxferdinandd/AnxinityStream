# AnxinityStream

Publisher / Developer: Felix Ferdinand  
Versi: 1.0.0 (Studio Edition)  
Lisensi: MIT (100% Free to Use)  
Repository: https://github.com/felixxferdinandd/AnxinityStream

---

## Ringkasan Proyek

AnxinityStream adalah aplikasi desktop Windows open-source yang dirancang khusus bagi live streamer dengan konfigurasi single-monitor. Aplikasi ini menggabungkan live chat, donasi SuperChat, gift TikTok, dan interaksi penonton dari YouTube Live serta TikTok LIVE ke dalam satu feed overlay transparan yang dilengkapi mode Ghost (Click-Through).

---

## Fitur Utama

1. **Unified Dual-Platform Live Feed**
   - Menggabungkan komentar YouTube Live dan TikTok LIVE secara real-time ke dalam satu jendela stream overlay.
   - Menampilkan foto profil (avatar) pengguna secara langsung, disertai lencana platform (YouTube/TikTok) di samping nama pengguna.
   - Dilengkapi penanda badge peran (Moderator, Member / Subscriber).

2. **Koneksi TikTok Bebas Login & Bebas API Key**
   - Terhubung langsung melalui protokol WebSocket tanpa mengharuskan input password, session cookie, login akun, atau langganan API berbayar pihak ketiga.
   - Cukup memasukkan username TikTok streamer saat siaran berlangsung.

3. **Ghost Mode (Tembus Klik) dengan Global Hotkey F9**
   - Menghilangkan interferensi kursor mouse saat bermain game fullscreen borderless.
   - Menekan hotkey F9 akan mengubah jendela overlay antara:
     - Mode Interaktif: Jendela dapat digeser, diatur ukurannya, dan diubah transparansinya.
     - Mode Ghost: Kursor mouse tembus langsung ke aplikasi/game di bawah overlay tanpa memicu fokus jendela chat.

4. **Kontrol Opacity Langsung pada Overlay**
   - Slider pengaturan transparansi latar belakang (5% hingga 100%) tersedia langsung pada header jendela overlay.
   - Streamer dapat menyesuaikan visibilitas layar secara instan tanpa perlu beralih jendela (Alt-Tab).

5. **Notifikasi Hype Alert (Gift & SuperChat)**
   - Tampilan visual menonjol untuk donasi YouTube SuperChat dan gift TikTok (seperti Mawar streak, Paus, dsb.).
   - Dilengkapi synthesizer audio internal (Web Audio API) untuk membunyikan nada notifikasi saat donasi diterima.

6. **Filter Transient Auto-Decay**
   - Notifikasi aktivitas sekunder (seperti user menyukai siaran, membagikan siaran, atau bergabung) ditampilkan dalam baris terisolasi dan otomatis menghilang dalam hitungan detik tanpa menabrak atau menumpuk teks chat utama.

7. **Studio Deck Control Panel**
   - Antarmuka manajemen siaran bergaya broadcast studio dengan fitur monitor feed lokal, penguncian kolom input otomatis saat koneksi aktif, kontrol volume nada, dan simulator event.

---

## Perbandingan Versi: Portable vs Setup Installer

Aplikasi disediakan dalam dua jenis distribusi binary:

| Aspek | Portable Edition (`AnxinityStream 1.0.0.exe`) | Setup Installer (`AnxinityStream Setup 1.0.0.exe`) |
| :--- | :--- | :--- |
| **Instalasi** | Tanpa instalasi. Langsung dijalankan saat file diklik. | Menjalankan wizard instalasi standar Windows. |
| **Penyimpanan** | Mandiri (*standalone*), dapat dijalankan dari flashdisk atau folder mana pun. | Terpasang rapi di direktori program sistem (`AppData/Local/Programs`). |
| **Shortcut** | Tidak otomatis membuat shortcut. | Otomatis membuat shortcut di Desktop dan Start Menu. |
| **Uninstaller** | Cukup hapus file exe untuk mencopot. | Terdaftar di Windows Settings / Control Panel untuk uninstalasi bersih. |
| **Rekomendasi Penggunaan** | Pengguna yang sering berpindah komputer atau ingin mencoba cepat tanpa modifikasi sistem. | Streamer harian yang ingin integrasi penuh di komputer utama. |

Kedua versi binary dapat diunduh langsung melalui halaman **GitHub Releases**:  
https://github.com/felixxferdinandd/AnxinityStream/releases

---

## Panduan Penggunaan

### 1. Menjalankan Aplikasi
1. Unduh salah satu versi binary (`AnxinityStream 1.0.0.exe` atau `AnxinityStream Setup 1.0.0.exe`).
2. Jalankan aplikasi. Dua jendela akan terbuka secara otomatis:
   - **AnxinityStream - Broadcast Studio** (Panel Kontrol)
   - **AnxinityStream Overlay** (Jendela Chat Transparan)

### 2. Menghubungkan YouTube Live
1. Buka tab **Studio Deck** pada panel kontrol.
2. Masukkan URL siaran langsung YouTube (contoh: `https://youtube.com/watch?v=xxxx`) atau handle channel (contoh: `@NamaChannel`).
3. Klik tombol **Sambungkan**.
4. Setelah terhubung, kolom input akan terkunci secara otomatis untuk mencegah perubahan tidak disengaja.

### 3. Menghubungkan TikTok LIVE
1. Pada kolom TikTok LIVE, masukkan username streamer (contoh: `mooniyelle`).
2. Pastikan akun tersebut sedang dalam status LIVE.
3. Klik tombol **Sambungkan**. Kolom username akan terkunci saat status siaran aktif.

### 4. Mengatur Posisi dan Mengaktifkan Ghost Mode
1. Geser jendela overlay ke sudut layar monitor yang diinginkan.
2. Buka game atau aplikasi yang sedang distreaming (disarankan mode *Borderless Windowed*).
3. Tekan tombol **F9** pada keyboard untuk mengaktifkan **Ghost Mode**. Jendela overlay kini tembus klik sepenuhnya.
4. Tekan **F9** kembali apabila ingin memindahkan posisi overlay.

---

## Known Issues & Solusi Cepat (v1.0.0)

> [!NOTE]
> Daftar kendala yang telah teridentifikasi pada rilis v1.0.0 beserta solusi sementara sebelum patch versi berikutnya dirilis.

### 1. Penundaan Pesan Pertama TikTok Saat Awal Terhubung
- **Gejala**: Status TikTok menunjukkan terhubung, tetapi pesan chat baru muncul setelah beberapa saat atau tampak lambat di channel dengan lalu lintas obrolan rendah.
- **Penyebab**: Protokol inisialisasi WebSocket TikTok membutuhkan beberapa detik untuk menyelesaikan upgrade koneksi dari polling HTTP ke socket aktif.
- **Solusi Sementara**: 
  1. Tunggu 5-10 detik setelah tombol Sambungkan ditekan.
  2. Buka tab **Simulator** di Studio Deck, lalu klik tombol **Pesan TikTok**. Ini akan memicu *feed listener* di layar overlay untuk memastikan pipeline render aktif. Setelah itu, pesan asli penonton akan mengalir normal.
- **Status**: Sedang dioptimasi pada branch `dev` untuk rilis v1.1.0.

### 2. Tembus Klik Tidak Berfungsi pada Mode Exclusive Fullscreen
- **Gejala**: Menekan F9 tidak membuat kursor tembus ke game, atau overlay tertutup oleh layar game.
- **Penyebab**: Windows Graphics Architecture memberikan hak rendering eksklusif kepada aplikasi berstatus *Exclusive Fullscreen*.
- **Solusi**: Ubah pengaturan tampilan di dalam menu grafis game menjadi **Borderless Windowed** atau **Windowed Fullscreen**.

---

## Changelog

### Version 1.0.0 (Initial Public Release)
- Rebranding resmi proyek menjadi AnxinityStream.
- Implementasi layout Studio Broadcast modern dengan 2-kolom monitor dan panel deck.
- Integrasi koneksi TikTok direct WebSocket bootstrap tanpa login dan tanpa API key berbayar.
- Penambahan tombol pengunci input otomatis saat channel tersambung.
- Integrasi slider transparansi latar belakang langsung pada header jendela overlay.
- Perbaikan perataan visual teks chat dan pesan transient (menghilangkan overlap atau tabrakan teks antar elemen).
- Penambahan foto profil (avatar) pengguna dengan fallback huruf inisial dan lencana logo resmi platform di samping username.
- Dukungan global shortcut F9 untuk peralihan Ghost Mode (Click-Through).
- Implementasi Web Audio synthesizer untuk nada notifikasi donasi dan gift.

---

## Panduan Berkontribusi & Struktur Branch

Pengembangan repository ini menggunakan dua branch utama:
- `main`: Branch produksi yang berisi kode stabil yang siap dirilis ke publik.
- `dev`: Branch pengembangan aktif untuk pengujian fitur baru, perbaikan bug, dan optimasi performa.

Untuk berkontribusi:
1. Fork repository ini.
2. Buat feature branch dari branch `dev`:
   ```bash
   git checkout -b feature/nama-fitur dev
   ```
3. Commit perubahan dengan deskripsi yang jelas.
4. Ajukan Pull Request ke branch `dev`.
