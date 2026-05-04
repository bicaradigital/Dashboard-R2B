"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Edit, Trash2, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import CostBreakdownViewer from "@/components/cost-breakdown-viewer"

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

interface TransactionListProps {
  transactions: Transaction[]
  onUpdate: (transactions: Transaction[]) => void
  showActions?: boolean
  showExport?: boolean
}

export default function TransactionList({
  transactions,
  onUpdate,
  showActions = true,
  showExport = false,
}: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleEdit = async (updatedData: Partial<Transaction>) => {
    if (!editingTransaction) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("transactions")
        .update({
          date: updatedData.date,
          type: updatedData.type,
          category: updatedData.category,
          amount: updatedData.amount,
          memo: updatedData.memo,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingTransaction.id)
        .select()

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error("Transaksi tidak ditemukan atau tidak dapat diperbarui")
      }

      const updatedTransaction = data[0]
      onUpdate(transactions.map((t) => (t.id === editingTransaction.id ? updatedTransaction : t)))
      setEditingTransaction(null)

      toast({
        title: "Berhasil",
        description: "Transaksi berhasil diperbarui",
      })
    } catch (error) {
      console.error("Error updating transaction:", error)
      toast({
        title: "Error",
        description: "Gagal memperbarui transaksi",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus transaksi ini? Data akan terhapus permanen dari database.")) return

    setIsLoading(true)
    try {
      const { error: allocationsError } = await supabase.from("cost_allocations").delete().eq("transaction_id", id)

      if (allocationsError) {
        console.error("Error deleting cost allocations:", allocationsError)
      }

      const { error } = await supabase.from("transactions").delete().eq("id", id)

      if (error) throw error

      onUpdate(transactions.filter((t) => t.id !== id))

      toast({
        title: "Berhasil",
        description: "Transaksi dan semua data terkait berhasil dihapus dari database",
      })
    } catch (error) {
      console.error("Error deleting transaction:", error)
      toast({
        title: "Error",
        description: "Gagal menghapus transaksi dari database",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = [
      "Tanggal",
      "Tipe Transaksi",
      "Kategori",
      "Jumlah (IDR)",
      "Catatan",
      "Dibuat Pada",
      "Diperbarui Pada",
    ]

    const csvContent = [
      `"${headers.join('","')}"`,
      ...transactions.map((t) => {
        const row = [
          new Date(t.date).toLocaleDateString("id-ID"),
          t.type === "income" ? "Pemasukan" : "Pengeluaran",
          t.category,
          t.amount.toLocaleString("id-ID"),
          (t.memo || "").replace(/"/g, '""'), // Escape quotes
          new Date(t.created_at).toLocaleString("id-ID"),
          new Date(t.updated_at).toLocaleString("id-ID"),
        ]
        return `"${row.join('","')}"`
      }),
    ].join("\n")

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `R2B-Laporan-Transaksi-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Berhasil",
      description: "File CSV berhasil diunduh",
    })
  }

  const exportToExcel = () => {
    const headers = [
      "Tanggal",
      "Tipe Transaksi",
      "Kategori",
      "Jumlah (IDR)",
      "Catatan",
      "Dibuat Pada",
      "Diperbarui Pada",
    ]

    let excelContent = `<table border="1">
      <thead>
        <tr style="background-color: #f0f0f0; font-weight: bold;">
          ${headers.map((h) => `<th style="padding: 8px; text-align: center;">${h}</th>`).join("")}
        </tr>
      </thead>
      <tbody>`

    transactions.forEach((t) => {
      const typeColor = t.type === "income" ? "#d4edda" : "#f8d7da"
      excelContent += `
        <tr style="background-color: ${typeColor};">
          <td style="padding: 6px;">${new Date(t.date).toLocaleDateString("id-ID")}</td>
          <td style="padding: 6px; text-align: center;">${t.type === "income" ? "Pemasukan" : "Pengeluaran"}</td>
          <td style="padding: 6px;">${t.category}</td>
          <td style="padding: 6px; text-align: right;">Rp ${t.amount.toLocaleString("id-ID")}</td>
          <td style="padding: 6px;">${t.memo || ""}</td>
          <td style="padding: 6px; text-align: center;">${new Date(t.created_at).toLocaleString("id-ID")}</td>
          <td style="padding: 6px; text-align: center;">${new Date(t.updated_at).toLocaleString("id-ID")}</td>
        </tr>`
    })

    excelContent += `</tbody></table>`

    const blob = new Blob([excelContent], { type: "application/vnd.ms-excel" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `R2B-Laporan-Transaksi-${new Date().toISOString().split("T")[0]}.xls`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Berhasil",
      description: "File Excel berhasil diunduh",
    })
  }

  return (
    <div className="space-y-4">
      {showExport && (
        <div className="flex justify-end gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={exportToExcel} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border rounded-lg">Belum ada transaksi</div>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="border rounded-lg">
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{transaction.category}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(transaction.date).toLocaleDateString("id-ID")}
                        </p>
                        {transaction.memo && <p className="text-sm text-gray-500 mt-1">{transaction.memo}</p>}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.type === "income" ? "Pemasukan" : "Pengeluaran"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <p
                      className={`font-bold text-lg ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatCurrency(transaction.amount)}
                    </p>

                    <div className="flex gap-2">
                      {transaction.type === "income" && transaction.category.toLowerCase().includes("retort") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setExpandedTransaction(expandedTransaction === transaction.id ? null : transaction.id)
                          }
                          className="bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                        >
                          {expandedTransaction === transaction.id ? "Tutup Rincian" : "Lihat Rincian HPP"}
                        </Button>
                      )}

                      {showActions && (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setEditingTransaction(transaction)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Transaksi</DialogTitle>
                                <DialogDescription>Ubah data transaksi di bawah ini</DialogDescription>
                              </DialogHeader>
                              {editingTransaction && (
                                <EditTransactionForm
                                  transaction={editingTransaction}
                                  onSave={handleEdit}
                                  onCancel={() => setEditingTransaction(null)}
                                  isLoading={isLoading}
                                />
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(transaction.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {expandedTransaction === transaction.id && (
                <div className="border-t px-4 pb-4">
                  <CostBreakdownViewer transaction={transaction} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function EditTransactionForm({
  transaction,
  onSave,
  onCancel,
  isLoading,
}: {
  transaction: Transaction
  onSave: (data: Partial<Transaction>) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState({
    date: transaction.date,
    type: transaction.type,
    category: transaction.category,
    amount: transaction.amount.toString(),
    memo: transaction.memo || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      amount: Number.parseFloat(formData.amount),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-date">Tanggal</Label>
          <Input
            id="edit-date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="edit-type">Tipe</Label>
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
        <Label htmlFor="edit-category">Kategori</Label>
        <Input
          id="edit-category"
          value={formData.category}
          onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="edit-amount">Jumlah (Rp)</Label>
        <Input
          id="edit-amount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="edit-memo">Catatan</Label>
        <Textarea
          id="edit-memo"
          value={formData.memo}
          onChange={(e) => setFormData((prev) => ({ ...prev, memo: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary">
          {isLoading ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </form>
  )
}
