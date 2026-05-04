"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, BarChart3, PieChart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Transaction {
  id: string
  date: string
  type: "income" | "expense"
  category: string
  amount: number
  memo?: string
  created_at: string
}

interface CostAllocation {
  id: string
  transaction_id: string
  allocation_type: string
  amount: number
  percentage: number
  created_at: string
}

interface PackagingReport {
  packaging_type: string
  total_income: number
  total_allocations: number
  profit_amount: number
  transaction_count: number
  avg_per_transaction: number
}

export default function AdvancedReports() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [costAllocations, setCostAllocations] = useState<CostAllocation[]>([])
  const [packagingReports, setPackagingReports] = useState<PackagingReport[]>([])
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  })
  const [selectedPackaging, setSelectedPackaging] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Fetch transactions
      const { data: transactionData, error: transactionError } = await supabase
        .from("transactions")
        .select("*")
        .gte("date", dateRange.start)
        .lte("date", dateRange.end)
        .order("date", { ascending: false })

      if (transactionError) throw transactionError
      setTransactions(transactionData || [])

      // Fetch cost allocations
      const { data: allocationData, error: allocationError } = await supabase
        .from("cost_allocations")
        .select("*, transactions!inner(date)")
        .gte("transactions.date", dateRange.start)
        .lte("transactions.date", dateRange.end)

      if (allocationError) throw allocationError
      setCostAllocations(allocationData || [])

      // Generate packaging reports
      generatePackagingReports(transactionData || [], allocationData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Gagal memuat data laporan",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generatePackagingReports = (transactions: Transaction[], allocations: CostAllocation[]) => {
    const packagingData: Record<string, PackagingReport> = {}

    // Group retort transactions by packaging type
    const retortTransactions = transactions.filter(
      (t) => t.type === "income" && t.category.toLowerCase().includes("retort"),
    )

    retortTransactions.forEach((transaction) => {
      // Extract packaging info from category or memo
      let packagingType = "Unknown"
      const categoryLower = transaction.category.toLowerCase()
      const memoLower = (transaction.memo || "").toLowerCase()

      if (categoryLower.includes("100") || memoLower.includes("100")) {
        packagingType = "Kemasan 100 gram"
      } else if (categoryLower.includes("250") || memoLower.includes("250")) {
        packagingType = "Kemasan 250 gram"
      } else if (categoryLower.includes("500") || memoLower.includes("500")) {
        packagingType = "Kemasan 500 gram"
      } else if (categoryLower.includes("12x15") || memoLower.includes("12x15")) {
        packagingType = "Kemasan 12x15 cm"
      } else if (categoryLower.includes("13x21") || memoLower.includes("13x21")) {
        packagingType = "Kemasan 13x21 cm"
      } else if (categoryLower.includes("16x23") || memoLower.includes("16x23")) {
        packagingType = "Kemasan 16x23 cm"
      } else {
        packagingType = "Retort Umum"
      }

      if (!packagingData[packagingType]) {
        packagingData[packagingType] = {
          packaging_type: packagingType,
          total_income: 0,
          total_allocations: 0,
          profit_amount: 0,
          transaction_count: 0,
          avg_per_transaction: 0,
        }
      }

      packagingData[packagingType].total_income += transaction.amount
      packagingData[packagingType].transaction_count += 1

      // Find related allocations
      const relatedAllocations = allocations.filter((a) => a.transaction_id === transaction.id)
      relatedAllocations.forEach((allocation) => {
        packagingData[packagingType].total_allocations += allocation.amount
        if (allocation.allocation_type === "profit") {
          packagingData[packagingType].profit_amount += allocation.amount
        }
      })
    })

    // Calculate averages
    Object.values(packagingData).forEach((report) => {
      if (report.transaction_count > 0) {
        report.avg_per_transaction = report.total_income / report.transaction_count
      }
    })

    setPackagingReports(Object.values(packagingData))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const exportDetailedReport = () => {
    const headers = [
      "Tanggal",
      "Jenis Kemasan",
      "Kategori Transaksi",
      "Total Pemasukan",
      "Biaya Listrik",
      "Biaya Gas",
      "Biaya Air",
      "Biaya Sewa",
      "Biaya Operasional",
      "Cadangan Operasional",
      "Biaya Tenaga Kerja",
      "Pajak",
      "Laba Perusahaan (25%)",
      "Total Alokasi Biaya",
      "Catatan",
    ]

    let csvContent = `"${headers.join('","')}"\n`

    const retortTransactions = transactions.filter(
      (t) => t.type === "income" && t.category.toLowerCase().includes("retort"),
    )

    retortTransactions.forEach((transaction) => {
      const relatedAllocations = costAllocations.filter((a) => a.transaction_id === transaction.id)

      // Extract packaging type
      let packagingType = "Retort Umum"
      const categoryLower = transaction.category.toLowerCase()
      const memoLower = (transaction.memo || "").toLowerCase()

      if (categoryLower.includes("100") || memoLower.includes("100")) {
        packagingType = "Kemasan 100 gram"
      } else if (categoryLower.includes("250") || memoLower.includes("250")) {
        packagingType = "Kemasan 250 gram"
      } else if (categoryLower.includes("500") || memoLower.includes("500")) {
        packagingType = "Kemasan 500 gram"
      } else if (categoryLower.includes("12x15") || memoLower.includes("12x15")) {
        packagingType = "Kemasan 12x15 cm"
      } else if (categoryLower.includes("13x21") || memoLower.includes("13x21")) {
        packagingType = "Kemasan 13x21 cm"
      } else if (categoryLower.includes("16x23") || memoLower.includes("16x23")) {
        packagingType = "Kemasan 16x23 cm"
      }

      const getAllocationAmount = (type: string) => {
        const allocation = relatedAllocations.find((a) => a.allocation_type === type)
        return allocation ? allocation.amount : 0
      }

      const row = [
        new Date(transaction.date).toLocaleDateString("id-ID"),
        packagingType,
        transaction.category,
        transaction.amount.toLocaleString("id-ID"),
        getAllocationAmount("electricity").toLocaleString("id-ID"),
        getAllocationAmount("gas").toLocaleString("id-ID"),
        getAllocationAmount("water").toLocaleString("id-ID"),
        getAllocationAmount("rent").toLocaleString("id-ID"),
        getAllocationAmount("operational").toLocaleString("id-ID"),
        getAllocationAmount("operational_reserve").toLocaleString("id-ID"),
        getAllocationAmount("labor").toLocaleString("id-ID"),
        getAllocationAmount("tax").toLocaleString("id-ID"),
        getAllocationAmount("profit").toLocaleString("id-ID"),
        relatedAllocations.reduce((sum, a) => sum + a.amount, 0).toLocaleString("id-ID"),
        (transaction.memo || "").replace(/"/g, '""'),
      ]
      csvContent += `"${row.join('","')}"\n`
    })

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `R2B-Laporan-Alokasi-Biaya-Detail-${dateRange.start}-${dateRange.end}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Berhasil",
      description: "Laporan detail berhasil diunduh",
    })
  }

  const exportPackagingReport = () => {
    const headers = [
      "Jenis Kemasan",
      "Jumlah Transaksi",
      "Total Pemasukan",
      "Total Alokasi Biaya",
      "Laba Perusahaan",
      "Rata-rata per Transaksi",
      "Margin Laba (%)",
    ]

    let csvContent = `"${headers.join('","')}"\n`

    packagingReports.forEach((report) => {
      const profitMargin = report.total_income > 0 ? (report.profit_amount / report.total_income) * 100 : 0
      const row = [
        report.packaging_type,
        report.transaction_count.toString(),
        report.total_income.toLocaleString("id-ID"),
        report.total_allocations.toLocaleString("id-ID"),
        report.profit_amount.toLocaleString("id-ID"),
        report.avg_per_transaction.toLocaleString("id-ID"),
        profitMargin.toFixed(2),
      ]
      csvContent += `"${row.join('","')}"\n`
    })

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `R2B-Laporan-Per-Kemasan-${dateRange.start}-${dateRange.end}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Berhasil",
      description: "Laporan per kemasan berhasil diunduh",
    })
  }

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const totalAllocatedProfit = costAllocations
    .filter((ca) => ca.allocation_type === "profit")
    .reduce((sum, ca) => sum + ca.amount, 0)

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="start-date">Tanggal Mulai</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end-date">Tanggal Akhir</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchData} disabled={isLoading} className="w-full">
                {isLoading ? "Memuat..." : "Perbarui Laporan"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Ringkasan
          </TabsTrigger>
          <TabsTrigger value="packaging" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Per Kemasan
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Detail Alokasi
          </TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Pemasukan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {transactions.filter((t) => t.type === "income").length} transaksi
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Pengeluaran</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {transactions.filter((t) => t.type === "expense").length} transaksi
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Laba HPP (25%)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalAllocatedProfit)}</p>
                <p className="text-sm text-gray-600 mt-2">Dari perhitungan HPP</p>
              </CardContent>
            </Card>
          </div>

          {/* Cost Allocation Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Rincian Alokasi Biaya</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Object.entries(
                  costAllocations.reduce(
                    (acc, ca) => {
                      if (!acc[ca.allocation_type]) {
                        acc[ca.allocation_type] = 0
                      }
                      acc[ca.allocation_type] += ca.amount
                      return acc
                    },
                    {} as Record<string, number>,
                  ),
                ).map(([type, amount]) => (
                  <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 capitalize mb-2">
                      {type === "electricity"
                        ? "Listrik"
                        : type === "gas"
                          ? "Gas"
                          : type === "water"
                            ? "Air"
                            : type === "rent"
                              ? "Sewa"
                              : type === "operational"
                                ? "Operasional"
                                : type === "operational_reserve"
                                  ? "Cadangan"
                                  : type === "labor"
                                    ? "Tenaga Kerja"
                                    : type === "tax"
                                      ? "Pajak"
                                      : type === "profit"
                                        ? "Laba"
                                        : type}
                    </p>
                    <p className="font-bold text-lg">{formatCurrency(amount)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Packaging Tab */}
        <TabsContent value="packaging" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Laporan Per Jenis Kemasan</h3>
            <Button onClick={exportPackagingReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <div className="grid gap-4">
            {packagingReports.map((report) => (
              <Card key={report.packaging_type}>
                <CardHeader>
                  <CardTitle className="text-lg">{report.packaging_type}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Jumlah Transaksi</p>
                      <p className="text-xl font-bold">{report.transaction_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Pemasukan</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(report.total_income)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Laba Perusahaan</p>
                      <p className="text-xl font-bold text-blue-600">{formatCurrency(report.profit_amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Rata-rata per Transaksi</p>
                      <p className="text-xl font-bold">{formatCurrency(report.avg_per_transaction)}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Margin Laba:</span>
                      <span className="font-bold text-lg text-purple-600">
                        {report.total_income > 0 ? ((report.profit_amount / report.total_income) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Detailed Tab */}
        <TabsContent value="detailed" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Laporan Detail Alokasi Biaya</h3>
            <Button onClick={exportDetailedReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Detail CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left">Tanggal</th>
                  <th className="border border-gray-300 p-3 text-left">Jenis Kemasan</th>
                  <th className="border border-gray-300 p-3 text-right">Pemasukan</th>
                  <th className="border border-gray-300 p-3 text-right">Laba (25%)</th>
                  <th className="border border-gray-300 p-3 text-right">Total Alokasi</th>
                  <th className="border border-gray-300 p-3 text-left">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {transactions
                  .filter((t) => t.type === "income" && t.category.toLowerCase().includes("retort"))
                  .map((transaction) => {
                    const relatedAllocations = costAllocations.filter((a) => a.transaction_id === transaction.id)
                    const profitAmount = relatedAllocations.find((a) => a.allocation_type === "profit")?.amount || 0
                    const totalAllocations = relatedAllocations.reduce((sum, a) => sum + a.amount, 0)

                    // Extract packaging type
                    let packagingType = "Retort Umum"
                    const categoryLower = transaction.category.toLowerCase()
                    const memoLower = (transaction.memo || "").toLowerCase()

                    if (categoryLower.includes("100") || memoLower.includes("100")) {
                      packagingType = "Kemasan 100 gram"
                    } else if (categoryLower.includes("250") || memoLower.includes("250")) {
                      packagingType = "Kemasan 250 gram"
                    } else if (categoryLower.includes("500") || memoLower.includes("500")) {
                      packagingType = "Kemasan 500 gram"
                    } else if (categoryLower.includes("12x15") || memoLower.includes("12x15")) {
                      packagingType = "Kemasan 12x15 cm"
                    } else if (categoryLower.includes("13x21") || memoLower.includes("13x21")) {
                      packagingType = "Kemasan 13x21 cm"
                    } else if (categoryLower.includes("16x23") || memoLower.includes("16x23")) {
                      packagingType = "Kemasan 16x23 cm"
                    }

                    return (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-3">
                          {new Date(transaction.date).toLocaleDateString("id-ID")}
                        </td>
                        <td className="border border-gray-300 p-3">{packagingType}</td>
                        <td className="border border-gray-300 p-3 text-right font-semibold text-green-600">
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="border border-gray-300 p-3 text-right font-semibold text-blue-600">
                          {formatCurrency(profitAmount)}
                        </td>
                        <td className="border border-gray-300 p-3 text-right">{formatCurrency(totalAllocations)}</td>
                        <td className="border border-gray-300 p-3 text-sm text-gray-600">{transaction.memo || "-"}</td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
