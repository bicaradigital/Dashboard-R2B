import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createClient()

    // Check if tables already exist
    const { data: existingTables } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .in("table_name", ["authorized_users", "login_codes", "login_history"])

    if (existingTables && existingTables.length > 0) {
      return NextResponse.json(
        { 
          success: true,
          message: "Database sudah di-setup sebelumnya",
          tables: existingTables
        },
        { status: 200 }
      )
    }

    // Create authorized_users table
    const { error: error1 } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS public.authorized_users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255),
          role VARCHAR(50) DEFAULT 'user',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    }).catch(() => ({ error: null }))

    // Create login_codes table
    const { error: error2 } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS public.login_codes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          code VARCHAR(8) UNIQUE NOT NULL,
          user_id UUID,
          email VARCHAR(255) NOT NULL,
          is_used BOOLEAN DEFAULT FALSE,
          used_at TIMESTAMP WITH TIME ZONE,
          expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          ip_address VARCHAR(45),
          user_agent TEXT
        );
      `
    }).catch(() => ({ error: null }))

    // Create login_history table
    const { error: error3 } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS public.login_history (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID,
          email VARCHAR(255) NOT NULL,
          login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          ip_address VARCHAR(45),
          user_agent TEXT,
          status VARCHAR(50),
          reason VARCHAR(255)
        );
      `
    }).catch(() => ({ error: null }))

    return NextResponse.json(
      {
        success: true,
        message: "Database tables berhasil dibuat",
        tables: ["authorized_users", "login_codes", "login_history"]
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[v0] Setup error:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Gagal setup database. Silakan setup manual via Supabase SQL Editor."
      },
      { status: 500 }
    )
  }
}
