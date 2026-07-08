export interface DropdownCoords {
   top?: number
   bottom?: number
   left: number
   width: number
   openUpward: boolean
}

/**
 * Calcula dónde debe posicionarse un dropdown portado a document.body (position: fixed)
 * respecto a su trigger. Si no hay espacio suficiente debajo del trigger antes de chocar
 * con el borde inferior del viewport, lo abre hacia arriba (bottom-anchored) en vez de
 * hacia abajo (top-anchored) — igual que el flip de Radix/Floating UI.
 */
export function computeDropdownPosition(
   triggerRect: DOMRect,
   { maxHeight, gap = 4 }: { maxHeight: number, gap?: number }
): DropdownCoords {
   const spaceBelow = window.innerHeight - triggerRect.bottom
   const spaceAbove = triggerRect.top
   const openUpward = spaceBelow < maxHeight + gap && spaceAbove > spaceBelow

   return {
      left: triggerRect.left,
      width: triggerRect.width,
      openUpward,
      ...(openUpward
         ? { bottom: window.innerHeight - triggerRect.top + gap }
         : { top: triggerRect.bottom + gap })
   }
}
