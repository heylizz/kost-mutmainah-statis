/* =========================================================================
   app.js — OTAK SISTEM (pengganti includes/auth.php + includes/db.php)

   Ini BUKAN backend beneran. Semua "tabel" (user, booking, penghuni,
   pembayaran, kamar) disimpan sebagai satu objek JSON di localStorage
   browser, dan setiap fungsi di bawah ini meniru query SQL yang ada
   di versi PHP/MySQL aslinya (INSERT, UPDATE, SELECT ... WHERE ...).

   Tujuan: dipakai untuk tugas Perancangan UI/UX & Front-End (Design
   Thinking) - fokus ke alur & tampilan, bukan ke keamanan/performa.
   ========================================================================= */

const STORAGE_KEY = 'kost_mutmainah_sim_state_v1';

/* ---------- DEFAULT "DATABASE" ---------- */
function defaultState() {
  return {
    // tabel user (username unik). Akun 'admin' = pemilik, disediakan
    // supaya bisa langsung login sebagai pemilik tanpa perlu daftar
    // (pengganti generate_password.php di versi PHP).
    users: [
      { id_user: 1, username: 'admin', password: '123456', role: 'pemilik' },
      { id_user: 2, username: 'firliani', password: '123456', role: 'penghuni' },
      { id_user: 3, username: 'salsabila', password: '123456', role: 'penghuni' },
      { id_user: 4, username: 'yorri', password: '123456', role: 'penghuni' },
      { id_user: 5, username: 'bunga', password: '123456', role: 'penghuni' },
      { id_user: 6, username: 'diesca', password: '123456', role: 'penghuni' },
      { id_user: 7, username: 'anggi', password: '123456', role: 'penghuni' },
      { id_user: 8, username: 'bila', password: '123456', role: 'penghuni' },
      { id_user: 9, username: 'gabriel', password: '123456', role: 'penghuni' },
      { id_user: 10, username: 'sanora', password: '123456', role: 'penghuni' },
      { id_user: 11, username: 'holis', password: '123456', role: 'penghuni' },
      { id_user: 12, username: 'bagas', password: '123456', role: 'penghuni' }
    ],
    nextUserId: 13,

    session: { loggedIn: false, id_user: null, username: null, role: null },

    // tabel kamar (disederhanakan jadi 1 kamar untuk demo)
    kamar: {
      id_kamar: 1,
      nomor_kamar: 3,
      status: 'Kosong', // 'Kosong' | 'Terisi' -- status kamar CONTOH ini sendiri
      jumlah_tersedia: 2, // meniru $kosong = COUNT(*) WHERE status='Kosong' di versi PHP (bisa >1 kamar kosong)
      harga_sewa: 800000,
      ukuran_kamar: '3 x 4 m',
      info_listrik: 'Termasuk',
      fasilitas: 'Kasur,Bantal,Lemari,Kamar Mandi Dalam,Kipas Angin'
    },

    // tabel informasi_kost
    informasi_kost: {
      nama_kost: 'Kost Mutmainah',
      deskripsi: 'Kost nyaman dengan fasilitas lengkap, lingkungan bersih, dan lokasi strategis untuk mahasiswa maupun pekerja.',
      nomor_kontak: '081234567890',
      alamat: 'Jalan Bumijo Lor Gg. Masjid Khusnul Khotimah JT I/1178, RT.23/RW.06, Bumijo, Kec. Jetis, Kota Yogyakarta, Daerah Istimewa Yogyakarta 55231',
      // format: "fasilitas1,fasilitas2,..."
      fasilitas_umum: 'WiFi,Ruang Tamu,CCTV,Dapur,Area Parkir',
      // format: "Nama|Jarak;Nama|Jarak;..."
      lokasi_terdekat: 'Masjid Khusnul Khotimah|40 m;Pasar Kranggan|450 m;Tugu Jogja|650 m;Bank BRI Unit Jetis|350 m;Malioboro|1.5 km;Indomaret|260 m',
      // format: "aturan1|aturan2|..."
      peraturan: 'Jam malam: pukul 22:00 untuk penghuni putra, pukul 23:00 untuk penghuni putri|Dilarang membawa tamu lawan jenis masuk ke dalam kamar|Wajib lapor ke pemilik/pengurus kost apabila pulang melewati jam malam|Dilarang membawa tamu menginap|Wajib menjaga kebersihan dan ketertiban lingkungan kost|Pembayaran sewa paling lambat tanggal 10 setiap bulan'
    },

    // tabel booking — diisi contoh sesuai kondisi yang pernah ditunjukkan
    // (Holis: Tahap 1 belum di-assign kamar, Bagas: Tahap 2 sudah upload identitas, kamar 11)
    bookings: [
      { id_booking: 1, id_user: 11, id_kamar: 1, nama: 'Holis', nomor_hp: '0878-9988-9272', tanggal: todayStr(), tanggal_mulai_sewa: todayStr(), tanggal_keluar: null, status_booking: 'Menunggu Persetujuan', identitas: null, nomor_kamar: null },
      { id_booking: 2, id_user: 12, id_kamar: 1, nama: 'Bagas', nomor_hp: '0812-3456-9012', tanggal: todayStr(), tanggal_mulai_sewa: todayStr(), tanggal_keluar: null, status_booking: 'Menunggu Konfirmasi', identitas: 'ktp_bagas.jpg', nomor_kamar: 11 }
    ],
    nextBookingId: 3,

    // dipakai untuk niruin $_SESSION['pending_booking'] di versi PHP
    pending_booking: null,

    // tabel penghuni
    penghuni: [
      { id_penghuni: 1, id_user: 2, nama: 'Firliani', nomor_hp: '0812-3456-0001', nomor_kamar: 1, identitas: 'ktp_firliani.jpg', tanggal_masuk: todayStr(), status_penghuni: 'Aktif' },
      { id_penghuni: 2, id_user: 3, nama: 'Salsabila', nomor_hp: '0812-3456-0002', nomor_kamar: 2, identitas: 'ktp_salsabila.jpg', tanggal_masuk: todayStr(), status_penghuni: 'Aktif' },
      { id_penghuni: 3, id_user: 4, nama: 'Yorri', nomor_hp: '0812-3456-0003', nomor_kamar: 3, identitas: 'ktp_yorri.jpg', tanggal_masuk: todayStr(), status_penghuni: 'Aktif' },
      { id_penghuni: 4, id_user: 5, nama: 'Bunga', nomor_hp: '0812-3456-0004', nomor_kamar: 4, identitas: 'ktp_bunga.jpg', tanggal_masuk: todayStr(), status_penghuni: 'Aktif' },
      { id_penghuni: 5, id_user: 6, nama: 'Diesca', nomor_hp: '0812-3456-0005', nomor_kamar: 5, identitas: 'ktp_diesca.jpg', tanggal_masuk: todayStr(), status_penghuni: 'Aktif' },
      { id_penghuni: 6, id_user: 7, nama: 'Anggi', nomor_hp: '0812-3456-0006', nomor_kamar: 6, identitas: 'ktp_anggi.jpg', tanggal_masuk: todayStr(), status_penghuni: 'Aktif' },
      { id_penghuni: 7, id_user: 8, nama: 'Bila', nomor_hp: '0812-3456-0007', nomor_kamar: 7, identitas: 'ktp_bila.jpg', tanggal_masuk: todayStr(), status_penghuni: 'Aktif' },
      { id_penghuni: 8, id_user: 9, nama: 'Gabriel', nomor_hp: '0812-3456-0008', nomor_kamar: 8, identitas: 'ktp_gabriel.jpg', tanggal_masuk: todayStr(), status_penghuni: 'Aktif' },
      { id_penghuni: 9, id_user: 10, nama: 'Sanora', nomor_hp: '0812-3456-0009', nomor_kamar: 9, identitas: 'ktp_sanora.jpg', tanggal_masuk: todayStr(), status_penghuni: 'Aktif' }
    ],
    nextPenghuniId: 10,

 
    pembayaran: buildRiwayatPembayaranAwal(),
    nextBayarId: 23
  };
}


function formatNomorWA(nomor) {
  let wa = (nomor || '').replace(/[^0-9]/g, '');
  if (wa.charAt(0) === '0') wa = '62' + wa.substring(1);
  return wa;
}
function buildWaUrl(nomor, pesan) {
  return `https://wa.me/${formatNomorWA(nomor)}?text=${encodeURIComponent(pesan)}`;
}

function getState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { const s = defaultState(); localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); return s; }
    return JSON.parse(raw);
  } catch (e) {
    const s = defaultState(); localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); return s;
  }
}
function saveState(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

function resetSimulationData() {
  if (!confirm('Reset semua data (user, booking, penghuni, pembayaran) ke kondisi awal?')) return;
  localStorage.removeItem(STORAGE_KEY);
  location.href = rootPath() + 'index.html';
}


function rootPath() {
  return location.pathname.includes('/penghuni/') || location.pathname.includes('/pemilik/') ? '../' : '';
}

/* ---------- AUTH (pengganti includes/auth.php) ---------- */
function isLoggedIn() { return getState().session.loggedIn === true; }
function isPemilik() { const s = getState(); return s.session.loggedIn && s.session.role === 'pemilik'; }
function isPenghuni() { const s = getState(); return s.session.loggedIn && s.session.role === 'penghuni'; }

function requireLogin() {
  if (!isLoggedIn()) { location.href = rootPath() + 'index.html?login=1'; }
}
function requirePemilik() {
  requireLogin();
  if (!isLoggedIn()) return;
  if (!isPemilik()) { location.href = rootPath() + 'penghuni/dashboard.html'; }
}
function requirePenghuni() {
  requireLogin();
  if (!isLoggedIn()) return;
  if (!isPenghuni()) { location.href = rootPath() + 'pemilik/dashboard.html'; }
}

function doLogout() {
  const s = getState();
  s.session = { loggedIn: false, id_user: null, username: null, role: null };
  saveState(s);
  location.href = rootPath() + 'index.html';
}

/* ---------- LIHAT DOKUMEN (identitas/bukti transfer) ---------- */
function showFotoDokumen(namaFile, judul) {
  let overlay = document.getElementById('fotoDokumenOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'fotoDokumenOverlay';
    overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:3000;align-items:center;justify-content:center;padding:24px;';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:12px;padding:20px;max-width:340px;text-align:center;position:relative;">
        <button onclick="document.getElementById('fotoDokumenOverlay').style.display='none'" style="position:absolute;top:8px;right:10px;background:none;border:none;font-size:20px;cursor:pointer;color:#888;line-height:1;">&times;</button>
        <h3 id="fotoDokumenJudul" style="font-size:15px;margin-bottom:12px;margin-top:6px;">Dokumen</h3>
        <div style="width:100%;height:200px;background:#e5e7eb;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:13px;">
            <img src="${rootPath()}icon/dokumen.png" alt="Pratinjau dokumen" style="width:56px;height:56px;opacity:0.6;">
        </div>
        <div id="fotoDokumenCaption" style="font-size:12px;color:#777;margin-top:10px;word-break:break-all;"></div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.style.display = 'none'; });
  }
  document.getElementById('fotoDokumenJudul').textContent = judul || 'Dokumen';
  document.getElementById('fotoDokumenCaption').textContent = namaFile;
  overlay.style.display = 'flex';
}

/* ---------- QUERY STRING HELPER ---------- */
function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

/* ---------- FORMAT HELPER ---------- */
function formatRupiah(n) { return 'Rp' + Number(n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function thisMonthStr() { return new Date().toISOString().slice(0, 7); }
function monthsAgoStr(n) {
  const d = new Date();
  d.setDate(1); // hindari overflow tanggal pas mundur bulan (misal tanggal 31)
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 7);
}
function monthsAgoDateStr(n, tanggal) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - n);
  d.setDate(tanggal || 8);
  return d.toISOString().slice(0, 10);
}
function formatTanggalIndo(dateStr) {
  if (!dateStr) return '-';
  const bulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const d = new Date(dateStr);
  return d.getDate() + ' ' + bulan[d.getMonth()] + ' ' + d.getFullYear();
}


function buildRiwayatPembayaranAwal() {
  const HARGA = 800000;
  const list = [];
  let id = 1;

  for (let idPenghuni = 1; idPenghuni <= 9; idPenghuni++) {
    // 2 bulan lalu & 1 bulan lalu: semua Lunas (riwayat)
    list.push({ id_pembayaran: id++, id_penghuni: idPenghuni, jumlah_bayar: HARGA, tanggal_bayar: monthsAgoDateStr(2), periode_bulan: monthsAgoStr(2), status_pembayaran: 'Lunas', bukti_transfer: 'bukti_' + idPenghuni + '_lalu2.jpg' });
    list.push({ id_pembayaran: id++, id_penghuni: idPenghuni, jumlah_bayar: HARGA, tanggal_bayar: monthsAgoDateStr(1), periode_bulan: monthsAgoStr(1), status_pembayaran: 'Lunas', bukti_transfer: 'bukti_' + idPenghuni + '_lalu1.jpg' });
  }

  // Bulan berjalan: status bervariasi sesuai skenario contoh
  const statusBulanIni = { 1: 'Lunas', 2: 'Pending', 3: 'Ditolak', 4: 'Pending' };
  for (const [idPenghuni, status] of Object.entries(statusBulanIni)) {
    list.push({ id_pembayaran: id++, id_penghuni: Number(idPenghuni), jumlah_bayar: HARGA, tanggal_bayar: todayStr(), periode_bulan: thisMonthStr(), status_pembayaran: status, bukti_transfer: 'bukti_' + idPenghuni + '_bulanini.jpg' });
  }

  return list;
}


function actionRegister(username, password) {
  const s = getState();
  if (s.users.find(u => u.username === username)) {
    return { error: 'Username sudah digunakan, coba yang lain.' };
  }
  s.users.push({ id_user: s.nextUserId++, username, password, role: 'penghuni' });
  saveState(s);
  return { success: true };
}

// index.php action=login: SELECT * FROM user WHERE username = ?
function actionLogin(username, password) {
  const s = getState();
  const user = s.users.find(u => u.username === username && u.password === password);
  if (!user) return { error: 'Username atau password salah.' };
  s.session = { loggedIn: true, id_user: user.id_user, username: user.username, role: user.role };
  saveState(s);
  return { success: true, role: user.role };
}

// booking.php POST: INSERT INTO booking (...)
function actionSubmitBooking(nama, nomor_hp, tanggal_mulai_sewa, tanggal_keluar) {
  const s = getState();
  if (!nama || !nomor_hp || !tanggal_mulai_sewa || !tanggal_keluar) return { error: 'Semua kolom wajib diisi.' };
  if (tanggal_mulai_sewa < todayStr()) return { error: 'Tanggal mulai sewa tidak boleh sebelum hari ini.' };
  if (tanggal_keluar <= tanggal_mulai_sewa) return { error: 'Tanggal keluar harus setelah tanggal mulai sewa.' };

  if (!s.session.loggedIn) {
   
    s.pending_booking = { id_kamar: s.kamar.id_kamar, nama, nomor_hp, tanggal_mulai_sewa, tanggal_keluar };
    saveState(s);
    return { needLogin: true };
  }

  s.bookings.push({
    id_booking: s.nextBookingId++,
    id_user: s.session.id_user,
    id_kamar: s.kamar.id_kamar,
    nama, nomor_hp,
    tanggal: todayStr(),
    tanggal_mulai_sewa,
    tanggal_keluar,
    status_booking: 'Menunggu Persetujuan',
    identitas: null,
    nomor_kamar: null
  });
  s.pending_booking = null;
  saveState(s);
  return { success: true };
}

// helper: ambil booking terakhir milik user yang sedang login
function getMyLatestBooking() {
  const s = getState();
  const mine = s.bookings.filter(b => b.id_user === s.session.id_user);
  if (!mine.length) return null;
  return mine.reduce((a, b) => (b.id_booking > a.id_booking ? b : a));
}
function getMyPenghuni() {
  const s = getState();
  return s.penghuni.find(p => p.id_user === s.session.id_user) || null;
}

// pemilik/booking.php tahap=awal aksi=setuju
function actionSetujuSementara(id_booking, nomor_kamar_input) {
  const s = getState();
  const bk = s.bookings.find(b => b.id_booking === id_booking);
  if (!bk) return {};
  const nk = parseInt(nomor_kamar_input);
  if (nk) bk.nomor_kamar = nk; // catatan: nomor kamar bebas diisi manual (1 kamar tersedia di demo ini)
  bk.status_booking = 'Menunggu Identitas';
  saveState(s);
  const pesan = `Halo ${bk.nama}, pemesanan kamar Anda disetujui SEMENTARA. Silakan upload identitas (KTP) di akun Anda untuk melanjutkan proses. Terima kasih - Kost Mutmainah`;
  return { waUrl: buildWaUrl(bk.nomor_hp, pesan) };
}

// pemilik/booking.php aksi=tolak
function actionTolakBooking(id_booking) {
  const s = getState();
  const bk = s.bookings.find(b => b.id_booking === id_booking);
  if (!bk) return {};
  bk.status_booking = 'Ditolak';
  saveState(s);
  const pesan = `Halo ${bk.nama}, maaf pemesanan kamar Anda DITOLAK. Silakan hubungi kami untuk info lebih lanjut. Terima kasih - Kost Mutmainah`;
  return { waUrl: buildWaUrl(bk.nomor_hp, pesan) };
}

// upload_identitas.php / penghuni/dashboard.php: UPDATE booking SET identitas=..., status_booking='Menunggu Konfirmasi'
function actionUploadIdentitas(id_booking, filename) {
  const s = getState();
  const bk = s.bookings.find(b => b.id_booking === id_booking);
  if (!bk) return { error: 'Booking tidak ditemukan.' };
  bk.identitas = filename;
  bk.status_booking = 'Menunggu Konfirmasi';
  saveState(s);
  return { success: true };
}

// pemilik/booking.php tahap=final aksi=setuju
function actionSetujuFinal(id_booking) {
  const s = getState();
  const bk = s.bookings.find(b => b.id_booking === id_booking);
  if (!bk) return {};
  bk.status_booking = 'Disetujui';

  const sudahAda = s.penghuni.find(p => p.nomor_hp === bk.nomor_hp);
  if (!sudahAda) {
    s.penghuni.push({
      id_penghuni: s.nextPenghuniId++,
      id_user: bk.id_user,
      nama: bk.nama,
      nomor_hp: bk.nomor_hp,
      id_kamar: s.kamar.id_kamar,
      nomor_kamar: bk.nomor_kamar || s.kamar.nomor_kamar,
      identitas: bk.identitas,
      tanggal_masuk: todayStr(),
      status_penghuni: 'Aktif'
    });
  }
  s.kamar.status = 'Terisi';
  saveState(s);
  const pesan = `Halo ${bk.nama}, booking kamar ${bk.nomor_kamar || s.kamar.nomor_kamar} Anda telah DISETUJUI FINAL. Selamat bergabung di Kost Mutmainah!`;
  return { waUrl: buildWaUrl(bk.nomor_hp, pesan) };
}

// penghuni/pembayaran.php POST: INSERT INTO pembayaran (...)
function actionSubmitPembayaran(id_penghuni, filename) {
  const s = getState();
  if (!filename) return { error: 'Silakan upload bukti transfer terlebih dahulu.' };
  s.pembayaran.push({
    id_pembayaran: s.nextBayarId++,
    id_penghuni,
    jumlah_bayar: 700000,
    tanggal_bayar: todayStr(),
    periode_bulan: thisMonthStr(),
    status_pembayaran: 'Pending',
    bukti_transfer: filename
  });
  saveState(s);
  return { success: true };
}

// pemilik/pembayaran.php POST: UPDATE pembayaran SET status_pembayaran=...
function actionValidasiPembayaran(id_pembayaran, aksi) {
  const s = getState();
  const p = s.pembayaran.find(x => x.id_pembayaran === id_pembayaran);
  if (!p) return;
  p.status_pembayaran = aksi === 'approve' ? 'Lunas' : 'Ditolak';
  saveState(s);
}

// pemilik/penghuni.php: pengingat pembayaran
function actionKirimReminder(nama, nomorHp) {
  const pesan = `Halo ${nama}, ini adalah pengingat pembayaran sewa kost bulan ${new Date().toLocaleString('id-ID',{month:'long', year:'numeric'})}. Mohon segera melakukan pembayaran. Terima kasih.`;
  return { waUrl: buildWaUrl(nomorHp, pesan) };
}
