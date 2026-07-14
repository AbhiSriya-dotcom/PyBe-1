/* ==========================================================================
   PyBe Core Application Engine & Simulator Logic
   ========================================================================== */

// Onboarding Pixel Art Character Renderer Pattern
const snakeArtPattern = [
  '.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.',
  '.','.','.','.','.','b','b','b','b','b','.','.','.','.','.','.',
  '.','.','.','.','b','a','a','b','a','a','b','.','.','.','.','.',
  '.','.','.','.','b','a','b','b','b','a','b','.','.','.','.','.',
  '.','.','.','.','b','a','a','a','a','a','b','.','.','.','.','.',
  '.','.','.','.','.','b','b','b','b','b','.','.','.','.','.','.',
  '.','.','.','b','b','a','a','a','a','a','b','b','.','.','.','.',
  '.','.','b','a','a','b','a','a','a','b','a','a','b','.','.','.',
  '.','.','b','a','a','b','b','a','b','b','a','a','b','.','.','.',
  '.','.','.','b','b','b','a','a','a','b','b','b','.','.','.','.',
  '.','.','.','.','b','a','a','a','a','a','b','.','.','.','.','.',
  '.','.','.','b','a','a','b','b','b','a','a','b','.','.','.','.',
  '.','.','.','b','b','b','.','.','.','b','b','b','.','.','.','.',
  '.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.',
  '.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.',
  '.','.','.','.','.','.','.','.','.','.','.','.','.','.','.','.'
];

function renderPixelArtCharacter(containerId) {
  const charCanvas = document.getElementById(containerId);
  if (!charCanvas) return;
  charCanvas.innerHTML = '';
  snakeArtPattern.forEach(p => {
    const pixel = document.createElement('div');
    pixel.className = 'pixel';
    if (p !== '.') {
      pixel.classList.add(p);
    }
    charCanvas.appendChild(pixel);
  });
}

// --- Global Application State ---
let state = {
  membership: 'Free', // 'Free' or 'Premium'
  tokens: 10,
  completedChallenges: [],
  currentRoute: 'home', // 'home', 'dashboard', 'challenge'
  currentChallengeId: 1,
  username: localStorage.getItem('pybe-username') || '',
  selectedTheme: localStorage.getItem('pybe-theme') || 'general',
  selectedTopics: []
};

// --- Challenges Database ---
const challenges = [
  {
    id: 1,
    chapter: 1,
    title: "Say Hello to the Jungle",
    instructions: `Use the <code>print()</code> function to output exactly the string <code>"Hello, world"</code> to the console.`,
    whyThisMatters: "The <code>print()</code> statement is the fundamental way a programmer inspects values and communicates with user dashboards. Every major software journey starts with standard console output.",
    template: `print("replace me")`,
    targetOutput: "Hello, world",
    errorTips: "Make sure you type exactly <code>print(\"Hello, world\")</code>. Double check quotes and capitalization!"
  },
  {
    id: 2,
    chapter: 1,
    title: "Printing Numbers & Math",
    instructions: `Output the mathematical product of multiplying <code>5</code> by <code>10</code> directly inside a print statement. e.g. <code>print(5 * 10)</code>.`,
    whyThisMatters: "Python evaluates math expressions inside arguments before executing functions. This inline computation is extremely fast and saves storing redundant variables.",
    template: `print()`,
    targetOutput: "50",
    errorTips: "Provide the multiplication formula inside the print parenthesis, e.g. <code>5 * 10</code>. Do not write quotes, otherwise it will print the formula text instead of the math result!"
  },
  {
    id: 3,
    chapter: 2,
    title: "Storing Jungle Fruits",
    instructions: `Create a variable named <code>fruits</code> and set its value to <code>25</code>. On the next line, print the variable's value: <code>print(fruits)</code>.`,
    whyThisMatters: "Variables store data in temporary memory blocks so they can be easily manipulated or referenced repeatedly in long scripts.",
    template: `# Create fruits variable below\n`,
    targetOutput: "25",
    errorTips: "Ensure you assign it exactly: <code>fruits = 25</code>, and then run <code>print(fruits)</code> without wrapping the variable name in quotes."
  },
  {
    id: 4,
    chapter: 2,
    title: "Simple Fruit Adder",
    instructions: `Add two variables: <code>apples = 10</code> and <code>oranges = 15</code>. Store the sum in a variable named <code>total</code>, then print <code>total</code>.`,
    whyThisMatters: "Mathematical addition across memory cells is the mechanical basis of web checkouts, inventory updates, and database calculations.",
    template: `apples = 10\noranges = 15\n# Compute total and print it below\n`,
    targetOutput: "25",
    errorTips: "Write <code>total = apples + oranges</code> and then <code>print(total)</code>. Double check variable spelling!"
  },
  {
    id: 5,
    chapter: 3,
    title: "String Length Check (Premium)",
    instructions: `Count the number of characters in the string <code>"Supercalifragilistic"</code> using the built-in <code>len()</code> function, and output the length using a print statement.`,
    whyThisMatters: "Checking length enables validation parameters, string truncation safeguards, and size indexing boundaries on servers.",
    template: `word = "Supercalifragilistic"\n# Print length here\n`,
    targetOutput: "20",
    errorTips: "Pass the variable or literal string into <code>len()</code> inside your print, like: <code>print(len(word))</code>."
  },
  {
    id: 6,
    chapter: 4,
    title: "Jungle Pack Lists (Premium)",
    instructions: `Initialize a Python list named <code>pack</code> containing standard string items <code>"rope"</code>, <code>"map"</code>, and <code>"canteen"</code>. Print the list to inspect it.`,
    whyThisMatters: "Arrays and list collections group multiple related elements into a single variable index, laying the track for dynamic loop runs.",
    template: `# Create list and print it below\n`,
    targetOutput: "['rope', 'map', 'canteen']",
    errorTips: "Declare list with square brackets: <code>pack = [\"rope\", \"map\", \"canteen\"]</code> and then <code>print(pack)</code>."
  }
];

// --- Simple Python Code Executor (Mock Sandbox Compiler) ---
function executePythonMock(code) {
  let lines = code.split('\n');
  let output = [];
  let scope = {};
  
  try {
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;
      
      // Print handling: print(...)
      if (line.startsWith('print(')) {
        if (!line.endsWith(')')) {
          throw new Error(`SyntaxError: invalid syntax. Missing closing parenthesis ')' on line ${i + 1}`);
        }
        let inner = line.substring(6, line.length - 1).trim();
        
        // Evaluate simple print arguments
        let val = evaluateExpression(inner, scope);
        output.push(val.toString());
        continue;
      }
      
      // Assignment handling: x = y
      if (line.includes('=')) {
        let parts = line.split('=');
        if (parts.length !== 2) {
          throw new Error(`SyntaxError: invalid syntax on line ${i + 1}`);
        }
        let varName = parts[0].trim();
        let expr = parts[1].trim();
        
        // Validate variable name
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
          throw new Error(`NameError: illegal variable name '${varName}' on line ${i + 1}`);
        }
        
        scope[varName] = evaluateExpression(expr, scope);
        continue;
      }
      
      // Unhandled syntax error
      throw new Error(`SyntaxError: Command '${line}' is not supported in the beginner sandbox on line ${i + 1}`);
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
  
  return { success: true, output: output.join('\n') };
}

// Sub-evaluator for simple sandbox math, lists, strings, lengths, variables
function evaluateExpression(expr, scope) {
  expr = expr.trim();
  
  // Literal String checking
  if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
    return expr.slice(1, -1);
  }
  
  // len(...) handler
  if (expr.startsWith('len(') && expr.endsWith(')')) {
    let inner = expr.substring(4, expr.length - 1).trim();
    let val = evaluateExpression(inner, scope);
    if (typeof val === 'string' || Array.isArray(val)) {
      return val.length;
    }
    throw new Error(`TypeError: object of type 'int' has no len()`);
  }
  
  // List checking [a, b, c]
  if (expr.startsWith('[') && expr.endsWith(']')) {
    let inner = expr.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map(item => evaluateExpression(item, scope));
  }
  
  // Math operators handler (e.g. 5 * 10, apples + oranges)
  if (expr.includes('+') || expr.includes('-') || expr.includes('*') || expr.includes('/')) {
    let tokens = expr.split(/(\+|-|\*|\/)/);
    let resolved = tokens.map(tok => {
      let t = tok.trim();
      if (['+', '-', '*', '/'].includes(t)) return t;
      return evaluateExpression(t, scope);
    });
    
    // Evaluate binary expression simply
    let simpleEval = resolved.join('');
    try {
      // Evaluate only safe math numbers
      if (/^[0-9.+\-*/()]+$/.test(simpleEval)) {
        return Function(`"use strict"; return (${simpleEval})`)();
      } else {
        throw new Error();
      }
    } catch(e) {
      throw new Error(`TypeError: Unsupported operand types or invalid calculation format`);
    }
  }
  
  // Number checks
  if (!isNaN(expr) && expr !== '') {
    return Number(expr);
  }
  
  // Variable checks
  if (scope.hasOwnProperty(expr)) {
    return scope[expr];
  }
  
  // NameError
  throw new Error(`NameError: name '${expr}' is not defined`);
}

// Helper to format JS arrays to Python style print outputs
function formatPythonList(val) {
  if (Array.isArray(val)) {
    return '[' + val.map(item => typeof item === 'string' ? `'${item}'` : item).join(', ') + ']';
  }
  return val;
}

// --- App Router & Global Navigation ---
function navigateToRoute() {
  const hash = window.location.hash || '#/home';
  const appContainer = document.getElementById('app-container');
  const globalHeader = document.getElementById('global-header');
  
  // Deactivate all routes
  document.querySelectorAll('.page-route').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  
  if (hash === '#/home' || hash === '#/') {
    state.currentRoute = 'home';
    document.getElementById('route-home').classList.remove('hidden');
    globalHeader.classList.add('hidden');
  } 
  else if (hash === '#/login') {
    state.currentRoute = 'login';
    document.getElementById('route-login').classList.remove('hidden');
    globalHeader.classList.add('hidden');
    renderPixelArtCharacter('onboarding-pixel-canvas');
  }
  else if (hash === '#/assessment') {
    state.currentRoute = 'assessment';
    document.getElementById('route-assessment').classList.remove('hidden');
    globalHeader.classList.add('hidden');
    renderPixelArtCharacter('assessment-pixel-canvas');
  }
  else if (hash === '#/theme-selector') {
    state.currentRoute = 'theme-selector';
    document.getElementById('route-theme-selector').classList.remove('hidden');
    globalHeader.classList.add('hidden');
  }
  else if (hash === '#/dashboard') {
    state.currentRoute = 'dashboard';
    document.getElementById('route-dashboard').classList.remove('hidden');
    globalHeader.classList.remove('hidden');
    document.getElementById('nav-dashboard-link').classList.add('active');
    renderDashboard();
  } 
  else if (hash.startsWith('#/challenge/')) {
    const id = parseInt(hash.split('/').pop());
    
    // Block access if challenge belongs to locked premium chapter
    const chall = challenges.find(c => c.id === id);
    if (chall && chall.chapter >= 3 && state.membership === 'Free') {
      // Prevent route, reset to dashboard hash and trigger upsell overlay
      window.location.hash = '#/dashboard';
      showUpsellModal(chall.chapter);
      return;
    }
    
    state.currentRoute = 'challenge';
    state.currentChallengeId = id || 1;
    document.getElementById('route-challenge').classList.remove('hidden');
    globalHeader.classList.remove('hidden');
    document.getElementById('nav-workspace-link').classList.add('active');
    loadChallengeWorkspace(state.currentChallengeId);
  }
  
  // Update state UI globally
  updateStateUI();
}

// Update Global Nav state counters
function updateStateUI() {
  // Memberships
  const membershipPill = document.getElementById('global-membership-pill');
  const dropdownStatusText = document.getElementById('dropdown-status-text');
  if (state.membership === 'Premium') {
    membershipPill.className = 'status-pill premium-badge premium';
    membershipPill.querySelector('.pill-text').textContent = 'Premium Member';
    dropdownStatusText.textContent = 'Premium Member Account';
  } else {
    membershipPill.className = 'status-pill premium-badge free';
    membershipPill.querySelector('.pill-text').textContent = 'Free Access';
    dropdownStatusText.textContent = 'Free Account';
  }
  
  // Tokens
  const tokenPillText = document.getElementById('global-token-count');
  const sidebarTokenPill = document.getElementById('chat-token-pill-sidebar');
  const statTokensLeft = document.getElementById('stat-tokens-left');
  
  const tokenVal = state.membership === 'Premium' ? '∞' : state.tokens;
  tokenPillText.textContent = `${tokenVal} Tokens`;
  if (sidebarTokenPill) sidebarTokenPill.textContent = tokenVal;
  if (statTokensLeft) statTokensLeft.textContent = `${tokenVal} Tokens Left`;
}

// --- Dashboard Render Controller ---
function renderDashboard() {
  // Update welcome header with user's name
  const welcomeText = document.querySelector('.dashboard-welcome h2');
  if (welcomeText) {
    welcomeText.innerHTML = `Welcome back, <span class="accent-text">${state.username || 'Python Cadet'}</span>! 🚀`;
  }
  
  // Update avatar and headers globally
  const avatar = document.querySelector('.profile-avatar');
  if (avatar && state.username) {
    avatar.textContent = state.username.trim().charAt(0).toUpperCase();
  }

  // Update stat widgets
  const solvedCount = state.completedChallenges.length;
  document.getElementById('stat-challenges-completed').textContent = `${solvedCount} / ${challenges.length} Solved`;
  
  // Calculate completed chapters
  let completedChaps = 0;
  // Chapter 1 progress
  const ch1Total = challenges.filter(c => c.chapter === 1).map(c => c.id);
  const ch1Solved = ch1Total.filter(id => state.completedChallenges.includes(id)).length;
  const ch1Pct = Math.round((ch1Solved / ch1Total.length) * 100);
  document.getElementById('chap-1-progress-pill').textContent = `${ch1Pct}% Complete`;
  if (ch1Pct === 100) completedChaps++;
  
  // Chapter 2 progress
  const ch2Total = challenges.filter(c => c.chapter === 2).map(c => c.id);
  const ch2Solved = ch2Total.filter(id => state.completedChallenges.includes(id)).length;
  const ch2Pct = Math.round((ch2Solved / ch2Total.length) * 100);
  document.getElementById('chap-2-progress-pill').textContent = `${ch2Pct}% Complete`;
  if (ch2Pct === 100) completedChaps++;
  
  // Premium Chapters
  if (state.membership === 'Premium') {
    const ch3Total = challenges.filter(c => c.chapter === 3).map(c => c.id);
    const ch3Solved = ch3Total.filter(id => state.completedChallenges.includes(id)).length;
    const ch3Pct = Math.round((ch3Solved / ch3Total.length) * 100);
    const ch3Card = document.getElementById('chapter-card-3');
    ch3Card.classList.remove('locked');
    ch3Card.classList.add('unlocked');
    const ch3Pill = ch3Card.querySelector('.progress-pill');
    ch3Pill.textContent = `${ch3Pct}% Complete`;
    if (ch3Pct === 100) completedChaps++;
    
    const ch4Total = challenges.filter(c => c.chapter === 4).map(c => c.id);
    const ch4Solved = ch4Total.filter(id => state.completedChallenges.includes(id)).length;
    const ch4Pct = Math.round((ch4Solved / ch4Total.length) * 100);
    const ch4Card = document.getElementById('chapter-card-4');
    ch4Card.classList.remove('locked');
    ch4Card.classList.add('unlocked');
    const ch4Pill = ch4Card.querySelector('.progress-pill');
    ch4Pill.textContent = `${ch4Pct}% Complete`;
    if (ch4Pct === 100) completedChaps++;
  } else {
    // Lock chapter UI
    const ch3Card = document.getElementById('chapter-card-3');
    ch3Card.classList.add('locked');
    ch3Card.classList.remove('unlocked');
    ch3Card.querySelector('.progress-pill').textContent = 'Locked';
    
    const ch4Card = document.getElementById('chapter-card-4');
    ch4Card.classList.add('locked');
    ch4Card.classList.remove('unlocked');
    ch4Card.querySelector('.progress-pill').textContent = 'Locked';
  }
  
  // Progress description text
  document.getElementById('stat-progress-title').textContent = `${completedChaps} Chapters Completed`;
  document.getElementById('carousel-completion-subtitle').textContent = `${completedChaps} of 4 chapters completed`;
}

// --- Workspace Panel Loading ---
function loadChallengeWorkspace(id) {
  const challenge = challenges.find(c => c.id === id);
  if (!challenge) return;
  
  // Header title & Instructions
  document.getElementById('workspace-challenge-header').textContent = `Challenge ${challenge.id}: ${challenge.title}`;
  document.getElementById('workspace-challenge-instructions').innerHTML = challenge.instructions;
  document.getElementById('workspace-challenge-why').innerHTML = challenge.whyThisMatters;
  
  // Setup editor initial value
  const storedCode = localStorage.getItem(`challenge_code_${challenge.id}`);
  document.getElementById('challenge-editor').value = storedCode || challenge.template;
  updateLineNumbers();
  
  // Target Expected console
  document.getElementById('workspace-expected-output').textContent = challenge.targetOutput;
  
  // Clear actual console
  const consoleOut = document.getElementById('workspace-actual-output');
  consoleOut.textContent = '> Ready. Click "Run Python Code" above to check execution output.';
  consoleOut.className = 'output-console terminal-console';
  
  // Generate map menu inside Sidebar
  renderChallengesMenu();
}

function renderChallengesMenu() {
  const container = document.getElementById('challenge-list-container');
  container.innerHTML = '';
  
  challenges.forEach(c => {
    const isPremiumLock = c.chapter >= 3 && state.membership === 'Free';
    const isCompleted = state.completedChallenges.includes(c.id);
    const isActive = state.currentChallengeId === c.id;
    
    const item = document.createElement('div');
    item.className = `challenge-item ${isActive ? 'active' : ''} ${isPremiumLock ? 'locked-item' : ''}`;
    
    // Status text logic
    let statusText = '';
    if (isPremiumLock) statusText = '<span class="challenge-status locked">🔒</span>';
    else if (isCompleted) statusText = '<span class="challenge-status completed">✓</span>';
    
    item.innerHTML = `
      <div class="challenge-label">
        <span class="challenge-num">Chapter ${c.chapter} • Lvl ${c.id}</span>
        <span class="challenge-title">${c.title}</span>
      </div>
      ${statusText}
    `;
    
    item.onclick = () => {
      if (isPremiumLock) {
        showUpsellModal(c.chapter);
      } else {
        window.location.hash = `#/challenge/${c.id}`;
      }
    };
    
    container.appendChild(item);
  });
  
  // Sidebar upgrade teaser box control
  const upgradeBox = document.getElementById('sidebar-upgrade-box');
  if (state.membership === 'Premium') {
    upgradeBox.classList.add('hidden');
  } else {
    upgradeBox.classList.remove('hidden');
  }
}

// --- Textarea Line Numbers sync ---
function updateLineNumbers() {
  const textarea = document.getElementById('challenge-editor');
  const lineNumbers = document.getElementById('editor-line-numbers');
  const lines = textarea.value.split('\n').length;
  
  lineNumbers.innerHTML = '';
  for (let i = 1; i <= Math.max(lines, 1); i++) {
    const num = document.createElement('div');
    num.textContent = i;
    lineNumbers.appendChild(num);
  }
}

// --- AI Chat assistant logic ---
function handleAIChat() {
  const userInput = document.getElementById('chat-user-input');
  const text = userInput.value.trim();
  if (!text) return;
  
  // Spend Token check
  if (state.membership === 'Free' && state.tokens <= 0) {
    appendChatMessage('bot', "⚠️ You have used up all your daily helper tokens. Please upgrade to Premium for unlimited questions!");
    showUpsellModal(3);
    return;
  }
  
  // Spend 1 token
  if (state.membership === 'Free') {
    state.tokens--;
    updateStateUI();
  }
  
  // Append user message
  appendChatMessage('user', text);
  userInput.value = '';
  
  // AI Response generator based on the user's current level & error tips
  const currentChall = challenges.find(c => c.id === state.currentChallengeId);
  const userCode = document.getElementById('challenge-editor').value;
  
  // Simple smart prompt evaluation
  setTimeout(() => {
    let responseText = "";
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('error') || lowerText.includes('syntax') || lowerText.includes('wrong') || lowerText.includes('help')) {
      responseText = `I see your workspace is running code for "${currentChall.title}". Here's a tip: ${currentChall.errorTips} Make sure there are no typos!`;
    } else if (lowerText.includes('answer') || lowerText.includes('code') || lowerText.includes('give me')) {
      responseText = `I cannot write the answer directly for you! But you want to make sure your output matches "${currentChall.targetOutput}". Ensure you use variables or calculations appropriately to output that.`;
    } else {
      responseText = `Good question! In Python, it is important to remember that syntax elements must match exactly. For level ${currentChall.id}, try structure like: <br><code>${currentChall.template}</code>`;
    }
    
    appendChatMessage('bot', responseText);
  }, 600);
}

function appendChatMessage(sender, message) {
  const container = document.getElementById('chat-messages-wrapper');
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender}`;
  msgDiv.innerHTML = `<div class="chat-bubble">${message}</div>`;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

// --- Modal Helper Functions ---
function showUpsellModal(chapterNum) {
  document.getElementById('upsell-chapter-number').textContent = chapterNum;
  document.getElementById('modal-upsell').classList.remove('hidden');
}

function hideUpsellModal() {
  document.getElementById('modal-upsell').classList.add('hidden');
}

function showSuccessModal() {
  document.getElementById('modal-success').classList.remove('hidden');
}

function hideSuccessModal() {
  document.getElementById('modal-success').classList.add('hidden');
}

// --- Interactive Teaser runner on Landing page ---
function runTeaserCode() {
  const indicator = document.getElementById('teaser-success-indicator');
  const termOut = document.getElementById('teaser-output-terminal');
  
  termOut.textContent = '> Running print("Hello, world")...';
  
  setTimeout(() => {
    termOut.textContent = 'Hello, world';
    indicator.textContent = '🎉 Successfully executed statement!';
    indicator.style.color = '#00E676';
    indicator.style.borderLeftColor = '#00E676';
  }, 500);
}

// --- Execution Sandbox trigger ---
function runChallengeCode() {
  const code = document.getElementById('challenge-editor').value;
  const consoleOut = document.getElementById('workspace-actual-output');
  const currentChall = challenges.find(c => c.id === state.currentChallengeId);
  
  consoleOut.textContent = '> Compiling and running scripts...\n';
  consoleOut.className = 'output-console terminal-console';
  
  // Save current code to localStorage
  localStorage.setItem(`challenge_code_${currentChall.id}`, code);
  
  setTimeout(() => {
    const res = executePythonMock(code);
    
    if (!res.success) {
      consoleOut.textContent = res.error;
      consoleOut.classList.add('error');
    } else {
      const formatted = res.output;
      consoleOut.textContent = formatted;
      
      // Match with target
      if (formatted.trim() === currentChall.targetOutput) {
        consoleOut.classList.add('success');
        
        // Add to completed list if not already there
        if (!state.completedChallenges.includes(currentChall.id)) {
          state.completedChallenges.push(currentChall.id);
        }
        
        // Trigger completed modal
        showSuccessModal();
      } else {
        consoleOut.textContent += `\n\n⚠️ Output matches target: False. Expected '${currentChall.targetOutput}' but got '${formatted}'`;
      }
    }
  }, 600);
}

// --- Floating Nodes Network Canvas Animation ---
function initNodeCanvas() {
  const canvas = document.getElementById('node-web-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  
  window.addEventListener('resize', () => {
    if (state.currentRoute === 'home') {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
  });
  
  const particles = [];
  const maxParticles = 45;
  
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.radius = Math.random() * 2 + 1.5;
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#00E676';
      ctx.fill();
    }
  }
  
  for (let i = 0; i < maxParticles; i++) {
    particles.push(new Particle());
  }
  
  function animate() {
    if (state.currentRoute !== 'home') return; // Pause calculation outside home
    
    ctx.clearRect(0, 0, width, height);
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 230, 118, ${0.15 * (1 - dist / 120)})`;
          ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  animate();
}

// --- Initialize Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  // Hash Routing
  window.addEventListener('hashchange', navigateToRoute);
  
  // Profile dropdown menu toggle
  const profileMenuBtn = document.getElementById('profile-menu-btn');
  const profileMenu = document.getElementById('profile-dropdown-menu');
  profileMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    profileMenu.classList.toggle('hidden');
  });
  
  document.addEventListener('click', () => {
    profileMenu.classList.add('hidden');
  });
  
  // Reset session
  document.getElementById('btn-reset-session').addEventListener('click', () => {
    state.completedChallenges = [];
    state.tokens = 10;
    state.membership = 'Free';
    
    // Clear local storage entries
    challenges.forEach(c => localStorage.removeItem(`challenge_code_${c.id}`));
    
    updateStateUI();
    renderDashboard();
    if (state.currentRoute === 'challenge') {
      loadChallengeWorkspace(state.currentChallengeId);
    }
    alert("Session successfully reset to initial states.");
  });

  // Sidebar Upgrade button
  document.getElementById('sidebar-upgrade-btn').addEventListener('click', () => showUpsellModal(3));
  document.getElementById('btn-upgrade-membership').addEventListener('click', () => showUpsellModal(3));

  // Modal actions
  document.getElementById('btn-upsell-cancel').addEventListener('click', hideUpsellModal);
  document.getElementById('btn-upsell-upgrade').addEventListener('click', () => {
    state.membership = 'Premium';
    updateStateUI();
    hideUpsellModal();
    renderDashboard();
    if (state.currentRoute === 'challenge') {
      renderChallengesMenu();
    }
  });

  // Success modal actions
  document.getElementById('btn-success-close').addEventListener('click', hideSuccessModal);
  document.getElementById('btn-success-next').addEventListener('click', () => {
    hideSuccessModal();
    const nextId = state.currentChallengeId + 1;
    if (nextId <= challenges.length) {
      window.location.hash = `#/challenge/${nextId}`;
    } else {
      window.location.hash = '#/dashboard';
    }
  });

  // Editor Key Listener for line numbers
  const editor = document.getElementById('challenge-editor');
  editor.addEventListener('input', updateLineNumbers);
  editor.addEventListener('scroll', () => {
    document.getElementById('editor-line-numbers').scrollTop = editor.scrollTop;
  });

  // Editor Reset button
  document.getElementById('btn-reset-code').addEventListener('click', () => {
    const curr = challenges.find(c => c.id === state.currentChallengeId);
    editor.value = curr.template;
    updateLineNumbers();
  });

  // Editor Run button
  document.getElementById('btn-run-code').addEventListener('click', runChallengeCode);

  // Chat panel tabs
  document.querySelectorAll('.sidebar-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.sidebar-panel').forEach(p => p.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(tab.dataset.target).classList.add('active');
    });
  });

  // AI Chat message dispatch
  document.getElementById('btn-send-chat').addEventListener('click', handleAIChat);
  document.getElementById('chat-user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAIChat();
  });

  // Teaser run
  document.getElementById('btn-run-teaser').addEventListener('click', runTeaserCode);

  // --- Onboarding Interactions & Flow ---

  // Auth Modes Toggle
  let onboardingMode = 'guest';
  const emailGrp = document.getElementById('auth-email-group');
  const speechBubbleTxt = document.getElementById('auth-speech-txt');
  const statusMsgEl = document.getElementById('auth-status-msg');

  const btnGuest = document.getElementById('auth-mode-guest');
  const btnSignIn = document.getElementById('auth-mode-signin');
  const btnSignUp = document.getElementById('auth-mode-signup');

  function setOnboardingMode(mode) {
    onboardingMode = mode;
    [btnGuest, btnSignIn, btnSignUp].forEach(b => b.classList.remove('active'));
    statusMsgEl.textContent = '';
    statusMsgEl.className = 'msg-display';

    if (mode === 'guest') {
      btnGuest.classList.add('active');
      emailGrp.classList.add('hidden');
      speechBubbleTxt.textContent = "Hi! What should I call you?";
    } else if (mode === 'signin') {
      btnSignIn.classList.add('active');
      emailGrp.classList.remove('hidden');
      speechBubbleTxt.textContent = "Welcome back! What are your credentials?";
    } else if (mode === 'signup') {
      btnSignUp.classList.add('active');
      emailGrp.classList.remove('hidden');
      speechBubbleTxt.textContent = "Let's create a permanent profile to save your progress!";
    }
  }

  if (btnGuest) btnGuest.addEventListener('click', () => setOnboardingMode('guest'));
  if (btnSignIn) btnSignIn.addEventListener('click', () => setOnboardingMode('signin'));
  if (btnSignUp) btnSignUp.addEventListener('click', () => setOnboardingMode('signup'));

  // Submit Login/Auth
  const btnSubmitAuth = document.getElementById('btn-submit-auth');
  if (btnSubmitAuth) {
    btnSubmitAuth.addEventListener('click', () => {
      const usernameInput = document.getElementById('auth-username-input').value.trim();
      const emailInput = document.getElementById('auth-email-input').value.trim();

      if (!usernameInput) {
        statusMsgEl.textContent = "Please enter your name.";
        statusMsgEl.className = "msg-display error";
        return;
      }

      if (onboardingMode !== 'guest' && !emailInput) {
        statusMsgEl.textContent = "Please enter an email address.";
        statusMsgEl.className = "msg-display error";
        return;
      }

      // Save user to state & localStorage
      state.username = usernameInput;
      localStorage.setItem('pybe-username', usernameInput);
      localStorage.setItem('pybe-auth', onboardingMode);

      statusMsgEl.textContent = "Identity verified! Redirecting to Assessment...";
      statusMsgEl.className = "msg-display success";

      setTimeout(() => {
        window.location.hash = '#/assessment';
      }, 1000);
    });
  }

  // Self Assessment checklist cards toggle
  const assessmentCards = document.querySelectorAll('.assessment-card');
  assessmentCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('checked');
    });
  });

  // Submit Assessment
  const btnSubmitAssessment = document.getElementById('btn-submit-assessment');
  if (btnSubmitAssessment) {
    btnSubmitAssessment.addEventListener('click', () => {
      const selectedMods = [];
      document.querySelectorAll('.assessment-card.checked').forEach(card => {
        selectedMods.push(parseInt(card.dataset.module));
      });
      state.selectedTopics = selectedMods;
      
      // Auto-complete challenges that the user already knows!
      // Module 1 maps to chapter 1 (Lvl 1 & 2)
      if (selectedMods.includes(1)) {
        if (!state.completedChallenges.includes(1)) state.completedChallenges.push(1);
        if (!state.completedChallenges.includes(2)) state.completedChallenges.push(2);
      }
      // Module 2 maps to chapter 2 (Lvl 3 & 4)
      if (selectedMods.includes(2)) {
        if (!state.completedChallenges.includes(3)) state.completedChallenges.push(3);
        if (!state.completedChallenges.includes(4)) state.completedChallenges.push(4);
      }

      window.location.hash = '#/theme-selector';
    });
  }

  // Theme card custom selector
  const themeCards = document.querySelectorAll('.theme-card-custom');
  themeCards.forEach(card => {
    card.addEventListener('click', () => {
      if (card.classList.contains('locked-theme')) {
        alert("This interface dimension is currently locked in Beta access! Try again later.");
        return;
      }

      // Deselect all
      themeCards.forEach(c => {
        c.classList.remove('selected');
        const status = c.querySelector('.theme-status');
        if (status) status.textContent = c.classList.contains('locked-theme') ? 'Locked' : 'Select Dimension';
      });

      // Select clicked
      card.classList.add('selected');
      const status = card.querySelector('.theme-status');
      if (status) status.textContent = '✓ Selected';
      state.selectedTheme = card.dataset.themeId;
    });
  });

  // Submit Theme Selection
  const btnSubmitTheme = document.getElementById('btn-submit-theme');
  if (btnSubmitTheme) {
    btnSubmitTheme.addEventListener('click', () => {
      localStorage.setItem('pybe-theme', state.selectedTheme);
      window.location.hash = '#/dashboard';
    });
  }

  // Dashboard Carousel Carousel Nav
  const carousel = document.getElementById('dashboard-journey-carousel');
  const btnCarouselLeft = document.getElementById('btn-carousel-left');
  const btnCarouselRight = document.getElementById('btn-carousel-right');
  if (btnCarouselLeft && carousel) {
    btnCarouselLeft.addEventListener('click', () => {
      carousel.scrollBy({ left: -280, behavior: 'smooth' });
    });
  }
  if (btnCarouselRight && carousel) {
    btnCarouselRight.addEventListener('click', () => {
      carousel.scrollBy({ left: 280, behavior: 'smooth' });
    });
  }

  // Chapter Cards Click Handler
  const chapterCards = document.querySelectorAll('.chapter-card');
  chapterCards.forEach(card => {
    card.addEventListener('click', () => {
      const chapterId = parseInt(card.dataset.chapter);
      
      // If locked, show upsell modal
      if (card.classList.contains('locked')) {
        showUpsellModal(chapterId);
        return;
      }
      
      // Navigate to the first challenge of this chapter
      if (chapterId === 1) {
        window.location.hash = '#/challenge/1';
      } else if (chapterId === 2) {
        window.location.hash = '#/challenge/3';
      } else if (chapterId === 3) {
        window.location.hash = '#/challenge/5';
      } else if (chapterId === 4) {
        window.location.hash = '#/challenge/6';
      }
    });
  });

  // Initial Router invoke & canvas start
  navigateToRoute();
  initNodeCanvas();
});

