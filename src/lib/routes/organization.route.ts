const BACKEND_URL = process.env.NEXT_PUBLIC_SERVICE_ORGANIZATION
const BOARD_URL = process.env.NEXT_PUBLIC_SERVICE_BOARDS
const AUTH_URL = process.env.NEXT_PUBLIC_SERVICE_OAUTH
const USERS_URL = process.env.NEXT_PUBLIC_SERVICE_USERS

export const API_ROUTES = {
    GET_ALL_ORGANIZATIONS: `${BACKEND_URL}/api/organizations/getAllOrganizations`,
    CREATE_ORGANIZATION: `${BACKEND_URL}/api/organizations/createOrganization`,
    GET_SPECIFIC_ORGANIZATION: `${BACKEND_URL}/api/organizations/getOrganization`,
    GET_PROJECTS_BY_ORGANIZATION: `${BOARD_URL}/api/projects/organization`,
    ADD_USER_TO_ORGANIZATION: `${AUTH_URL}/api/oauth/add-user-with-organization`,
    CHANGE_USER_TO_ORGANIZATION: `${AUTH_URL}/api/oauth/change-organization`,
    UPDATE_ORGANIZATION: `${BACKEND_URL}/api/organizations/updateOrganization`,
    DELETE_ORGANIZATION: `${BACKEND_URL}/api/organizations/deleteOrganization`,
    GET_USERS_BY_ORGANIZATION: `${AUTH_URL}/api/oauth/users/organization`,
    CHANGE_USER_ORGANIZATION: `${AUTH_URL}/api/oauth/change-organization`,
    GET_ROLES_BY_ORGANIZATION: ({ idOrg }: { idOrg: string }) => `${USERS_URL}/api/roles/organization/${idOrg}/roles`,
}