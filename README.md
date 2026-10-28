# Tasonaliz Frontend (Vue 3 + Vite + TypeScript)

**Tasonaliz**; Borsa İstanbul (BIST) şirketlerinin hisse fiyatlarını, KAP finansal tablolarını (Bilanço, Gelir Tablosu, Nakit Akış Tablosu), sadeleştirilmiş temel analizlerini, şirket haberlerini, altın/gümüş/bronz değerlerini ve kullanıcı yorumlarını sunan öğrenci amaçlı bilgilendirme ve simülasyon uygulamasının frontend arayüzüdür.

## Teknoloji Yığını

- **Framework:** Vue 3 (`<script setup lang="ts">`)
- **Build Aracı:** Vite 5 + TypeScript
- **Durum Yönetimi & Yönlendirme:** Pinia + Vue Router 4
- **Tema & Erişilebilirlik:** `<meta name="color-scheme">` + CSS `light-dark()` + `@container` duyarlı tablolar
- **Hedef Dağıtım Platformu:** Vercel (`vercel.json` SPA yönlendirmesi hazır)

## Kurulum ve Çalıştırma

```bash
npm install
cp .env.example .env
npm run dev
```

## Üretim Derlemesi (TypeScript Kontrolü + Vite Build)

```bash
npm run build
```
