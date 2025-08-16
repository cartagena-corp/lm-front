import { UserListProps } from "@/lib/types/config"
import UserCard from "./UserCard"

export default function UserList({ data }: UserListProps): JSX.Element {
    return (
        <section className="flex flex-col gap-4">
            <span className="text-primary-border text-sm">Mostrando {data.content.length} de {data.totalElements} {data.totalElements === 1 ? "usuario" : "usuarios"}</span>
            <div className="flex flex-col gap-2">
                {data.content.map((user, i) => <UserCard key={user.id} user={user} index={i} />)}
            </div>
        </section>
    )
}