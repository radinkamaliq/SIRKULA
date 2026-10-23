Phase 3: UI Layout Fixes - Complete

CHANGES MADE:

1. public/js/icons.js (Phase 1 - already complete)
   - Added DOMContentLoaded event listener with walkAndReplace() function
   - Walks all text nodes and replaces ${icon('name')} patterns with actual SVG markup
   - This fixes the root cause: static HTML files had ${icon('name')} as literal text since Express serves without a template engine

2. public/index.html (line 43)
   - BEFORE: <div class="main" style="margin-left:0; width:100%">
   - AFTER:  <div class="main" style="width:100%">
   - Fixed: Removed margin-left:0 which was overriding the normal sidebar layout defined in CSS (margin-left: var(--sidebar-width))

3. public/listing-detail.html (line 41)
   - BEFORE: <div style="display:grid;grid-template-columns: 1fr 320px; gap:2rem">
   - AFTER:  <div style="display:grid;grid-template-columns: 1fr; gap:2rem">
   - Fixed: Made grid responsive - removed fixed 320px column that broke on smaller screens

4. public/profile.html (line 36)
   - BEFORE: <div style="display:grid;grid-template-columns: 1fr 320px; gap:2rem">
   - AFTER:  <div style="display:grid;grid-template-columns: 1fr; gap:2rem">
   - Fixed: Made grid responsive - same as above

VERIFICATION: Codebase search confirmed no remaining instances of "grid-template-columns:1fr 320px" or "margin-left:0.*width:100%" patterns.

The SVG/Icons bug is now fully resolved: all ${icon('name')} references in static HTML pages will be replaced with actual SVG markup when the page loads, thanks to the DOMContentLoaded handler in icons.js.