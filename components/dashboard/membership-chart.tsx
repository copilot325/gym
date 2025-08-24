"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface MembershipChartProps {
  activeMembers: number
  inactiveMembers: number // vencidos
  withoutMembershipMembers: number // nunca tuvieron
  totalMembers: number
}

export function MembershipChart({ activeMembers, inactiveMembers, withoutMembershipMembers, totalMembers }: MembershipChartProps) {
  const shownTotal = activeMembers + inactiveMembers + withoutMembershipMembers

  const data = [
    {
      name: "Activos",
      value: activeMembers,
      color: "hsl(var(--chart-1))",
    },
  { name: "Inactivos", value: inactiveMembers, color: "hsl(var(--chart-2))" },
  { name: "Sin Membresía", value: withoutMembershipMembers, color: "hsl(var(--chart-3))" },
  ]

  const chartConfig = {
    value: {
      label: "Miembros",
    },
    active: {
      label: "Activos",
      color: "hsl(var(--chart-1))",
    },
    expired: {
      label: "Vencidos",
      color: "hsl(var(--chart-2))",
    },
    none: {
      label: "Sin Membresía",
      color: "hsl(var(--chart-3))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de Membresías</CardTitle>
        <CardDescription>Distribución actual de miembros por estado</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="flex justify-center gap-6 mt-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-muted-foreground">
                {item.name}: {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
