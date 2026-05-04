"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PackagingType {
  id: string
  name: string
  size: string
  unit_price: number
}

interface HPPCalculation {
  id: string
  packaging_type_id: string
  quantity: number
  packaging_cost: number
  electricity_cost: number
  gas_cost: number
  water_cost: number
  rent_cost: number
  total_production_cost: number
  operational_cost: number
  reserve_cost: number
  labor_cost: number
  tax_amount: number
  total_after_tax: number
  profit_amount: number
  total_selling_price: number
  price_per_unit: number
  actual_margin: number
  calculation_date: string
  packaging_type?: PackagingType
}

export default function HPPCalculator() {
  const [packagingTypes, setPackagingTypes] = useState<PackagingType[]>([])
  const [calculations, setCalculations] = useState<HPPCalculation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const [calculationForm, setCalculationForm] = useState({
    packaging_type_id: "",
    quantity: 1,
  })

  useEffect(() => {
    fetchPackagingTypes()
    fetchCalculations()
  }, [])

  const fetchPackagingTypes = async () => {
    try {
      const { data, error } = await supabase.from("packaging_types").select("*").order("name, size")
      if (error) throw error
      setPackagingTypes(data || [])
    } catch (error) {
      console.error("Error fetching packaging types:", error)
    }
  }

  const fetchCalculations = async () => {
    try {
      const { data, error } = await supabase
        .from("hpp_calculations")
        .select(`
          *,
          packaging_type:packaging_types(*)
        `)
        .order("calculation_date", { ascending: false })
        .limit(10)

      if (error) throw error
      setCalculations(data || [])
    } catch (error) {
      console.error("Error fetching calculations:", error)
    }
  }

  const calculateHPP = async () => {
    if (!calculationForm.packaging_type_id || calculationForm.quantity <= 0) {
      toast({
        title: "Error",
        description: "Pilih jenis kemasan dan masukkan jumlah yang valid",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.rpc("calculate_hpp_for_retort_service", {
        p_packaging_type_id: calculationForm.packaging_type_id,
        p_quantity: calculationForm.quantity,
      })

      if (error) throw error

      await fetchCalculations()
      setCalculationForm({ packaging_type_id: "", quantity: 1 })

      toast({
        title: "Berhasil",
        description: "Perhitungan HPP berhasil dibuat",
      })
    } catch (error) {
      console.error("Error calculating HPP:", error)
      toast({
        title: "Error",
        description: "Gagal menghitung HPP",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateHPPReport = (calculation: HPPCalculation) => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
    }

    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Laporan HPP Jasa Retort</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 2rem; color: #333; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 2rem; }
          .header h1 { color: #d4af37; margin-bottom: 0.5rem; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
          .info-item { padding: 0.5rem; background-color: #f8f9fa; border-radius: 5px; }
          .info-item strong { color: #333; }
          .calculation-section { margin: 1.5rem 0; }
          .calculation-section h3 { color: #d4af37; border-bottom: 2px solid #d4af37; padding-bottom: 0.5rem; }
          .cost-item { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
          .total-item { display: flex; justify-content: space-between; padding: 0.75rem 0; font-weight: bold; background-color: #f8f9fa; margin: 0.5rem 0; padding-left: 1rem; padding-right: 1rem; border-radius: 5px; }
          .final-result { background-color: #d4af37; color: white; padding: 1rem; border-radius: 5px; text-align: center; margin-top: 2rem; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Laporan HPP Jasa Retort</h1>
          <p>Tanggal Input: ${new Date(calculation.calculation_date).toLocaleDateString("id-ID")} ${new Date(calculation.calculation_date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</p>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <strong>Jenis Kemasan:</strong> ${calculation.packaging_type?.name || "N/A"}
          </div>
          <div class="info-item">
            <strong>Ukuran Kemasan:</strong> ${calculation.packaging_type?.size || "N/A"}
          </div>
          <div class="info-item">
            <strong>Harga Kemasan per pcs:</strong> ${formatCurrency(calculation.packaging_type?.unit_price || 0)}
          </div>
          <div class="info-item">
            <strong>Jumlah Produk Diproses:</strong> ${calculation.quantity} pcs
          </div>
        </div>

        <div class="calculation-section">
          <h3>Rincian Biaya Produksi</h3>
          <div class="cost-item">
            <span>Biaya Kemasan (${calculation.quantity} x ${formatCurrency(calculation.packaging_type?.unit_price || 0)})</span>
            <span>${formatCurrency(calculation.packaging_cost)}</span>
          </div>
          <div class="cost-item">
            <span>Biaya Listrik</span>
            <span>${formatCurrency(calculation.electricity_cost)}</span>
          </div>
          <div class="cost-item">
            <span>Biaya Gas</span>
            <span>${formatCurrency(calculation.gas_cost)}</span>
          </div>
          <div class="cost-item">
            <span>Biaya Air</span>
            <span>${formatCurrency(calculation.water_cost)}</span>
          </div>
          <div class="cost-item">
            <span>Biaya Sewa</span>
            <span>${formatCurrency(calculation.rent_cost)}</span>
          </div>
          <div class="total-item">
            <span>Total Biaya Produksi</span>
            <span>${formatCurrency(calculation.total_production_cost)}</span>
          </div>
        </div>

        <div class="calculation-section">
          <h3>Biaya Tambahan</h3>
          <div class="cost-item">
            <span>Biaya Operasional</span>
            <span>${formatCurrency(calculation.operational_cost)}</span>
          </div>
          <div class="cost-item">
            <span>Cadangan Operasional</span>
            <span>${formatCurrency(calculation.reserve_cost)}</span>
          </div>
          <div class="cost-item">
            <span>Biaya Tenaga Kerja</span>
            <span>${formatCurrency(calculation.labor_cost)}</span>
          </div>
          <div class="cost-item">
            <span>Pajak (${((calculation.tax_amount / calculation.total_after_tax) * 100).toFixed(1)}%)</span>
            <span>${formatCurrency(calculation.tax_amount)}</span>
          </div>
          <div class="total-item">
            <span>Total Setelah Pajak</span>
            <span>${formatCurrency(calculation.total_after_tax)}</span>
          </div>
        </div>

        <div class="calculation-section">
          <h3>Perhitungan Laba</h3>
          <div class="cost-item">
            <span>Laba Perusahaan (${calculation.actual_margin.toFixed(2)}%)</span>
            <span>${formatCurrency(calculation.profit_amount)}</span>
          </div>
          <div class="total-item">
            <span>Harga Jual Total</span>
            <span>${formatCurrency(calculation.total_selling_price)}</span>
          </div>
        </div>

        <div class="final-result">
          <h2>Harga Jual per pcs: ${formatCurrency(calculation.price_per_unit)}</h2>
          <p>Margin Aktual: ${calculation.actual_margin.toFixed(2)}%</p>
        </div>
      </body>
      </html>
    `

    const newWindow = window.open("", "_blank")
    if (newWindow) {
      newWindow.document.write(reportHtml)
      newWindow.document.close()
      newWindow.focus()
      setTimeout(() => {
        newWindow.print()
      }, 500)
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Kalkulator HPP Jasa Retort</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator Form */}
        <Card>
          <CardHeader>
            <CardTitle>Hitung HPP Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="packaging_type">Jenis & Ukuran Kemasan</Label>
                <Select
                  value={calculationForm.packaging_type_id}
                  onValueChange={(value) => setCalculationForm((prev) => ({ ...prev, packaging_type_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis kemasan" />
                  </SelectTrigger>
                  <SelectContent>
                    {packagingTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} - {type.size} ({formatCurrency(type.unit_price)}/pcs)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity">Jumlah Produk (pcs)</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={calculationForm.quantity}
                  onChange={(e) =>
                    setCalculationForm((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 1 }))
                  }
                />
              </div>

              <Button
                onClick={calculateHPP}
                disabled={isLoading || !calculationForm.packaging_type_id}
                className="w-full bg-primary hover:bg-primary"
              >
                <Calculator className="h-4 w-4 mr-2" />
                {isLoading ? "Menghitung..." : "Hitung HPP"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Calculations */}
        <Card>
          <CardHeader>
            <CardTitle>Perhitungan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {calculations.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Belum ada perhitungan HPP</p>
              ) : (
                calculations.map((calc) => (
                  <div key={calc.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">
                          {calc.packaging_type?.name} - {calc.packaging_type?.size}
                        </p>
                        <p className="text-sm text-gray-600">{calc.quantity} pcs</p>
                        <p className="text-sm text-gray-500">
                          {new Date(calc.calculation_date).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{formatCurrency(calc.price_per_unit)}/pcs</p>
                        <p className="text-sm text-gray-600">Total: {formatCurrency(calc.total_selling_price)}</p>
                        <p className="text-sm text-green-600">Margin: {calc.actual_margin.toFixed(1)}%</p>
                      </div>
                    </div>
                    <Button onClick={() => generateHPPReport(calc)} size="sm" variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Cetak Laporan
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
