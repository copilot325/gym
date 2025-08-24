"use client"

import { useEffect, useState } from "react"
import { MobileSidebar } from "./sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { signOut, getSession } from "@/lib/auth-client"
import { useStore } from "@nanostores/react"
import { currentUserStore, authActions } from "@/lib/stores/auth-store"
import { LogOut } from "lucide-react"

export function Header() {
  const user = useStore(currentUserStore)

  useEffect(() => {
    const load = async () => {
      const session = await getSession()
      if (session?.data) {
        authActions.setSession({
          user: session.data.user,
          expiresAt: session.data.session.expiresAt,
        })
      }
    }
    load()
  }, [])

  const handleLogout = async () => {
  await signOut()
  authActions.clearSession()
  window.location.href = "/login"
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <MobileSidebar />
        <div className="hidden md:block">
          <h1 className="text-xl font-semibold text-foreground">Sistema de Gestión - BodyStrong</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(user.name || user.email)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user.name}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
