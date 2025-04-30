import { createContext, useContext, Dispatch, SetStateAction } from 'react'

interface MultiDragContextValue {
   setSelectedIds: Dispatch<SetStateAction<string[]>>
   selectedIds: string[]
}

const MultiDragContext = createContext<MultiDragContextValue>({ selectedIds: [], setSelectedIds: () => { } })
export const MultiDragProvider = MultiDragContext.Provider
export const useMultiDragContext = () => useContext(MultiDragContext)
