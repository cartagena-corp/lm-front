import { useOrganizationStore } from "@/lib/store/OrganizationStore"
import { useBoardStore } from "@/lib/store/BoardStore"
import { useAuthStore } from "@/lib/store/AuthStore"
import { useEffect, useState } from "react"

interface BoardsOrgProps {
    organization: { organizationId: string; organizationName: string; createdAt: string }
}

export default function BoardsOrg({ organization }: BoardsOrgProps) {
    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Tableros de la Organización</h2>
            {/* TODO: Display boards here */}
            <p>List of boards will be displayed here.</p>
        </div>
    )
}