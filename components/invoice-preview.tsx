"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface InvoicePreviewProps {
  invoice: {
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
  }
  items: Array<{
    id: string
    description: string
    quantity: number
    price: number
    total: number
  }>
}

export default function InvoicePreview({ invoice, items }: InvoicePreviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200"
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Lunas"
      case "sent":
        return "Terkirim"
      case "partial":
        return "Sebagian"
      default:
        return "Draft"
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-500 to-yellow-400 text-white">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Image src="/images/r2b-logo.png" alt="R2B Logo" width={60} height={60} className="rounded-lg" />
            <div>
              <CardTitle className="text-2xl font-bold">R2B - RUMAH RETORT BERSAMA</CardTitle>
              <div className="grid grid-cols-2 gap-4 mt-2 text-sm opacity-90">
                <p>📱 WA: 0821-3432-0434</p>
                <p>✉️ rumahretorttbersama1@gmail.com</p>
                <p>🌐 www.makanantahanlama.com</p>
              </div>
            </div>
          </div>
          <div className="text-right bg-white/20 p-4 rounded-lg backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-2">INVOICE</h2>
            <p className="font-semibold">No: {invoice.invoice_number}</p>
            <p>Tanggal: {new Date(invoice.invoice_date).toLocaleDateString("id-ID")}</p>
            <Badge className={`mt-2 ${getStatusColor(invoice.status)}`}>{getStatusText(invoice.status)}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Customer Information */}
        <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border-l-4 border-blue-500">
          <h3 className="font-semibold text-lg mb-3 text-gray-800">Informasi Pelanggan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-lg text-gray-900">{invoice.customer_name}</p>
              {invoice.customer_phone && <p className="text-gray-600">📞 {invoice.customer_phone}</p>}
              {invoice.customer_email && <p className="text-gray-600">✉️ {invoice.customer_email}</p>}
            </div>
            {invoice.customer_address && (
              <div>
                <p className="font-medium text-gray-700">📍 Alamat:</p>
                <p className="text-gray-600">{invoice.customer_address}</p>
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
                  <th className="p-4 text-left font-semibold">Deskripsi Layanan</th>
                  <th className="p-4 text-center font-semibold w-20">Qty</th>
                  <th className="p-4 text-right font-semibold w-32">Harga Satuan</th>
                  <th className="p-4 text-right font-semibold w-32">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                  >
                    <td className="p-4 font-medium text-gray-900">{item.description}</td>
                    <td className="p-4 text-center text-gray-700">{item.quantity}</td>
                    <td className="p-4 text-right text-gray-700">{formatCurrency(item.price)}</td>
                    <td className="p-4 text-right font-semibold text-gray-900">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-end mb-6">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white p-4 rounded-lg shadow-md">
            <div className="text-right">
              <p className="text-lg font-bold">TOTAL PEMBAYARAN</p>
              <p className="text-2xl font-bold">{formatCurrency(invoice.total)}</p>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-lg border-t-4 border-blue-500">
          <h3 className="text-xl font-bold text-center text-gray-800 mb-4">INFORMASI PEMBAYARAN</h3>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-400 mb-4">
            <p className="text-center mb-2">
              <span className="font-semibold">Nama Penerima:</span> Bagoes Tri Anggoro
            </p>
            <p className="text-center mb-4">
              <span className="font-semibold">Bank BCA:</span> 836-049-6750
            </p>
            <div className="bg-blue-100 p-3 rounded-lg border-l-4 border-blue-500">
              <p className="text-center font-semibold text-blue-800">
                Lakukan Konfirmasi Bila Sudah Melakukan Pembayaran ke Nomor WA yang Tertera Disertai Bukti Transfer
              </p>
            </div>
          </div>
          <p className="text-center text-gray-600 font-medium">
            Terima kasih atas kepercayaan Anda kepada R2B - Rumah Retort Bersama
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
