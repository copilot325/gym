import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserX, UserPlus, RotateCcw } from "lucide-react"
import type { DashboardStats } from "@/lib/types"

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    { title: "Activos", value: stats.activeMembers, icon: UserCheck, color: "text-green-600", bgColor: "bg-green-50" },
    { title: "Inactivos", value: stats.inactiveMembers, icon: UserX, color: "text-red-600", bgColor: "bg-red-50" },
    { title: "Sin Membresía", value: stats.withoutMembershipMembers, icon: Users, color: "text-gray-600", bgColor: "bg-gray-100" },
    { title: "Nuevos (Mes)", value: stats.newMembersThisMonth, icon: UserPlus, color: "text-purple-600", bgColor: "bg-purple-50" },
    { title: "No Renovaron", value: stats.membersNotRenewed, icon: RotateCcw, color: "text-orange-600", bgColor: "bg-orange-50" },
    { title: "Total", value: stats.totalMembers, icon: Users, color: "text-blue-600", bgColor: "bg-blue-50" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
