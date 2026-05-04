"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, FileText, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Invoice {
  id: string
  invoice_number: string
  customer_name: string
  customer_phone?: string
  customer_address?: string
  customer_email?: string
  invoice_date: string
  subtotal: number
  total: number
  status: string
  created_at: string
}

interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  price: number
  total: number
}

export default function InvoiceManager() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const [invoiceForm, setInvoiceForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    customer_email: "",
    invoice_date: new Date().toISOString().split("T")[0],
  })

  const [itemForm, setItemForm] = useState({
    description: "",
    quantity: 1,
    price: 0,
  })

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase.from("invoices").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setInvoices(data || [])
    } catch (error) {
      console.error("Error fetching invoices:", error)
      toast({
        title: "Error",
        description: "Gagal memuat invoice",
        variant: "destructive",
      })
    }
  }

  const fetchInvoiceItems = async (invoiceId: string) => {
    try {
      const { data, error } = await supabase.from("invoice_items").select("*").eq("invoice_id", invoiceId)

      if (error) throw error
      setInvoiceItems(data || [])
    } catch (error) {
      console.error("Error fetching invoice items:", error)
      toast({
        title: "Error",
        description: "Gagal memuat item invoice",
        variant: "destructive",
      })
    }
  }

  const generateInvoiceNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const time = String(now.getHours()).padStart(2, "0") + String(now.getMinutes()).padStart(2, "0")
    return `INV-${year}${month}${day}-${time}`
  }

  const createInvoice = async () => {
    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data, error } = await supabase
        .from("invoices")
        .insert({
          invoice_number: generateInvoiceNumber(),
          customer_name: invoiceForm.customer_name,
          customer_phone: invoiceForm.customer_phone,
          customer_address: invoiceForm.customer_address,
          customer_email: invoiceForm.customer_email,
          invoice_date: invoiceForm.invoice_date,
          subtotal: 0,
          total: 0,
          status: "draft",
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      setInvoices((prev) => [data, ...prev])
      setSelectedInvoice(data)
      setInvoiceItems([])
      setInvoiceForm({
        customer_name: "",
        customer_phone: "",
        customer_address: "",
        customer_email: "",
        invoice_date: new Date().toISOString().split("T")[0],
      })
      setIsCreateModalOpen(false)

      toast({
        title: "Berhasil",
        description: "Invoice berhasil dibuat",
      })
    } catch (error) {
      console.error("Error creating invoice:", error)
      toast({
        title: "Error",
        description: "Gagal membuat invoice",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const editInvoice = async (updatedData: Partial<Invoice>) => {
    if (!editingInvoice) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("invoices")
        .update({
          customer_name: updatedData.customer_name,
          customer_phone: updatedData.customer_phone,
          customer_address: updatedData.customer_address,
          customer_email: updatedData.customer_email,
          invoice_date: updatedData.invoice_date,
        })
        .eq("id", editingInvoice.id)
        .select()
        .single()

      if (error) throw error

      setInvoices((prev) => prev.map((inv) => (inv.id === editingInvoice.id ? data : inv)))
      if (selectedInvoice?.id === editingInvoice.id) {
        setSelectedInvoice(data)
      }
      setEditingInvoice(null)
      setIsEditModalOpen(false)

      toast({
        title: "Berhasil",
        description: "Invoice berhasil diperbarui",
      })
    } catch (error) {
      console.error("Error updating invoice:", error)
      toast({
        title: "Error",
        description: "Gagal memperbarui invoice",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteInvoice = async (invoiceId: string) => {
    if (!confirm("Yakin ingin menghapus invoice ini? Semua item invoice juga akan terhapus permanen dari database."))
      return

    setIsLoading(true)
    try {
      const { error: itemsError } = await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId)

      if (itemsError) {
        console.error("Error deleting invoice items:", itemsError)
      }

      const { error } = await supabase.from("invoices").delete().eq("id", invoiceId)

      if (error) throw error

      setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceId))
      if (selectedInvoice?.id === invoiceId) {
        setSelectedInvoice(null)
        setInvoiceItems([])
      }

      toast({
        title: "Berhasil",
        description: "Invoice dan semua item terkait berhasil dihapus dari database",
      })
    } catch (error) {
      console.error("Error deleting invoice:", error)
      toast({
        title: "Error",
        description: "Gagal menghapus invoice dari database",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteInvoiceItem = async (itemId: string) => {
    if (!selectedInvoice || !confirm("Yakin ingin menghapus item ini? Data akan terhapus permanen dari database."))
      return

    setIsLoading(true)
    try {
      const { error } = await supabase.from("invoice_items").delete().eq("id", itemId)

      if (error) throw error

      const updatedItems = invoiceItems.filter((item) => item.id !== itemId)
      const newSubtotal = updatedItems.reduce((sum, item) => sum + item.total, 0)

      const { error: updateError } = await supabase
        .from("invoices")
        .update({
          subtotal: newSubtotal,
          total: newSubtotal,
        })
        .eq("id", selectedInvoice.id)

      if (updateError) throw updateError

      setInvoiceItems(updatedItems)
      setSelectedInvoice((prev) => (prev ? { ...prev, subtotal: newSubtotal, total: newSubtotal } : null))

      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === selectedInvoice.id ? { ...inv, subtotal: newSubtotal, total: newSubtotal } : inv,
        ),
      )

      toast({
        title: "Berhasil",
        description: "Item berhasil dihapus dari database",
      })
    } catch (error) {
      console.error("Error deleting invoice item:", error)
      toast({
        title: "Error",
        description: "Gagal menghapus item dari database",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addInvoiceItem = async () => {
    if (!selectedInvoice) return

    setIsLoading(true)
    try {
      const lineTotal = itemForm.quantity * itemForm.price

      const { data, error } = await supabase
        .from("invoice_items")
        .insert({
          invoice_id: selectedInvoice.id,
          description: itemForm.description,
          quantity: itemForm.quantity,
          price: itemForm.price,
          total: lineTotal,
        })
        .select()
        .single()

      if (error) throw error

      const newItems = [...invoiceItems, data]
      const newSubtotal = newItems.reduce((sum, item) => sum + item.total, 0)

      const { error: updateError } = await supabase
        .from("invoices")
        .update({
          subtotal: newSubtotal,
          total: newSubtotal,
        })
        .eq("id", selectedInvoice.id)

      if (updateError) throw updateError

      setInvoiceItems(newItems)
      setSelectedInvoice((prev) => (prev ? { ...prev, subtotal: newSubtotal, total: newSubtotal } : null))
      setItemForm({
        description: "",
        quantity: 1,
        price: 0,
      })

      toast({
        title: "Berhasil",
        description: "Item berhasil ditambahkan",
      })
    } catch (error) {
      console.error("Error adding invoice item:", error)
      toast({
        title: "Error",
        description: "Gagal menambahkan item",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generatePDF = () => {
    if (!selectedInvoice) return

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
    }

    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${selectedInvoice.invoice_number}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * { box-sizing: border-box; }
          
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
            margin: 0; 
            padding: 2rem; 
            color: #1e293b; 
            line-height: 1.2; 
            background: #ffffff;
            position: relative;
          }
          
          /* Watermark */
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 5rem;
            font-weight: 100;
            color: rgba(59, 130, 246, 0.05);
            z-index: -1;
            pointer-events: none;
            user-select: none;
          }
          
          .invoice-container {
            max-width: 700px;
            margin: 0 auto;
            background: white;
            border-radius: 17px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            overflow: hidden;
            position: relative;
          }
          
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #fbbf24 100%);
            color: white;
            padding: 2rem;
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: -40%;
            right: -40%;
            width: 250%;
            height: 250%;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
            animation: float 20s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            position: relative;
            z-index: 2;
          }
          
          .company-info {
            flex: 1;
          }
          
          .company-info h1 {
            font-size: 1rem;
            font-weight: 700;
            margin: 0 0 1rem 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            letter-spacing: -0.025em;
          }
          
          .company-info .contact-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.85rem;
            margin-top: 1rem;
          }
          
          .company-info p {
            margin: 0;
            font-size: 0.75rem;
            font-weight: 500;
            opacity: 0.95;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .company-info .icon {
            width: 14px;
            height: 14px;
            opacity: 0.8;
          }
          
          .invoice-info {
            text-align: right;
            min-width: 200px;
            background: rgba(255, 255, 255, 0.15);
            padding: 1rem;
            border-radius: 12px;
            backdrop-filter: blur(7px);
          }
          
          .invoice-info h2 {
            font-size: 0.75rem;
            font-weight: 500;
            margin: 0 0 1rem 0;
            text-shadow: 0 2px 3px rgba(0,0,0,0.1);
            letter-spacing: -0.05em;
          }
          
          .invoice-info p {
            margin: 0.5rem 0;
            font-size: 0.75rem;
            font-weight: 500;
          }
          
          .invoice-info strong {
            font-weight: 600;
          }
          
          .content {
            padding: 2rem;
          }
          
          .customer-section {
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            border-radius: 12px;
            border-left: 4px solid #3b82f6;
          }
          
          .customer-section h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0 0 1rem 0;
            color: #1e293b;
          }
          
          .customer-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }
          
          .customer-info p {
            margin: 0.25rem 0;
            font-size: 0.95rem;
          }
          
          .customer-info strong {
            font-weight: 600;
            color: #1e293b;
            font-size: 1rem;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 2rem 0;
            border-radius: 11px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          
          .items-table th {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 90%);
            color: white;
            padding: 1.25rem 1rem;
            text-align: left;
            font-weight: 600;
            font-size: 0.95rem;
            letter-spacing: 0.025em;
            text-transform: uppercase;
          }
          
          .items-table td {
            padding: 1.25rem 1rem;
            border-bottom: 1px solid #e2e8f0;
            font-size: 0.95rem;
          }
          
          .items-table tbody tr:nth-child(even) {
            background-color: #f8fafc;
          }
          
          .items-table tbody tr:hover {
            background-color: #f1f5f9;
          }
          
          .text-right { text-align: right; }
          
          .total-section {
            display: flex;
            justify-content: flex-end;
            margin: 2rem 0;
          }
          
          .total-table {
            width: 350px;
            border-collapse: collapse;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          
          .total-table td {
            padding: 1rem 1.25rem;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .total-row {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: white;
            font-weight: 700;
            font-size: 1.1rem;
          }
          
          .total-row td {
            border: none;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
          }
          
          .footer {
            margin-top: 2rem;
            padding: 2.5rem;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-top: 3px solid #3b82f6;
          }
          
          .payment-info {
            text-align: center;
          }
          
          .payment-info h3 {
            font-size: 1rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .payment-details {
            background: white;
            padding: 2rem;
            border-radius: 10px;
            margin-bottom: 1.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border-left: 4px solid #fbbf24;
          }
          
          .payment-details p {
            margin: 0.75rem 0;
            font-size: 1rem;
          }
          
          .payment-details strong {
            font-weight: 600;
            color: #1e293b;
          }
          
          .highlight-text {
            font-weight: 600;
            color: #3b82f6;
            font-size: 1rem;
            margin: 1rem 0;
            padding: 1rem;
            background: rgba(59, 130, 246, 0.1);
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
          
          .thank-you {
            font-size: 0.75 rem;
            font-weight: 500;
            color: #64748b;
            margin-top: 1rem;
          }
          
          @media print {
            body { background: white; padding: 1rem; }
            .invoice-container { box-shadow: none; }
            .watermark { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="watermark">r2b-logo.png</div>
        
        <div class="invoice-container">
          <div class="header">
            <div class="header-content">
              <div class="company-info">
                <h1>R2B - RUMAH RETORT BERSAMA</h1>
                <div class="contact-grid">
                  <p>
                    <span class="icon">📱</span>
                    WA: 0821-3432-0434
                  </p>
                  <p>
                    <span class="icon">✉️</span>
                    rumahretorttbersama1@gmail.com
                  </p>
                  <p>
                    <span class="icon">🌐</span>
                    www.makanantahanlama.com
                  </p>
                </div>
              </div>
              <div class="invoice-info">
                <h2>INVOICE</h2>
                <p><strong>No:</strong> ${selectedInvoice.invoice_number}</p>
                <p><strong>Tanggal:</strong> ${new Date(selectedInvoice.invoice_date).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</p>
              </div>
            </div>
          </div>
          
          <div class="content">
            <div class="customer-section">
              <h3>Informasi Pelanggan</h3>
              <div class="customer-info">
                <div>
                  <p><strong>${selectedInvoice.customer_name}</strong></p>
                  ${selectedInvoice.customer_phone ? `<p>📞 ${selectedInvoice.customer_phone}</p>` : ""}
                  ${selectedInvoice.customer_email ? `<p>✉️ ${selectedInvoice.customer_email}</p>` : ""}
                </div>
                ${
                  selectedInvoice.customer_address
                    ? `
                <div>
                  <p>📍 <strong>Alamat:</strong></p>
                  <p>${selectedInvoice.customer_address}</p>
                </div>
                `
                    : ""
                }
              </div>
            </div>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th>Deskripsi Layanan</th>
                  <th style="width: 80px;">Qty</th>
                  <th style="width: 100px;">Harga Satuan</th>
                  <th style="width: 100px;" class="text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceItems
                  .map(
                    (item) => `
                  <tr>
                    <td><strong>${item.description}</strong></td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.price)}</td>
                    <td class="text-right"><strong>${formatCurrency(item.total)}</strong></td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
            
            <div class="total-section">
              <table class="total-table">
                <tr class="total-row">
                  <td><strong>TOTAL PEMBAYARAN</strong></td>
                  <td class="text-right"><strong>${formatCurrency(selectedInvoice.total)}</strong></td>
                </tr>
              </table>
            </div>
          </div>
          
          <div class="footer">
            <div class="payment-info">
              <h3>Informasi Pembayaran</h3>
              <div class="payment-details">
                <p><strong>Nama Penerima:</strong> Bagoes Tri Anggoro</p>
                <p><strong>Bank BCA:</strong> 836-049-6750</p>
                <div class="highlight-text">
                  Lakukan Konfirmasi Bila Sudah Melakukan Pembayaran ke Nomor WA yang Tertera Disertai Bukti Transfer
                </div>
              </div>
              <p class="thank-you">Terima kasih atas kepercayaan Anda kepada R2B - Rumah Retort Bersama</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const newWindow = window.open("", "_blank")
    if (newWindow) {
      newWindow.document.write(invoiceHtml)
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manajemen Invoice</h2>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary">
              <Plus className="h-4 w-4 mr-2" />
              Buat Invoice Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Buat Invoice Baru</DialogTitle>
              <DialogDescription>Isi informasi pelanggan dan invoice</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customer_name">Nama Pelanggan *</Label>
                <Input
                  id="customer_name"
                  value={invoiceForm.customer_name}
                  onChange={(e) => setInvoiceForm((prev) => ({ ...prev, customer_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="customer_phone">Nomor Telepon</Label>
                <Input
                  id="customer_phone"
                  value={invoiceForm.customer_phone}
                  onChange={(e) => setInvoiceForm((prev) => ({ ...prev, customer_phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="customer_address">Alamat</Label>
                <Input
                  id="customer_address"
                  value={invoiceForm.customer_address}
                  onChange={(e) => setInvoiceForm((prev) => ({ ...prev, customer_address: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="customer_email">Email</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={invoiceForm.customer_email}
                  onChange={(e) => setInvoiceForm((prev) => ({ ...prev, customer_email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="invoice_date">Tanggal Invoice</Label>
                <Input
                  id="invoice_date"
                  type="date"
                  value={invoiceForm.invoice_date}
                  onChange={(e) => setInvoiceForm((prev) => ({ ...prev, invoice_date: e.target.value }))}
                />
              </div>
              <Button
                onClick={createInvoice}
                disabled={isLoading || !invoiceForm.customer_name}
                className="w-full bg-primary hover:bg-primary"
              >
                {isLoading ? "Membuat..." : "Buat Invoice"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invoices.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Belum ada invoice</p>
              ) : (
                invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedInvoice?.id === invoice.id ? "bg-primary/10 border-primary" : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setSelectedInvoice(invoice)
                      fetchInvoiceItems(invoice.id)
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{invoice.invoice_number}</p>
                        <p className="text-sm text-gray-600">{invoice.customer_name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(invoice.invoice_date).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(invoice.total)}</p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            invoice.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : invoice.status === "sent"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {invoice.status === "paid" ? "Lunas" : invoice.status === "sent" ? "Terkirim" : "Draft"}
                        </span>
                        <div className="flex gap-1 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingInvoice(invoice)
                              setIsEditModalOpen(true)
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteInvoice(invoice.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedInvoice ? `Detail Invoice ${selectedInvoice.invoice_number}` : "Pilih Invoice"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedInvoice ? (
              <div className="space-y-4">
                {/* Invoice Info */}
                <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Pelanggan</p>
                    <p className="font-medium">{selectedInvoice.customer_name}</p>
                    {selectedInvoice.customer_phone && (
                      <p className="text-sm text-gray-600">Tel: {selectedInvoice.customer_phone}</p>
                    )}
                    {selectedInvoice.customer_address && (
                      <p className="text-sm text-gray-600">{selectedInvoice.customer_address}</p>
                    )}
                    {selectedInvoice.customer_email && (
                      <p className="text-sm text-gray-600">{selectedInvoice.customer_email}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tanggal</p>
                    <p className="font-medium">{new Date(selectedInvoice.invoice_date).toLocaleDateString("id-ID")}</p>
                  </div>
                </div>

                {/* Add Item Form */}
                <div className="space-y-3 p-4 border rounded-lg">
                  <h4 className="font-medium">Tambah Item</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Deskripsi"
                      value={itemForm.description}
                      onChange={(e) => setItemForm((prev) => ({ ...prev, description: e.target.value }))}
                    />
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={itemForm.quantity}
                      onChange={(e) =>
                        setItemForm((prev) => ({ ...prev, quantity: Number.parseInt(e.target.value) || 1 }))
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Harga"
                      value={itemForm.price}
                      onChange={(e) =>
                        setItemForm((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <Button
                    onClick={addInvoiceItem}
                    disabled={!itemForm.description || isLoading}
                    size="sm"
                    className="bg-primary hover:bg-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Item
                  </Button>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  <h4 className="font-medium">Item Invoice</h4>
                  {invoiceItems.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">Belum ada item</p>
                  ) : (
                    <div className="space-y-2">
                      {invoiceItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-gray-600">
                              {item.quantity} x {formatCurrency(item.price)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{formatCurrency(item.total)}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteInvoiceItem(item.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(selectedInvoice.total)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button onClick={generatePDF} className="flex-1 bg-primary hover:bg-primary">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate PDF
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500">Pilih invoice dari daftar untuk melihat detail</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Invoice Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>Ubah informasi pelanggan dan invoice</DialogDescription>
          </DialogHeader>
          {editingInvoice && (
            <EditInvoiceForm
              invoice={editingInvoice}
              onSave={editInvoice}
              onCancel={() => {
                setEditingInvoice(null)
                setIsEditModalOpen(false)
              }}
              isLoading={isLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EditInvoiceForm({
  invoice,
  onSave,
  onCancel,
  isLoading,
}: {
  invoice: Invoice
  onSave: (data: Partial<Invoice>) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState({
    customer_name: invoice.customer_name,
    customer_phone: invoice.customer_phone || "",
    customer_address: invoice.customer_address || "",
    customer_email: invoice.customer_email || "",
    invoice_date: invoice.invoice_date,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-customer_name">Nama Pelanggan *</Label>
        <Input
          id="edit-customer_name"
          value={formData.customer_name}
          onChange={(e) => setFormData((prev) => ({ ...prev, customer_name: e.target.value }))}
          required
        />
      </div>
      <div>
        <Label htmlFor="edit-customer_phone">Nomor Telepon</Label>
        <Input
          id="edit-customer_phone"
          value={formData.customer_phone}
          onChange={(e) => setFormData((prev) => ({ ...prev, customer_phone: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor="edit-customer_address">Alamat</Label>
        <Input
          id="edit-customer_address"
          value={formData.customer_address}
          onChange={(e) => setFormData((prev) => ({ ...prev, customer_address: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor="edit-customer_email">Email</Label>
        <Input
          id="edit-customer_email"
          type="email"
          value={formData.customer_email}
          onChange={(e) => setFormData((prev) => ({ ...prev, customer_email: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor="edit-invoice_date">Tanggal Invoice</Label>
        <Input
          id="edit-invoice_date"
          type="date"
          value={formData.invoice_date}
          onChange={(e) => setFormData((prev) => ({ ...prev, invoice_date: e.target.value }))}
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
