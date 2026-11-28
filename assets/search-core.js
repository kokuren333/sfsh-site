export function normalize(text) {
    return text.normalize('NFKC').toLowerCase().replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60)).replace(/[\s\p{P}\p{S}ー]/gu, '');
}
export function readingGroup(item) {
    const c = normalize(item.title_reading || item.title)[0] || '';
    const rows = ['あいうえおぁぃぅぇぉ', 'かきくけこがぎぐげご', 'さしすせそざじずぜぞ', 'たちつてとだぢづでどっ', 'なにぬねの', 'はひふへほばびぶべぼぱぴぷぺぽ', 'まみむめも', 'やゆよゃゅょ', 'らりるれろ', 'わをんゎ'];
    const n = rows.findIndex(row => row.includes(c) && c !== '');
    return n >= 0 ? 'あかさたなはまやらわ'[n] : /[a-z]/.test(c) ? 'A–Z' : /[0-9]/.test(c) ? '0–9' : 'その他';
}
const groups = ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ', 'A–Z', '0–9', 'その他'];
export function compareReading(a, b) {
    return groups.indexOf(readingGroup(a)) - groups.indexOf(readingGroup(b)) || normalize(a.title_reading || a.title).localeCompare(normalize(b.title_reading || b.title), 'ja') || a.work_id.localeCompare(b.work_id, 'en');
}
/** Sellers' approximate substring DP: a free text prefix, edit cost at most one. */
export function editDistance1Substring(query, text) {
    const q = Array.from(query), t = Array.from(text);
    let prev = q.map((_, i) => i + 1);
    prev.unshift(0);
    for (const c of t) {
        const next = [0];
        for (let i = 1; i <= q.length; i++)
            next[i] = Math.min(prev[i] + 1, next[i - 1] + 1, prev[i - 1] + (q[i - 1] === c ? 0 : 1));
        if (next[q.length] <= 1)
            return true;
        prev = next;
    }
    return q.length <= 1;
}
export function rank(item, query) {
    const q = normalize(query);
    if (!q)
        return 0;
    const title = normalize(item.title), aliases = item.aliases.map(normalize);
    if (title === q)
        return 0;
    if (title.startsWith(q))
        return 1;
    if (title.includes(q))
        return 2;
    if (aliases.includes(q))
        return 3;
    if (aliases.some(a => a.includes(q)))
        return 4;
    if ([item.title_reading, item.title_original].some(t => t && normalize(t).includes(q)))
        return 5;
    if (item.creators.some(t => normalize(t).includes(q)))
        return 6;
    if (Array.from(q).length >= 4 && [title, ...aliases].some(t => editDistance1Substring(q, t)))
        return 7;
    return null;
}
export function search(items, query) {
    return items.flatMap(item => { const r = rank(item, query); return r === null ? [] : [{ item, rank: r, alias: r === 3 || r === 4 || (r === 7 && !editDistance1Substring(normalize(query), normalize(item.title))) }]; }).sort((a, b) => a.rank - b.rank || compareReading(a.item, b.item));
}
