import { axes, facets } from '../filter-core.js';
export function selectedFilters(form) {
    // Disabled, checked zero-count options still form part of the URL selection.
    const inputs = [...form.querySelectorAll('input[type="checkbox"]')];
    return Object.fromEntries(axes.map(axis => [axis, inputs.filter(i => i.name === axis && i.checked).map(i => i.value)]));
}
export function restoreFilters(form, selected) {
    for (const input of form.querySelectorAll('input[type="checkbox"]'))
        input.checked = !!selected[input.name]?.includes(input.value);
}
export function updateFacets(form, results, selected, universe) {
    const counts = facets(results, selected, universe);
    for (const axis of axes)
        for (const option of counts[axis]) {
            const input = [...form.querySelectorAll('input[type="checkbox"]')].find(i => i.name === axis && i.value === option.value);
            if (input)
                input.disabled = option.disabled;
            const count = [...form.querySelectorAll('[data-count]')].find(n => n.dataset.count === axis + ':' + option.value);
            if (count)
                count.textContent = String(option.count);
        }
}
