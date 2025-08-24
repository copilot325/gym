"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard-new"
import { AppLayout } from "@/components/layout/app-layout"
import { MembersTable } from "@/components/members/members-table"
import { MemberForm } from "@/components/members/member-form"
import { MemberProfile } from "@/components/members/member-profile"
import type { Member } from "@/lib/types"

type ViewMode = "table" | "form" | "profile"

export default function MembersPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  useEffect(() => { /* table handles its own loading */ }, [])

  const handleAddMember = () => {
    setSelectedMember(null)
    setViewMode("form")
  }

  const handleEditMember = (member: Member) => {
    setSelectedMember(member)
    setViewMode("form")
  }

  const handleViewMember = (member: Member) => {
    setSelectedMember(member)
    setViewMode("profile")
  }

  const handleFormSuccess = () => {
    setViewMode("table")
    setSelectedMember(null)
  // table will refresh via its own fetch logic
  }

  const handleFormCancel = () => {
    setViewMode("table")
    setSelectedMember(null)
  }

  const handleProfileClose = () => {
    setViewMode("table")
    setSelectedMember(null)
  }

  const handleProfileEdit = () => {
    setViewMode("form")
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="flex items-center justify-center min-h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </AppLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <AppLayout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {viewMode === "table" && (
              <MembersTable onAddMember={handleAddMember} onEditMember={handleEditMember} onViewMember={handleViewMember} />
            )}
            {viewMode === "form" && (
              <MemberForm
                member={selectedMember || undefined}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            )}
            {viewMode === "profile" && selectedMember && (
              <MemberProfile member={selectedMember} onEdit={handleProfileEdit} onClose={handleProfileClose} />
            )}
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  )
}
