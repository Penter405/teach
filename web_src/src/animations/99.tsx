// Animation 99: Mo's algorithm 的結構（樹狀圖）— hand-written, not traced.
// One step = one node of the tree; the code below lights up the lines that node is about.
// steps / results in data.json (7 of each) are NOW / POST below: change both together.
import React from 'react';
import { AlgoBoard, Stage, FitWidth, type CellTone } from '../animation_kit/AlgoKit';
import { clampStep, CodePanel, Line, Tok } from '../animation_kit/HardwareKit';
import { toneFill } from '../animation_kit/AlgoHelpers';

export const STEPS = 7;

type Node = { id: number; x: number; y: number; w: number; title: string; sub: string; parent?: number };
// id = the step that explains this node
const NODES: Node[] = [
  { id: 0, x: 380, y: 34, w: 230, title: "Mo's algorithm", sub: '離線：先讀完所有查詢' },
  { id: 1, x: 190, y: 124, w: 260, title: '1. 更改搜尋順序', sub: 'queries.sort(...)', parent: 0 },
  { id: 4, x: 570, y: 124, w: 300, title: '2. 移動 two pointers 到當前搜尋', sub: 'for l, r, idx in queries', parent: 0 },
  { id: 2, x: 100, y: 224, w: 168, title: '主要：left 在第幾塊', sub: 'x[0] // end 由小到大', parent: 1 },
  { id: 3, x: 280, y: 224, w: 168, title: '次要：right', sub: 'x[1] 由小到大', parent: 1 },
  { id: 5, x: 480, y: 224, w: 168, title: '移動 cur_l、cur_r', sub: 'add / remove 更新 d[x]', parent: 4 },
  { id: 6, x: 660, y: 224, w: 168, title: '存答案', sub: 'ans[原本的編號]', parent: 4 },
];
const H = 54;

const NOW = [
  "Mo's algorithm：整個方法只做兩件事",
  '1. 更改搜尋順序：先把查詢排序',
  '主要規則：依 left 在第幾塊（x[0] // end）由小到大',
  '次要規則：同一塊裡依 right（x[1]）由小到大',
  '2. 照排好的順序，一筆一筆處理查詢',
  '把 cur_l、cur_r 一格一格移到這一筆的 [l, r]',
  '兩個指標到位：存答案',
];
const POST = [
  '先決定查詢的順序，再照這個順序移動兩個指標',
  '排序會打亂順序，所以每筆查詢要帶著原本的編號 idx',
  'end ≈ √n：同一塊的查詢，left 最多差 end − 1 格',
  '同一塊裡 right 只往右走一趟；right 由小到大的好處比 left 由小到大多',
  '區間 [cur_l, cur_r] 從上一筆留下來，不用重新數',
  '區間變大 add：d[x] += 1（0 → 1 答案 +1）；變小 remove：d[x] -= 1（1 → 0 答案 −1）',
  'ans[idx] = cur_ans 存回原本的編號，最後依原本的順序輸出',
];

export default function MoStructureAnim({ step }: { step: number }) {
  const s = clampStep(step, STEPS);
  // current node = active, already explained = yes, not yet = normal
  const tone = (id: number): CellTone => (id === s ? 'active' : id < s ? 'yes' : 'normal');
  const byId = (id: number) => NODES.find((n) => n.id === id)!;
  const on = (...ids: number[]) => ids.includes(s);

  return (
    <div className="w-full flex flex-col items-center gap-3 font-sans">
      <AlgoBoard now={NOW[s]} post={POST[s]} wide>
        <Stage title="Mo's algorithm 的結構">
          <FitWidth>
            <svg width={760} height={262} viewBox="0 0 760 262" className="block">
              {NODES.filter((n) => n.parent !== undefined).map((n) => {
                const p = byId(n.parent!);
                const lit = n.id <= s;
                const midY = (p.y + H / 2 + n.y - H / 2) / 2;
                return (
                  <path key={`e${n.id}`} d={`M${p.x},${p.y + H / 2} V${midY} H${n.x} V${n.y - H / 2}`} fill="none"
                    stroke={lit ? toneFill(n.id === s ? 'active' : 'yes')[1] : '#334155'} strokeWidth={lit ? 2.5 : 1.5}
                    className="transition-colors duration-300" />
                );
              })}
              {NODES.map((n) => {
                const [fill, stroke, text] = toneFill(tone(n.id));
                return (
                  <g key={n.id} className="transition-colors duration-300">
                    <rect x={n.x - n.w / 2} y={n.y - H / 2} width={n.w} height={H} rx={10} fill={fill} stroke={stroke} strokeWidth={n.id === s ? 3 : 1.5} />
                    <text x={n.x} y={n.y - 5} textAnchor="middle" fill={text} fontSize={15} fontWeight={700}>{n.title}</text>
                    <text x={n.x} y={n.y + 16} textAnchor="middle" fill={text} fontSize={12} opacity={0.8} fontFamily="ui-monospace, monospace">{n.sub}</text>
                  </g>
                );
              })}
            </svg>
          </FitWidth>
        </Stage>

        <CodePanel title="對應的程式碼">
          <Line pc={on(2)} dim={s < 2}>end = int(n ** 0.5)</Line>
          <Line pc={on(1, 2, 3)} dim={s < 1}>
            queries.sort(key=lambda x: (<Tok s={on(2) ? 'active' : s > 2 ? 'done' : 'normal'}>x[0] // end</Tok>, <Tok s={on(3) ? 'active' : s > 3 ? 'done' : 'normal'}>x[1]</Tok>))
          </Line>
          <Line pc={on(4)} dim={s < 4}>for l, r, idx in queries:</Line>
          <Line pc={on(5)} dim={s < 5}>{'    '}while cur_l &gt; l: ...   <span className="text-slate-400"># 往左變大 → add</span></Line>
          <Line pc={on(5)} dim={s < 5}>{'    '}while cur_r &lt; r: ...   <span className="text-slate-400"># 往右變大 → add</span></Line>
          <Line pc={on(5)} dim={s < 5}>{'    '}while cur_l &lt; l: ...   <span className="text-slate-400"># 左邊縮小 → remove</span></Line>
          <Line pc={on(5)} dim={s < 5}>{'    '}while cur_r &gt; r: ...   <span className="text-slate-400"># 右邊縮小 → remove</span></Line>
          <Line pc={on(6)} dim={s < 6}>{'    '}ans[idx] = cur_ans</Line>
        </CodePanel>
      </AlgoBoard>
    </div>
  );
}

