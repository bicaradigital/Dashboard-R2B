"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, Plus, FileText, BarChart3, LogOut, Menu, X } from "lucide-react"
import TransactionForm from "@/components/transaction-form"
import TransactionList from "@/components/transaction-list"
import InvoiceManager from "@/components/invoice-manager"
import FinancialChart from "@/components/financial-chart"
import AuthGuard from "@/components/auth-guard"
import AdvancedReports from "@/components/advanced-reports"
import { getPermissions } from "@/lib/auth"

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

interface Profile {
  id: string
  full_name: string
  role: string
}

interface CostAllocation {
  id: string
  transaction_id: string
  allocation_type: string
  amount: number
  percentage: number
}

interface DashboardClientProps {
  user: User
  profile: Profile | null
  initialTransactions: Transaction[]
}

export default function DashboardClient({ user, profile, initialTransactions }: DashboardClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [costAllocations, setCostAllocations] = useState<CostAllocation[]>([])
  const supabase = createClient()

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0)
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0)

  // Calculate actual profit from cost allocations (25% company profit from HPP)
  const totalAllocatedProfit = costAllocations
    .filter((ca) => ca.allocation_type === "profit")
    .reduce((sum, ca) => sum + Number(ca.amount), 0)

  // Calculate operational costs from allocations
  const totalOperationalCosts = costAllocations
    .filter((ca) =>
      ["electricity", "gas", "water", "rent", "operational", "operational_reserve", "labor", "tax"].includes(
        ca.allocation_type,
      ),
    )
    .reduce((sum, ca) => sum + Number(ca.amount), 0)

  // Net profit calculation: allocated profit minus additional expenses not covered by HPP
  const netProfit = totalAllocatedProfit - totalExpense + (totalIncome - totalOperationalCosts - totalAllocatedProfit)

  // Average profit margin calculation
  const avgProfitMargin = totalIncome > 0 ? (totalAllocatedProfit / totalIncome) * 100 : 0

  // Fetch cost allocations
  useEffect(() => {
    fetchCostAllocations()
  }, [transactions])

  const fetchCostAllocations = async () => {
    try {
      const { data, error } = await supabase
        .from("cost_allocations")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setCostAllocations(data || [])
    } catch (error) {
      console.error("Error fetching cost allocations:", error)
    }
  }

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("transactions")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setTransactions((prev) => [payload.new as Transaction, ...prev])
        } else if (payload.eventType === "UPDATE") {
          setTransactions((prev) => prev.map((t) => (t.id === payload.new.id ? (payload.new as Transaction) : t)))
        } else if (payload.eventType === "DELETE") {
          setTransactions((prev) => prev.filter((t) => t.id !== payload.old.id))
        }
      })
      .subscribe()

    // Subscribe to cost allocations changes
    const costChannel = supabase
      .channel("cost_allocations")
      .on("postgres_changes", { event: "*", schema: "public", table: "cost_allocations" }, () => {
        fetchCostAllocations()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(costChannel)
    }
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/auth/login"
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const navigation = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "transactions", label: "Transaksi", icon: Plus },
    { id: "invoices", label: "Invoice", icon: FileText },
    { id: "reports", label: "Laporan", icon: BarChart3 },
  ]

  const permissions = getPermissions(profile)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="gradient-bg text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Image src="/images/r2b-logo.png" alt="R2B Logo" width={40} height={40} className="rounded-lg" />
              <div>
                <h1 className="text-xl font-bold">R2B Dashboard Laporan Keuangan</h1>
                <p className="text-sm opacity-90">Selamat datang, {profile?.full_name || user.email}</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              {permissions.isAdmin && <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Admin</span>}
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-white hover:bg-white/20">
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="px-4 py-2 space-y-1">
            {permissions.isAdmin && (
              <div className="px-3 py-2 text-xs text-primary font-medium bg-primary/10 rounded-md mb-2">
                Administrator
              </div>
            )}
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 active:bg-gray-200"
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop Navigation */}
          <TabsList className="hidden md:grid w-full grid-cols-4 bg-white">
            {navigation.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
              <Card className="transform transition duration-300 hover:scale-105 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Pemasukan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
                </CardContent>
              </Card>

              <Card className="transform transition duration-300 hover:scale-105 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Pengeluaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</div>
                </CardContent>
              </Card>

              <Card className="transform transition duration-300 hover:scale-105 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Laba HPP (25%)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalAllocatedProfit)}</div>
                  <p className="text-xs text-gray-500 mt-1">Dari perhitungan HPP</p>
                </CardContent>
              </Card>

              <Card className="transform transition duration-300 hover:scale-105 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Laba Bersih</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold truncate ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(netProfit)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Setelah semua biaya</p>
                </CardContent>
              </Card>

              <Card className="transform transition duration-300 hover:scale-105 hover:shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Margin Rata-rata</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{avgProfitMargin.toFixed(1)}%</div>
                  <p className="text-xs text-gray-500 mt-1">Dari total pemasukan</p>
                </CardContent>
              </Card>
            </div>

            {/* HPP Cost Breakdown Summary */}
            {costAllocations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Ringkasan Alokasi Biaya HPP</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {Object.entries(
                      costAllocations.reduce(
                        (acc, ca) => {
                          if (!acc[ca.allocation_type]) {
                            acc[ca.allocation_type] = 0
                          }
                          acc[ca.allocation_type] += Number(ca.amount)
                          return acc
                        },
                        {} as Record<string, number>,
                      ),
                    ).map(([type, amount]) => (
                      <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 capitalize">
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
                        <p className="font-semibold text-sm">{formatCurrency(amount)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Financial Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Grafik Keuangan</CardTitle>
              </CardHeader>
              <CardContent>
                <FinancialChart transactions={transactions} />
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Transaksi Terbaru</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionList
                  transactions={transactions.slice(0, 5)}
                  onUpdate={setTransactions}
                  showActions={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AuthGuard
                requireEdit={true}
                fallback={
                  <Card>
                    <CardHeader>
                      <CardTitle>Tambah Transaksi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        Hanya administrator yang dapat menambah transaksi
                      </div>
                    </CardContent>
                  </Card>
                }
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Tambah Transaksi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TransactionForm
                      onSuccess={(newTransaction) => {
                        setTransactions((prev) => [newTransaction, ...prev])
                      }}
                    />
                  </CardContent>
                </Card>
              </AuthGuard>

              <Card>
                <CardHeader>
                  <CardTitle>Daftar Transaksi</CardTitle>
                </CardHeader>
                <CardContent>
                  <TransactionList
                    transactions={transactions}
                    onUpdate={setTransactions}
                    showActions={permissions.canEdit}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <Card>
              <CardContent>
                <InvoiceManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Laporan Keuangan Lengkap</CardTitle>
              </CardHeader>
              <CardContent>
                <AdvancedReports />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
