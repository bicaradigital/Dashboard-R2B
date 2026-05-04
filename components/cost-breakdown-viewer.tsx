"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CostAllocation {
  id: string
  transaction_id: string
  allocation_type: string
  amount: number
  percentage: number
  created_at: string
}

interface Transaction {
  id: string
  date: string
  type: "income" | "expense"
  category: string
  amount: number
  memo?: string
}

interface CostBreakdownViewerProps {
  transaction: Transaction
}

export default function CostBreakdownViewer({ transaction }: CostBreakdownViewerProps) {
  const [allocations, setAllocations] = useState<CostAllocation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [packagingDetails, setPackagingDetails] = useState<{
    packaging_type: string
    packaging_size: string
    quantity: number
    price_per_unit: number
  } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (transaction.type === "income" && transaction.category.toLowerCase().includes("retort")) {
      fetchCostAllocations()
      extractPackagingDetails()
    }
  }, [transaction.id])

  const extractPackagingDetails = () => {
    if (transaction.memo) {
      // Try to parse packaging details from memo
      const memoLower = transaction.memo.toLowerCase()
      const packagingType = "Bag Retort"
      let packagingSize = ""
      let quantity = 0

      // Extract packaging size (e.g., "12x15", "13x21", "16x23")
      const sizeMatch = transaction.memo.match(/(\d+x\d+)/i)
      if (sizeMatch) {
        packagingSize = sizeMatch[1] + " cm"
      }

      // Extract quantity
      const quantityMatch = transaction.memo.match(/(\d+)\s*(pcs|buah|unit)/i)
      if (quantityMatch) {
        quantity = Number.parseInt(quantityMatch[1])
      }

      // Calculate price per unit
      const pricePerUnit = quantity > 0 ? transaction.amount / quantity : 0

      setPackagingDetails({
        packaging_type: packagingType,
        packaging_size: packagingSize,
        quantity: quantity,
        price_per_unit: pricePerUnit,
      })
    }
  }

  const fetchCostAllocations = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("cost_allocations")
        .select("*")
        .eq("transaction_id", transaction.id)
        .order("allocation_type")

      if (error) throw error

      const uniqueAllocations =
        data?.reduce((acc: CostAllocation[], current) => {
          const existingIndex = acc.findIndex((item) => item.allocation_type === current.allocation_type)
          if (existingIndex === -1) {
            acc.push(current)
          } else {
            if (current.amount > acc[existingIndex].amount) {
              acc[existingIndex] = current
            }
          }
          return acc
        }, []) || []

      uniqueAllocations.sort((a, b) => b.amount - a.amount)

      setAllocations(uniqueAllocations)
    } catch (error) {
      console.error("Error fetching cost allocations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getCostTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      electricity: "Biaya Listrik",
      gas: "Biaya Gas",
      water: "Biaya Air",
      rent: "Biaya Sewa",
      operational: "Biaya Operasional",
      operational_reserve: "Cadangan Operasional",
      labor: "Biaya Tenaga Kerja",
      tax: "Pajak",
      profit: "Laba Perusahaan",
    }
    return labels[type] || type
  }

  const getCostTypeDescription = (type: string) => {
    const descriptions: { [key: string]: string } = {
      electricity: "Konsumsi listrik untuk proses sterilisasi retort",
      gas: "Penggunaan gas untuk pemanasan dalam proses retort",
      water: "Konsumsi air untuk proses sterilisasi dan pendinginan",
      rent: "Alokasi biaya sewa tempat dan peralatan retort",
      operational: "Biaya operasional harian (30% dari total biaya produksi)",
      operational_reserve: "Cadangan untuk biaya operasional tak terduga (10% dari total biaya produksi)",
      labor: "Upah tenaga kerja untuk proses retort",
      tax: "Pajak usaha (0.5% dari total setelah biaya)",
      profit: "Laba bersih perusahaan (25% margin)",
    }
    return descriptions[type] || ""
  }

  const COLORS = ["#059669", "#dc2626", "#7c3aed", "#f59e0b", "#06b6d4", "#8b5cf6", "#10b981", "#f97316", "#3b82f6"]

  const pieData = allocations.map((allocation, index) => ({
    name: getCostTypeLabel(allocation.allocation_type),
    value: allocation.amount,
    percentage: allocation.percentage,
    color: COLORS[index % COLORS.length],
  }))

  if (transaction.type !== "income" || !transaction.category.toLowerCase().includes("retort")) {
    return null
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Rincian Otomatis HPP Jasa Retort</CardTitle>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            Tanggal Input: {new Date(transaction.date).toLocaleDateString("id-ID")}{" "}
            {new Date(transaction.created_at || transaction.date).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {packagingDetails && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p>
                <strong>Jenis Kemasan:</strong> {packagingDetails.packaging_type}
              </p>
              {packagingDetails.packaging_size && (
                <p>
                  <strong>Ukuran Kemasan:</strong> {packagingDetails.packaging_size}
                </p>
              )}
              {packagingDetails.quantity > 0 && (
                <>
                  <p>
                    <strong>Jumlah Produk Diproses:</strong> {packagingDetails.quantity} pcs
                  </p>
                  <p>
                    <strong>Harga Jual per pcs:</strong> {formatCurrency(packagingDetails.price_per_unit)}
                  </p>
                </>
              )}
              <p>
                <strong>Harga Jual Total:</strong> {formatCurrency(transaction.amount)}
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center py-4">Memuat rincian biaya...</p>
        ) : allocations.length === 0 ? (
          <p className="text-center py-4 text-gray-500">Belum ada rincian biaya</p>
        ) : (
          <div className="space-y-3">
            <h4 className="font-medium">Rincian Komponen Biaya HPP:</h4>
            {allocations.map((allocation, index) => (
              <div
                key={allocation.id}
                className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-l-4"
                style={{ borderLeftColor: COLORS[index % COLORS.length] }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{getCostTypeLabel(allocation.allocation_type)}</p>
                    <p className="text-xs text-gray-600 mt-1">{getCostTypeDescription(allocation.allocation_type)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {allocation.percentage.toFixed(2)}%
                      </Badge>
                      {packagingDetails && packagingDetails.quantity > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {formatCurrency(allocation.amount / packagingDetails.quantity)}/pcs
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg" style={{ color: COLORS[index % COLORS.length] }}>
                      {formatCurrency(allocation.amount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-6 p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <h5 className="font-semibold text-green-800 mb-2">Ringkasan Perhitungan:</h5>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Biaya Produksi:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      allocations
                        .filter((a) => ["electricity", "gas", "water", "rent"].includes(a.allocation_type))
                        .reduce((sum, a) => sum + a.amount, 0),
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Setelah Pajak:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      allocations.filter((a) => a.allocation_type !== "profit").reduce((sum, a) => sum + a.amount, 0),
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="font-semibold">Margin Aktual:</span>
                  <span className="font-bold text-green-600">25.00%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
