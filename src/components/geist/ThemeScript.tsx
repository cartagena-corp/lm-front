/**
 * Anti-FOUC theme bootstrap. Runs synchronously in <head> before first paint,
 * reading the same persisted key the ThemeStore uses ("theme-storage"), so the
 * correct data-theme + accent are applied before any CSS is evaluated.
 */
export default function ThemeScript() {
    const code = `(function(){try{
    var raw = localStorage.getItem('theme-storage');
    var s = raw ? (JSON.parse(raw).state || {}) : {};
    var t = s.theme || 'light', a = s.accent || 'blue';
    var root = document.documentElement;
    if (t === 'dark') root.setAttribute('data-theme','dark');
    root.style.setProperty('--accent', a === 'blue' ? 'var(--blue-700)' : 'var(--ds-text)');
    root.style.setProperty('--accent-fg', a === 'blue' ? '#fff' : 'var(--ds-contrast-inverse)');
  }catch(e){}})();`
    return <script dangerouslySetInnerHTML={{ __html: code }} />
}
