import { BoardStatusProps } from "@/lib/types/global"
import { DeleteIcon, EditIcon } from "@public/icon/Icon"
import Button from "@/components/ui/Button"

export default function StateCard({ state }: { state: BoardStatusProps }) {
    return (
        <article style={{ backgroundColor: `${state.color}0f` }} className="hover:shadow-md transition-shadow flex justify-between items-center rounded-md text-sm group gap-2 p-4">
            <aside className="flex justify-start items-center gap-2">
                <span style={{ backgroundColor: state.color }} className="flex justify-center items-center rounded-full p-1.5" />
                <p style={{ color: state.color }} className="font-medium">{state.name}</p>
            </aside>

            <aside style={{ color: state.color }} className="group-hover:opacity-100 transition-opacity opacity-0 flex justify-end items-center gap-2">
                <Button variant="none" className="p-0!"><EditIcon size={16} /></Button>
                <Button variant="none" className="p-0!"><DeleteIcon size={16} /></Button>
            </aside>
        </article>
    )
}
