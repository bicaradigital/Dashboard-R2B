import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import DashboardClient from "@/components/dashboard-client"

export default async function DashboardPage() {
  // Check user session from cookie
  const cookieStore = await cookies()
  const userDataCookie = cookieStore.get('user_data')

  if (!userDataCookie?.value) {
    redirect("/auth/login")
  }

  try {
    const userData = JSON.parse(userDataCookie.value)
    
    if (!userData.id) {
      redirect("/auth/login")
    }

    // Get Supabase client for fetching data
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {},
        },
      }
    )

    // fetch data transaksi
    const { data: transactions } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false })

    return (
      <DashboardClient 
        user={{ id: userData.id, username: userData.username, role: userData.role }} 
        profile={null} 
        initialTransactions={transactions || []} 
      />
    )
  } catch (error) {
    console.error('[v0] Dashboard error:', error)
    redirect("/auth/login")
  }
}
