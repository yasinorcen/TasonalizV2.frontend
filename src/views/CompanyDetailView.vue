<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import PriceChart from '@/components/PriceChart.vue'
import CommentSection from '@/components/CommentSection.vue'
import { apiFetch } from '@/services/api'
import type {
  CompanyFinancialsPayload,
  CompanyItem,
  CompanyNewsPayload,
  FinancialAnalysisData,
  StockMarketData,
} from '@/types/api'
import {
  formatCompactNumber,
  formatCurrency,
  formatDateTime,
  formatFullAccounting,
  formatPercent,
} from '@/utils/formatters'

const route = useRoute()
const code = computed(() => String(route.params.code || '').toUpperCase())

type MainTab = 'OVERVIEW' | 'FINANCIALS' | 'ANALYSIS' | 'NEWS' | 'COMMENTS'
const activeTab = ref<MainTab>('OVERVIEW')

type StatementTab = 'BILANCO' | 'GELIR' | 'NAKIT'
const activeStatementTab = ref<StatementTab>('BILANCO')
const selectedCommentPeriod = ref<string>('')

const company = ref<CompanyItem | null>(null)
const marketData = ref<StockMarketData | null>(null)
const chartPeriod = ref('6mo')
const loadingOverview = ref(true)
const overviewError = ref<string | null>(null)

const financials = ref<CompanyFinancialsPayload | null>(null)
const analysis = ref<FinancialAnalysisData | null>(null)
const loadingFinancials = ref(false)
const financialsError = ref<string | null>(null)

const news = ref<CompanyNewsPayload | null>(null)
const loadingNews = ref(false)
const newsError = ref<string | null>(null)

async function fetchCompanyOverview() {
  loadingOverview.value = true
  overviewError.value = null
  try {
    const res = await apiFetch<{
      company: CompanyItem
      market_data: StockMarketData
    }>(`/companies/${code.value}/?period=${chartPeriod.value}`)
    company.value = res.company
    marketData.value = res.market_data
    if (typeof document !== 'undefined' && res.company) {
      document.title = `${res.company.code} (${res.company.name}) — Tasonaliz`
    }
  } catch (err) {
    overviewError.value =
      err instanceof Error
        ? err.message
        : 'Şirket detayları yüklenirken bir hata oluştu.'
  } finally {
    loadingOverview.value = false
  }
}

async function fetchFinancialsAndAnalysis() {
  if (financials.value && financials.value.code === code.value) return
  loadingFinancials.value = true
  financialsError.value = null
  try {
    const res = await apiFetch<{
      company: CompanyItem
      financials: CompanyFinancialsPayload
      analysis: FinancialAnalysisData
    }>(`/companies/${code.value}/financials/`)
    financials.value = res.financials
    analysis.value = res.analysis
    if (res.financials.periods.length > 0 && !selectedCommentPeriod.value) {
      selectedCommentPeriod.value = res.financials.periods[0] || ''
    }
  } catch (err) {
    financialsError.value =
      err instanceof Error
        ? err.message
        : 'KAP finansal tabloları ve analiz verileri alınamadı.'
  } finally {
    loadingFinancials.value = false
  }
}

async function fetchNews() {
  if (news.value && news.value.code === code.value) return
  loadingNews.value = true
  newsError.value = null
  try {
    news.value = await apiFetch<CompanyNewsPayload>(
      `/companies/${code.value}/news/`
    )
  } catch (err) {
    newsError.value =
      err instanceof Error
        ? err.message
        : 'Şirket haberleri alınırken bir hata oluştu.'
  } finally {
    loadingNews.value = false
  }
}

function handlePeriodChange(newPeriod: string) {
  chartPeriod.value = newPeriod
  fetchCompanyOverview()
}

const currentTable = computed(() => {
  if (!financials.value) return null
  return financials.value.tables[activeStatementTab.value]
})

onMounted(() => {
  fetchCompanyOverview()
  fetchFinancialsAndAnalysis()
  fetchNews()
})

watch(code, () => {
  financials.value = null
  analysis.value = null
  news.value = null
  selectedCommentPeriod.value = ''
  fetchCompanyOverview()
  fetchFinancialsAndAnalysis()
  fetchNews()
})
</script>

<template>
  <div class="company-detail-view">
    <div style="margin-block-end: 1rem">
      <RouterLink to="/sirketler" class="btn btn-sm">
        ← BIST Şirketler Listesine Dön
      </RouterLink>
    </div>

    <div v-if="loadingOverview && !company" class="state-box">
      <strong>{{ code }}</strong> şirket ve piyasa verileri yükleniyor...
    </div>

    <div v-else-if="overviewError" class="state-box state-box-error">
      {{ overviewError }}
    </div>

    <template v-else-if="company && marketData">
      <!-- Company Header Card -->
      <section class="company-hero card">
        <div class="company-hero-left">
          <div class="hero-badges">
            <span class="badge badge-accent">{{ company.code }}</span>
            <span class="badge badge-neutral">{{ company.sector }}</span>
            <span v-if="company.is_bist30" class="badge badge-positive">
              BIST 30
            </span>
          </div>
          <h1 class="company-title">{{ company.name }}</h1>
          <p class="company-indices">
            Endeksler: <strong>{{ company.indices }}</strong>
          </p>
          <div class="external-links">
            <a
              v-if="company.kap_url"
              :href="company.kap_url"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-sm"
            >
              Resmî KAP Şirket Sayfası ↗
            </a>
            <a
              :href="marketData.source_url"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-sm"
            >
              Piyasa Veri Kaynağı ↗
            </a>
          </div>
        </div>

        <div class="company-hero-right">
          <template v-if="marketData.data_available">
            <span class="quote-caption">
              Gecikmeli Hisse Fiyatı ({{ marketData.currency }})
            </span>
            <div class="quote-main-row">
              <strong class="quote-price">
                {{ formatCurrency(marketData.last_price, marketData.currency) }}
              </strong>
              <span
                v-if="marketData.change_percent !== null"
                class="badge"
                :class="
                  marketData.change_percent >= 0
                    ? 'badge-positive'
                    : 'badge-negative'
                "
              >
                {{
                  marketData.change !== null && marketData.change >= 0 ? '+' : ''
                }}{{ marketData.change }} ({{
                  formatPercent(marketData.change_percent)
                }})
              </span>
            </div>
            <span class="quote-delay-note">
              ⏱ {{ marketData.delay_disclaimer }}
            </span>
            <span class="quote-updated">
              Son Güncelleme: {{ formatDateTime(marketData.last_updated) }}
            </span>
          </template>
          <template v-else>
            <div class="state-box state-box-warning">
              <strong>Hisse Fiyat Verisi Bulunamadı</strong>
              <p style="margin: 0.35rem 0 0 0; font-size: 0.85rem">
                {{ marketData.unavailable_reason }}
              </p>
            </div>
          </template>
        </div>
      </section>

      <!-- Navigation Tabs -->
      <nav class="detail-tabs" aria-label="Şirket inceleme bölümleri">
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'OVERVIEW' }"
          @click="activeTab = 'OVERVIEW'"
        >
          📈 Hisse &amp; Piyasa Bilgileri
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'FINANCIALS' }"
          @click="activeTab = 'FINANCIALS'"
        >
          📊 KAP Finansal Tablolar (Bilanço / Gelir / Nakit)
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'ANALYSIS' }"
          @click="activeTab = 'ANALYSIS'"
        >
          🔍 Temel Finansal Analiz &amp; Oranlar
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'NEWS' }"
          @click="activeTab = 'NEWS'"
        >
          📰 Şirket Haberleri
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'COMMENTS' }"
          @click="activeTab = 'COMMENTS'"
        >
          💬 Şirket Yorumları
        </button>
      </nav>

      <!-- TAB 1: OVERVIEW & STOCK QUOTE -->
      <section v-if="activeTab === 'OVERVIEW'" class="tab-panel">
        <div class="metrics-grid">
          <div class="metric-card card">
            <span class="metric-label">Önceki Kapanış</span>
            <strong class="metric-val">
              {{ formatCurrency(marketData.previous_close, marketData.currency) }}
            </strong>
          </div>
          <div class="metric-card card">
            <span class="metric-label">Gün İçi Aralık (En Düşük - En Yüksek)</span>
            <strong class="metric-val">
              {{ formatCurrency(marketData.day_low, marketData.currency) }} —
              {{ formatCurrency(marketData.day_high, marketData.currency) }}
            </strong>
          </div>
          <div class="metric-card card">
            <span class="metric-label">52 Haftalık Aralık</span>
            <strong class="metric-val">
              {{ formatCurrency(marketData.year_low, marketData.currency) }} —
              {{ formatCurrency(marketData.year_high, marketData.currency) }}
            </strong>
          </div>
          <div class="metric-card card">
            <span class="metric-label">Piyasa Değeri</span>
            <strong class="metric-val">
              {{ formatCompactNumber(marketData.market_cap, marketData.currency) }}
            </strong>
          </div>
          <div class="metric-card card">
            <span class="metric-label">Günlük İşlem Hacmi (Adet)</span>
            <strong class="metric-val">
              {{ formatCompactNumber(marketData.volume) }}
            </strong>
          </div>
          <div class="metric-card card">
            <span class="metric-label">50 / 200 Günlük Ortalama</span>
            <strong class="metric-val">
              {{ formatCurrency(marketData.ma50, marketData.currency) }} /
              {{ formatCurrency(marketData.ma200, marketData.currency) }}
            </strong>
          </div>
        </div>

        <PriceChart
          :points="marketData.history"
          :currency="marketData.currency"
          :selected-period="chartPeriod"
          style="margin-block-start: 1.25rem"
          @change-period="handlePeriodChange"
        />

        <div class="source-meta-bar" style="margin-block-start: 0.85rem">
          <span>
            <strong>Veri Kaynağı:</strong>
            <a
              :href="marketData.source_url"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ marketData.source_name }} ↗
            </a>
          </span>
          <span>
            <strong>Son Güncellenme:</strong>
            {{ formatDateTime(marketData.last_updated) }}
          </span>
        </div>

        <CommentSection
          :company-code="company.code"
          target-type="COMPANY"
          section-title="Şirket ve Hisse Hakkında Kullanıcı Yorumları"
          style="margin-block-start: 1.75rem"
        />
      </section>

      <!-- TAB 2: KAP FINANCIAL STATEMENTS (BILANCO, GELIR, NAKIT) -->
      <section v-else-if="activeTab === 'FINANCIALS'" class="tab-panel">
        <div v-if="loadingFinancials" class="state-box">
          KAP finansal tabloları (Bilanço, Gelir Tablosu, Nakit Akış Tablosu)
          yükleniyor...
        </div>
        <div v-else-if="financialsError" class="state-box state-box-error">
          {{ financialsError }}
        </div>
        <template v-else-if="financials">
          <!-- KAP Metadata & Links Header -->
          <div class="kap-meta-card card">
            <div class="kap-meta-top">
              <div>
                <h2 class="section-title" style="margin-block-end: 0.25rem">
                  {{ company.code }} — Finansal Tablolar ve KAP Bildirimleri
                </h2>
                <p class="section-sub">
                  {{ financials.unit_note }} Kaynakta bulunmayan kalemler tahmin
                  edilmez; açıkça <strong>Veri Yok</strong> olarak gösterilir.
                </p>
              </div>
              <div class="kap-links">
                <a
                  :href="financials.kap_financials_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-sm btn-primary"
                >
                  Resmî KAP Finansal Bildirimler ↗
                </a>
                <a
                  :href="financials.kap_company_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-sm"
                >
                  KAP Şirket Özeti ↗
                </a>
              </div>
            </div>

            <!-- Statement Type Switcher -->
            <div class="stmt-switcher" role="tablist" aria-label="Finansal tablo türü">
              <button
                type="button"
                class="btn"
                :class="{ 'btn-primary': activeStatementTab === 'BILANCO' }"
                @click="activeStatementTab = 'BILANCO'"
              >
                1. Bilanço (Finansal Durum)
              </button>
              <button
                type="button"
                class="btn"
                :class="{ 'btn-primary': activeStatementTab === 'GELIR' }"
                @click="activeStatementTab = 'GELIR'"
              >
                2. Gelir Tablosu (Kâr / Zarar)
              </button>
              <button
                type="button"
                class="btn"
                :class="{ 'btn-primary': activeStatementTab === 'NAKIT' }"
                @click="activeStatementTab = 'NAKIT'"
              >
                3. Nakit Akış Tablosu
              </button>
            </div>
          </div>

          <div
            v-if="!financials.data_available || !currentTable?.data_available"
            class="state-box state-box-warning"
            style="margin-block-start: 1.25rem"
          >
            <strong>Yapılandırılmış Finansal Tablo Verisi Bulunamadı</strong>
            <p style="margin: 0.4rem 0 0 0">
              {{
                financials.unavailable_reason ||
                'Bu tablo türü için dönem verisi mevcut değil.'
              }}
            </p>
          </div>

          <!-- Financial Statement Table + Inline Explanations -->
          <template v-else-if="currentTable">
            <div
              tabindex="0"
              role="region"
              :aria-labelledby="`stmt-caption-${currentTable.type}`"
              class="table-wrapper"
              style="margin-block-start: 1.25rem"
            >
              <table class="data-table">
                <caption :id="`stmt-caption-${currentTable.type}`">
                  {{ company.code }} — {{ currentTable.title }} (Para Birimi:
                  {{ financials.currency }}) · {{ currentTable.subtitle }}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Finansal Kalem &amp; Açıklama</th>
                    <th scope="col">Grup</th>
                    <th
                      v-for="per in currentTable.periods"
                      :key="per"
                      scope="col"
                      class="num-cell"
                    >
                      {{ per }} Dönemi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in currentTable.rows"
                    :key="row.key"
                    :class="{ 'summary-row': row.is_summary }"
                  >
                    <th scope="row">
                      <div class="stmt-item-name">{{ row.label }}</div>
                      <div class="stmt-item-desc">{{ row.description }}</div>
                    </th>
                    <td>
                      <span class="badge badge-neutral">{{ row.category }}</span>
                    </td>
                    <td
                      v-for="per in currentTable.periods"
                      :key="per"
                      class="num-cell"
                    >
                      <span
                        :title="
                          formatFullAccounting(
                            row.values[per],
                            financials.currency
                          )
                        "
                      >
                        {{
                          row.values[per] !== null && row.values[per] !== undefined
                            ? formatCompactNumber(
                                row.values[per],
                                financials.currency
                              )
                            : '— (Veri Yok)'
                        }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="source-meta-bar" style="margin-block-start: 0.85rem">
              <span>
                <strong>Kaynak:</strong> {{ financials.source_name }}
              </span>
              <span>
                <strong>Son Güncellenme:</strong>
                {{ formatDateTime(financials.last_updated) }}
              </span>
            </div>
          </template>

          <!-- Period Selector for Financial Table Comments -->
          <div class="card" style="margin-block-start: 1.5rem">
            <div class="period-comment-filter">
              <label for="stmt-period-select" style="font-weight: 700">
                Finansal Tablo Yorum Dönemi Seçin:
              </label>
              <select
                id="stmt-period-select"
                v-model="selectedCommentPeriod"
                class="select"
                style="max-width: 240px"
              >
                <option value="">Tüm Dönemler</option>
                <option
                  v-for="p in financials.periods"
                  :key="p"
                  :value="p"
                >
                  {{ p }} Dönemi
                </option>
              </select>
            </div>
          </div>

          <CommentSection
            :company-code="company.code"
            target-type="FINANCIAL_TABLE"
            :statement-type="activeStatementTab"
            :period="selectedCommentPeriod"
            :section-title="`${company.code} — ${
              activeStatementTab === 'BILANCO'
                ? 'Bilanço'
                : activeStatementTab === 'GELIR'
                  ? 'Gelir Tablosu'
                  : 'Nakit Akış Tablosu'
            } Kullanıcı Yorumları`"
            style="margin-block-start: 1rem"
          />
        </template>
      </section>

      <!-- TAB 3: FUNDAMENTAL FINANCIAL ANALYSIS -->
      <section v-else-if="activeTab === 'ANALYSIS'" class="tab-panel">
        <div v-if="loadingFinancials" class="state-box">
          Finansal analiz ve oran hesaplamaları hazırlanıyor...
        </div>
        <div v-else-if="financialsError" class="state-box state-box-error">
          {{ financialsError }}
        </div>
        <template v-else-if="analysis && financials">
          <div class="state-box state-box-warning" style="margin-block-end: 1.25rem">
            <strong>Eğitsel Analiz Notu:</strong> {{ analysis.disclaimer }}
          </div>

          <div
            v-for="(warn, wIdx) in analysis.warnings"
            :key="wIdx"
            class="state-box"
            style="margin-block-end: 1rem"
          >
            ⚠️ <strong>Veri Uyarısı:</strong> {{ warn }}
          </div>

          <!-- Period-over-Period Comparisons -->
          <h2 class="section-title">
            1. Varlık, Yükümlülük, Özkaynak ve Kârlılık Dönem Karşılaştırması
          </h2>
          <div class="card-Grid" style="margin-block-end: 2rem">
            <article
              v-for="comp in analysis.comparisons"
              :key="comp.key"
              class="card comparison-card"
            >
              <div class="comp-top">
                <span class="badge badge-neutral">{{ comp.category }}</span>
                <span
                  v-if="comp.change_percent !== null"
                  class="badge"
                  :class="
                    comp.change_percent >= 0
                      ? 'badge-positive'
                      : 'badge-negative'
                  "
                >
                  {{ formatPercent(comp.change_percent) }}
                </span>
              </div>
              <h3 class="comp-title">{{ comp.title }}</h3>
              <div class="comp-values">
                <div>
                  <span class="comp-period-label">
                    {{ comp.current_period || 'Son Dönem' }}:
                  </span>
                  <strong>
                    {{
                      formatCompactNumber(
                        comp.current_value,
                        financials.currency
                      )
                    }}
                  </strong>
                </div>
                <div v-if="comp.previous_period">
                  <span class="comp-period-label">
                    {{ comp.previous_period }}:
                  </span>
                  <span>
                    {{
                      formatCompactNumber(
                        comp.previous_value,
                        financials.currency
                      )
                    }}
                  </span>
                </div>
              </div>
              <p class="comp-summary">{{ comp.summary }}</p>
            </article>
          </div>

          <!-- Fundamental Financial Ratios -->
          <h2 class="section-title">
            2. Temel Finansal Oranlar ve Sade Açıklamaları
          </h2>
          <div class="card-Grid" style="margin-block-end: 2rem">
            <article
              v-for="ratio in analysis.ratios"
              :key="ratio.code"
              class="card ratio-card"
            >
              <div class="comp-top">
                <strong class="ratio-name">{{ ratio.name }}</strong>
                <span class="badge badge-accent">
                  {{ ratio.period || 'Dönem Yok' }}
                </span>
              </div>

              <div class="ratio-val-box">
                <template v-if="ratio.status === 'calculated' && ratio.value !== null">
                  <strong class="ratio-number">
                    {{
                      ratio.unit === '%'
                        ? `%${ratio.value.toLocaleString('tr-TR')}`
                        : `${ratio.value.toLocaleString('tr-TR')}x`
                    }}
                  </strong>
                </template>
                <template v-else>
                  <span class="badge badge-warning">Veri Eksik / Hesaplanmadı</span>
                </template>
              </div>

              <div class="ratio-formula">
                <strong>Formül:</strong> <code>{{ ratio.formula }}</code>
              </div>
              <p class="comp-summary">{{ ratio.educational_note }}</p>
            </article>
          </div>

          <!-- Cash Flow Overview -->
          <h2 class="section-title">
            3. İşletme, Yatırım ve Finansman Nakit Akışı Görünümü ({{
              analysis.cash_flow_summary.period || 'Son Dönem'
            }})
          </h2>
          <div class="card">
            <div class="cf-grid">
              <div class="cf-item">
                <span class="metric-label">İşletme Faaliyetlerinden Nakit</span>
                <strong class="metric-val">
                  {{
                    formatCompactNumber(
                      analysis.cash_flow_summary.operating,
                      financials.currency
                    )
                  }}
                </strong>
              </div>
              <div class="cf-item">
                <span class="metric-label">Yatırım Faaliyetlerinden Nakit</span>
                <strong class="metric-val">
                  {{
                    formatCompactNumber(
                      analysis.cash_flow_summary.investing,
                      financials.currency
                    )
                  }}
                </strong>
              </div>
              <div class="cf-item">
                <span class="metric-label">Finansman Faaliyetlerinden Nakit</span>
                <strong class="metric-val">
                  {{
                    formatCompactNumber(
                      analysis.cash_flow_summary.financing,
                      financials.currency
                    )
                  }}
                </strong>
              </div>
              <div class="cf-item">
                <span class="metric-label">Serbest Nakit Akışı (FCF)</span>
                <strong class="metric-val">
                  {{
                    formatCompactNumber(
                      analysis.cash_flow_summary.free_cash_flow,
                      financials.currency
                    )
                  }}
                </strong>
              </div>
            </div>

            <ul
              v-if="analysis.cash_flow_summary.commentary.length"
              class="cf-notes"
            >
              <li
                v-for="(note, idx) in analysis.cash_flow_summary.commentary"
                :key="idx"
              >
                {{ note }}
              </li>
            </ul>
            <p v-else class="section-sub" style="margin-block-start: 0.75rem">
              Bu şirket için yapılandırılmış nakit akışı özeti bulunamadı.
            </p>
          </div>
        </template>
      </section>

      <!-- TAB 4: COMPANY NEWS -->
      <section v-else-if="activeTab === 'NEWS'" class="tab-panel">
        <div v-if="loadingNews" class="state-box">
          {{ company.code }} şirket haberleri yükleniyor...
        </div>
        <div v-else-if="newsError" class="state-box state-box-error">
          {{ newsError }}
        </div>
        <template v-else-if="news">
          <div class="state-box" style="margin-block-end: 1.25rem">
            <strong>Telif ve Kaynak Politikası (Bölüm 3.2):</strong>
            {{ news.copyright_notice }}
          </div>

          <div v-if="!news.data_available" class="state-box state-box-warning">
            <p style="margin: 0 0 0.75rem 0">{{ news.empty_message }}</p>
            <a
              :href="news.kap_company_url"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-sm btn-primary"
            >
              Resmî KAP Özel Durum Açıklamalarını Aç ↗
            </a>
          </div>

          <div v-else class="news-list">
            <article
              v-for="(item, idx) in news.items"
              :key="idx"
              class="card news-card"
            >
              <div class="news-meta">
                <span class="badge badge-accent">{{ item.source_name }}</span>
                <span class="news-date">{{ item.published_at }}</span>
              </div>
              <h3 class="news-title">
                <a :href="item.url" target="_blank" rel="noopener noreferrer">
                  {{ item.title }} ↗
                </a>
              </h3>
              <div class="news-footer">
                <a
                  :href="item.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-sm"
                >
                  Orijinal Habere Git ↗
                </a>
              </div>
            </article>
          </div>

          <div class="source-meta-bar" style="margin-block-start: 1rem">
            <span><strong>Kaynak:</strong> {{ news.source_name }}</span>
            <span>
              <strong>Son Güncellenme:</strong>
              {{ formatDateTime(news.last_updated) }}
            </span>
          </div>
        </template>
      </section>

      <!-- TAB 5: COMPANY COMMENTS -->
      <section v-else-if="activeTab === 'COMMENTS'" class="tab-panel">
        <CommentSection
          :company-code="company.code"
          target-type="COMPANY"
          :section-title="`${company.code} (${company.name}) Kullanıcı Yorumları`"
        />
      </section>
    </template>
  </div>
</template>

<style scoped>
.company-hero {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 1.5rem;
  align-items: center;
}

.hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-block-end: 0.65rem;
}

.company-title {
  font-size: clamp(1.3rem, 1rem + 1.4vw, 1.85rem);
  font-weight: 800;
  margin: 0 0 0.35rem 0;
}

.company-indices {
  margin: 0 0 0.85rem 0;
  font-size: 0.88rem;
  color: var(--text-muted);
}

.external-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.company-hero-right {
  padding: 1rem 1.25rem;
  border-radius: var(--radius-sm);
  background: var(--bg-surface-alt);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.quote-caption {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
}

.quote-main-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.quote-price {
  font-size: 1.9rem;
  font-weight: 800;
}

.quote-delay-note,
.quote-updated {
  font-size: 0.76rem;
  color: var(--text-muted);
}

.detail-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-block: 1.25rem;
  border-block-end: 1px solid var(--border-color);
  padding-block-end: 0.75rem;
}

.tab-btn {
  padding: 0.55rem 0.95rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
}

.tab-btn.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #ffffff;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.85rem;
}

.metric-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric-label {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-weight: 600;
}

.metric-val {
  font-size: 1.05rem;
  font-weight: 800;
}

.kap-meta-top {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-block-end: 1rem;
}

.kap-links {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.stmt-switcher {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-block-start: 0.85rem;
  border-block-start: 1px solid var(--border-color);
}

.stmt-item-name {
  font-weight: 700;
}

.stmt-item-desc {
  font-size: 0.76rem;
  font-weight: 400;
  color: var(--text-muted);
  max-width: 390px;
}

.period-comment-filter {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.comparison-card,
.ratio-card {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.comp-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.comp-title {
  margin: 0;
  font-size: 1.02rem;
}

.comp-values {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.65rem;
  border-radius: var(--radius-sm);
  background: var(--bg-surface-alt);
  font-size: 0.88rem;
}

.comp-period-label {
  color: var(--text-muted);
  margin-inline-end: 0.35rem;
}

.comp-summary {
  margin: 0;
  font-size: 0.86rem;
  color: var(--text-secondary);
}

.ratio-name {
  font-size: 1rem;
}

.ratio-val-box {
  padding: 0.55rem 0.75rem;
  background: var(--bg-surface-alt);
  border-radius: var(--radius-sm);
}

.ratio-number {
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--accent-primary);
}

.ratio-formula {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.cf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.cf-item {
  padding: 0.8rem;
  border-radius: var(--radius-sm);
  background: var(--bg-surface-alt);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cf-notes {
  margin: 1rem 0 0 0;
  padding-inline-start: 1.25rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.news-card {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.news-date {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.news-title {
  margin: 0;
  font-size: 1.05rem;
}

@media (max-width: 860px) {
  .company-hero {
    grid-template-columns: 1fr;
  }
}
</style>
