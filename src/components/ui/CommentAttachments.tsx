import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play } from "lucide-react"
import MediaViewerModal, { MediaType } from "./MediaViewerModal"

interface Attachment {
   id?: string
   fileName: string
   fileUrl: string
}

interface Props {
   attachments: Attachment[]
}

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg", "avif"]
const VIDEO_EXTENSIONS = ["mp4", "webm", "ogg", "mov", "mkv", "avi", "m4v"]

const getExtension = (fileName: string) => fileName.split(".").pop()?.toLowerCase() ?? ""

const getMediaType = (fileName: string): MediaType | null => {
   const ext = getExtension(fileName)
   if (IMAGE_EXTENSIONS.includes(ext)) return "image"
   if (VIDEO_EXTENSIONS.includes(ext)) return "video"
   return null
}

// Etiqueta + color del badge según el tipo de archivo
const getFileTypeBadge = (fileName: string): { label: string; className: string } => {
   const ext = getExtension(fileName)
   const map: Record<string, { label: string; className: string }> = {
      pdf: { label: "PDF", className: "bg-[var(--red-100)] text-[var(--red-900)]" },
      doc: { label: "DOC", className: "bg-[var(--blue-100)] text-[var(--blue-900)]" },
      docx: { label: "DOC", className: "bg-[var(--blue-100)] text-[var(--blue-900)]" },
      xls: { label: "XLS", className: "bg-[var(--green-100)] text-[var(--green-900)]" },
      xlsx: { label: "XLS", className: "bg-[var(--green-100)] text-[var(--green-900)]" },
      csv: { label: "CSV", className: "bg-[var(--green-100)] text-[var(--green-900)]" },
      ppt: { label: "PPT", className: "bg-[var(--amber-100)] text-[var(--amber-900)]" },
      pptx: { label: "PPT", className: "bg-[var(--amber-100)] text-[var(--amber-900)]" },
      txt: { label: "TXT", className: "bg-[var(--gray-alpha-100)] text-[var(--ds-text-secondary)]" },
      zip: { label: "ZIP", className: "bg-[var(--amber-100)] text-[var(--amber-900)]" },
      rar: { label: "RAR", className: "bg-[var(--amber-100)] text-[var(--amber-900)]" },
      "7z": { label: "7Z", className: "bg-[var(--amber-100)] text-[var(--amber-900)]" },
   }
   return map[ext] ?? { label: ext ? ext.slice(0, 4).toUpperCase() : "FILE", className: "bg-[var(--gray-alpha-100)] text-[var(--ds-text-secondary)]" }
}

export default function CommentAttachments({ attachments }: Props) {
   const [preview, setPreview] = useState<{ url: string; fileName: string; type: MediaType } | null>(null)

   if (!attachments || attachments.length === 0) return null

   return (
      <>
         <div className="flex flex-wrap gap-2">
            {attachments.map((file, idx) => {
               const url = file.fileUrl
               const mediaType = getMediaType(file.fileName)

               if (mediaType && url) {
                  return (
                     <button
                        key={file.id ?? idx}
                        type="button"
                        onClick={() => setPreview({ url, fileName: file.fileName, type: mediaType })}
                        className="group relative h-16 w-16 overflow-hidden rounded-lg border border-[var(--ds-border)] transition-all hover:border-[var(--blue-400)] hover:shadow-[var(--shadow-md)]"
                        title={file.fileName}
                     >
                        {mediaType === "image" ? (
                           <Image
                              src={url}
                              alt={file.fileName}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                              unoptimized
                           />
                        ) : (
                           <>
                              <video
                                 // #t=0.1 fuerza al navegador a renderizar el primer fotograma como miniatura
                                 src={`${url}#t=0.1`}
                                 preload="metadata"
                                 muted
                                 playsInline
                                 className="h-full w-full object-cover"
                              />
                              <span className="absolute inset-0 flex items-center justify-center bg-[var(--gray-alpha-600)] text-[var(--ds-contrast-inverse)] transition-colors group-hover:bg-[var(--gray-alpha-700)]">
                                 <Play size={22} strokeWidth={1.5} fill="currentColor" />
                              </span>
                           </>
                        )}
                     </button>
                  )
               }

               const badge = getFileTypeBadge(file.fileName)

               return (
                  <div
                     key={file.id ?? idx}
                     className="overflow-hidden rounded-lg border border-[var(--ds-border)] transition-all hover:border-[var(--blue-400)] hover:shadow-[var(--shadow-md)]"
                  >
                     <Link
                        href={url}
                        target="_blank"
                        download={file.fileName}
                        className="flex min-w-0 max-w-[200px] items-center gap-2 p-2 transition-colors hover:bg-[var(--gray-alpha-100)]"
                        title={file.fileName}
                     >
                        <span
                           className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${badge.className}`}
                        >
                           {badge.label}
                        </span>
                        <span className="truncate text-xs text-[var(--ds-text-secondary)]">{file.fileName}</span>
                     </Link>
                  </div>
               )
            })}
         </div>

         {preview && (
            <MediaViewerModal
               url={preview.url}
               fileName={preview.fileName}
               type={preview.type}
               onClose={() => setPreview(null)}
            />
         )}
      </>
   )
}
