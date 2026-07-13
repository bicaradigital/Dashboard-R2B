'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type SetupStep = 'welcome' | 'database' | 'admin' | 'complete'

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<SetupStep>('welcome')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminName, setAdminName] = useState('')
  const [success, setSuccess] = useState('')

  const handleInitDatabase = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('/api/setup/init-database', {
        method: 'POST'
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal setup database')
      }

      setSuccess('Database berhasil dibuat!')
      setTimeout(() => {
        setStep('admin')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAdmin = async () => {
    if (!adminEmail || !adminEmail.includes('@')) {
      setError('Email tidak valid')
      return
    }
    if (!adminName) {
      setError('Nama harus diisi')
      return
    }

    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('/api/setup/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmail.toLowerCase(),
          name: adminName
        })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat admin')
      }

      setSuccess('Admin user berhasil dibuat!')
      setTimeout(() => {
        setStep('complete')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4">
            <Image src="/images/r2b-logo.png" alt="R2B Logo" width={80} height={80} className="rounded-lg" />
            <h1 className="text-2xl font-bold text-gray-900">Setup Aplikasi</h1>
          </div>

          <Card>
            {step === 'welcome' && (
              <>
                <CardHeader>
                  <CardTitle>Selamat Datang!</CardTitle>
                  <CardDescription>Aplikasi perlu setup database terlebih dahulu</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>Setup wizard akan:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Membuat tabel database otomatis</li>
                      <li>Membuat user admin pertama</li>
                      <li>Siap untuk login</li>
                    </ul>
                  </div>
                  <Button
                    onClick={() => setStep('database')}
                    className="w-full bg-primary hover:bg-primary"
                  >
                    Mulai Setup
                  </Button>
                </CardContent>
              </>
            )}

            {step === 'database' && (
              <>
                <CardHeader>
                  <CardTitle>Setup Database</CardTitle>
                  <CardDescription>Klik tombol di bawah untuk membuat tabel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  )}
                  <Button
                    onClick={handleInitDatabase}
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Membuat Tabel...
                      </>
                    ) : (
                      'Buat Tabel Database'
                    )}
                  </Button>
                </CardContent>
              </>
            )}

            {step === 'admin' && (
              <>
                <CardHeader>
                  <CardTitle>Buat Admin User</CardTitle>
                  <CardDescription>Masukkan data untuk user admin pertama</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  )}
                  <div>
                    <Label htmlFor="name">Nama</Label>
                    <Input
                      id="name"
                      placeholder="Admin"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@perusahaan.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    onClick={handleCreateAdmin}
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Membuat Admin...
                      </>
                    ) : (
                      'Buat Admin User'
                    )}
                  </Button>
                </CardContent>
              </>
            )}

            {step === 'complete' && (
              <>
                <CardHeader>
                  <CardTitle>Selesai!</CardTitle>
                  <CardDescription>Aplikasi siap digunakan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                  </div>
                  <div className="text-center space-y-2 text-sm text-gray-600">
                    <p>✓ Database siap</p>
                    <p>✓ Admin user dibuat</p>
                    <p className="font-medium">Siap login dengan kode!</p>
                  </div>
                  <Button
                    onClick={() => router.push('/auth/login')}
                    className="w-full bg-primary hover:bg-primary"
                  >
                    Lanjut ke Login
                  </Button>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
