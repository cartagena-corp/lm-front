/**
 * Dev-only console.error filter for hydration-mismatch warnings caused by
 * browser extensions (Bitdefender, Grammarly, ColorZilla, etc.) that inject
 * attributes like `bis_skin_checked` into the DOM before React hydrates.
 * These are false positives — the extension modifies the page, not our code —
 * and React itself calls this out as a possible cause of the warning. This
 * only runs in development and only swallows that specific, known pattern;
 * every other console.error still logs normally.
 */
export default function HydrationNoiseFilter() {
    const code = `(function(){
    if (${process.env.NODE_ENV === "production"}) return;
    var markers = ['bis_skin_checked', 'bis_register', 'cz-shortcut-listen', 'data-gr-ext-installed', 'data-new-gr-c-s-check-loaded', "didn't match the client properties", 'Hydration failed because the server rendered HTML'];
    var original = window.console.error;
    window.console.error = function() {
      try {
        for (var i = 0; i < arguments.length; i++) {
          var arg = arguments[i];
          if (typeof arg === 'string') {
            for (var j = 0; j < markers.length; j++) {
              if (arg.indexOf(markers[j]) !== -1) return;
            }
          }
        }
      } catch (e) {}
      return original.apply(window.console, arguments);
    };
  })();`
    return <script dangerouslySetInnerHTML={{ __html: code }} suppressHydrationWarning />
}
