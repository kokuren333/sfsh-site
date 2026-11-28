import { parseState, stateParams } from '../filter-core.js';
export const readState = () => parseState(new URLSearchParams(location.search));
export function writeState(state) {
    const params = stateParams(state).toString();
    history.replaceState(null, '', location.pathname + (params ? '?' + params : '') + location.hash);
}
export function rootUrl() {
    return new URL(document.querySelector('meta[name="sfsh-root"]')?.content || './', location.href);
}
