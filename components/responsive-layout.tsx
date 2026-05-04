"use client"

import type React from "react"
import { useEffect, useState } from "react"

interface ResponsiveLayoutProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveContainer({ children, className = "" }: ResponsiveLayoutProps) {
  return <div className={`w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 ${className}`}>{children}</div>
}

export function ResponsiveGrid({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = "4",
  className = "",
}: {
  children: React.ReactNode
  cols?: { mobile: number; tablet: number; desktop: number }
  gap?: string
  className?: string
}) {
  return (
    <div
      className={`grid grid-cols-${cols.mobile} md:grid-cols-${cols.tablet} lg:grid-cols-${cols.desktop} gap-${gap} ${className}`}
    >
      {children}
    </div>
  )
}

export function MobileOptimizedCard({
  children,
  className = "",
  padding = "default",
}: {
  children: React.ReactNode
  className?: string
  padding?: "none" | "small" | "default" | "large"
}) {
  const paddingClasses = {
    none: "",
    small: "p-2 sm:p-3",
    default: "p-3 sm:p-4 md:p-6",
    large: "p-4 sm:p-6 md:p-8",
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  )
}

export function useResponsive() {
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">("desktop")

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 768) {
        setScreenSize("mobile")
      } else if (window.innerWidth < 1024) {
        setScreenSize("tablet")
      } else {
        setScreenSize("desktop")
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  return {
    isMobile: screenSize === "mobile",
    isTablet: screenSize === "tablet",
    isDesktop: screenSize === "desktop",
    screenSize,
  }
}
