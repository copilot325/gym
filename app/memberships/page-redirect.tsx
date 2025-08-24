"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MembershipsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to main dashboard since memberships management 
    // is integrated in the member profiles
    router.replace("/")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}
