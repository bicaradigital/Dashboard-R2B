"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2, Mail } from "lucide-react"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isPending = searchParams.get("pending") === "true"
  const isSuccess = searchParams.get("success") === "true"

  useEffect(() => {
    // Auto redirect to login after 3 seconds on success
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push("/auth/login")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, router])

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
              <CardTitle className="text-2xl">
                {isSuccess 
                  ? "Pendaftaran Berhasil!" 
                  : isPending 
                    ? "Verifikasi Email Diperlukan" 
                    : "Verifikasi Email"}
              </CardTitle>
              <CardDescription>
                {isSuccess
                  ? "Akun Anda telah dibuat. Silakan login dengan email dan password Anda"
                  : isPending
                    ? "Silakan verifikasi email Anda untuk melanjutkan"
                    : "Mengalami masalah? Coba login kembali"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                {isSuccess ? (
                  <>
                    <div className="flex justify-center">
                      <CheckCircle2 className="h-16 w-16 text-green-600 animate-pulse" />
                    </div>
                    <Alert>
                      <AlertDescription>
                        Akun Anda berhasil dibuat! Anda akan diarahkan ke halaman login dalam beberapa detik.
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-3">
                      <Link href="/auth/login">
                        <Button className="w-full bg-primary hover:bg-primary">
                          Masuk Sekarang
                        </Button>
                      </Link>
                      <p className="text-xs text-gray-500">Gunakan email dan password yang tadi didaftarkan</p>
                    </div>
                  </>
                ) : isPending ? (
                  <>
                    <div className="flex justify-center">
                      <Mail className="h-16 w-16 text-blue-600" />
                    </div>
                    <Alert>
                      <AlertDescription>
                        Kami telah mengirimkan link verifikasi ke email Anda. Silakan cek email dan klik link tersebut untuk menyelesaikan pendaftaran.
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Setelah klik link di email, Anda dapat{" "}
                        <Link href="/auth/login" className="text-primary underline">
                          masuk di sini
                        </Link>
                      </p>
                      <Link href="/auth/login">
                        <Button variant="outline" className="w-full">
                          Kembali ke Login
                        </Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-center">
                      <Loader2 className="h-16 w-16 text-gray-400 animate-spin" />
                    </div>
                    <p className="text-sm text-gray-600">Memverifikasi email Anda...</p>
                    <Link href="/auth/login">
                      <Button className="w-full bg-primary hover:bg-primary">
                        Kembali ke Login
                      </Button>
                    </Link>
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

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <Loader2 className="h-6 w-6 animate-spin" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
