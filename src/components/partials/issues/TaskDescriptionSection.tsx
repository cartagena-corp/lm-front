'use client'

import { TaskProps } from '@/lib/types/types'
import { Download } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import SafeHtml from '@/components/ui/SafeHtml'

interface TaskDescriptionSectionProps {
   task: TaskProps
}

export default function TaskDescriptionSection({ task }: TaskDescriptionSectionProps) {
   return (
      <div>
         <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--ds-text)" }}>Descripción</h3>

         {task.descriptions.length > 0 ? (
            <div className="space-y-4">
               {task.descriptions.map((desc, id) => (
                  <div key={id} className="space-y-1">
                     {desc.title && (
                        <h4 className="font-medium text-xs" style={{ color: "var(--ds-text-secondary)" }}>{desc.title}</h4>
                     )}
                     <SafeHtml
                        html={desc.text}
                        className="text-sm leading-relaxed text-[var(--ds-text)] [&_code]:font-mono [&_code]:bg-[var(--gray-alpha-200)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs"
                     />
                     {desc.attachments && desc.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                           {desc.attachments.map((file) => {
                              const fileSplitted = file.fileName.split(".")
                              const extension = fileSplitted[fileSplitted.length - 1]
                              const isImage = ["jpg", "png", "jpeg", "gif", "bmp", "webp"].includes(extension.toLowerCase())
                              const url = file.fileUrl

                              return (
                                 <div key={file.id} className="rounded-md overflow-hidden transition-all border border-[var(--ds-border)] hover:border-[var(--blue-400)] hover:shadow-[var(--shadow-md)]">
                                    {isImage && url ? (
                                       <Link href={url} target="_blank">
                                          <div className="w-16 h-16 relative">
                                             <Image
                                                src={url}
                                                alt={file.fileName}
                                                fill
                                                className="object-cover hover:scale-105 transition-transform"
                                                unoptimized
                                             />
                                          </div>
                                       </Link>
                                    ) : (
                                       <Link
                                          href={url}
                                          target="_blank"
                                          className="flex items-center gap-2 p-3 min-w-0 hover:bg-[var(--gray-alpha-100)] transition-colors"
                                       >
                                          <div className="flex-shrink-0">
                                             <Download size={16} strokeWidth={2} />
                                          </div>
                                          <span className="text-xs truncate text-[var(--ds-text-secondary)]">
                                             {file.fileName}
                                          </span>
                                       </Link>
                                    )}
                                 </div>
                              )
                           })}
                        </div>
                     )}
                  </div>
               ))}
            </div>
         ) : (
            <p className="text-sm" style={{ color: "var(--ds-text-muted)" }}>No hay descripción disponible</p>
         )}
      </div>
   )
}
