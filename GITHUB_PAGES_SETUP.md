# GitHub Pages Setup Guide

Jika Anda mengalami error `Get Pages site failed`, ikuti langkah-langkah berikut:

## Cara Mengaktifkan GitHub Pages

### Langkah 1: Buka Repository Settings
1. Buka repository Anda di GitHub
2. Klik tab **Settings** (di bagian atas)

### Langkah 2: Navigasi ke Pages Settings
1. Di sidebar kiri, scroll ke bawah
2. Klik **Pages**

### Langkah 3: Pilih Source

#### Opsi A: GitHub Actions (Direkomendasikan)
1. Di bagian **Build and deployment**
2. Pilih **Source**: **GitHub Actions**
3. Klik **Save**

#### Opsi B: Deploy from Branch (Alternatif)
1. Pilih **Source**: **Deploy from a branch**
2. Pilih **Branch**: `gh-pages` / `main`
3. Klik **Save**

### Langkah 4: Jalankan Workflow
1. Kembali ke repository
2. Klik tab **Actions**
3. Pilih workflow **"Deploy to GitHub Pages"**
4. Klik **Run workflow**

---

## Troubleshooting

### Error: "Get Pages site failed"

**Penyebab**: GitHub Pages belum diaktifkan di repository

**Solusi**:
```
Settings > Pages > Source: GitHub Actions > Save
```

### Error: "Resource not accessible by integration"

**Penyebab**: Workflow tidak memiliki izin yang cukup

**Solusi**:
1. Buka **Settings > Actions > General**
2. Scroll ke **Workflow permissions**
3. Pilih **Read and write permissions**
4. Centang **Allow GitHub Actions to create and approve pull requests**
5. Klik **Save**

### Workflow tidak muncul

**Solusi**:
1. Push file workflow ke repository
2. Tunggu beberapa menit
3. Refresh halaman Actions

---

## Alternatif: Deploy Manual

Jika semua workflow gagal, deploy secara manual:

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/webtoapk-builder.git
cd webtoapk-builder

# Install dan build
npm install
npm run build

# Install gh-pages
git checkout --orphan gh-pages
git rm -rf .
cp -r dist/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

---

## Verifikasi Deployment

Setelah berhasil deploy:
1. Buka **Settings > Pages**
2. Lihat bagian **Visit site**
3. URL akan terlihat seperti: `https://yourusername.github.io/webtoapk-builder`

---

## Butuh Bantuan?

Jika masih mengalami masalah:
1. Cek [GitHub Pages Documentation](https://docs.github.com/en/pages)
2. Lihat [GitHub Actions Documentation](https://docs.github.com/en/actions)
3. Buka issue di repository ini
