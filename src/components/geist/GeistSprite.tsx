import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Inlines the Geist icon sprite once into the document so any
 * `<svg><use href="#geist-..."/></svg>` resolves app-wide. Read at module
 * scope so the file is only loaded once per server process. SSR-safe — the
 * symbols are present in the initial HTML, so there is no icon flash.
 */
let sprite = ''
try {
    sprite = readFileSync(join(process.cwd(), 'public', 'geist-icons.svg'), 'utf8')
} catch {
    sprite = ''
}

export default function GeistSprite() {
    if (!sprite) return null
    return <div aria-hidden suppressHydrationWarning dangerouslySetInnerHTML={{ __html: sprite }} />
}
