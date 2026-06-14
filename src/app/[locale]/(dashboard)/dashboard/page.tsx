import { getTranslations } from "next-intl/server"
import { MetricsOverview } from "../dashboard-2/components/metrics-overview"
import { SalesChart } from "../dashboard-2/components/sales-chart"
import { RevenueBreakdown } from "../dashboard-2/components/revenue-breakdown"
import { RecentTransactions } from "../dashboard-2/components/recent-transactions"
import { TopProducts } from "../dashboard-2/components/top-products"
import { CustomerInsights } from "../dashboard-2/components/customer-insights"

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "dashboard.home" })

  return (
    <div className="flex-1 space-y-6 px-6 pt-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{t("pageTitle")}</h1>
        <p className="text-muted-foreground">{t("pageSubtitle")}</p>
      </div>

      <div className="@container/main space-y-6">
        <MetricsOverview />

        <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
          <SalesChart />
          <RevenueBreakdown />
        </div>

        <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
          <RecentTransactions />
          <TopProducts />
        </div>

        <CustomerInsights />
      </div>
    </div>
  )
}
