import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import {
   DownloadIcon,
   XIcon,
   ZoomInIcon,
   ZoomOutIcon,
   ZoomResetIcon,
} from "@/assets/Icon"

export type MediaType = "image" | "video"

interface Props {
   url: string
   fileName: string
   type: MediaType
   onClose: () => void
}

const MIN_SCALE = 1
const MAX_SCALE = 5
const SCALE_STEP = 0.5

export default function MediaViewerModal({ url, fileName, type, onClose }: Props) {
   const [mounted, setMounted] = useState(false)
   const [scale, setScale] = useState(1)
   const [offset, setOffset] = useState({ x: 0, y: 0 })

   const dragState = useRef<{ dragging: boolean; startX: number; startY: number; originX: number; originY: number }>({
      dragging: false,
      startX: 0,
      startY: 0,
      originX: 0,
      originY: 0,
   })

   const isImage = type === "image"

   const resetView = useCallback(() => {
      setScale(1)
      setOffset({ x: 0, y: 0 })
   }, [])

   const zoomIn = useCallback(() => {
      setScale((prev) => Math.min(MAX_SCALE, prev + SCALE_STEP))
   }, [])

   const zoomOut = useCallback(() => {
      setScale((prev) => {
         const next = Math.max(MIN_SCALE, prev - SCALE_STEP)
         if (next === MIN_SCALE) setOffset({ x: 0, y: 0 })
         return next
      })
   }, [])

   // Portal target + lock body scroll
   useEffect(() => {
      setMounted(true)
      const previousOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
         document.body.style.overflow = previousOverflow
      }
   }, [])

   // Close on Escape
   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         if (e.key === "Escape") onClose()
      }
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
   }, [onClose])

   const handlePointerDown = (e: React.PointerEvent) => {
      if (!isImage || scale <= 1) return
      dragState.current = {
         dragging: true,
         startX: e.clientX,
         startY: e.clientY,
         originX: offset.x,
         originY: offset.y,
      }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
   }

   const handlePointerMove = (e: React.PointerEvent) => {
      if (!dragState.current.dragging) return
      setOffset({
         x: dragState.current.originX + (e.clientX - dragState.current.startX),
         y: dragState.current.originY + (e.clientY - dragState.current.startY),
      })
   }

   const handlePointerUp = () => {
      dragState.current.dragging = false
   }

   const handleWheel = (e: React.WheelEvent) => {
      if (!isImage) return
      if (e.deltaY < 0) zoomIn()
      else zoomOut()
   }

   if (!mounted) return null

   return createPortal(
      <AnimatePresence>
         <motion.div
            className="fixed inset-0 z-[1000] flex h-screen w-screen flex-col bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
         >
            {/* Barra superior de controles */}
            <header
               className="flex items-center justify-between gap-2 p-3 sm:p-4"
               onClick={(e) => e.stopPropagation()}
            >
               <span className="max-w-[60%] truncate text-xs text-white/80 sm:text-sm">
                  {fileName}
               </span>

               <div className="flex items-center gap-1 sm:gap-2">
                  {isImage && (
                     <>
                        <button
                           type="button"
                           onClick={zoomOut}
                           disabled={scale <= MIN_SCALE}
                           className="rounded-full p-2 text-white transition-colors hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent"
                           title="Alejar"
                        >
                           <ZoomOutIcon size={20} stroke={2} />
                        </button>
                        <button
                           type="button"
                           onClick={zoomIn}
                           disabled={scale >= MAX_SCALE}
                           className="rounded-full p-2 text-white transition-colors hover:bg-white/15 disabled:opacity-30 disabled:hover:bg-transparent"
                           title="Acercar"
                        >
                           <ZoomInIcon size={20} stroke={2} />
                        </button>
                        <button
                           type="button"
                           onClick={resetView}
                           className="rounded-full p-2 text-white transition-colors hover:bg-white/15"
                           title="Restablecer"
                        >
                           <ZoomResetIcon size={20} stroke={2} />
                        </button>
                        <span className="hidden w-12 text-center text-xs text-white/60 sm:inline">
                           {Math.round(scale * 100)}%
                        </span>
                     </>
                  )}

                  <a
                     href={url}
                     download={fileName}
                     target="_blank"
                     rel="noopener noreferrer"
                     onClick={(e) => e.stopPropagation()}
                     className="rounded-full p-2 text-white transition-colors hover:bg-white/15"
                     title="Descargar"
                  >
                     <DownloadIcon size={20} stroke={2} />
                  </a>
                  <button
                     type="button"
                     onClick={onClose}
                     className="rounded-full p-2 text-white transition-colors hover:bg-white/15"
                     title="Cerrar"
                  >
                     <XIcon size={22} stroke={2} />
                  </button>
               </div>
            </header>

            {/* Contenido multimedia */}
            <div
               className="flex flex-1 items-center justify-center overflow-hidden p-2 sm:p-6"
               onClick={onClose}
               onWheel={handleWheel}
            >
               {isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                     src={url}
                     alt={fileName}
                     draggable={false}
                     onClick={(e) => e.stopPropagation()}
                     onPointerDown={handlePointerDown}
                     onPointerMove={handlePointerMove}
                     onPointerUp={handlePointerUp}
                     onPointerCancel={handlePointerUp}
                     className="max-h-full max-w-full select-none object-contain"
                     style={{
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                        cursor: scale > 1 ? (dragState.current.dragging ? "grabbing" : "grab") : "default",
                        transition: dragState.current.dragging ? "none" : "transform 0.15s ease-out",
                     }}
                  />
               ) : (
                  <video
                     src={url}
                     controls
                     autoPlay
                     onClick={(e) => e.stopPropagation()}
                     className="max-h-full max-w-full rounded-md"
                  />
               )}
            </div>
         </motion.div>
      </AnimatePresence>,
      document.body,
   )
}
