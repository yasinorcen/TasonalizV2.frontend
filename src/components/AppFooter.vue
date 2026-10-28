<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="app-footer">
    <div class="container">
      <div class="simulation-disclaimer" role="note" aria-label="Yasal ve Eğitsel Simülasyon Uyarısı">
        <div class="disclaimer-badge">ÖĞRENCİ SİMÜLASYONU VE BİLGİLENDİRME UYARISI</div>
        <p class="disclaimer-text">
          <strong>
            Tasonaliz, öğrenci projesi kapsamında geliştirilmiş bir bilgilendirme ve
            simülasyon uygulamasıdır. Alım-satım işlemi gerçekleştirmez ve yatırım
            tavsiyesi sunmaz. Gösterilen veriler ücretsiz üçüncü taraf kaynaklardan
            ve/veya kamuya açık bildirimlerden elde edilebilir; gecikmeli, eksik veya
            hatalı olabilir. Finansal analizler yalnızca bilgilendirme ve eğitim amacı
            taşır. Önemli kararlar için resmî kaynakları kontrol ediniz.
          </strong>
        </p>
      </div>

      <div class="footer-bottom">
        <div class="footer-brand">
          <strong>Tasonaliz V2</strong> — Borsa İstanbul Şirketleri, KAP Finansal Tabloları ve Emtia Simülasyonu
        </div>
        <div class="footer-links">
          <RouterLink to="/sirketler">BIST Şirketleri</RouterLink>
          <RouterLink to="/altin-ve-emtia">Altın &amp; Değerli Metaller</RouterLink>
          <RouterLink to="/hakkinda">Veri Kaynakları &amp; İlkeler</RouterLink>
          <a href="https://www.kap.org.tr" target="_blank" rel="noopener noreferrer">
            Resmî KAP (kap.org.tr) ↗
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: var(--bg-surface);
  border-block-start: 1px solid var(--border-color);
  padding-block: 1.75rem;
  margin-block-start: auto;
}

.simulation-disclaimer {
  background: var(--warning-bg);
  color: var(--warning-text);
  border: 1px solid currentColor;
  border-radius: var(--radius-md);
  padding: 1rem 1.25rem;
  margin-block-end: 1.25rem;
}

.disclaimer-badge {
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  margin-block-end: 0.35rem;
}

.disclaimer-text {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.55;
}

.footer-bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1.15rem;
}
</style>
