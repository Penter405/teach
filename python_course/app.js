/* ═══════════════════════════════════════════════════════
   PythonClassPenter — Application Logic
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── State ──
  let courseData = null;
  let currentLessonId = null;
  let flatLessons = []; // ordered list for prev/next nav

  // ── DOM refs ──
  const sidebar      = document.getElementById('sidebar');
  const sidebarNav   = document.getElementById('sidebar-nav');
  const sidebarToggle= document.getElementById('sidebar-toggle');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const mainContent  = document.getElementById('main-content');
  const explorerBubble = document.getElementById('explorer-bubble');

  // ── Init ──
  async function init() {
    try {
      const res = await fetch('data.json');
      courseData = await res.json();
      buildFlatLessons();
      renderSidebar();
      renderWelcome();
      bindEvents();
      showExplorerTip('👋 歡迎！點選左側選單開始學習吧 ✨');
    } catch (err) {
      mainContent.innerHTML = `<div class="welcome-screen"><p style="color:var(--error)">載入失敗: ${err.message}</p></div>`;
    }
  }

  function buildFlatLessons() {
    flatLessons = [];
    courseData.modules.forEach(mod => {
      mod.lessons.forEach(les => {
        flatLessons.push({ moduleId: mod.id, ...les });
      });
    });
  }

  // ═══════════════════════════════════════════════════════
  //  Sidebar
  // ═══════════════════════════════════════════════════════
  function renderSidebar() {
    let html = '';
    courseData.modules.forEach((mod, idx) => {
      html += `
        <div class="nav-module${idx === 0 ? ' expanded' : ''}" data-module="${mod.id}">
          <div class="nav-module-header" data-module-toggle="${mod.id}">
            <span class="nav-module-icon">${mod.icon}</span>
            <span class="nav-module-title">${mod.title}</span>
            <svg class="nav-module-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M6 4l4 4-4 4"/>
            </svg>
          </div>
          <div class="nav-lessons">
            ${mod.lessons.map(les => `
              <div class="nav-lesson" data-lesson="${les.id}">
                ${les.title}
              </div>
            `).join('')}
          </div>
        </div>`;
    });
    sidebarNav.innerHTML = html;
  }

  // ═══════════════════════════════════════════════════════
  //  Welcome Screen
  // ═══════════════════════════════════════════════════════
  function renderWelcome() {
    const { course, modules } = courseData;
    mainContent.innerHTML = `
      <div class="welcome-screen">
        <div class="welcome-icon">🐍</div>
        <h1 class="welcome-title">${course.title}</h1>
        <p class="welcome-subtitle">${course.subtitle}。從基礎概念到物件導向，系統性地掌握 Python 程式設計。</p>
        <div class="welcome-modules">
          ${modules.map(mod => `
            <div class="welcome-module-card" data-goto-module="${mod.id}">
              <div class="wmc-icon">${mod.icon}</div>
              <div class="wmc-title">${mod.title}</div>
              <div class="wmc-count">${mod.lessons.length} 課</div>
            </div>
          `).join('')}
        </div>
      </div>`;
  }

  // ═══════════════════════════════════════════════════════
  //  Render Lesson
  // ═══════════════════════════════════════════════════════
  function renderLesson(lessonId) {
    currentLessonId = lessonId;

    // Find lesson & module
    let lesson = null, module = null;
    for (const mod of courseData.modules) {
      const found = mod.lessons.find(l => l.id === lessonId);
      if (found) { lesson = found; module = mod; break; }
    }
    if (!lesson) return;

    // Update sidebar active
    document.querySelectorAll('.nav-lesson').forEach(el => el.classList.remove('active'));
    const activeEl = document.querySelector(`.nav-lesson[data-lesson="${lessonId}"]`);
    if (activeEl) {
      activeEl.classList.add('active');
      // Expand parent module
      const parentMod = activeEl.closest('.nav-module');
      if (parentMod && !parentMod.classList.contains('expanded')) {
        parentMod.classList.add('expanded');
      }
    }

    // Build content HTML
    let bodyHtml = '';
    lesson.content.forEach((block, i) => {
      bodyHtml += renderContentBlock(block, i);
    });

    // Prev / Next
    const idx = flatLessons.findIndex(l => l.id === lessonId);
    const prev = idx > 0 ? flatLessons[idx - 1] : null;
    const next = idx < flatLessons.length - 1 ? flatLessons[idx + 1] : null;

    mainContent.innerHTML = `
      <section class="lesson-hero">
        <div class="hero-breadcrumb">
          <span class="crumb">${module.icon} ${module.title}</span>
          <span class="crumb-sep">›</span>
          <span class="crumb crumb-active">${lesson.title}</span>
        </div>
        <h1>${lesson.title}</h1>
        <p class="hero-subtitle">${lesson.titleEn}</p>
        <span class="hero-tag">📄 Pages ${lesson.pdfPages.join('–')}</span>
      </section>
      <div class="lesson-body">
        ${bodyHtml}
      </div>
      <div class="lesson-nav-footer">
        <button class="nav-btn nav-btn-prev" ${prev ? `data-lesson="${prev.id}"` : 'disabled'}>
          ← ${prev ? prev.title : ''}
        </button>
        <button class="nav-btn nav-btn-next" ${next ? `data-lesson="${next.id}"` : 'disabled'}>
          ${next ? next.title : ''} →
        </button>
      </div>`;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close sidebar on mobile
    if (window.innerWidth <= 1024) {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('visible');
    }

    // Explorer tip
    const tips = [
      '💡 試著在腦中跑一遍程式碼！',
      '🧪 打開 Python REPL 動手試試！',
      '📝 把重點抄下來更容易記住喔',
      '🔗 這些概念之後會互相連結',
      '🎯 理解比背誦更重要！',
    ];
    showExplorerTip(tips[Math.floor(Math.random() * tips.length)]);
  }

  // ═══════════════════════════════════════════════════════
  //  Content Block Renderer
  // ═══════════════════════════════════════════════════════
  function renderContentBlock(block, index) {
    const cls = `content-block`;
    switch (block.type) {
      case 'heading':
        return `<div class="${cls}"><h2>${esc(block.text)}</h2></div>`;

      case 'paragraph':
        return `<div class="${cls}"><p>${esc(block.text)}</p></div>`;

      case 'code':
        return `<div class="${cls}">${renderCodeBlock(block)}</div>`;

      case 'callout':
        return `<div class="${cls}">${renderCallout(block)}</div>`;

      case 'diagram':
        return `<div class="${cls}">${renderDiagram(block)}</div>`;

      case 'list':
        return `<div class="${cls}">${renderList(block)}</div>`;

      case 'animation':
        return `<div class="${cls} animation-placeholder" style="padding:20px; background:#e0f2fe; color:#0369a1; border-radius:8px; margin-bottom:20px; font-weight:bold;">
                  🎬 動畫/互動預留區: <span style="font-weight:normal">${esc(block.caption || block.animationId)}</span>
                </div>`;

      case 'quiz':
        return `<div class="${cls} quiz-placeholder" style="padding:20px; background:#fef3c7; color:#b45309; border-radius:8px; margin-bottom:20px; font-weight:bold;">
                  🏆 小測驗 (Knowledge Check): <span style="font-weight:normal">共 ${block.questions?.length || 0} 題</span>
                </div>`;

      case 'practice':
        return `<div class="${cls} practice-placeholder" style="padding:20px; background:#e0e7ff; color:#3730a3; border-radius:8px; margin-bottom:20px; font-weight:bold;">
                  💻 實作練習: <span style="font-weight:normal">${esc(block.problems?.[0]?.title || '')} (${esc(block.problems?.[0]?.difficulty || '')})</span>
                </div>`;

      default:
        return '';
    }
  }

  // ── Code Block ──
  function renderCodeBlock(block) {
    const highlighted = highlightPython(block.code);
    return `
      <div class="code-block-wrapper">
        <div class="code-block-header">
          <span class="code-lang-tag">${block.language || 'python'}</span>
          <div class="code-dots"><span></span><span></span><span></span></div>
        </div>
        <div class="code-block-body">
          <pre>${highlighted}</pre>
        </div>
      </div>`;
  }

  // Simple Python syntax highlighter
  function highlightPython(code) {
    let html = esc(code);

    // Comments
    html = html.replace(/(#.*)$/gm, '<span class="cm">$1</span>');

    // Strings (double and single quotes)
    html = html.replace(/(&quot;.*?&quot;|&#x27;.*?&#x27;|".*?"|'.*?')/g, '<span class="st">$1</span>');
    // Also handle f-strings
    html = html.replace(/f(<span class="st">)/g, '<span class="fn">f</span>$1');

    // Keywords
    const keywords = ['def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'import', 'from', 'as', 'True', 'False', 'None', 'and', 'or', 'not', 'is', 'break', 'continue', 'pass', 'try', 'except', 'finally', 'with', 'yield', 'lambda', 'self'];
    keywords.forEach(kw => {
      const re = new RegExp(`\\b(${kw})\\b`, 'g');
      html = html.replace(re, (match, p1, offset, str) => {
        // Don't replace within already-tagged spans
        const before = str.substring(Math.max(0, offset - 30), offset);
        if (before.includes('class="')) return match;
        return `<span class="kw">${p1}</span>`;
      });
    });

    // Built-in functions
    const builtins = ['print', 'input', 'len', 'range', 'int', 'str', 'float', 'bool', 'list', 'dict', 'tuple', 'type', 'sum', 'max', 'min', 'enumerate', 'append', 'split', 'get', 'keys'];
    builtins.forEach(fn => {
      const re = new RegExp(`\\b(${fn})(?=\\()`, 'g');
      html = html.replace(re, (match, p1, offset, str) => {
        const before = str.substring(Math.max(0, offset - 30), offset);
        if (before.includes('class="')) return match;
        return `<span class="fn">${p1}</span>`;
      });
    });

    // Numbers
    html = html.replace(/\b(\d+\.?\d*)\b/g, (match, p1, offset, str) => {
      const before = str.substring(Math.max(0, offset - 30), offset);
      if (before.includes('class="')) return match;
      return `<span class="nb">${p1}</span>`;
    });

    return html;
  }

  // ── Callout ──
  function renderCallout(block) {
    const labelLower = (block.label || '').toLowerCase();
    let variant = 'info';
    if (['重要', '注意', '小心', 'important', 'warning'].some(k => labelLower.includes(k))) variant = 'warn';
    if (['比喻', '記住', '記住', 'tip', '練習'].some(k => labelLower.includes(k))) variant = 'tip';

    return `
      <div class="callout-card callout-${variant}">
        <div class="callout-label">${esc(block.label)}</div>
        <div class="callout-text">${esc(block.text)}</div>
      </div>`;
  }

  // ── List ──
  function renderList(block) {
    if (block.style === 'definition') {
      return `<ul class="def-list">${block.items.map(item =>
        `<li class="def-item">
          <span class="def-term">${esc(item.term)}</span>
          <span class="def-definition">${esc(item.definition)}</span>
        </li>`
      ).join('')}</ul>`;
    }
    // Directory style
    return `<ul class="dir-list">${block.items.map(item =>
      `<li class="dir-item">${esc(typeof item === 'string' ? item : item.text || '')}</li>`
    ).join('')}</ul>`;
  }

  // ═══════════════════════════════════════════════════════
  //  Interactive Diagrams
  // ═══════════════════════════════════════════════════════
  function renderDiagram(block) {
    const id = block.diagramId;
    let inner = '';

    switch (id) {
      case 'course-structure-timeline':
        inner = renderTimeline();
        break;
      case 'input-process-output':
        inner = renderIPO();
        break;
      case 'interpreter-vs-compiler':
        inner = renderIVC();
        break;
      case 'class-object-flow':
        inner = renderClassObjectFlow();
        break;
      case 'cpu-ram-cycle':
        inner = renderCPURamCycle();
        break;
      case 'variable-memory-map':
        inner = renderVariableMemoryMap();
        break;
      case 'python-code-types':
        inner = renderPythonCodeTypes();
        break;
      case 'class-blueprint':
        inner = renderClassBlueprint();
        break;
      default:
        inner = `<p style="text-align:center;color:var(--on-surface-variant)">📊 ${esc(block.caption || id)}</p>`;
    }

    return `
      <div class="diagram-container">
        ${inner}
        ${block.caption ? `<div class="diagram-caption">${esc(block.caption)}</div>` : ''}
      </div>`;
  }

  // ── Timeline ──
  function renderTimeline() {
    return `
      <div class="timeline-diagram">
        <div class="timeline-segment">
          <div class="timeline-label">總則</div>
          <div class="timeline-dot" style="background:var(--secondary)"></div>
          <div class="timeline-desc">全面介紹</div>
        </div>
        <div class="timeline-line"></div>
        <div class="timeline-segment">
          <div class="timeline-label">分則</div>
          <div class="timeline-dot" style="background:var(--tertiary)"></div>
          <div class="timeline-desc">特定分析</div>
        </div>
        <div class="timeline-line"></div>
        <div class="timeline-segment">
          <div class="timeline-label" style="opacity:0.5">time →</div>
          <div class="timeline-dot" style="background:var(--outline-variant)"></div>
          <div class="timeline-desc"></div>
        </div>
      </div>`;
  }

  // ── Input → Process → Output ──
  function renderIPO() {
    return `
      <div class="ipo-diagram">
        <div class="ipo-node node-input">
          <span class="node-icon">📥</span>
          <span class="node-label">Input</span>
        </div>
        <div class="ipo-arrow">→</div>
        <div class="ipo-node node-process">
          <span class="node-icon">💻</span>
          <span class="node-label">Process</span>
          <span class="node-binary">11010110</span>
        </div>
        <div class="ipo-arrow">→</div>
        <div class="ipo-node node-output">
          <span class="node-icon">📤</span>
          <span class="node-label">Output</span>
        </div>
      </div>`;
  }

  // ── Interpreter vs Compiler ──
  function renderIVC() {
    return `
      <div class="ivc-diagram">
        <div class="ivc-panel panel-interpreter">
          <div class="panel-badge">✅</div>
          <div class="panel-title">直譯器 Interpreter</div>
          <div class="panel-subtitle">Python 使用</div>
          <div class="panel-code">a = 5\nprint(a)</div>
          <div class="panel-desc">從頭看，從頭寫<br>逐行執行，立即回饋</div>
        </div>
        <div class="ivc-panel panel-compiler">
          <div class="panel-badge">❌</div>
          <div class="panel-title">編譯器 Compiler</div>
          <div class="panel-subtitle">C# 使用</div>
          <div class="panel-code">main()\nprint(a)\na = 5</div>
          <div class="panel-desc">先看過一遍再從某個地方開始<br>速度快：只要 50ms</div>
        </div>
      </div>`;
  }

  // ── Class → Object Flow ──
  function renderClassObjectFlow() {
    return `
      <div class="cof-diagram">
        <div class="cof-box box-class">
          <div class="box-title">Class</div>
          <div class="box-desc">藍圖 / 論文</div>
        </div>
        <div class="cof-arrow-wrap">
          <span class="cof-arrow-line">→</span>
          <span class="cof-arrow-label">實例化</span>
        </div>
        <div class="cof-box box-object">
          <div class="box-title">Object</div>
          <div class="box-desc">實作 / 實體</div>
        </div>
      </div>`;
  }

  // ── CPU / RAM Cycle ──
  function renderCPURamCycle() {
    return `
      <div class="crc-diagram">
        <div class="crc-node node-programmer">
          <div class="crc-icon">👨‍💻</div>
          <div class="crc-title">Programmer</div>
          <div class="crc-desc">寫 Code</div>
        </div>
        <div class="crc-node node-ram">
          <div class="crc-icon">🧠</div>
          <div class="crc-title">RAM</div>
          <div class="crc-desc">暫存資料 & 指令</div>
        </div>
        <div class="crc-node node-cpu">
          <div class="crc-icon">⚙️</div>
          <div class="crc-title">CPU</div>
          <div class="crc-desc">處理 & 執行</div>
        </div>
      </div>`;
  }

  // ── Variable → Memory Map ──
  function renderVariableMemoryMap() {
    const rows = [
      { name: 'a', addr: '0x7f3a01', value: '5' },
      { name: 'b', addr: '0x7f3a01', value: '5' },
      { name: 'a', addr: '0x7f3a09', value: '10' },
    ];
    return `
      <div class="vmm-diagram">
        ${rows.map((r, i) => `
          <div class="vmm-row" style="animation-delay:${i * 120}ms">
            <span class="vmm-name">${r.name}</span>
            <span class="vmm-arrow">→</span>
            <span class="vmm-addr">${r.addr}</span>
            <span class="vmm-arrow">→</span>
            <span class="vmm-value">${r.value}</span>
          </div>
        `).join('')}
      </div>`;
  }

  // ── Python Code Types ──
  function renderPythonCodeTypes() {
    return `
      <div class="pct-diagram">
        <div class="pct-root">Python Code</div>
        <div class="pct-branches">
          <div class="pct-branch branch-normal">
            <div class="branch-title">普通</div>
            <div class="branch-items">function 函式<br>class → object</div>
          </div>
          <div class="pct-branch branch-special">
            <div class="branch-title">特別</div>
            <div class="branch-items">if / else 條件<br>for / while 迴圈</div>
          </div>
        </div>
      </div>`;
  }

  // ── Class Blueprint ──
  function renderClassBlueprint() {
    return `
      <div class="cbp-diagram">
        <div class="cbp-blueprint">
          <div class="bp-title">Class（藍圖）</div>
          <div class="bp-items">
            <div class="bp-item">__init__(self, ...)</div>
            <div class="bp-item">method(self, ...)</div>
            <div class="bp-item">self.property = ...</div>
          </div>
        </div>
        <div class="cbp-down-arrow">↓</div>
        <div class="cbp-object">
          <div class="obj-title">Object（實體）</div>
          <div class="obj-desc">my_obj = ClassName()</div>
        </div>
      </div>`;
  }

  // ═══════════════════════════════════════════════════════
  //  Explorer Tips
  // ═══════════════════════════════════════════════════════
  function showExplorerTip(text) {
    if (!explorerBubble) return;
    explorerBubble.textContent = text;
    const explorer = explorerBubble.closest('.explorer');
    if (explorer) {
      explorer.classList.add('show-tip');
      setTimeout(() => explorer.classList.remove('show-tip'), 5000);
    }
  }

  // ═══════════════════════════════════════════════════════
  //  Events
  // ═══════════════════════════════════════════════════════
  function bindEvents() {
    // Module header toggle
    sidebarNav.addEventListener('click', e => {
      const toggle = e.target.closest('[data-module-toggle]');
      if (toggle) {
        const moduleEl = toggle.closest('.nav-module');
        moduleEl.classList.toggle('expanded');
        return;
      }

      const lessonEl = e.target.closest('[data-lesson]');
      if (lessonEl) {
        renderLesson(lessonEl.dataset.lesson);
      }
    });

    // Welcome module cards
    mainContent.addEventListener('click', e => {
      const card = e.target.closest('[data-goto-module]');
      if (card) {
        const modId = card.dataset.gotoModule;
        const mod = courseData.modules.find(m => m.id === modId);
        if (mod && mod.lessons.length > 0) {
          // Expand sidebar module
          document.querySelectorAll('.nav-module').forEach(el => {
            if (el.dataset.module === modId) el.classList.add('expanded');
          });
          renderLesson(mod.lessons[0].id);
        }
      }

      // Prev / Next buttons
      const navBtn = e.target.closest('[data-lesson]');
      if (navBtn) {
        renderLesson(navBtn.dataset.lesson);
      }
    });

    // Sidebar toggle (mobile)
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('visible');
      });
    }

    // Overlay click closes sidebar
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('visible');
      });
    }

    // Explorer avatar click
    const avatar = document.getElementById('explorer-avatar');
    if (avatar) {
      avatar.addEventListener('click', () => {
        const tips = [
          '🐍 Python 的 = 是賦值，== 是比較喔！',
          '💡 range(5) 是 0~4，不包含 5',
          '🧱 class 是藍圖，object 是成品',
          '📦 list 的 index 從 0 開始',
          '🔄 while True 記得加 break！',
          '✨ self 代表物件自己',
          '🎯 寫程式前先拆解需求',
        ];
        showExplorerTip(tips[Math.floor(Math.random() * tips.length)]);
      });
    }
  }

  // ── Helpers ──
  function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Go ──
  document.addEventListener('DOMContentLoaded', init);
})();
