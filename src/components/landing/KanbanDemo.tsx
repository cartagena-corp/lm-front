"use client"

import { Fragment, useEffect, useState } from "react"
import { Plus, X } from "lucide-react"
import { useModalStore } from "@/lib/hooks/ModalStore"
import CreateIssueDemoForm, { type NewIssuePayload } from "./CreateIssueDemoForm"
import type { Dictionary } from "@/lib/landing/i18n"

type DemoDict = Dictionary["hero"]["demo"]
type DemoStatus = "todo" | "doing" | "done"
type Board = Record<DemoStatus, DemoIssue[]>

interface DemoIssue {
   id: string
   title: string
   description: string
   type: string
   image?: string
}

const STORAGE_KEY = "lm-demo-board-v2"
const CREATE_ID = "lm-demo-create"
const COLUMN_ORDER: DemoStatus[] = ["todo", "doing", "done"]
const COLUMN_DOT: Record<DemoStatus, string> = {
   todo: "var(--blue-700)",
   doing: "var(--amber-700)",
   done: "var(--green-700)",
}
// Data-driven chip colors (hex so an alpha suffix can tint the background),
// the same pattern the real issue cards use for backend-defined type colors.
const TYPE_COLORS = ["#0068d6", "#7856ff", "#0d9488", "#e68a00", "#e5397f", "#3b9a57"]

function typeColor(type: string): string {
   let hash = 0
   for (let i = 0; i < type.length; i++) hash = (hash * 31 + type.charCodeAt(i)) >>> 0
   return TYPE_COLORS[hash % TYPE_COLORS.length]
}

function seedBoard(demo: DemoDict): Board {
   const board: Board = { todo: [], doing: [], done: [] }
   demo.seed.forEach((s, i) =>
      board[s.status].push({ id: `seed-${i}`, title: s.title, description: s.description, type: s.type }),
   )
   return board
}

function loadBoard(demo: DemoDict): Board {
   if (typeof window === "undefined") return seedBoard(demo)
   try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      if (parsed && Array.isArray(parsed.todo) && Array.isArray(parsed.doing) && Array.isArray(parsed.done)) {
         return parsed as Board
      }
   } catch {
      /* fall through to seed */
   }
   return seedBoard(demo)
}

// Collapsed hover-reveal insert affordance between two cards (or above the first
// / below the last) — same "hover-reveal insert row" pattern as the sprint list.
function GapAdd({ title, onAdd }: { title: string; onAdd: () => void }) {
   return (
      <div className="group flex items-center h-2 hover:h-7 focus-within:h-7 transition-all duration-150" style={{ margin: "-1px 0" }}>
         <div
            className="flex-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150"
            style={{ borderTop: "1px dashed var(--blue-600)" }}
         />
         <button
            type="button"
            onClick={onAdd}
            title={title}
            aria-label={title}
            className="flex-shrink-0 mx-1.5 inline-flex items-center justify-center rounded-full opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100 focus-visible:opacity-100 focus-visible:scale-100 hover:bg-[var(--blue-100)] transition-all duration-150"
            style={{ width: 22, height: 22, background: "var(--ds-card)", color: "var(--blue-700)", boxShadow: "var(--shadow-border)" }}
         >
            <Plus size={13} strokeWidth={2} />
         </button>
         <div
            className="flex-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150"
            style={{ borderTop: "1px dashed var(--blue-600)" }}
         />
      </div>
   )
}

const dotStyle = (color: string): React.CSSProperties => ({ width: 11, height: 11, borderRadius: 999, background: color, display: "inline-block" })

export default function KanbanDemo({ demo }: { demo: DemoDict }) {
   const openModal = useModalStore((s) => s.openModal)
   const closeModal = useModalStore((s) => s.closeModal)

   const [board, setBoard] = useState<Board>(() => loadBoard(demo))
   const [draggingId, setDraggingId] = useState<string | null>(null)
   const [overCol, setOverCol] = useState<DemoStatus | null>(null)

   useEffect(() => {
      try {
         sessionStorage.setItem(STORAGE_KEY, JSON.stringify(board))
      } catch {
         /* quota / private mode — non-fatal for a demo */
      }
   }, [board])

   const cloneBoard = (b: Board): Board => ({ todo: [...b.todo], doing: [...b.doing], done: [...b.done] })

   const moveTo = (id: string, to: DemoStatus) =>
      setBoard((prev) => {
         const next = cloneBoard(prev)
         let moved: DemoIssue | undefined
         for (const s of COLUMN_ORDER) {
            const idx = next[s].findIndex((i) => i.id === id)
            if (idx >= 0) {
               moved = next[s].splice(idx, 1)[0]
               break
            }
         }
         if (moved) next[to].push(moved)
         return next
      })

   const removeIssue = (id: string) =>
      setBoard((prev) => {
         const next = cloneBoard(prev)
         for (const s of COLUMN_ORDER) {
            const idx = next[s].findIndex((i) => i.id === id)
            if (idx >= 0) {
               next[s].splice(idx, 1)
               break
            }
         }
         return next
      })

   const addAt = (status: DemoStatus, index: number, payload: NewIssuePayload) =>
      setBoard((prev) => {
         const next = cloneBoard(prev)
         const issue: DemoIssue = {
            id: `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
            title: payload.title,
            description: payload.description,
            type: demo.newType,
            image: payload.image,
         }
         const clamped = Math.max(0, Math.min(index, next[status].length))
         next[status].splice(clamped, 0, issue)
         return next
      })

   const openCreate = (status: DemoStatus, index: number) =>
      openModal({
         id: CREATE_ID,
         title: demo.form.title,
         desc: demo.form.desc,
         size: "md",
         mode: "CREATE",
         children: (
            <CreateIssueDemoForm
               demo={demo}
               onCancel={() => closeModal(CREATE_ID)}
               onCreate={(p) => {
                  addAt(status, index, p)
                  closeModal(CREATE_ID)
               }}
            />
         ),
      })

   return (
      <div
         style={{
            background: "var(--ds-card)",
            color: "var(--ds-text)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "0 24px 48px -16px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.06)",
            overflow: "hidden",
            width: "100%",
         }}
      >
         {/* iOS-style window titlebar */}
         <div
            style={{
               position: "relative",
               display: "flex",
               alignItems: "center",
               height: 40,
               padding: "0 14px",
               borderBottom: "1px solid var(--ds-border)",
               background: "var(--ds-background-subtle)",
            }}
         >
            <span style={{ display: "inline-flex", gap: 7 }}>
               <span style={dotStyle("#ff5f57")} />
               <span style={dotStyle("#febc2e")} />
               <span style={dotStyle("#28c840")} />
            </span>
            <span
               style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  fontSize: 12.5,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  color: "var(--ds-text-secondary)",
                  pointerEvents: "none",
               }}
            >
               LA MURALLA
            </span>
         </div>

         {/* Board */}
         <div
            className="lm-no-scrollbar lm-demo-board"
            style={{
               display: "flex",
               overflowY: "auto",
               maxHeight: "min(64vh, 520px)",
               overscrollBehavior: "contain",
            }}
         >
            {COLUMN_ORDER.map((status) => {
               const items = board[status]
               const isOver = overCol === status
               return (
                  <section
                     key={status}
                     className="lm-demo-col"
                     onDragOver={(e) => {
                        e.preventDefault()
                        setOverCol(status)
                     }}
                     onDragLeave={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                           setOverCol((prev) => (prev === status ? null : prev))
                        }
                     }}
                     onDrop={(e) => {
                        e.preventDefault()
                        const id = e.dataTransfer.getData("text/plain") || draggingId
                        if (id) moveTo(id, status)
                        setOverCol(null)
                        setDraggingId(null)
                     }}
                  >
                     {/* Column header + "+" */}
                     <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 2px", marginBottom: 6 }}>
                        <span style={{ flexShrink: 0, width: 8, height: 8, borderRadius: 999, background: COLUMN_DOT[status] }} />
                        <h4 style={{ margin: 0, minWidth: 0, flex: 1, fontSize: 13, fontWeight: 600, color: "var(--ds-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{demo.columns[status]}</h4>
                        <span style={{ flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ds-text-muted)" }}>{items.length}</span>
                        <button
                           type="button"
                           onClick={() => openCreate(status, items.length)}
                           aria-label={demo.addIssue}
                           title={demo.addIssue}
                           className="hover:bg-[var(--gray-alpha-100)]"
                           style={{ flexShrink: 0, display: "inline-flex", padding: 3, borderRadius: "var(--radius-sm)", border: "none", background: "transparent", color: "var(--ds-text-muted)", cursor: "pointer" }}
                        >
                           <Plus size={15} strokeWidth={2} />
                        </button>
                     </div>

                     {/* Drop zone */}
                     <div
                        style={{
                           minHeight: 180,
                           borderRadius: "var(--radius-lg)",
                           padding: 6,
                           background: isOver ? "var(--blue-100)" : "var(--gray-alpha-100)",
                           border: isOver ? "1px dashed var(--blue-600)" : "1px solid transparent",
                           transition: "background var(--duration-fast) var(--ease-standard)",
                        }}
                     >
                        <GapAdd title={demo.addIssue} onAdd={() => openCreate(status, 0)} />

                        {items.length === 0 && (
                           <p style={{ margin: "18px 0", textAlign: "center", fontSize: 12, color: "var(--ds-text-muted)" }}>{demo.emptyColumn}</p>
                        )}

                        {items.map((issue, idx) => {
                           const color = typeColor(issue.type)
                           return (
                              <Fragment key={issue.id}>
                                 <article
                                    className="lm-card group"
                                    draggable
                                    onDragStart={(e) => {
                                       if ((e.target as HTMLElement).closest("button")) {
                                          e.preventDefault()
                                          return
                                       }
                                       e.dataTransfer.effectAllowed = "move"
                                       e.dataTransfer.setData("text/plain", issue.id)
                                       window.setTimeout(() => setDraggingId(issue.id), 0)
                                    }}
                                    onDragEnd={() => {
                                       setDraggingId(null)
                                       setOverCol(null)
                                    }}
                                    style={{
                                       background: "var(--ds-card)",
                                       borderRadius: "var(--radius-md)",
                                       boxShadow: "var(--shadow-border)",
                                       padding: 10,
                                       cursor: "grab",
                                       opacity: draggingId === issue.id ? 0.5 : 1,
                                    }}
                                 >
                                    <div style={{ display: "flex", alignItems: "start", gap: 6 }}>
                                       <p style={{ margin: 0, flex: 1, minWidth: 0, fontSize: 13, fontWeight: 500, lineHeight: "18px", color: "var(--ds-text)", overflowWrap: "break-word" }}>{issue.title}</p>
                                       <button
                                          type="button"
                                          onClick={() => removeIssue(issue.id)}
                                          aria-label="✕"
                                          className="opacity-0 group-hover:opacity-100 hover:bg-[var(--red-100)] hover:text-[var(--red-900)]"
                                          style={{ flexShrink: 0, display: "inline-flex", padding: 3, borderRadius: "var(--radius-sm)", border: "none", background: "transparent", color: "var(--ds-text-muted)", cursor: "pointer", transition: "opacity var(--duration-fast) var(--ease-standard)" }}
                                       >
                                          <X size={14} strokeWidth={1.75} />
                                       </button>
                                    </div>

                                    <span
                                       style={{
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: 5,
                                          marginTop: 8,
                                          maxWidth: "100%",
                                          height: 20,
                                          padding: "0 7px",
                                          borderRadius: "var(--radius-sm)",
                                          background: `${color}1f`,
                                          color,
                                          fontSize: 11,
                                          fontWeight: 500,
                                       }}
                                    >
                                       <span style={{ flexShrink: 0, width: 5, height: 5, borderRadius: 999, background: color }} />
                                       <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{issue.type}</span>
                                    </span>

                                    {issue.description && (
                                       <p className="line-clamp-2" style={{ margin: "8px 0 0", fontSize: 12, lineHeight: "17px", color: "var(--ds-text-secondary)" }}>
                                          {issue.description}
                                       </p>
                                    )}

                                    {issue.image && (
                                       // eslint-disable-next-line @next/next/no-img-element
                                       <img src={issue.image} alt="" style={{ marginTop: 8, width: "100%", height: 88, objectFit: "cover", borderRadius: "var(--radius-sm)", display: "block" }} />
                                    )}
                                 </article>

                                 <GapAdd title={demo.addIssue} onAdd={() => openCreate(status, idx + 1)} />
                              </Fragment>
                           )
                        })}
                     </div>
                  </section>
               )
            })}
         </div>
      </div>
   )
}
