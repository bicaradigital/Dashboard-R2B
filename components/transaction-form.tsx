"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

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

interface TransactionFormProps {
  onSuccess: (transaction: Transaction) => void
}

export default function TransactionForm({ onSuccess }: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "income" as "income" | "expense",
    category: "",
    amount: "",
    memo: "",
  })
  const { toast } = useToast()
  const supabase = createClient()

  const createCostAllocations = async (transactionId: string, amount: number) => {
    const allocations = [
      { type: "electricity", percentage: 1.77 },
      { type: "gas", percentage: 1.26 },
      { type: "water", percentage: 4.04 },
      { type: "rent", percentage: 2.93 },
      { type: "operational", percentage: 9.62 },
      { type: "operational_reserve", percentage: 3.21 },
      { type: "labor", percentage: 31.58 },
      { type: "tax", percentage: 0.38 },
      { type: "profit", percentage: 19.21 },
    ]

    const allocationData = allocations.map((allocation) => ({
      transaction_id: transactionId,
      allocation_type: allocation.type,
      amount: Math.round(amount * (allocation.percentage / 100)),
      percentage: allocation.percentage,
    }))

    const { error } = await supabase.from("cost_allocations").insert(allocationData)

    if (error) {
      console.error("Error creating cost allocations:", error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLoading) return

    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data: existingTransaction } = await supabase
        .from("transactions")
        .select("id")
        .eq("user_id", user.id)
        .eq("date", formData.date)
        .eq("category", formData.category)
        .eq("amount", Number.parseFloat(formData.amount))
        .eq("type", formData.type)
        .eq("memo", formData.memo || "")
        .maybeSingle()

      if (existingTransaction) {
        toast({
          title: "Peringatan",
          description: "Transaksi dengan data yang sama sudah ada pada tanggal ini",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("transactions")
        .insert({
          date: formData.date,
          type: formData.type,
          category: formData.category,
          amount: Number.parseFloat(formData.amount),
          memo: formData.memo || null,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      if (data.type === "income" && data.category.toLowerCase().includes("retort")) {
        try {
          const { data: existingAllocations } = await supabase
            .from("cost_allocations")
            .select("id")
            .eq("transaction_id", data.id)
            .limit(1)

          if (!existingAllocations || existingAllocations.length === 0) {
            await createCostAllocations(data.id, data.amount)
            toast({
              title: "Berhasil",
              description: "Transaksi berhasil disimpan dengan rincian HPP otomatis",
            })
          } else {
            toast({
              title: "Berhasil",
              description: "Transaksi berhasil disimpan",
            })
          }
        } catch (allocationError) {
          console.error("Cost allocation error:", allocationError)
          toast({
            title: "Peringatan",
            description: "Transaksi tersimpan, namun gagal membuat rincian HPP otomatis",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Berhasil",
          description: "Transaksi berhasil disimpan",
        })
      }

      onSuccess(data)
      setFormData({
        date: new Date().toISOString().split("T")[0],
        type: "income",
        category: "",
        amount: "",
        memo: "",
      })
    } catch (error) {
      console.error("Error saving transaction:", error)
      toast({
        title: "Error",
        description: "Gagal menyimpan transaksi",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Tanggal</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Tipe</Label>
          <Select
            value={formData.type}
            onValueChange={(value: "income" | "expense") => setFormData((prev) => ({ ...prev, type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Pemasukan</SelectItem>
              <SelectItem value="expense">Pengeluaran</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="category">Kategori</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
          placeholder="Contoh: Retort, Operasional, Penjualan"
          required
        />
        {formData.type === "income" && (
          <p className="text-xs text-gray-500 mt-1">
            💡 Tip: Gunakan kata "retort" dalam kategori untuk mengaktifkan rincian HPP otomatis
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="amount">Jumlah (Rp)</Label>
        <Input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
          placeholder="0"
          required
        />
      </div>

      <div>
        <Label htmlFor="memo">Catatan (Opsional)</Label>
        <Textarea
          id="memo"
          value={formData.memo}
          onChange={(e) => setFormData((prev) => ({ ...prev, memo: e.target.value }))}
          placeholder="Contoh: 12x15 cm, 75 pcs - untuk detail kemasan retort"
          rows={3}
        />
        {formData.type === "income" && formData.category.toLowerCase().includes("retort") && (
          <p className="text-xs text-amber-600 mt-1">
            💡 Untuk rincian yang lebih detail, tambahkan info kemasan: ukuran (12x15 cm) dan jumlah (75 pcs)
          </p>
        )}
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary" disabled={isLoading}>
        {isLoading ? "Menyimpan..." : "Simpan Transaksi"}
      </Button>
    </form>
  )
}
