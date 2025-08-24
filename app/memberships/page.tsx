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
    setSelectedMembership(membership)
    setViewMode("details")
  }

  const handleFormSuccess = () => {
    setViewMode("table")
    setSelectedMember(null)
    loadData()
  }

  const handleFormCancel = () => {
    setViewMode("table")
    setSelectedMember(null)
  }

  const handleDetailsClose = () => {
    setViewMode("table")
    setSelectedMembership(null)
  }

  if (isLoading) {
    return (
      <AuthGuard requireAdmin>
        <AppLayout>
          <div className="flex items-center justify-center min-h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </AppLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requireAdmin>
      <AppLayout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {viewMode === "table" && (
              <MembershipsTable
                memberships={memberships}
                members={members}
                onAddMembership={handleAddMembership}
                onViewMembership={handleViewMembership}
              />
            )}

            {viewMode === "form" && selectedMember && (
              <MembershipForm
                member={selectedMember}
                membershipTypes={membershipTypes}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            )}

            {viewMode === "details" && selectedMembership && (
              <MembershipDetails membership={selectedMembership} onClose={handleDetailsClose} />
            )}
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  )
}
