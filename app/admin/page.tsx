"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { AlertCircle, CheckCircle2, Copy, Trash2, Plus, Loader2 } from "lucide-react"

interface AuthorizedUser {
  id: string
  email: string
  name: string
  role: string
  is_active: boolean
  created_at: string
}

interface LoginCode {
  id: string
  code: string
  email: string
  is_used: boolean
  expires_at: string
  created_at: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<AuthorizedUser[]>([])
  const [codes, setCodes] = useState<LoginCode[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Form states
  const [newEmail, setNewEmail] = useState("")
  const [newName, setNewName] = useState("")
  const [codeEmail, setCodeEmail] = useState("")

  useEffect(() => {
    loadUsers()
    loadCodes()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (!response.ok) throw new Error("Gagal memuat pengguna")
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    }
  }

  const loadCodes = async () => {
    try {
      const response = await fetch("/api/admin/codes")
      if (!response.ok) throw new Error("Gagal memuat kode")
      const data = await response.json()
      setCodes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail.toLowerCase(),
          name: newName,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Gagal menambah pengguna")

      setSuccess(`Pengguna ${newEmail} berhasil ditambahkan`)
      setNewEmail("")
      setNewName("")
      loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/admin/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: codeEmail.toLowerCase(),
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Gagal membuat kode")

      setSuccess(`Kode berhasil dibuat: ${data.code}`)
      setCodeEmail("")
      loadCodes()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Yakin ingin menghapus pengguna ini?")) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Gagal menghapus pengguna")

      setSuccess("Pengguna berhasil dihapus")
      loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess("Kode disalin ke clipboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Image src="/images/r2b-logo.png" alt="R2B Logo" width={60} height={60} className="rounded-lg" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Kelola pengguna dan kode akses</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Pengguna Terdaftar</TabsTrigger>
            <TabsTrigger value="codes">Kode Akses</TabsTrigger>
            <TabsTrigger value="add">Tambah Pengguna</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pengguna Terdaftar</CardTitle>
                <CardDescription>Daftar semua pengguna yang berhak akses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <p className="text-gray-500">Belum ada pengguna terdaftar</p>
                  ) : (
                    <div className="space-y-3">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div>
                            <p className="font-medium">{user.name || "Tanpa Nama"}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500">
                              Status: {user.is_active ? "Aktif" : "Tidak Aktif"}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="codes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Kode Akses Aktif</CardTitle>
                <CardDescription>Kode yang masih berlaku (belum digunakan dan belum expired)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {codes.filter(c => !c.is_used).length === 0 ? (
                    <p className="text-gray-500">Tidak ada kode aktif</p>
                  ) : (
                    <div className="space-y-3">
                      {codes
                        .filter(c => !c.is_used)
                        .map((code) => (
                          <div
                            key={code.id}
                            className="flex items-center justify-between p-3 border rounded-lg bg-blue-50"
                          >
                            <div>
                              <p className="font-mono font-bold text-lg">{code.code}</p>
                              <p className="text-sm text-gray-600">{code.email}</p>
                              <p className="text-xs text-gray-500">
                                Berlaku sampai: {new Date(code.expires_at).toLocaleString("id-ID")}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(code.code)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tambah Pengguna Baru</CardTitle>
                <CardDescription>Daftarkan pengguna baru yang bisa mengakses sistem</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@perusahaan.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Nama</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Nama Lengkap"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menambahkan...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Pengguna
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">Cara Kerja:</h3>
                  <ol className="text-sm space-y-1 text-gray-700">
                    <li>1. Tambahkan email pengguna di sini</li>
                    <li>2. Pengguna akan bisa login dengan kode 6 digit</li>
                    <li>3. Kode dapat digenerate kapan saja dari tab "Kode Akses"</li>
                    <li>4. Setiap kode berlaku 24 jam dan hanya bisa digunakan 1 kali</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
