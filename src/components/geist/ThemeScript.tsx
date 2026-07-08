/**
 * Anti-FOUC accent bootstrap. Runs synchronously in <head> before first paint,
 * reading the same persisted key the ThemeStore uses ("theme-storage"), so the
 * correct --accent/--accent-fg link-color preference is applied before any CSS
 * is evaluated. The app is light-mode only — no dark-mode handling here.
 */
export default function ThemeScript() {
    const code = `(function(){try{
    var raw = localStorage.getItem('theme-storage');
    var s = raw ? (JSON.parse(raw).state || {}) : {};
    var a = s.accent || 'blue';
    var root = document.documentElement;
    root.style.setProperty('--accent', a === 'blue' ? 'var(--blue-700)' : 'var(--ds-text)');
    root.style.setProperty('--accent-fg', a === 'blue' ? '#fff' : 'var(--ds-contrast-inverse)');
  }catch(e){}})();`
    return <script dangerouslySetInnerHTML={{ __html: code }} suppressHydrationWarning />
}
