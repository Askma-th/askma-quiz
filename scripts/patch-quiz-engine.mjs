import fs from 'fs';

const p = 'src/components/QuizEngine.astro';
let s = fs.readFileSync(p, 'utf8');

// Remove duplicate :root block
s = s.replace(
  /:root \{[^}]+\}\s*:root \{[^}]+\}/,
  `:root {
    --accent: #FFD600;
    --bg: #0a0a14;
    --card: #1a1a28;
    --border: #2a2a3a;
    --text: #ffffff;
    --text-muted: #a0a0b8;
  }`
);

// Replace progress CSS block
s = s.replace(
  /\/\* --- QUESTION SCREEN --- \*\/\s*\.progress-wrap \{[\s\S]*?\.btn-back:hover \{[\s\S]*?\}/,
  `/* --- QUESTION SCREEN --- */
  .ambient-wrap {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  .ambient-piece {
    position: absolute;
    font-size: var(--sz);
    opacity: 0;
    animation: floatAmbient var(--dur) ease-in-out var(--delay) infinite;
    user-select: none;
    filter: blur(0.3px);
  }

  @keyframes floatAmbient {
    0%, 100% { opacity: var(--op); transform: translateY(0) rotate(var(--r1)); }
    50% { opacity: calc(var(--op) * 1.3); transform: translateY(var(--travel)) rotate(var(--r2)); }
  }

  .screen { position: relative; z-index: 1; }

  .progress-wrap { width: 100%; margin-bottom: 1rem; padding: 0 4px; }

  .progress-track {
    position: relative;
    width: 100%;
    height: 5px;
    background: var(--border);
    border-radius: 3px;
    overflow: visible;
  }

  .progress-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 3px;
    transition: width 0.45s cubic-bezier(0.4, 0, 0.2, 1);
    width: 0%;
  }

  .progress-animal {
    position: absolute;
    top: 50%;
    left: 0%;
    transform: translate(-50%, -50%);
    font-size: 1.15rem;
    transition: left 0.45s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
    animation: animalBounce 0.5s ease-out;
    line-height: 1;
  }

  @keyframes animalBounce {
    0% { transform: translate(-50%, -65%) scale(1.4); }
    60% { transform: translate(-50%, -35%) scale(0.9); }
    100% { transform: translate(-50%, -50%) scale(1); }
  }

  .q-counter {
    text-align: center;
    color: var(--text-muted);
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    margin: 0 0 0.75rem;
  }

  .btn-back {
    background: none;
    border: 1px solid var(--border);
    color: var(--text-muted);
    border-radius: 10px;
    padding: 8px 16px;
    font-size: 0.85rem;
    cursor: pointer;
    margin-bottom: 1.5rem;
    font-family: 'IBM Plex Sans Thai', sans-serif;
    transition: border-color 0.15s, color 0.15s;
  }

  .btn-back:hover {
    border-color: var(--text-muted);
    color: var(--text);
  }`
);

// Replace q-card and option styles
s = s.replace(
  /\.q-card \{[\s\S]*?\.option-btn\.selected \{[\s\S]*?font-weight: 600;\s*\}/,
  `.q-card {
    background: var(--card);
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--border);
    margin-bottom: 1.25rem;
  }

  .q-image-zone {
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #0d1a0d, #1a2a1a);
  }

  .q-image-zone .iz-emoji {
    position: absolute;
    line-height: 1;
    user-select: none;
    pointer-events: none;
  }

  .q-body { padding: 14px 16px 18px; }

  .q-num {
    color: var(--text-muted);
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 6px;
  }

  .q-text {
    color: var(--text);
    font-size: 1.05rem;
    font-weight: 600;
    line-height: 1.5;
    margin: 0;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .options-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .option-btn {
    width: 100%;
    padding: 13px 16px;
    background: #12121f;
    border: 1.5px solid var(--border);
    border-radius: 12px;
    color: var(--text);
    font-size: 0.92rem;
    line-height: 1.5;
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: border-color 0.15s, transform 0.1s, box-shadow 0.15s, background 0.15s;
    font-family: 'IBM Plex Sans Thai', sans-serif;
    opacity: 0;
    transform: translateY(10px);
  }

  .option-btn:hover:not(.selected) {
    border-color: rgba(255, 214, 0, 0.35);
    transform: translateX(3px);
    background: rgba(255,255,255,0.02);
  }

  .option-btn:active { transform: scale(0.98); }

  .option-label {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #1e1e30;
    border: 1.5px solid #3a3a50;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: var(--text-muted);
    flex-shrink: 0;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }

  .option-btn.selected {
    border-color: var(--accent);
    background: rgba(255, 214, 0, 0.07);
    box-shadow: 0 0 0 3px rgba(255, 214, 0, 0.12);
  }

  .option-btn.selected .option-label {
    background: rgba(255, 214, 0, 0.2);
    border-color: var(--accent);
    color: var(--accent);
  }`
);

// Add result reveal CSS before @media
if (!s.includes('result-reveal-sequence')) {
  s = s.replace(
    '@media (min-width: 600px)',
    `.result-reveal-sequence > * {
    opacity: 0;
    transform: translateY(14px);
    transition: opacity 0.38s ease, transform 0.38s ease;
  }
  .result-reveal-sequence.revealed > *:nth-child(1) { transition-delay: 0.05s; opacity:1; transform:none; }
  .result-reveal-sequence.revealed > *:nth-child(2) { transition-delay: 0.2s;  opacity:1; transform:none; }
  .result-reveal-sequence.revealed > *:nth-child(3) { transition-delay: 0.35s; opacity:1; transform:none; }
  .result-reveal-sequence.revealed > *:nth-child(4) { transition-delay: 0.5s;  opacity:1; transform:none; }
  .result-reveal-sequence.revealed > *:nth-child(5) { transition-delay: 0.62s; opacity:1; transform:none; }
  .result-reveal-sequence.revealed > *:nth-child(6) { transition-delay: 0.74s; opacity:1; transform:none; }
  .result-reveal-sequence.revealed > *:nth-child(7) { transition-delay: 0.86s; opacity:1; transform:none; }
  .result-reveal-sequence.revealed > *:nth-child(8) { transition-delay: 0.98s; opacity:1; transform:none; }
  .result-reveal-sequence.revealed > *:nth-child(9) { transition-delay: 1.1s;  opacity:1; transform:none; }

  @media (min-width: 600px)`
  );
}

// Patch script: theme + ambient + renderQuestion + showResult reveal
const renderFn = `const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

    function renderQuestion(index) {
      const q = quizData.questions[index];
      const total = quizData.questions.length;

      const pct = (index / total) * 100;
      document.getElementById('progress-bar').style.width = pct + '%';
      const animalEl = document.getElementById('progress-animal');
      const animalPct = Math.max(4, Math.min(96, pct));
      animalEl.style.left = animalPct + '%';
      const themeEmoji = quizData.emoji || '⭐';
      animalEl.textContent = themeEmoji;
      animalEl.style.animation = 'none';
      animalEl.offsetHeight;
      animalEl.style.animation = 'animalBounce 0.5s ease-out';

      document.getElementById('q-counter').textContent = index + 1 + ' / ' + total;
      document.getElementById('q-num').textContent = 'คำถามที่ ' + (index + 1);
      const btnBack = document.getElementById('btn-back');
      if (index === 0) btnBack.classList.add('hidden');
      else btnBack.classList.remove('hidden');

      const imageZone = document.getElementById('q-image-zone');
      const izEmojis = (quizData.theme && quizData.theme.imageZoneEmojis) || [quizData.emoji];
      imageZone.innerHTML = '';
      if (quizData.theme && quizData.theme.bgGradient) {
        imageZone.style.background = 'linear-gradient(' + quizData.theme.bgGradient + ')';
      }
      const positions = [
        { left: '50%', top: '50%', size: '3.8rem', opacity: '1', rotate: '0deg', transform: 'translate(-50%,-50%)' },
        { left: '12%', top: '50%', size: '2.8rem', opacity: '0.22', rotate: '-15deg', transform: 'translateY(-50%)' },
        { left: '80%', top: '50%', size: '2.8rem', opacity: '0.22', rotate: '12deg', transform: 'translateY(-50%)' },
        { left: '30%', top: '75%', size: '1.8rem', opacity: '0.12', rotate: '-8deg', transform: 'translateY(-50%)' },
        { left: '68%', top: '25%', size: '1.8rem', opacity: '0.12', rotate: '10deg', transform: 'translateY(-50%)' },
      ];
      positions.forEach((pos, i) => {
        const emoji = izEmojis[i % izEmojis.length];
        const span = document.createElement('span');
        span.className = 'iz-emoji';
        span.textContent = emoji;
        span.style.cssText = 'left:' + pos.left + ';top:' + pos.top + ';font-size:' + pos.size + ';opacity:' + pos.opacity + ';transform:' + pos.transform + ' rotate(' + pos.rotate + ');filter:drop-shadow(0 3px 8px rgba(0,0,0,0.5));';
        imageZone.appendChild(span);
      });

      const qCard = document.getElementById('q-card');
      qCard.style.animation = 'none';
      qCard.offsetHeight;
      qCard.style.animation = 'slideIn 0.25s ease-out';
      document.getElementById('q-text').textContent = q.question;

      const list = document.getElementById('options-list');
      list.innerHTML = '';
      q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-btn';
        if (answers[q.id] === i) btn.classList.add('selected');

        const label = document.createElement('span');
        label.className = 'option-label';
        label.textContent = OPTION_LABELS[i] || String(i + 1);

        const text = document.createElement('span');
        text.textContent = opt.text;

        btn.appendChild(label);
        btn.appendChild(text);
        btn.addEventListener('click', () => selectOption(index, i));
        list.appendChild(btn);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            btn.style.transition = 'opacity 0.22s ease ' + (i * 75) + 'ms, transform 0.22s ease ' + (i * 75) + 'ms, border-color 0.15s, box-shadow 0.15s, background 0.15s';
            btn.style.opacity = '1';
            btn.style.transform = 'translateY(0)';
          });
        });
      });
    }`;

s = s.replace(/function renderQuestion\(index\) \{[\s\S]*?\n    \}/, renderFn);

// Theme + ambient after quizData parse
if (!s.includes('setupAmbient')) {
  s = s.replace(
    'const quizData = JSON.parse(dataEl.textContent);',
    `const quizData = JSON.parse(dataEl.textContent);

    const theme = quizData.theme || {};
    const root = document.documentElement;
    if (theme.accentColor) root.style.setProperty('--accent', theme.accentColor);
    if (theme.bgGradient) {
      document.getElementById('quiz-wrap').style.background =
        'linear-gradient(' + theme.bgGradient + ')';
    }

    (function setupAmbient() {
      const wrap = document.getElementById('ambient-wrap');
      const emojis = (quizData.theme && quizData.theme.ambientEmojis) || [];
      if (emojis.length === 0) return;
      const spots = [
        { x:'6%',  y:'12%', sz:'2rem',   op:0.14, dur:'7s',   delay:'0s',    r1:'-10deg', r2:'5deg',   travel:'-16px' },
        { x:'86%', y:'8%',  sz:'1.7rem', op:0.12, dur:'9s',   delay:'1.2s',  r1:'8deg',  r2:'-5deg',  travel:'-20px' },
        { x:'10%', y:'68%', sz:'1.9rem', op:0.13, dur:'8s',   delay:'2.5s',  r1:'-5deg', r2:'10deg',  travel:'-14px' },
        { x:'80%', y:'62%', sz:'1.8rem', op:0.12, dur:'10s',  delay:'0.6s',  r1:'12deg', r2:'-8deg',  travel:'-18px' },
        { x:'44%', y:'4%',  sz:'1.5rem', op:0.10, dur:'6.5s', delay:'3s',    r1:'-8deg', r2:'4deg',   travel:'-12px' },
        { x:'60%', y:'88%', sz:'1.6rem', op:0.10, dur:'11s',  delay:'4s',    r1:'6deg',  r2:'-10deg', travel:'-16px' },
        { x:'22%', y:'88%', sz:'1.4rem', op:0.09, dur:'7.5s', delay:'1.8s',  r1:'-12deg',r2:'6deg',   travel:'-10px' },
      ];
      spots.forEach((spot, i) => {
        const el = document.createElement('span');
        el.className = 'ambient-piece';
        el.textContent = emojis[i % emojis.length];
        el.style.cssText = 'left:' + spot.x + ';top:' + spot.y + ';--sz:' + spot.sz + ';--op:' + spot.op + ';--dur:' + spot.dur + ';--delay:' + spot.delay + ';--r1:' + spot.r1 + ';--r2:' + spot.r2 + ';--travel:' + spot.travel + ';';
        wrap.appendChild(el);
      });
    })();`
  );
}

// showResult personality + reveal
s = s.replace(
  "if (persEl) persEl.textContent = `\"${result.personality}\"`;",
  'if (persEl) persEl.textContent = result.personality;'
);

if (!s.includes("seq.classList.add('revealed')")) {
  s = s.replace(
    "showScreen('screen-result');\n    }",
    `showScreen('screen-result');

      setTimeout(() => {
        const seq = document.querySelector('.result-reveal-sequence');
        if (seq) seq.classList.add('revealed');
      }, 80);
    }`
  );
}

// Restart should reset reveal
s = s.replace(
  `btnRestart.addEventListener('click', () => {
        currentIndex = 0;
        Object.keys(answers).forEach(k => delete answers[k]);
        history.length = 0;
        showScreen('screen-start');
      });`,
  `btnRestart.addEventListener('click', () => {
        currentIndex = 0;
        Object.keys(answers).forEach(k => delete answers[k]);
        history.length = 0;
        const seq = document.querySelector('.result-reveal-sequence');
        if (seq) seq.classList.remove('revealed');
        showScreen('screen-start');
      });`
);

fs.writeFileSync(p, s);
console.log('QuizEngine patched');
