import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

export default function VerifyEmailPage() {
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
              <CardDescription>Kami telah mengirimkan link verifikasi ke email Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Silakan cek email Anda dan klik link verifikasi untuk mengaktifkan akun.
                </p>
                <p className="text-sm text-gray-600">
                  Setelah verifikasi, Anda dapat{" "}
                  <Link href="/auth/login" className="text-primary underline">
                    masuk ke aplikasi
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
