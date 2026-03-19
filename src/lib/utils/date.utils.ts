export const formatDate = (fecha: string | null) => {
    if (!fecha) return "No definida"
    else {
        const [year, month, day] = fecha.split('T')[0].split('-')
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))

        const dayFormatted = dateObj.getDate().toString().padStart(2, '0')
        const monthFormatted = dateObj
            .toLocaleString('es-ES', { month: 'short' })
            .replace('.', '')
            .toLowerCase()

        const yearFormatted = dateObj.getFullYear()
        return `${dayFormatted} ${monthFormatted} ${yearFormatted}`
    }
}