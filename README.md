# AnxinityStream

Publisher / Developer: Felix Ferdinand  
Versi: 5.0.0 (Mega Studio Edition)  
Lisensi: MIT (100% Free to Use)  
Repository: https://github.com/felixxferdinandd/AnxinityStream

---

## Ringkasan Proyek

AnxinityStream v5.0.0 Mega Studio Edition adalah suite aplikasi desktop Windows profesional open-source yang dirancang khusus bagi live streamer dengan konfigurasi single-monitor. Aplikasi ini menggabungkan live chat, donasi SuperChat, gift TikTok, dan interaksi penonton dari YouTube Live serta TikTok LIVE ke dalam satu feed overlay transparan berperforma tinggi yang dilengkapi mode Ghost (Click-Through), engine Text-To-Speech (TTS) in-game, soundboard synthesizer, dan analitik siaran langsung.

---

## Fitur Utama v5.0.0 Mega Studio Edition

1. **Auto-Reconnect & Health Monitor (Penyelesaian Masalah Koneksi)**
   - Algoritma reconnect otomatis dengan exponential backoff (hingga 5 kali percobaan) saat internet atau socket siaran mengalami gangguan sesaat.
   - Indikator latensi ping real-time (hijau/amber/merah) untuk memantau kesehatan koneksi WebSocket.
   - Guard batas waktu koneksi (timeout 14 detik) agar aplikasi tidak pernah terjebak dalam status menghubungkan tanpa henti.
   - Sanitasi komprehensif untuk link, username TikTok, dan channel handle YouTube.

2. **In-Game Text-To-Speech (TTS) Voice Engine**
   - Streamer dapat mendengarkan pesan chat dibacakan langsung ke headset dalam Bahasa Indonesia tanpa perlu mengalihkan pandangan dari crosshair game.
   - Pilihan filter fleksibel: bacakan semua chat, bacakan SuperChat & Gift saja, atau bacakan pesan moderator saja.
   - Dilengkapi slider kecepatan (speed), nada (pitch), dan volume independen.

3. **Audio Synthesizer v5.0 & Soundboard Suite**
   - 5 profil suara notifikasi donasi yang dapat diganti sewaktu-waktu:
     - Cyberpunk Fanfare: Akord synth harmonik modern.
     - Retro 8-Bit Arcade: Nada koin game konsol klasik.
     - Modern Crisp Ding: Denting bel kristal studio halus.
     - Luxury Casino Cascade: Efek jackpot koin beruntun untuk mega gift.
     - Rising Level-Up: Sapuan nada naik heroik penyemangat siaran.
   - Soundboard test button pada setiap profil nada untuk pengujian instan.
   - Nada konfirmasi akustik halus saat Hotkey F9 ditekan.

4. **Visual Theme Studio (4 Presets & 3 Bubble Styles)**
   - 4 tema visual siap pakai:
     - Cyberpunk Neon: Aksen cyan dan hot pink dengan glow esports.
     - Obsidian Dark Pro: Tampilan matte black minimalis berstandar studio OBS/Linear.
     - Glass Minimalist: Efek frosted blur transparan dengan kontras tinggi.
     - Gold Luxury: Nuansa amber dan emas mewah untuk siaran eksklusif.
   - 3 gaya bentuk gelembung pesan: Card Mode (kotak bingkai), Compact Line (garis minimalis), dan Floating Pill (kapsul rounded).
   - Skala font 4 tingkat (Kecil 11px, Sedang 13px, Besar 15px, Extra 17px) dan 3 keluarga font (Modern Sans, Gaming Bold, Clean Monospace).

5. **Ghost Mode (Tembus Klik) Universal (Hotkey: F9)**
   - Solusi mutlak untuk gamer single-monitor pada mode Borderless Windowed.
   - Kursor mouse tembus 100% ke game tanpa pernah salah klik jendela chat saat baku tembak kompetitif.
   - Tombol toggle instan tersedia di navbar studio dan floating overlay.

6. **Analitik Siaran Langsung & Session HUD**
   - Jam durasi siaran (Session Uptime Clock) yang berjalan real-time sejak siaran dimulai.
   - Penghitung pesan masuk per platform (YouTube vs TikTok) dan total donasi/gift.
   - Pengukur penonton aktif dan akumulasi likes real-time.

7. **Sistem Moderasi & Sensor Kata (Blacklist)**
   - Sensor otomatis kata-kata kasar / toxic dengan penggantian teks `***`.
   - Filter anti-spam duplikasi pesan berulang dalam 4 detik.
   - Pengatur ambang batas minimum diamond gift TikTok.
   - Filter platform: Tampilkan keduanya (Dual Stream), YouTube saja, atau TikTok saja.

---

## Perbandingan Versi: Portable vs Setup Installer

Aplikasi v5.0.0 disediakan dalam dua bentuk distribusi binary resmi:

| Aspek | Portable Edition (`AnxinityStream 5.0.0.exe`) | Setup Installer (`AnxinityStream Setup 5.0.0.exe`) |
| :--- | :--- | :--- |
| **Instalasi** | Tanpa instalasi. Langsung jalan saat file diklik dua kali. | Wizard instalasi standar Windows. |
| **Penyimpanan** | Mandiri (*standalone*), fleksibel ditaruh di flashdisk atau folder game. | Terpasang rapi di direktori program sistem (`AppData/Local/Programs`). |
| **Shortcut** | Tidak otomatis membuat shortcut. | Otomatis membuat shortcut di Desktop dan Start Menu. |
| **Pencopotan** | Cukup hapus file exe untuk mencopot. | Terdaftar di Windows Settings / Control Panel untuk uninstalasi bersih. |
| **Rekomendasi Penggunaan** | Pengguna yang sering berpindah perangkat atau ingin mencoba cepat tanpa modifikasi sistem. | Streamer harian yang ingin integrasi penuh di komputer utama. |

Kedua versi binary dapat diunduh melalui halaman GitHub Releases:  
https://github.com/felixxferdinandd/AnxinityStream/releases

---

## Panduan Penggunaan Lengkap

### 1. Menjalankan Aplikasi
1. Jalankan `AnxinityStream 5.0.0.exe` (Portable) atau installer yang telah terpasang.
2. Dua jendela kerja akan terbuka:
   - **AnxinityStream v5.0.0 - Broadcast Mega Studio** (Panel Kontrol Induk)
   - **AnxinityStream Overlay v5.0.0** (Jendela Chat Mengambang)

### 2. Menghubungkan Siaran YouTube Live
1. Masuk ke tab **Broadcast Center**.
2. Masukkan URL siaran langsung YouTube, Video ID, atau channel handle (contoh: `@ChannelHandle`).
3. Klik **Sambungkan**. Kolom input akan terkunci secara otomatis demi keamanan siaran.

### 3. Menghubungkan Siaran TikTok LIVE
1. Masukkan username streamer TikTok (contoh: `mooniyelle`).
2. Pastikan akun tersebut sedang dalam status LIVE di TikTok.
3. Klik **Sambungkan**. Koneksi WebSocket bootstrap langsung aktif tanpa meminta password ataupun login akun.

### 4. Menggunakan Ghost Mode Saat Bermain Game
1. Posisikan jendela overlay pada sudut layar monitor yang Anda inginkan.
2. Buka game Anda (disarankan menggunakan mode grafis **Borderless Windowed**).
3. Tekan tombol **F9** pada keyboard. Overlay seketika terkunci dan kursor mouse tembus 100% ke dalam game.
4. Tekan **F9** kembali apabila Anda ingin menggeser atau mengubah ukuran overlay.

### 5. Mengaktifkan In-Game TTS (Text-to-Speech)
1. Buka tab **Audio & TTS** pada panel kontrol.
2. Aktifkan toggle **Aktifkan Voice Speech Synthesizer**.
3. Pilih mode pembacaan (contoh: *SuperChat & Gifts Saja* agar hanya donasi yang dibacakan ke headset Anda).
4. Atur kecepatan dan volume sesuai kenyamanan telinga Anda.

---

## Changelog v5.0.0 (Mega Studio Edition)

- Peningkatan versi besar dari v1.0.0 ke v5.0.0 Mega Studio Edition.
- Penambahan engine Auto-Reconnect dengan exponential backoff dan live countdown.
- Penambahan Health Monitor dengan indikator latensi WebSocket real-time.
- Penambahan In-Game Text-To-Speech (TTS) Voice Engine dengan filter kategori pesan.
- Implementasi Audio Synthesizer v5.0 dengan 5 profil nada dan soundboard tester.
- Penambahan Theme Studio dengan 4 tema visual dan 3 gaya gelembung chat.
- Penambahan Session Uptime Clock dan meteran analitik per platform.
- Penambahan sistem sensor kata terlarang (blacklist) dan filter anti-spam.
- Penambahan umpan balik nada akustik saat Hotkey F9 ditekan.
- Optimalisasi layout Broadcast Center ke resolusi 980x730 untuk kenyamanan multitasking.

---

## Struktur Branch Repository

- `main`: Kode rilis produksi stabil yang siap digunakan publik.
- `dev`: Kode pengembangan aktif untuk eksperimen dan penambahan fitur lanjutan.
