export interface UserProfile {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  date_joined: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface CompanyItem {
  id: number
  code: string
  name: string
  sector: string
  indices: string
  kap_url: string
  is_bist30: boolean
  comment_count: number
  updated_at: string
}

export interface PriceHistoryPoint {
  date: string
  close: number
  volume: number | null
}

export interface StockMarketData {
  code: string
  symbol: string
  data_available: boolean
  currency: string
  last_price: number | null
  previous_close: number | null
  change: number | null
  change_percent: number | null
  open: number | null
  day_high: number | null
  day_low: number | null
  volume: number | null
  market_cap: number | null
  year_high: number | null
  year_low: number | null
  ma50: number | null
  ma200: number | null
  history: PriceHistoryPoint[]
  source_name: string
  source_url: string
  is_delayed: boolean
  delay_disclaimer: string
  last_updated: string
  unavailable_reason: string | null
}

export interface FinancialRow {
  key: string
  label: string
  category: string
  is_summary: boolean
  description: string
  values: Record<string, number | null>
}

export interface FinancialTableData {
  type: 'BILANCO' | 'GELIR' | 'NAKIT'
  title: string
  subtitle: string
  periods: string[]
  rows: FinancialRow[]
  data_available: boolean
}

export interface CompanyFinancialsPayload {
  code: string
  symbol: string
  data_available: boolean
  currency: string
  unit_note: string
  periods: string[]
  kap_company_url: string
  kap_financials_url: string
  yahoo_financials_url: string
  source_name: string
  last_updated: string
  is_delayed: boolean
  tables: {
    BILANCO: FinancialTableData
    GELIR: FinancialTableData
    NAKIT: FinancialTableData
  }
  unavailable_reason: string | null
}

export interface AnalysisComparison {
  key: string
  title: string
  category: string
  current_period: string | null
  previous_period: string | null
  current_value: number | null
  previous_value: number | null
  change_percent: number | null
  summary: string
}

export interface FinancialRatio {
  code: string
  name: string
  value: number | null
  unit: string
  period: string | null
  formula: string
  status: 'calculated' | 'missing_data'
  educational_note: string
}

export interface CashFlowSummary {
  period: string | null
  operating: number | null
  investing: number | null
  financing: number | null
  free_cash_flow: number | null
  ending_cash: number | null
  commentary: string[]
}

export interface FinancialAnalysisData {
  latest_periods: {
    bilanco: string | null
    gelir: string | null
    nakit: string | null
  }
  comparisons: AnalysisComparison[]
  ratios: FinancialRatio[]
  cash_flow_summary: CashFlowSummary
  warnings: string[]
  disclaimer: string
}

export interface NewsItem {
  title: string
  published_at: string
  source_name: string
  url: string
}

export interface CompanyNewsPayload {
  code: string
  data_available: boolean
  items: NewsItem[]
  kap_company_url: string
  source_name: string
  copyright_notice: string
  last_updated: string
  empty_message: string | null
}

export interface CommodityAsset {
  code: string
  name: string
  category: string
  unit: string
  currency: string
  spot_price: number | null
  buy_price: number | null
  sell_price: number | null
  spread_note: string
  change_percent: number | null
  data_available: boolean
  calculation_note: string
  source_name: string
  source_url: string
  is_delayed: boolean
  last_updated: string
}

export interface CommoditiesPayload {
  fx_reference: {
    pair: string
    rate: number | null
    change_percent: number | null
    source_name: string
    source_url: string
  }
  assets: CommodityAsset[]
  source_name: string
  is_delayed: boolean
  last_updated: string
  disclaimer: string
}

export interface CommentItem {
  id: number
  author_username: string
  company_code: string
  company_name: string
  target_type: 'COMPANY' | 'FINANCIAL_TABLE'
  statement_type: '' | 'BILANCO' | 'GELIR' | 'NAKIT'
  period: string
  content: string
  is_edited: boolean
  is_owner: boolean
  created_at: string
  updated_at: string
}

export interface HomeOverviewPayload {
  bist_stats: {
    total_companies: number
    bist30_count: number
    sector_count: number
  }
  market_summary: {
    bist100: {
      symbol: string
      name: string
      last_price: number | null
      change: number | null
      change_percent: number | null
      data_available: boolean
      source_name: string
      source_url: string
      is_delayed: boolean
      last_updated: string
    }
    featured_quotes: Array<{
      code: string
      name?: string
      last_price: number | null
      change: number | null
      change_percent: number | null
      volume: number | null
      market_cap: number | null
      currency: string
      data_available: boolean
      is_delayed: boolean
      last_updated: string
    }>
    source_name: string
    is_delayed: boolean
    last_updated: string
  }
  commodities_preview: {
    fx_reference: CommoditiesPayload['fx_reference']
    assets: CommodityAsset[]
    last_updated: string
    source_name: string
  }
  recent_comments: CommentItem[]
}
