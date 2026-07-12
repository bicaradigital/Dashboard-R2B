"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4">
            <Image src="/images/r2b-logo.png" alt="R2B Logo" width={80} height={80} className="rounded-lg" />
            <h1 className="text-2xl font-bold text-gray-900">R2B Laporan Keuangan</h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Verifikasi Email</CardTitle>
              <CardDescription>
                {error ? "Verifikasi gagal" : "Kami telah mengirimkan link verifikasi ke email Anda"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                {error ? (
                  <>
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {error === "verification_failed"
                          ? "Link verifikasi tidak valid atau sudah kadaluarsa. Silakan daftar ulang."
                          : "Terjadi kesalahan saat verifikasi."}
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <Link href="/auth/signup" className="text-primary underline hover:no-underline">
                          Coba daftar ulang
                        </Link>
                      </p>
                      <p className="text-sm text-gray-600">
                        atau{" "}
                        <Link href="/auth/login" className="text-primary underline hover:no-underline">
                          masuk ke aplikasi
                        </Link>
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-center">
                      <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Silakan cek email Anda dan klik link verifikasi untuk mengaktifkan akun.
                    </p>
                    <p className="text-sm text-gray-600">
                      Setelah verifikasi, Anda akan otomatis diarahkan ke dashboard atau dapat{" "}
                      <Link href="/auth/login" className="text-primary underline hover:no-underline">
                        masuk ke aplikasi
                      </Link>
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
