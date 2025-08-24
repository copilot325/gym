import type { User } from "./types"
import { dataService } from "./data-service"

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

class AuthService {
  private currentUser: User | null = null

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const user = await dataService.getUserByEmail(email)

      if (!user) {
        return { success: false, error: "Usuario no encontrado" }
      }

      if (user.password !== password) {
        return { success: false, error: "Contraseña incorrecta" }
      }

      this.currentUser = user
      // Store in localStorage for persistence
      if (typeof window !== "undefined") {
        localStorage.setItem("bodystrong_user", JSON.stringify(user))
      }

      return { success: true, user }
    } catch (error) {
      return { success: false, error: "Error al iniciar sesión" }
    }
  }

  async logout(): Promise<void> {
    this.currentUser = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("bodystrong_user")
    }
  }

  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser
    }

    // Try to restore from localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bodystrong_user")
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored)
          return this.currentUser
        } catch {
          localStorage.removeItem("bodystrong_user")
        }
      }
    }

    return null
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser()
    return user?.role === "ADMIN"
  }
}

export const authService = new AuthService()
