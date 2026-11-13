// "預告" (preview): mark, on the CURRENT step, the code the NEXT step will process.
// Works for any animation built from <Line> and <Tok>: we compare each code line's tokens
// in the current render and in an invisible render of the next step.
type Tk = { el: HTMLElement; text: string; state: string };

const toks = (line: Element): Tk[] =>
  Array.from(line.querySelectorAll<HTMLElement>('[data-tok]')).map((el) => ({
    el, text: (el.textContent || '').replace(/\s+/g, ' ').trim(), state: el.dataset.tokState || 'normal',
  }));

// A token is "untouched" by the next step if its text stays and it does not become active/done.
const same = (a: Tk, b: Tk) => a.text === b.text && !(b.state !== a.state && (b.state === 'active' || b.state === 'done'));

export function markPreview(current: HTMLElement, next: HTMLElement): number {
  clearPreview(current);
  const curLines = current.querySelectorAll('[data-line]');
  const nextLines = next.querySelectorAll('[data-line]');
  let marked = 0;
  curLines.forEach((line, i) => {
    const nl = nextLines[i];
    if (!nl) return;
    if ((nl as HTMLElement).dataset.pc === '1') { (line as HTMLElement).dataset.previewLine = '1'; }
    const a = toks(line), b = toks(nl);
    let pre = 0;
    while (pre < a.length && pre < b.length && same(a[pre], b[pre])) pre++;
    let suf = 0;
    while (suf < a.length - pre && suf < b.length - pre && same(a[a.length - 1 - suf], b[b.length - 1 - suf])) suf++;
    for (let k = pre; k < a.length - suf; k++) { a[k].el.dataset.preview = '1'; marked++; }
  });
  return marked;
}

export function clearPreview(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('[data-preview]').forEach((el) => { delete el.dataset.preview; });
  root.querySelectorAll<HTMLElement>('[data-preview-line]').forEach((el) => { delete el.dataset.previewLine; });
}
