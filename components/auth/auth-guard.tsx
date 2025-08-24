"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@nanostores/react"
import { isAuthenticatedStore, authActions } from "@/lib/stores/auth-store"
import { getSession } from "@/lib/auth-client"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

export function AuthGuard({ children, redirectTo = "/login" }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const isAuthenticated = useStore(isAuthenticatedStore)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getSession()
        if (session?.data) {
          authActions.setSession({
            user: session.data.user,
            expiresAt: session.data.session.expiresAt,
          })
          if (!session.data.user.emailVerified) {
            router.push("/login?pendingApproval=1")
            return
          }
        } else {
          authActions.clearSession()
          router.push(redirectTo)
          return
        }
      } catch (e) {
        authActions.clearSession()
        router.push(redirectTo)
        return
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [router, redirectTo])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null
  return <>{children}</>
}
