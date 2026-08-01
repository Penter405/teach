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
    currentLessonId = null;
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

    // Prev / Next (stay within module)
    const lessonIdx = module.lessons.findIndex(l => l.id === lessonId);
    const prev = lessonIdx > 0 ? module.lessons[lessonIdx - 1] : null;
    const next = lessonIdx < module.lessons.length - 1 ? module.lessons[lessonIdx + 1] : null;

    mainContent.innerHTML = `
      <section class="lesson-hero">
        <div class="hero-breadcrumb">
          <span class="crumb">${module.icon} ${module.title}</span>
          <span class="crumb-sep">›</span>
          <span class="crumb crumb-active">${lesson.title}</span>
        </div>
        <h1>${lesson.title}</h1>
        <p class="hero-subtitle">${lesson.titleEn}</p>
        ${lesson.pdfPages && lesson.pdfPages.length > 0 ? `<span class="hero-tag">📄 Pages ${lesson.pdfPages.join('–')}</span>` : `<span class="hero-tag">📝 Hand Notes</span>`}
      </section>
      <div class="lesson-body">
        ${bodyHtml}
      </div>
      <div class="lesson-nav-footer">
        <button class="nav-btn nav-btn-prev" ${prev ? `data-lesson="${prev.id}"` : 'disabled'}>
          ← ${prev ? prev.title : ''}
        </button>
        <button class="nav-btn nav-btn-map" data-go-map="true">Go back to map</button>
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

      case 'animation':
        return `<div class="${cls}">${renderAnimation(block)}</div>`;

      case 'list':
        return `<div class="${cls}">${renderList(block)}</div>`;

      case 'quiz':
        return `<div class="${cls}">${renderQuiz(block)}</div>`;

      case 'ai-chat':
        return `<div class="${cls}">${renderAiChat(block, index)}</div>`;

      case 'matching':
        return `<div class="${cls}">${renderMatching(block, index)}</div>`;

      case 'practice':
        return `<div class="${cls} practice-placeholder" style="padding:20px; background:#e0e7ff; color:#3730a3; border-radius:8px; margin-bottom:20px; font-weight:bold;">
                  💻 實作練習: <span style="font-weight:normal">${esc(block.problems?.[0]?.title || '')} (${esc(block.problems?.[0]?.difficulty || '')})</span>
                </div>`;

      default:
        return '';
    }
  }

  // ── Animation / Flow ──
  function renderAnimation(block) {
    const steps = block.steps || [];
    return `
      <div class="animation-flow">
        <div class="animation-steps">
          ${steps.map((step, idx) => `
            <div class="af-step">
              <div class="af-badge">${idx + 1}</div>
              <div class="af-text">${esc(step)}</div>
            </div>
          `).join('')}
        </div>
        ${block.caption ? `<div class="animation-caption">${esc(block.caption)}</div>` : ''}
      </div>`;
  }

  // ── Quiz (Interactive) ──
  function renderQuiz(block) {
    const questions = block.questions || [];
    const quizId = 'quiz-' + Math.random().toString(36).substr(2, 9);
    return `
      <div class="quiz-container" id="${quizId}">
        <div class="quiz-header">🏆 Knowledge Check <span class="quiz-count">${questions.length} 題</span></div>
        ${questions.map((q, qi) => `
          <div class="quiz-question" data-answer="${q.answer}" data-qindex="${qi}">
            <div class="quiz-q-text">${qi + 1}. ${esc(q.question)}</div>
            <div class="quiz-options">
              ${q.options.map((opt, oi) => `
                <button class="quiz-option" data-option="${oi}" onclick="(function(btn){
                  var qEl = btn.closest('.quiz-question');
                  if (qEl.classList.contains('answered')) return;
                  qEl.classList.add('answered');
                  var correct = parseInt(qEl.dataset.answer);
                  var chosen = parseInt(btn.dataset.option);
                  if (chosen === correct) {
                    btn.classList.add('correct');
                  } else {
                    btn.classList.add('wrong');
                    qEl.querySelectorAll('.quiz-option')[correct].classList.add('correct');
                  }
                })(this)">${esc(opt)}</button>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>`;
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
  //  AI Chat Widget (申論題)
  // ═══════════════════════════════════════════════════════
  function renderAiChat(block, index) {
    const chatId = 'ai-chat-' + Math.random().toString(36).substr(2, 9);
    const diffBadge = block.difficulty
      ? `<span class="ai-chat-diff ai-chat-diff-${(block.difficulty || '').toLowerCase()}">${esc(block.difficulty)}</span>`
      : '';

    return `
      <div class="ai-chat-container" id="${chatId}" data-course-prompt="${escAttr(block.coursePrompt || '')}">
        <div class="ai-chat-header">
          <div class="ai-chat-header-left">
            ${diffBadge}
            <div>
              <div class="ai-chat-title">${esc(block.title)}</div>
              ${block.subtitle ? `<div class="ai-chat-subtitle">${esc(block.subtitle)}</div>` : ''}
            </div>
          </div>
          <svg class="ai-chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="28" height="28">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        </div>
        <div class="ai-chat-messages" id="${chatId}-messages">
          <div class="ai-chat-welcome">
            <span class="ai-chat-welcome-icon">🤖</span>
            <span>在下方輸入你的答案，AI 助教會幫你批改！</span>
          </div>
        </div>
        <div class="ai-chat-input-area">
          <textarea class="ai-chat-input" id="${chatId}-input" placeholder="輸入你的答案..." rows="2"></textarea>
          <button class="ai-chat-send" id="${chatId}-send" onclick="(function(btn){
            var container = document.getElementById('${chatId}');
            var input = document.getElementById('${chatId}-input');
            var messagesEl = document.getElementById('${chatId}-messages');
            var prompt = input.value.trim();
            if (!prompt) return;

            // Remove welcome message
            var welcome = messagesEl.querySelector('.ai-chat-welcome');
            if (welcome) welcome.remove();

            // Add user message
            var userMsg = document.createElement('div');
            userMsg.className = 'ai-chat-msg ai-chat-msg-user';
            userMsg.innerHTML = '<div class=\\'ai-chat-msg-bubble\\'>' + prompt.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\\n/g,'<br>') + '</div>';
            messagesEl.appendChild(userMsg);

            input.value = '';
            btn.disabled = true;
            messagesEl.scrollTop = messagesEl.scrollHeight;

            // Add loading indicator
            var loadingMsg = document.createElement('div');
            loadingMsg.className = 'ai-chat-msg ai-chat-msg-ai';
            loadingMsg.innerHTML = '<div class=\\'ai-chat-msg-bubble ai-chat-loading\\'><span class=\\'dot-typing\\'></span></div>';
            messagesEl.appendChild(loadingMsg);
            messagesEl.scrollTop = messagesEl.scrollHeight;

            // Call API
            var coursePrompt = container.dataset.coursePrompt || '';
            fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: prompt, coursePrompt: coursePrompt })
            })
            .then(function(r){ return r.json(); })
            .then(function(data){
              loadingMsg.remove();
              var aiMsg = document.createElement('div');
              aiMsg.className = 'ai-chat-msg ai-chat-msg-ai';
              var text = (data.text || data.message || '抱歉，目前無法取得回覆。').replace(/</g,'&lt;').replace(/>/g,'&gt;');
              // Simple markdown: **bold**, \\n, backtick code
              text = text.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
              text = text.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
              text = text.replace(/\\n/g, '<br>');
              aiMsg.innerHTML = '<div class=\\'ai-chat-msg-avatar\\'>🤖</div><div class=\\'ai-chat-msg-bubble\\'>' + text + '</div>';
              messagesEl.appendChild(aiMsg);
              messagesEl.scrollTop = messagesEl.scrollHeight;
            })
            .catch(function(err){
              loadingMsg.remove();
              var errMsg = document.createElement('div');
              errMsg.className = 'ai-chat-msg ai-chat-msg-ai';
              errMsg.innerHTML = '<div class=\\'ai-chat-msg-avatar\\'>⚠️</div><div class=\\'ai-chat-msg-bubble\\'>連線失敗，請稍後再試。</div>';
              messagesEl.appendChild(errMsg);
            })
            .finally(function(){ btn.disabled = false; });
          })(this)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="20" height="20">
              <path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2"/>
            </svg>
          </button>
        </div>
      </div>`;
  }

  // ═══════════════════════════════════════════════════════
  //  Matching Exercise (連連看)
  // ═══════════════════════════════════════════════════════
  function renderMatching(block, index) {
    const matchId = 'match-' + Math.random().toString(36).substr(2, 9);
    const items = block.items || [];
    const categories = block.categories || [];
    const diffBadge = block.difficulty
      ? `<span class="matching-diff matching-diff-${(block.difficulty || '').toLowerCase()}">${esc(block.difficulty)}</span>`
      : '';

    // Shuffle items for display (Fisher-Yates)
    const shuffled = items.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return `
      <div class="matching-container" id="${matchId}"
           data-answers='${JSON.stringify(items.map(it => ({id: it.id, category: it.category})))}'
           data-state='{}'>
        <div class="matching-header">
          <div class="matching-header-left">
            ${diffBadge}
            <div>
              <div class="matching-title">${esc(block.title)}</div>
              ${block.subtitle ? `<div class="matching-subtitle">${esc(block.subtitle)}</div>` : ''}
            </div>
          </div>
          <span class="matching-tag">🔗 連連看</span>
        </div>
        <div class="matching-board">
          <div class="matching-items">
            ${shuffled.map(item => `
              <button class="matching-item" data-item-id="${item.id}" onclick="(function(btn){
                var container = btn.closest('.matching-container');
                var allItems = container.querySelectorAll('.matching-item');
                // toggle selection
                if (btn.classList.contains('selected')) {
                  btn.classList.remove('selected');
                  return;
                }
                allItems.forEach(function(b){ b.classList.remove('selected'); });
                btn.classList.add('selected');
              })(this)">
                <code>${esc(item.text)}</code>
              </button>
            `).join('')}
          </div>
          <div class="matching-arrows" id="${matchId}-arrows">
            <!-- Connection indicators rendered dynamically -->
          </div>
          <div class="matching-categories">
            ${categories.map(cat => `
              <button class="matching-category" data-category="${cat}" onclick="(function(catBtn){
                var container = catBtn.closest('.matching-container');
                var selectedItem = container.querySelector('.matching-item.selected');
                if (!selectedItem) return;

                var itemId = selectedItem.dataset.itemId;
                var cat = catBtn.dataset.category;
                var state = JSON.parse(container.dataset.state || '{}');

                // Remove previous assignment of this item
                state[itemId] = cat;
                container.dataset.state = JSON.stringify(state);

                // Update visual
                selectedItem.classList.remove('selected');
                selectedItem.classList.add('connected');
                selectedItem.dataset.assignedCategory = cat;

                // Show connection tag on item
                var tag = selectedItem.querySelector('.matching-conn-tag');
                if (!tag) {
                  tag = document.createElement('span');
                  tag.className = 'matching-conn-tag';
                  selectedItem.appendChild(tag);
                }
                tag.textContent = cat;

                // Update category badge count
                var allAssigned = Object.values(state).filter(function(v){ return v === cat; }).length;
                var badge = catBtn.querySelector('.matching-cat-count');
                if (badge) badge.textContent = allAssigned;

                // Update arrows area
                var arrowsEl = document.getElementById('${matchId}-arrows');
                var total = container.querySelectorAll('.matching-item').length;
                var connected = Object.keys(state).length;
                arrowsEl.innerHTML = '<div class=\"matching-progress\">' + connected + ' / ' + total + '</div>';
              })(this)">
                <span class="matching-cat-icon">${cat === 'Function' ? '⚡' : cat === 'Method' ? '🔧' : '➕'}</span>
                <span class="matching-cat-label">${esc(cat)}</span>
                <span class="matching-cat-count">0</span>
              </button>
            `).join('')}
          </div>
        </div>
        <div class="matching-actions">
          <button class="matching-check-btn" onclick="(function(btn){
            var container = btn.closest('.matching-container');
            var state = JSON.parse(container.dataset.state || '{}');
            var answers = JSON.parse(container.dataset.answers || '[]');
            var correct = 0;
            var total = answers.length;

            answers.forEach(function(ans){
              var itemEl = container.querySelector('.matching-item[data-item-id=\\'' + ans.id + '\\']');
              if (!itemEl) return;
              if (state[ans.id] === ans.category) {
                correct++;
                itemEl.classList.remove('wrong');
                itemEl.classList.add('correct');
              } else if (state[ans.id]) {
                itemEl.classList.remove('correct');
                itemEl.classList.add('wrong');
              }
            });

            var resultEl = container.querySelector('.matching-result');
            if (!resultEl) {
              resultEl = document.createElement('div');
              resultEl.className = 'matching-result';
              container.querySelector('.matching-actions').appendChild(resultEl);
            }

            if (correct === total) {
              resultEl.className = 'matching-result matching-result-pass';
              resultEl.innerHTML = '🎉 全部正確！太厲害了！ (' + correct + '/' + total + ')';
            } else {
              resultEl.className = 'matching-result matching-result-fail';
              resultEl.innerHTML = '💪 答對 ' + correct + '/' + total + ' 題，紅色的再想想看！';
            }
          })(this)">
            ✓ 檢查答案
          </button>
          <button class="matching-reset-btn" onclick="(function(btn){
            var container = btn.closest('.matching-container');
            container.dataset.state = '{}';
            container.querySelectorAll('.matching-item').forEach(function(el){
              el.classList.remove('connected','selected','correct','wrong');
              el.removeAttribute('data-assigned-category');
              var tag = el.querySelector('.matching-conn-tag');
              if (tag) tag.remove();
            });
            container.querySelectorAll('.matching-cat-count').forEach(function(el){ el.textContent = '0'; });
            var arrowsEl = container.querySelector('.matching-arrows');
            if (arrowsEl) arrowsEl.innerHTML = '';
            var result = container.querySelector('.matching-result');
            if (result) result.remove();
          })(this)">
            ↺ 重新作答
          </button>
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

      const backToMap = e.target.closest('[data-go-map]');
      if (backToMap) {
        document.querySelectorAll('.nav-lesson').forEach(el => el.classList.remove('active'));
        renderWelcome();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
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

  // Escape for use inside HTML attribute values (also escapes quotes)
  function escAttr(str) {
    return esc(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ── Go ──
  document.addEventListener('DOMContentLoaded', init);
})();
