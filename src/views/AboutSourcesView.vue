<script setup lang="ts">
// About, Simulation Notice & Data Sources Documentation Page (Section 7, 8 & 11)
</script>

<template>
  <div class="about-view">
    <section class="card" style="margin-block-end: 1.5rem">
      <span class="badge badge-accent" style="margin-block-end: 0.5rem">
        Bölüm 7, 8 ve 11 — Proje İlkeleri ve Veri Şeffaflığı
      </span>
      <h1 class="hero-title">Hakkında, Veri Kaynakları ve Simülasyon İlkeleri</h1>
      <p class="section-sub">
        <strong>Tasonaliz</strong>; Borsa İstanbul'da işlem gören şirketlere ait hisse
        fiyatlarını, şirket haberlerini, Kamuyu Aydınlatma Platformu (KAP) üzerinden
        yayımlanan finansal tabloları, sadeleştirilmiş temel analizleri ve değerli metal
        fiyatlarını tek bir arayüzde sunmayı amaçlayan öğrenci amaçlı bir bilgilendirme
        ve simülasyon projesidir.
      </p>
    </section>

    <div class="card-Grid" style="margin-block-end: 1.75rem">
      <article class="card">
        <h2 class="section-title">🚫 Kapsam Dışı Özellikler (Bölüm 4)</h2>
        <ul class="info-list">
          <li>Hisse, altın veya başka bir varlık için <strong>alım-satım işlemi gerçekleştirmez</strong>.</li>
          <li>Aracı kurum bağlantısı veya gerçek yatırım hesabı işlevi sunmaz.</li>
          <li>Emir oluşturma, iletme ya da portföyü gerçek piyasada yönetme özelliği yoktur.</li>
          <li>Kesin getiri vaadi, garantili yatırım sonucu veya kişiye özel yatırım tavsiyesi vermez.</li>
        </ul>
      </article>

      <article class="card">
        <h2 class="section-title">🔒 Güvenlik ve Veri İlkeleri (Bölüm 7 &amp; 10)</h2>
        <ul class="info-list">
          <li>Kaynakta bulunmayan finansal değerler tahmin edilerek gerçek veri gibi gösterilmez.</li>
          <li>Her veri öğesinde kaynak adı, kaynak bağlantısı, son güncellenme zamanı ve gecikme durumu belirtilir.</li>
          <li>Kullanıcı parolaları düz metin olarak saklanmaz; Django'nun yerleşik şifreleme yönetimi kullanılır.</li>
          <li>Kullanıcılar yalnızca kendi yazdıkları yorumları düzenleyebilir ve silebilir.</li>
        </ul>
      </article>
    </div>

    <!-- Data Sources Table -->
    <div
      tabindex="0"
      role="region"
      aria-labelledby="sources-table-caption"
      class="table-wrapper"
    >
      <table class="data-table stack-mobile">
        <caption id="sources-table-caption">
          Tasonaliz'de Kullanılan Ücretsiz Veri Kaynakları ve Güncellik Durumu
        </caption>
        <thead>
          <tr>
            <th scope="col">Veri Kategorisi</th>
            <th scope="col">Kullanılan Kaynak</th>
            <th scope="col">Güncellik / Gecikme</th>
            <th scope="col">Kullanım ve Gösterim İlkesi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">BIST Şirketler Dizini</th>
            <td data-label="Kaynak">
              <a
                href="https://www.kap.org.tr/tr/bist-sirketler"
                target="_blank"
                rel="noopener noreferrer"
              >
                Kamuyu Aydınlatma Platformu (KAP) ↗
              </a>
            </td>
            <td data-label="Güncellik">Kamuya açık resmî dizin</td>
            <td data-label="İlke">
              Tüm BIST şirketleri hisse kodu, unvanı ve resmî KAP özet bağlantısıyla listelenir.
            </td>
          </tr>
          <tr>
            <th scope="row">Hisse Fiyatları ve Grafikler</th>
            <td data-label="Kaynak">Yahoo Finance (.IS BIST Verisi)</td>
            <td data-label="Güncellik">15 dk gecikmeli / Gün sonu kapanışı</td>
            <td data-label="İlke">
              Gerçek zamanlı olduğu varsayılmaz; gecikme uyarısı ve son güncelleme zamanı açıkça gösterilir.
            </td>
          </tr>
          <tr>
            <th scope="row">Bilanço, Gelir ve Nakit Akış Tabloları</th>
            <td data-label="Kaynak">KAP Bildirim Bağlantıları &amp; UFRS/TMS Veri Akışı</td>
            <td data-label="Güncellik">Dönemsel (Yıllık / Çeyreklik)</td>
            <td data-label="İlke">
              Dönem, para birimi ve resmî KAP bağlantısı gösterilir; eksik kalemler uydurulmaz.
            </td>
          </tr>
          <tr>
            <th scope="row">Şirket Haberleri</th>
            <td data-label="Kaynak">Google Haberler RSS &amp; KAP Bildirimleri</td>
            <td data-label="Güncellik">RSS yayın akışı</td>
            <td data-label="İlke">
              Telif kuralları gereği haber metinleri kopyalanmaz; yalnızca başlık, tarih, kaynak adı ve orijinal link verilir.
            </td>
          </tr>
          <tr>
            <th scope="row">Altın Türleri, Gümüş ve Bronz</th>
            <td data-label="Kaynak">Küresel Spot Emtia (GC=F, SI=F, HG=F) &amp; USD/TRY</td>
            <td data-label="Güncellik">Gecikmeli spot parite</td>
            <td data-label="İlke">
              Standart borsa kodu bulunmayan alaşımlar (Bronz) için sahte fiyat üretilmez; durum açıkça belirtilir.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.info-list {
  margin: 0;
  padding-inline-start: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.92rem;
}
</style>
