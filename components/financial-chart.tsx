"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Transaction {
  id: string
  date: string
  type: "income" | "expense"
  category: string
  amount: number
  memo?: string
  user_id: string
  created_at: string
  updated_at: string
}

interface FinancialChartProps {
  transactions: Transaction[]
}

type PeriodType = "daily" | "weekly" | "monthly" | "yearly"
type ChartType = "bar" | "line"

export default function FinancialChart({ transactions }: FinancialChartProps) {
  const [period, setPeriod] = useState<PeriodType>("monthly")
  const [chartType, setChartType] = useState<ChartType>("bar")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const groupTransactionsByPeriod = (transactions: Transaction[], period: PeriodType) => {
    const grouped: { [key: string]: { income: number; expense: number; net: number } } = {}

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      let key: string

      switch (period) {
        case "daily":
          key = date.toISOString().split("T")[0] // YYYY-MM-DD
          break
        case "weekly":
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = `Minggu ${weekStart.toISOString().split("T")[0]}`
          break
        case "monthly":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
          break
        case "yearly":
          key = date.getFullYear().toString()
          break
        default:
          key = date.toISOString().split("T")[0]
      }

      if (!grouped[key]) {
        grouped[key] = { income: 0, expense: 0, net: 0 }
      }

      if (transaction.type === "income") {
        grouped[key].income += Number(transaction.amount)
      } else {
        grouped[key].expense += Number(transaction.amount)
      }
      grouped[key].net = grouped[key].income - grouped[key].expense
    })

    return Object.entries(grouped)
      .map(([period, data]) => ({
        period,
        pemasukan: data.income,
        pengeluaran: data.expense,
        laba_bersih: data.net,
      }))
      .sort((a, b) => a.period.localeCompare(b.period))
      .slice(-12) // Show last 12 periods
  }

  const chartData = groupTransactionsByPeriod(transactions, period)

  const formatPeriodLabel = (periodStr: string) => {
    switch (period) {
      case "daily":
        return new Date(periodStr).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })
      case "weekly":
        return periodStr.replace("Minggu ", "")
      case "monthly":
        const [year, month] = periodStr.split("-")
        return new Date(Number(year), Number(month) - 1).toLocaleDateString("id-ID", {
          month: "short",
          year: "numeric",
        })
      case "yearly":
        return periodStr
      default:
        return periodStr
    }
  }

  const ChartComponent = chartType === "bar" ? BarChart : LineChart

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <Select value={period} onValueChange={(value: PeriodType) => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Harian</SelectItem>
              <SelectItem value="weekly">Mingguan</SelectItem>
              <SelectItem value="monthly">Bulanan</SelectItem>
              <SelectItem value="yearly">Tahunan</SelectItem>
            </SelectContent>
          </Select>

          <Select value={chartType} onValueChange={(value: ChartType) => setChartType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ef4444" />
            <XAxis
              dataKey="period"
              tickFormatter={formatPeriodLabel}
              angle={-45}
              textAnchor="end"
              height={60}
              stroke="#3b82f6"
            />
            <YAxis tickFormatter={(value) => formatCurrency(value)} stroke="#3b82f6" />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              labelFormatter={formatPeriodLabel}
              contentStyle={{
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />

            {chartType === "bar" ? (
              <>
                <Bar dataKey="pemasukan" name="Pemasukan" fill="#10b981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#ef4444" radius={[2, 2, 0, 0]} />
                <Bar dataKey="laba_bersih" name="Laba Bersih" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              </>
            ) : (
              <>
                <Line
                  type="monotone"
                  dataKey="pemasukan"
                  name="Pemasukan"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="pengeluaran"
                  name="Pengeluaran"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#ef4444", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="laba_bersih"
                  name="Laba Bersih"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2 }}
                />
              </>
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Rata-rata Pemasukan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(chartData.reduce((sum, item) => sum + item.pemasukan, 0) / (chartData.length || 1))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Rata-rata Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-red-600">
              {formatCurrency(chartData.reduce((sum, item) => sum + item.pengeluaran, 0) / (chartData.length || 1))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Rata-rata Laba</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-600">
              {formatCurrency(chartData.reduce((sum, item) => sum + item.laba_bersih, 0) / (chartData.length || 1))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
