const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export function esc(v) {
    return String(v ?? "").replace(/[&<>"']/g, (c) => ESC[c]);
}
export function raw(s) {
    return { __raw: s };
}
function isRaw(v) {
    return typeof v === "object" && v !== null && typeof v.__raw === "string";
}
function part(v) {
    if (v === null || v === undefined || v === false)
        return "";
    if (Array.isArray(v))
        return v.map(part).join("");
    if (isRaw(v))
        return v.__raw;
    return esc(v);
}
/** html`<p>${text}</p>` → Raw (escaped). Nest freely: html results are Raw. */
export function html(strings, ...values) {
    let out = strings[0];
    for (let i = 0; i < values.length; i++)
        out += part(values[i]) + strings[i + 1];
    return { __raw: out };
}
export function toString(r) {
    return r.__raw;
}
