/**
 * Genera un placeholder SVG para avatares de usuario
 * @param size - Tamaño del avatar en píxeles (default: 40)
 * @param name - Nombre del usuario para generar las iniciales (opcional)
 * @returns URL de datos SVG para usar como placeholder
 */
export function generateAvatarPlaceholder(size: number = 40, name?: string): string {
   // Colores de fondo aleatorios para hacer los avatares más distintivos
   const colors = [
      '#3B82F6', // blue-500
      '#10B981', // emerald-500
      '#F59E0B', // amber-500
      '#EF4444', // red-500
      '#8B5CF6', // violet-500
      '#06B6D4', // cyan-500
      '#84CC16', // lime-500
      '#F97316', // orange-500
   ]
   
   // Generar iniciales del nombre
   let initials = '?'
   if (name) {
      const nameParts = name.trim().split(' ')
      if (nameParts.length >= 2) {
         initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      } else if (nameParts.length === 1 && nameParts[0].length > 0) {
         initials = nameParts[0][0].toUpperCase()
      }
   }
   
   // Seleccionar color basado en el nombre para consistencia
   const colorIndex = name ? name.charCodeAt(0) % colors.length : 0
   const backgroundColor = colors[colorIndex]
   
   // Generar SVG
   const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
         <rect width="${size}" height="${size}" fill="${backgroundColor}" rx="${size / 2}"/>
         <text x="50%" y="50%" dy="0.35em" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif" font-size="${size * 0.4}" font-weight="600">${initials}</text>
      </svg>
   `.trim()
   
   // Convertir a data URL
   return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * Obtiene la URL del avatar del usuario o genera un placeholder
 * @param user - Objeto usuario que puede tener la propiedad picture
 * @param size - Tamaño del placeholder (default: 40)
 * @returns URL de la imagen o placeholder SVG
 */
export function getUserAvatar(user: { picture?: string; firstName?: string; lastName?: string; email?: string }, size: number = 40): string {
   if (user.picture) {
      return user.picture
   }
   
   // Generar nombre completo para las iniciales
   const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Usuario'
   
   return generateAvatarPlaceholder(size, fullName)
}
