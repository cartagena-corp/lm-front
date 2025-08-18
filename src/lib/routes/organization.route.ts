const BACKEND_URL = process.env.NEXT_PUBLIC_SERVICE_ORGANIZATION

export const API_ROUTES = {
    GET_ALL_ORGANIZATIONS: `${BACKEND_URL}/api/organizations/getAllOrganizations`,
    CREATE_ORGANIZATION: `${BACKEND_URL}/api/organizations/createOrganization`,
}