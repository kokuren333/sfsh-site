/**
 * Phase state for figures A and C (WP-2.3). Progressive enhancement only: the phase switch itself works
 * without JS (radio inputs + CSS :has()). This module
 *  - restores the phase from `?phase=<id>` on load (and on bfcache restore),
 *  - writes the selected phase back to `?phase=` (history.replaceState, no reload, other params kept),
 *  - keeps every figure on the page on the same phase,
 *  - marks `.fig-c__scroll` with data-overflow="yes|no" so the "scroll →" cue only shows when needed.
 * Width changes / rotation never re-render anything (layouts switch by CSS), so the checked radio — and
 * therefore the phase — survives resize by construction.
 * Plain ES module, DOM only, no imports.
 */
const RADIO = "input.fig-phase-radio";
function radios() {
    return Array.from(document.querySelectorAll(RADIO));
}
function select(phase) {
    let hit = false;
    for (const r of radios()) {
        if (r.value === phase) {
            r.checked = true;
            hit = true;
        }
    }
    return hit;
}
function restore() {
    const want = new URL(window.location.href).searchParams.get("phase");
    if (want !== null)
        select(want);
}
function remember(phase) {
    const url = new URL(window.location.href);
    if (url.searchParams.get("phase") === phase)
        return;
    url.searchParams.set("phase", phase);
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
}
function markOverflow() {
    for (const el of Array.from(document.querySelectorAll(".fig-c__scroll"))) {
        el.dataset["overflow"] = el.scrollWidth > el.clientWidth + 1 ? "yes" : "no";
    }
}
function init() {
    restore();
    document.addEventListener("change", (ev) => {
        const t = ev.target;
        if (t instanceof HTMLInputElement && t.matches(RADIO) && t.checked) {
            select(t.value);
            remember(t.value);
        }
        if (t instanceof HTMLInputElement && t.type === "checkbox")
            markOverflow();
    });
    window.addEventListener("pageshow", restore);
    window.addEventListener("resize", markOverflow);
    markOverflow();
}
if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
else
    init();
export {};
