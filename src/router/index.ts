import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import CompaniesView from '@/views/CompaniesView.vue'
import CompanyDetailView from '@/views/CompanyDetailView.vue'
import CommoditiesView from '@/views/CommoditiesView.vue'
import AuthView from '@/views/AuthView.vue'
import AboutSourcesView from '@/views/AboutSourcesView.vue'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Ana Sayfa — Tasonaliz BIST & KAP Simülasyonu' },
    },
    {
      path: '/sirketler',
      name: 'companies',
      component: CompaniesView,
      meta: { title: 'Borsa İstanbul Şirketleri — Tasonaliz' },
    },
    {
      path: '/sirketler/:code',
      name: 'company-detail',
      component: CompanyDetailView,
      props: true,
      meta: { title: 'Şirket Detayı, KAP Tabloları ve Analiz — Tasonaliz' },
    },
    {
      path: '/altin-ve-emtia',
      name: 'commodities',
      component: CommoditiesView,
      meta: { title: 'Altın, Gümüş, Bronz ve Değerli Metaller — Tasonaliz' },
    },
    {
      path: '/hesap',
      name: 'auth',
      component: AuthView,
      meta: { title: 'Giriş Yap / Kayıt Ol — Tasonaliz' },
    },
    {
      path: '/hakkinda',
      name: 'about',
      component: AboutSourcesView,
      meta: { title: 'Hakkında, Veri Kaynakları ve Simülasyon Uyarısı — Tasonaliz' },
    },
  ],
})

router.afterEach((to) => {
  const title = (to.meta?.title as string) || 'Tasonaliz'
  if (typeof document !== 'undefined') {
    document.title = title
  }
})

export default router
