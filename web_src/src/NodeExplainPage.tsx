import { motion } from 'motion/react';
import { ChevronRight, GitBranch, BookOpen } from 'lucide-react';
import { nodeExplanations, codeTree, getCategoryColor, TreeNode } from './codeTreeData';
import { AIChat } from './AIChat';

// ── Helper: find node in tree ──
function findNode(root: TreeNode, id: string): TreeNode | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

// ── Helper: get breadcrumb path ──
function getPath(root: TreeNode, targetId: string, path: TreeNode[] = []): TreeNode[] | null {
  if (root.id === targetId) return [...path, root];
  for (const child of root.children) {
    const result = getPath(child, targetId, [...path, root]);
    if (result) return result;
  }
  return null;
}

// ── Related Nodes (siblings + children) ──
function getRelatedNodes(root: TreeNode, nodeId: string): { siblings: TreeNode[]; children: TreeNode[] } {
  const node = findNode(root, nodeId);
  const children = node?.children ?? [];
  
  // Find parent to get siblings
  const path = getPath(root, nodeId) ?? [];
  const parent = path.length >= 2 ? path[path.length - 2] : null;
  const siblings = parent ? parent.children.filter(c => c.id !== nodeId) : [];

  return { siblings, children };
}

export function NodeExplainPage({
  nodeId,
  onBack,
  onNodeClick,
}: {
  nodeId: string;
  onBack: () => void;
  onNodeClick: (id: string) => void;
}) {
  const explanation = nodeExplanations[nodeId];
  const node = findNode(codeTree, nodeId);
  const breadcrumb = getPath(codeTree, nodeId) ?? [];
  const { siblings, children } = getRelatedNodes(codeTree, nodeId);
  const colors = node ? getCategoryColor(node.category) : getCategoryColor('leaf');

  if (!explanation || !node) {
    return (
      <div className="h-screen bg-surface dark:bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500">Node not found.</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-surface dark:bg-slate-950 flex flex-col transition-colors duration-500 overflow-hidden">
      {/* Header */}
      <nav className="w-full flex-shrink-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center px-3 sm:px-4 md:px-6 py-2 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
          <button
            onClick={onBack}
            className="flex items-center gap-1 sm:gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-xs sm:text-sm font-semibold uppercase tracking-wider"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 rotate-180" />
            <span className="hidden sm:inline">Back to Tree</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-cyan-600 dark:text-cyan-400">
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-headline font-bold text-xs sm:text-sm tracking-tight">Node Detail</span>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 lg:px-12">
          
          {/* Breadcrumb */}
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-slate-400 dark:text-slate-500 mb-6 sm:mb-8 flex-wrap"
          >
            {breadcrumb.map((crumb, i) => (
              <span key={crumb.id} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3 h-3 opacity-40" />}
                <button 
                  onClick={() => onNodeClick(crumb.id)}
                  className={`font-medium transition-colors ${
                    crumb.id === nodeId 
                      ? 'text-cyan-600 dark:text-cyan-400 font-bold' 
                      : 'hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {crumb.label}
                </button>
              </span>
            ))}
          </motion.div>

          {/* Title Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 md:p-10 mb-8 sm:mb-10 border-2 ${colors.border} ${colors.borderDark} ${colors.bg} ${colors.bgDark} relative overflow-hidden`}
          >
            {node.category === 'root' && (
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-500 opacity-90" />
            )}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <GitBranch className={`w-6 h-6 ${node.category === 'root' ? 'text-white' : `${colors.text} ${colors.textDark}`}`} />
                <span className={`text-xs font-bold uppercase tracking-[0.2em] ${node.category === 'root' ? 'text-white/70' : `${colors.text} ${colors.textDark} opacity-60`}`}>
                  {node.category}
                </span>
              </div>
              <h1 className={`font-headline text-2xl sm:text-4xl md:text-5xl font-bold mb-2 tracking-tight ${node.category === 'root' ? 'text-white' : `${colors.text} ${colors.textDark}`}`}>
                {explanation.title}
              </h1>
              <p className={`text-base sm:text-xl font-medium ${node.category === 'root' ? 'text-white/80' : `${colors.text} ${colors.textDark} opacity-70`}`}>
                {explanation.titleZh}
              </p>
            </div>
          </motion.div>

          {/* Brief */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-8 p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
          >
            <p className="text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              💡 {explanation.brief}
            </p>
          </motion.div>

          {/* Full Explanation */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-12"
          >
            <h2 className="font-headline text-2xl font-bold text-slate-800 dark:text-white mb-6 tracking-tight">
              詳細說明
            </h2>
            <div className="bg-white dark:bg-slate-900/60 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-slate-200 dark:border-slate-800">
              {explanation.fullExplanation.split('\n\n').map((paragraph, i) => {
                // Check if it looks like code
                const isCode = paragraph.includes('def ') || paragraph.includes('import ') || 
                               (paragraph.includes('=') && paragraph.includes('(')) ||
                               paragraph.startsWith('for ') || paragraph.startsWith('if ') ||
                               paragraph.startsWith('while ');
                
                if (isCode || paragraph.match(/^[a-zA-Z_]+\s*[=(]/m)) {
                  // Check if it's mixed text+code
                  const lines = paragraph.split('\n');
                  const codeLines = lines.filter(l => 
                    l.match(/^[a-zA-Z_].*[=(:]/) || l.startsWith('    ') || l.startsWith('#') || l.match(/^\s*"""/)
                  );
                  
                  if (codeLines.length > lines.length / 2) {
                    return (
                      <pre key={i} className="my-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-sm font-mono text-tertiary dark:text-purple-300 overflow-x-auto border border-slate-200 dark:border-slate-700 leading-relaxed">
                        {paragraph}
                      </pre>
                    );
                  }
                }

                return (
                  <p key={i} className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4 text-[15px]">
                    {paragraph.split('\n').map((line, j) => (
                      <span key={j}>
                        {line}
                        {j < paragraph.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                );
              })}
            </div>
          </motion.div>

          {/* Related Nodes */}
          {(children.length > 0 || siblings.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-12"
            >
              {children.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-headline text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 tracking-tight">
                    子節點 Children
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {children.map(child => {
                      const c = getCategoryColor(child.category);
                      return (
                        <button
                          key={child.id}
                          onClick={() => onNodeClick(child.id)}
                          className={`text-left p-4 rounded-xl border-2 ${c.border} ${c.borderDark} ${c.bg} ${c.bgDark} hover:scale-[1.02] active:scale-[0.98] transition-all`}
                        >
                          <span className={`font-headline font-bold text-sm ${c.text} ${c.textDark}`}>{child.label}</span>
                          <span className={`block text-xs mt-1 ${c.text} ${c.textDark} opacity-60`}>{child.labelZh}</span>
                          <span className={`block text-xs mt-2 ${c.text} ${c.textDark} opacity-50`}>{child.brief}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {siblings.length > 0 && (
                <div>
                  <h3 className="font-headline text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 tracking-tight">
                    同層節點 Siblings
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {siblings.map(sib => {
                      const c = getCategoryColor(sib.category);
                      return (
                        <button
                          key={sib.id}
                          onClick={() => onNodeClick(sib.id)}
                          className={`text-left p-4 rounded-xl border-2 ${c.border} ${c.borderDark} ${c.bg} ${c.bgDark} hover:scale-[1.02] active:scale-[0.98] transition-all`}
                        >
                          <span className={`font-headline font-bold text-sm ${c.text} ${c.textDark}`}>{sib.label}</span>
                          <span className={`block text-xs mt-1 ${c.text} ${c.textDark} opacity-60`}>{sib.labelZh}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* AI Chat */}
          <div className="mb-12">
            <AIChat 
              title={`AI 助教 - ${node.label}`}
              coursePrompt={`當前探討 Python 語法樹的節點：\n名稱：${node.label} (${node.labelZh})\n類型：${node.category}\n簡介：${explanation.brief}\n請針對此節點內容協助學生，回答問題時請保持友善並引導學生思考。`}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
