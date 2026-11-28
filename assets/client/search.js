import { search } from '../search-core.js';
import { filter } from '../filter-core.js';
import { html } from '../html.js';
import { readState, rootUrl, writeState } from './state.js';
import { restoreFilters, selectedFilters, updateFacets } from './filters.js';
const form = document.querySelector('#search-filters');
const results = document.querySelector('#search-results');
if (form && results) {
    const query = form.querySelector('input[name="q"]');
    const header = document.querySelector('#header-q');
    const root = rootUrl();
    try {
        const response = await fetch(new URL('catalog.json', root));
        if (!response.ok)
            throw new Error('catalog');
        const items = await response.json();
        let state = readState();
        const restore = () => { state = readState(); query.value = state.q; if (header)
            header.value = state.q; restoreFilters(form, state.filters); };
        restore();
        const render = () => {
            const q = query.value, selected = selectedFilters(form), hits = search(items, q);
            const allowed = new Set(filter(hits.map(h => h.item), selected).map(w => w.work_id));
            const shown = hits.filter(h => allowed.has(h.item.work_id));
            updateFacets(form, hits.map(h => h.item), selected, items);
            const prefix = document.querySelector('meta[name="sfsh-root"]').content;
            results.innerHTML = html `<p>${shown.length}件</p><ol class="work-list">${shown.map(h => html `<li class="work-row"><a href="${prefix}${h.item.url}">${h.item.title}</a><p>${({ book: '書籍', novel: '小説', manga: '漫画', anime: 'アニメ', film: '映画', drama: 'ドラマ', game: 'ゲーム', other: 'その他' })[h.item.medium]} · ${h.item.coverage_label}</p>${h.alias ? html `<p>『${q}』に一致</p>` : null}</li>`)}</ol>${shown.length ? null : html `<p>一致する作品がありません。<a href="${prefix}works/">作品索引</a>・<a href="${prefix}genres/">ジャンル一覧</a>から探せます。</p>`}`.__raw;
            state = { ...state, q, filters: selected };
            writeState(state);
            if (header)
                header.value = q;
        };
        form.addEventListener('input', render);
        form.addEventListener('change', render);
        form.addEventListener('submit', event => { event.preventDefault(); render(); });
        form.querySelector('#clear-filters')?.addEventListener('click', () => { restoreFilters(form, {}); render(); });
        if (header) {
            header.addEventListener('input', () => { query.value = header.value; render(); });
            header.form?.addEventListener('submit', event => { event.preventDefault(); query.value = header.value; render(); });
        }
        window.addEventListener('popstate', () => { restore(); render(); });
        render();
    }
    catch {
        results.innerHTML = html `<p>検索データを読み込めませんでした。<a href="../works/">作品索引</a>から探せます。</p>`.__raw;
    }
}
