import React, { useState, useEffect, useRef } from 'react';

import parsedChallenges from '../../parsed_challenges.json';

const defaultChallenges = parsedChallenges;

export default function App() {
  // --- Routing & User States ---
  const [route, setRoute] = useState('home');
  const [activeChallengeId, setActiveChallengeId] = useState(1);
  
  // Onboarding credentials state
  const [username, setUsername] = useState(localStorage.getItem('pybe-username') || '');
  const [authMode, setAuthMode] = useState(localStorage.getItem('pybe-auth') || 'guest');
  const [membership, setMembership] = useState('Premium'); // Free or Premium
  const [tokens, setTokens] = useState(10);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(localStorage.getItem('pybe-theme') || 'general');
  const [role, setRole] = useState(localStorage.getItem('pybe-role') || 'Student'); // Student or Admin

  // DB Challenges list
  const [challenges, setChallenges] = useState(defaultChallenges);

  // Layout focus Toggles for Workspace (Header links: Code, Prompt, Did You Know)
  const [workspaceFocus, setWorkspaceFocus] = useState('code'); // 'code', 'prompt', 'dyk'

  // Profile menu dropdown toggle
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  // Modals state
  const [upsellModalOpen, setUpsellModalOpen] = useState(false);
  const [upsellChapter, setUpsellChapter] = useState(3);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Sync Hash changes
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash || '#/home';
      if (hash === '#/home' || hash === '#/') {
        setRoute('home');
      } else if (hash === '#/login') {
        setRoute('login');
      } else if (hash === '#/assessment') {
        setRoute('assessment');
      } else if (hash === '#/theme-selector') {
        setRoute('theme-selector');
      } else if (hash === '#/dashboard') {
        setRoute('dashboard');
      } else if (hash === '#/admin') {
        if (role !== 'Admin') {
          window.location.hash = '#/dashboard';
        } else {
          setRoute('admin');
        }
      } else if (hash.startsWith('#/challenge/')) {
        const id = parseInt(hash.split('/').pop());
        const chall = challenges.find(c => c.id === id);
        if (chall && chall.chapter >= 3 && membership === 'Free') {
          window.location.hash = '#/dashboard';
          setUpsellChapter(chall.chapter);
          setUpsellModalOpen(true);
        } else {
          setActiveChallengeId(id || 1);
          setRoute('challenge');
        }
      } else if (hash.startsWith('#/prompt-workspace/')) {
        const id = parseInt(hash.split('/').pop());
        setActiveChallengeId(id || 1);
        setRoute('prompt-workspace');
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, [challenges, membership, role]);

  // Fetch Challenges from Backend MERN server
  useEffect(() => {
    fetch('/api/challenges')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setChallenges(data);
        }
      })
      .catch(err => console.log('Serving from pre-seeded memory database (Express Offline)'));
  }, []);

  return (
    <div className="app-shell">
      {/* Dynamic Main Header */}
      {route !== 'home' && route !== 'login' && route !== 'assessment' && route !== 'theme-selector' && (
        <header className="main-header" id="global-header">
          <div className="header-logo" onClick={() => window.location.hash = '#/home'}>
            <span className="logo-icon">🐍</span>
            <span className="logo-text">Py<span className="accent-text">Be</span></span>
          </div>
          
          <nav className="nav-links">
            <a href="#/dashboard" className={`nav-link ${route === 'dashboard' ? 'active' : ''}`}>Dashboard</a>
            {route === 'dashboard' && (
              <a 
                href="#dyk-section" 
                className="nav-link" 
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById('dyk-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                💡 Did You Know?
              </a>
            )}
            
            {/* Header controls for workspace page */}
            {(route === 'challenge' || route === 'prompt-workspace') && (
              <div className="header-workspace-controls">
                <button 
                  className={`btn btn-secondary btn-small ${route === 'challenge' ? 'active' : ''}`}
                  onClick={() => { window.location.hash = '#/challenge/' + activeChallengeId; setWorkspaceFocus('code'); }}
                >
                  💻 Code Workspace
                </button>
                <button 
                  className={`btn btn-secondary btn-small ${route === 'prompt-workspace' ? 'active' : ''}`}
                  onClick={() => window.location.hash = '#/prompt-workspace/' + activeChallengeId}
                >
                  ✨ Prompt Workspace
                </button>
                <button 
                  className={`btn btn-secondary btn-small ${workspaceFocus === 'dyk' ? 'active' : ''}`}
                  onClick={() => setWorkspaceFocus('dyk')}
                >
                  💡 Did You Know?
                </button>
              </div>
            )}

            {role === 'Admin' && <a href="#/admin" className={`nav-link ${route === 'admin' ? 'active' : ''}`}>Admin Panel</a>}
          </nav>

          <div className="header-status-panel">
            <div className="profile-menu-container">
              <button className="profile-trigger" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
                <div className="profile-avatar">{username ? username.charAt(0).toUpperCase() : 'S'}</div>
                <span className="profile-arrow">▼</span>
              </button>
              {profileDropdownOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-user-info">
                    <p className="user-name">{username || 'Python Coder'}</p>
                  </div>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item" onClick={() => {
                    setCompletedChallenges([]);
                    setTokens(10);
                    setProfileDropdownOpen(false);
                    alert("Session successfully reset.");
                  }}>🔄 Reset Progress</button>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item logout" onClick={() => { setProfileDropdownOpen(false); localStorage.removeItem('pybe-role'); setRole('Student'); window.location.hash = '#/home'; }}>🚪 Sign Out</button>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Pages Router */}
      <main id="app-container">
        {route === 'home' && <LandingPage />}
        {route === 'login' && <LoginPage setUsername={setUsername} setAuthMode={setAuthMode} setRole={setRole} />}
        {route === 'assessment' && <AssessmentPage username={username} setCompletedChallenges={setCompletedChallenges} />}
        {route === 'theme-selector' && <ThemeSelectorPage selectedTheme={selectedTheme} setSelectedTheme={setSelectedTheme} />}
        {route === 'dashboard' && (
          <DashboardPage 
            username={username} 
            membership={membership} 
            tokens={tokens} 
            completedChallenges={completedChallenges} 
            challenges={challenges}
            setUpsellChapter={setUpsellChapter}
            setUpsellModalOpen={setUpsellModalOpen}
          />
        )}
        {route === 'challenge' && (
          <WorkspacePage 
            id={activeChallengeId} 
            challenges={challenges}
            completedChallenges={completedChallenges}
            setCompletedChallenges={setCompletedChallenges}
            tokens={tokens}
            setTokens={setTokens}
            membership={membership}
            setUpsellChapter={setUpsellChapter}
            setUpsellModalOpen={setUpsellModalOpen}
            workspaceFocus={workspaceFocus}
            setWorkspaceFocus={setWorkspaceFocus}
            successModalOpen={successModalOpen}
            setSuccessModalOpen={setSuccessModalOpen}
          />
        )}
        {route === 'prompt-workspace' && (
          <PromptWorkspacePage 
            id={activeChallengeId} 
            challenges={challenges}
            completedChallenges={completedChallenges}
            setCompletedChallenges={setCompletedChallenges}
            tokens={tokens}
            setTokens={setTokens}
            membership={membership}
            setUpsellChapter={setUpsellChapter}
            setUpsellModalOpen={setUpsellModalOpen}
            workspaceFocus={workspaceFocus}
            setWorkspaceFocus={setWorkspaceFocus}
            successModalOpen={successModalOpen}
            setSuccessModalOpen={setSuccessModalOpen}
          />
        )}
        {route === 'admin' && <AdminPage challenges={challenges} setChallenges={setChallenges} />}
      </main>

      {/* Premium Upsell Modal */}
      {upsellModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel">
            <div className="modal-header">
              <span className="modal-icon">🔓</span>
              <h3>Unlock More Chapters</h3>
            </div>
            <div className="modal-body">
              <p>Unfortunately, you don't have access to Chapter {upsellChapter}. Upgrade to our Premium membership to unlock all core levels, custom string methods, data arrays, and unlimited AI assistant queries!</p>
              <div className="pricing-card">
                <div className="price-title">Premium Access</div>
                <div className="price-value">$9.99<span className="price-period">/mo</span></div>
                <ul>
                  <li>✅ Instant access to Chapters 3 & 4</li>
                  <li>✅ Unlimited AI assistant queries</li>
                  <li>✅ Multi-file personal project builder (Beta)</li>
                  <li>✅ Dedicated Discord study group room</li>
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setUpsellModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary btn-glow" onClick={() => { setMembership('Premium'); setUpsellModalOpen(false); }}>Upgrade to Premium 🚀</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================================================
// 1. Landing Page Route
// ==========================================================================
function LandingPage() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = [];
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1.5
      });
    }

    let animationFrameId;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#00E676';
        ctx.fill();
      });

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
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const [teaserOut, setTeaserOut] = useState('> Click run to execute statement...');
  const [teaserStatus, setTeaserStatus] = useState('Ready to execute...');

  const runTeaser = () => {
    setTeaserOut('> Running print("Hello, world")...');
    setTimeout(() => {
      setTeaserOut('Hello, world');
      setTeaserStatus('🎉 Successfully executed statement!');
    }, 500);
  };

  return (
    <section id="route-home" className="page-route">
      <div className="hero-container">
        <canvas ref={canvasRef} className="hero-canvas"></canvas>
        <div className="hero-content">
          <div className="hero-badge animate-pulse">✨ Introducing PyBe 2.0</div>
          <h1 class="hero-title">Code <span class="gradient-text">🐍 Python</span> with your <span class="accent-text glow-text">AI assistant!</span></h1>
          <p className="hero-subtitle">Interactive playground, gamified challenges, and immediate smart AI debugging guidance.</p>
          <button className="btn btn-primary btn-large btn-glow" onClick={() => window.location.hash = '#/login'}>
            Continue Coding <span className="arrow">→</span>
          </button>
        </div>
      </div>

      <section className="section-container">
        <h2 className="section-title text-center">Engineered for Fast Learning</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>From Python Beginner to Pro</h3>
            <p>Step-by-step interactive chapters built to take you from printing variables to structuring enterprise applications.</p>
          </div>
          <div className="feature-card">
            <h3>Integrated AI Chat</h3>
            <p>Never get stuck. Ask your embedded AI tutor to explain errors, debug logic, or detail syntax quirks right inside your workspace.</p>
          </div>
          <div className="feature-card">
            <h3>Build Your Own Projects</h3>
            <p>Deploy code directly onto our virtual platform and share custom creations with fellow student programmers.</p>
          </div>
        </div>
      </section>

      <section className="section-container teaser-section">
        <div className="teaser-grid">
          <div>
            <h2 className="section-title">How It Works</h2>
            <p className="section-desc">Write real Python code, run it directly in your browser, and see instant terminal output. Try executing the simple print statement on the right.</p>
            <div className="teaser-run-indicator" style={{ color: teaserStatus.startsWith('🎉') ? '#00E676' : 'inherit' }}>
              {teaserStatus}
            </div>
          </div>
          <div className="teaser-editor-panel glass-panel">
            <div className="teaser-header">
              <span className="red-dot"></span><span className="yellow-dot"></span><span className="green-dot"></span>
              <span className="window-title">interactive_teaser.py</span>
            </div>
            <div className="teaser-body">
              <div className="line-nums"><div>1</div></div>
              <div className="teaser-editor">
                <span className="syntax-keyword">print</span>(<span className="syntax-string">"Hello, world"</span>)
              </div>
            </div>
            <div class="teaser-footer">
              <button className="btn btn-accent btn-small" onClick={runTeaser}>Run Code</button>
              <div className="teaser-output">{teaserOut}</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="dark-footer">
        <div className="footer-bottom">
          <p>&copy; 2026 PyBe Inc. All rights reserved. Designed with premium dark coding aesthetics.</p>
        </div>
      </footer>
    </section>
  );
}

// ==========================================================================
// 2. Login & Credentials Page
// ==========================================================================
function LoginPage({ setUsername, setAuthMode, setRole }) {
  const [activeTab, setActiveTab] = useState('guest');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState('');

  const pixelCanvasRef = useRef(null);

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

  useEffect(() => {
    const canvas = pixelCanvasRef.current;
    if (!canvas) return;
    canvas.innerHTML = '';
    snakeArtPattern.forEach(p => {
      const pixel = document.createElement('div');
      pixel.className = 'pixel';
      if (p !== '.') pixel.classList.add(p);
      canvas.appendChild(pixel);
    });
  }, []);

  const handleAuth = () => {
    if (!name.trim()) {
      setStatusMsg("Please enter your name.");
      setStatusType('error');
      return;
    }
    if (activeTab !== 'guest' && !email.trim()) {
      setStatusMsg("Please enter an email address.");
      setStatusType('error');
      return;
    }

    // Determine role implicitly (hide role fields from public UI)
    let determinedRole = 'Student';
    const lowerName = name.trim().toLowerCase();
    const lowerEmail = email.trim().toLowerCase();
    if (lowerName === 'admin' || lowerEmail === 'admin@pybe.com' || lowerEmail.endsWith('@pybe.admin') || lowerEmail.endsWith('.admin')) {
      determinedRole = 'Admin';
    }

    setUsername(name);
    setAuthMode(activeTab);
    setRole(determinedRole);
    localStorage.setItem('pybe-username', name);
    localStorage.setItem('pybe-auth', activeTab);
    localStorage.setItem('pybe-role', determinedRole);

    setStatusMsg(`Identity verified! Loading...`);
    setStatusType('success');
    setTimeout(() => {
      window.location.hash = '#/assessment';
    }, 1000);
  };

  return (
    <section id="route-login" className="page-route">
      <div className="onboarding-container">
        <div className="progress-header">
          <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '25%' }}></div></div>
          <div className="progress-label">STEP 1: IDENTITY // 25%</div>
        </div>

        <div className="auth-card glass-panel">
          <div className="character-box">
            <div ref={pixelCanvasRef} className="pixel-art-canvas"></div>
            <div className="speech-bubble">
              <p>Hi! What should I call you?</p>
            </div>
          </div>

          <div className="auth-form">
            <div className="input-group">
              <label>Your Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter name or nickname" />
            </div>

            {activeTab !== 'guest' && (
              <div className="input-group">
                <label>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@domain.com" />
              </div>
            )}

            <div className="action-row">
              <button className={`btn btn-secondary ${activeTab === 'guest' ? 'active' : ''}`} onClick={() => setActiveTab('guest')}>Guest</button>
              <button className={`btn btn-secondary ${activeTab === 'signin' ? 'active' : ''}`} onClick={() => setActiveTab('signin')}>Sign In</button>
              <button className={`btn btn-secondary ${activeTab === 'signup' ? 'active' : ''}`} onClick={() => setActiveTab('signup')}>Sign Up</button>
            </div>

            {statusMsg && <div className={`msg-display ${statusType}`}>{statusMsg}</div>}

            <button className="btn btn-primary btn-glow btn-block" onClick={handleAuth}>GO →</button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==========================================================================
// 3. Self-Assessment Route
// ==========================================================================
function AssessmentPage({ username, setCompletedChallenges }) {
  const [selected, setSelected] = useState([]);
  const canvasRef = useRef(null);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.innerHTML = '';
    snakeArtPattern.forEach(p => {
      const pixel = document.createElement('div');
      pixel.className = 'pixel';
      if (p !== '.') pixel.classList.add(p);
      canvas.appendChild(pixel);
    });
  }, []);

  const toggleModule = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(x => x !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleNext = () => {
    // If topics selected, pre-complete core challenge chapters
    const completed = [];
    if (selected.includes(1)) {
      completed.push(1, 2); // Chapter 1
    }
    if (selected.includes(2)) {
      completed.push(3, 4); // Chapter 2
    }
    setCompletedChallenges(completed);
    window.location.hash = '#/theme-selector';
  };

  return (
    <section id="route-assessment" className="page-route">
      <div className="onboarding-container wide">
        <div className="progress-header">
          <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '50%' }}></div></div>
          <div className="progress-label">STEP 2: ASSESSMENT // 50%</div>
        </div>

        <div className="assessment-layout">
          <div className="assessment-left glass-panel text-center">
            <div className="character-box">
              <div ref={canvasRef} className="pixel-art-canvas"></div>
              <div className="speech-bubble">
                <p>"Check the Python modules you already know so we can dynamically adjust your roadmap."</p>
              </div>
            </div>
          </div>

          <div className="assessment-right glass-panel">
            <div className="module-header-tag">SELECT ALL TOPICS THAT YOU KNOW</div>
            <div className="assessment-list">
              <div className={`assessment-card ${selected.includes(1) ? 'checked' : ''}`} onClick={() => toggleModule(1)}>
                <div className="card-left">
                  <div className="custom-checkbox"></div>
                  <div className="module-info">
                    <span className="module-title">Variables & Data Types</span>
                    <span className="module-subtitle">MODULE_01 // CORE_FUNDAMENTALS</span>
                  </div>
                </div>
                <div className="module-icon">🗄️</div>
              </div>

              <div className={`assessment-card ${selected.includes(2) ? 'checked' : ''}`} onClick={() => toggleModule(2)}>
                <div className="card-left">
                  <div className="custom-checkbox"></div>
                  <div className="module-info">
                    <span className="module-title">Conditionals (if/else)</span>
                    <span className="module-subtitle">MODULE_02 // FLOW_CONTROL</span>
                  </div>
                </div>
                <div className="module-icon">🌿</div>
              </div>

              <div className={`assessment-card ${selected.includes(3) ? 'checked' : ''}`} onClick={() => toggleModule(3)}>
                <div className="card-left">
                  <div className="custom-checkbox"></div>
                  <div className="module-info">
                    <span class="module-title">Loops (while/for)</span>
                    <span className="module-subtitle">MODULE_03 // ITERATION</span>
                  </div>
                </div>
                <div className="module-icon">🔄</div>
              </div>
            </div>

            <button className="btn btn-primary btn-glow btn-block" onClick={handleNext}>NEXT: CHOOSE DIMENSION →</button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==========================================================================
// 4. Theme Selector Route
// ==========================================================================
function ThemeSelectorPage({ selectedTheme, setSelectedTheme }) {
  const handleTeleport = () => {
    window.location.hash = '#/dashboard';
  };

  return (
    <section id="route-theme-selector" className="page-route">
      <div className="onboarding-container wide">
        <div className="progress-header">
          <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '75%' }}></div></div>
          <div className="progress-label">STEP 3: INTERFACE DIMENSION // 75%</div>
        </div>

        <div className="main-title-container text-center">
          <h2 className="section-title">Select Your Interface Dimension</h2>
          <p className="section-desc text-center">Choose a theme to skin your learning workspace environment.</p>
        </div>

        <div className="themes-grid">
          <div className={`theme-card-custom ${selectedTheme === 'general' ? 'selected' : ''}`} onClick={() => setSelectedTheme('general')}>
            <div className="theme-card-visual">
              <svg width="80" height="80" viewBox="0 0 16 16">
                <rect x="5" y="3" width="6" height="6" fill="#00E676" />
                <rect x="4" y="6" width="8" height="6" fill="#00E676" />
                <circle cx="6.5" cy="5.5" r="0.7" fill="#ffffff" />
                <circle cx="9.5" cy="5.5" r="0.7" fill="#ffffff" />
              </svg>
            </div>
            <div className="theme-card-body">
              <span className="theme-badge">Dimension_01</span>
              <h3>General</h3>
              <p>Classic 16-Bit Retro System</p>
              <div className="theme-status">{selectedTheme === 'general' ? '✓ Selected' : 'Select Dimension'}</div>
            </div>
          </div>

          <div className={`theme-card-custom ${selectedTheme === 'marvel' ? 'selected' : ''}`} onClick={() => setSelectedTheme('marvel')}>
            <div className="theme-card-visual">
              <svg width="80" height="80" viewBox="0 0 100 100">
                <polygon points="50,25 75,40 75,70 50,85 25,70 25,40" fill="none" stroke="#00b0ff" strokeWidth="3" />
              </svg>
            </div>
            <div className="theme-card-body">
              <span className="theme-badge">Dimension_02</span>
              <h3>Marvel</h3>
              <p>Holographic Tech Grid Theme</p>
              <div className="theme-status">{selectedTheme === 'marvel' ? '✓ Selected' : 'Select Dimension'}</div>
            </div>
          </div>

          <div className={`theme-card-custom ${selectedTheme === 'harrypotter' ? 'selected' : ''}`} onClick={() => setSelectedTheme('harrypotter')}>
            <div className="theme-card-visual">
              <svg width="80" height="80" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="30" fill="none" stroke="#d500f9" strokeWidth="2.5" />
              </svg>
            </div>
            <div className="theme-card-body">
              <span className="theme-badge">Dimension_03</span>
              <h3>Harry Potter</h3>
              <p>Wizarding Alchemy Theme</p>
              <div className="theme-status">{selectedTheme === 'harrypotter' ? '✓ Selected' : 'Select Dimension'}</div>
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-glow btn-block" style={{ maxWidth: '400px', margin: '40px auto 0 auto' }} onClick={handleTeleport}>
          ⚡ Teleport to Realm →
        </button>
      </div>
    </section>
  );
}

// ==========================================================================
// 5. Student Dashboard Route
// ==========================================================================
function DashboardPage({ username, membership, tokens, completedChallenges, challenges, setUpsellChapter, setUpsellModalOpen }) {
  const carouselRef = useRef(null);

  const scrollLeft = () => {
    if (carouselRef.current) carouselRef.current.scrollBy({ left: -280, behavior: 'smooth' });
  };
  const scrollRight = () => {
    if (carouselRef.current) carouselRef.current.scrollBy({ left: 280, behavior: 'smooth' });
  };

  const getChapterProgress = (chapterNum) => {
    const total = challenges.filter(c => c.chapter === chapterNum).map(c => c.id);
    if (total.length === 0) return 0;
    const completed = total.filter(id => completedChallenges.includes(id)).length;
    return Math.round((completed / total.length) * 100);
  };

  // Group challenges by chapter dynamically
  const chaptersList = [];
  const chaptersSet = new Set();
  
  challenges.forEach(c => {
    if (!chaptersSet.has(c.chapter)) {
      chaptersSet.add(c.chapter);
      chaptersList.push({
        num: c.chapter,
        concept: c.concept || 'Concept',
        title: c.conceptName || (c.concept ? c.concept.split('—')[0].trim() : 'Basics'),
        desc: c.instructions ? c.instructions.replace(/<[^>]*>/g, '') : 'Explore logic concept levels.'
      });
    }
  });
  
  chaptersList.sort((a, b) => a.num - b.num);
  const completedChapsCount = chaptersList.filter(ch => getChapterProgress(ch.num) === 100).length;

  const handleChapterClick = (chNum) => {
    const firstChallenge = challenges.find(c => c.chapter === chNum);
    if (firstChallenge) {
      window.location.hash = `#/challenge/${firstChallenge.id}`;
    }
  };

  return (
    <section id="route-dashboard" className="page-route">
      <div className="dashboard-hero section-container">
        <div className="dashboard-welcome">
          <h2>Welcome back, <span className="accent-text">{username || 'Python Cadet'}</span>! 🚀</h2>
          <p>Ready to level up your programming skills today?</p>
        </div>

        <div className="dashboard-stats-row">
          <div className="dash-stat-card glass-panel">
            <span className="stat-icon">🎓</span>
            <div className="stat-info">
              <h4>{completedChapsCount} Chapters Completed</h4>
              <p>Overall Level Progress</p>
            </div>
          </div>
          <div className="dash-stat-card glass-panel">
            <span className="stat-icon">🔥</span>
            <div className="stat-info">
              <h4>{completedChallenges.length} / {challenges.length} Solved</h4>
              <p>Challenges Completed</p>
            </div>
          </div>
          <div className="dash-stat-card glass-panel">
            <span className="stat-icon">✨</span>
            <div className="stat-info">
              <h4>{membership === 'Premium' ? '∞' : tokens} Tokens Left</h4>
              <p>Daily Assistant Power</p>
            </div>
          </div>
        </div>
      </div>

      <section className="section-container">
        <div className="journey-header">
          <div>
            <h2 className="section-title">Coding Journey</h2>
            <p className="section-desc">{completedChapsCount} of {chaptersList.length} chapters completed</p>
          </div>
          <div className="carousel-nav">
            <button className="btn btn-secondary btn-icon-only" onClick={scrollLeft}>◀</button>
            <button className="btn btn-secondary btn-icon-only" onClick={scrollRight}>▶</button>
          </div>
        </div>

        <div className="carousel-viewport" ref={carouselRef}>
          <div className="journey-carousel">
            {chaptersList.map(ch => {
              const chChallenges = challenges.filter(c => c.chapter === ch.num);
              return (
                <div 
                  key={ch.num} 
                  className="chapter-card unlocked" 
                  onClick={() => handleChapterClick(ch.num)}
                  style={{ minWidth: '280px' }}
                >
                  <div className="chapter-badge">Chapter {ch.num}</div>
                  <h3 style={{ textTransform: 'capitalize' }}>{ch.title}</h3>
                  <p style={{ display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ch.desc}
                  </p>
                  <div className="chapter-footer">
                    <span className="challenge-count">{chChallenges.length} levels</span>
                    <span className="progress-pill">{getChapterProgress(ch.num)}% Complete</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Unlocked Did You Know Theories section */}
      <section id="dyk-section" className="section-container" style={{ borderTop: '1px solid var(--border-color)', marginTop: '40px' }}>
        <h2 className="section-title">💡 Unlocked Coding Theories</h2>
        <p className="section-desc" style={{ marginBottom: '24px' }}>Review the "Did You Know?" concepts from challenge levels you have successfully solved.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {challenges.map(c => {
            const isCompleted = completedChallenges.includes(c.id);
            return (
              <div 
                key={c.id} 
                className="glass-panel" 
                style={{ 
                  padding: '20px', 
                  textAlign: 'left', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '10px',
                  opacity: isCompleted ? 1 : 0.5,
                  border: isCompleted ? '1px solid var(--accent-green)' : '1px solid var(--border-color)',
                  boxShadow: isCompleted ? '0 0 10px rgba(0, 230, 118, 0.1)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge ${isCompleted ? 'badge-success' : 'badge-accent'}`}>
                    Lvl {c.id} {isCompleted ? '• Unlocked' : '• Locked'}
                  </span>
                  <span>{isCompleted ? '💡' : '🔒'}</span>
                </div>
                <h4 style={{ color: isCompleted ? '#fff' : 'var(--text-muted)' }}>{isCompleted ? c.title : 'Locked Concept'}</h4>
                {isCompleted ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }} dangerouslySetInnerHTML={{ __html: c.whyThisMatters }}></p>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontStyle: 'italic' }}>Complete challenge Level {c.id} to unlock this Python theory guide.</p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
}

// ==========================================================================
// 6. Workspace Environment (With Splitter, Custom Header Focus, AI Divert)
// ==========================================================================
function WorkspacePage({ 
  id, challenges, completedChallenges, setCompletedChallenges, 
  tokens, setTokens, membership, setUpsellChapter, setUpsellModalOpen, 
  workspaceFocus, setWorkspaceFocus, successModalOpen, setSuccessModalOpen 
}) {
  const challenge = challenges.find(c => c.id === id) || challenges[0];
  const [code, setCode] = useState(challenge.template);
  const [actualOut, setActualOut] = useState('> Ready. Click "Run Python Code" to execute.');
  const [isError, setIsError] = useState(false);

  // Quiz States
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizFeedback, setQuizFeedback] = useState({});
  const [revealedShortAnswers, setRevealedShortAnswers] = useState({});

  // Chat States
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hello! I'm your interactive Python assistant. Stuck on this challenge? Ask me about prints, syntax errors, or variables, and I'll explain them cleanly!" }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Resizable Splitter State
  const [leftWidth, setLeftWidth] = useState(45); // in percentage
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    setCode(localStorage.getItem(`challenge_code_${challenge.id}`) || challenge.template);
    setActualOut('> Ready. Click "Run Python Code" to execute.');
    setIsError(false);
    setQuizAnswers({});
    setQuizFeedback({});
    setRevealedShortAnswers({});
  }, [challenge]);

  const handleMouseDown = () => {
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newWidth > 20 && newWidth < 80) {
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const runCode = () => {
    setActualOut('> Running code...');
    localStorage.setItem(`challenge_code_${challenge.id}`, code);

    setTimeout(() => {
      const res = executePythonMock(code);
      if (!res.success) {
        setActualOut(res.error);
        setIsError(true);
      } else {
        setActualOut(res.output);
        setIsError(false);
        if (res.output.trim() === challenge.targetOutput) {
          if (!completedChallenges.includes(challenge.id)) {
            setCompletedChallenges([...completedChallenges, challenge.id]);
          }
          setSuccessModalOpen(true);
        } else {
          setActualOut(prev => prev + `\n\n⚠️ Output matches target: False. Expected '${challenge.targetOutput}' but got '${res.output}'`);
          setIsError(true);
        }
      }
    }, 500);
  };

  // Mock python runner
  const executePythonMock = (rawCode) => {
    let lines = rawCode.split('\n');
    let output = [];
    let scope = {};
    try {
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line || line.startsWith('#')) continue;

        if (line.startsWith('print(')) {
          if (!line.endsWith(')')) throw new Error(`SyntaxError: missing closing parenthesis on line ${i + 1}`);
          let inner = line.substring(6, line.length - 1).trim();
          let val = evaluateExpression(inner, scope);
          output.push(val.toString());
          continue;
        }

        if (line.includes('=')) {
          let parts = line.split('=');
          if (parts.length !== 2) throw new Error(`SyntaxError: invalid variable assignment on line ${i + 1}`);
          let varName = parts[0].trim();
          let expr = parts[1].trim();
          if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) throw new Error(`NameError: illegal variable name '${varName}' on line ${i + 1}`);
          scope[varName] = evaluateExpression(expr, scope);
          continue;
        }
        throw new Error(`SyntaxError: unrecognized statement '${line}' on line ${i + 1}`);
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
    return { success: true, output: output.join('\n') };
  };

  const evaluateExpression = (expr, scope) => {
    expr = expr.trim();
    if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
      return expr.slice(1, -1);
    }
    if (expr.startsWith('len(') && expr.endsWith(')')) {
      let inner = expr.substring(4, expr.length - 1).trim();
      let val = evaluateExpression(inner, scope);
      return val.length;
    }
    if (expr.startsWith('[') && expr.endsWith(']')) {
      let inner = expr.slice(1, -1).trim();
      if (!inner) return [];
      return inner.split(',').map(x => evaluateExpression(x, scope));
    }
    if (expr.includes('+') || expr.includes('-') || expr.includes('*') || expr.includes('/')) {
      let tokens = expr.split(/(\+|-|\*|\/)/);
      let resolved = tokens.map(tok => {
        let t = tok.trim();
        if (['+', '-', '*', '/'].includes(t)) return t;
        return evaluateExpression(t, scope);
      });
      let simpleEval = resolved.join('');
      try {
        if (/^[0-9.+\-*/()]+$/.test(simpleEval)) {
          return Function(`"use strict"; return (${simpleEval})`)();
        }
      } catch (e) {}
      throw new Error("TypeError: invalid arithmetic operand types");
    }
    if (!isNaN(expr) && expr !== '') return Number(expr);
    if (scope.hasOwnProperty(expr)) return scope[expr];
    throw new Error(`NameError: name '${expr}' is not defined`);
  };

  const handleSendMessage = (textToSend) => {
    const text = textToSend || chatInput.trim();
    if (!text) return;

    if (membership === 'Free' && tokens <= 0) {
      setMessages([...messages, { sender: 'bot', text: "⚠️ You've spent all daily help tokens. Go Premium for unlimited debugger access!" }]);
      setUpsellChapter(3);
      setUpsellModalOpen(true);
      return;
    }

    if (membership === 'Free') setTokens(prev => prev - 1);
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setChatInput('');

    setTimeout(() => {
      let response = `In this challenge ("${challenge.title}"), you must output exactly "${challenge.targetOutput}". Review your variables and calculations!`;
      if (text.toLowerCase().includes('error') || text.toLowerCase().includes('wrong')) {
        response = `Here is a debugger hint: ${challenge.errorTips}`;
      }
      setMessages(prev => [...prev, { sender: 'bot', text: response }]);
    }, 600);
  };

  // Triggered when "Know What's Wrong" is clicked
  const handleKnowWhatsWrong = () => {
    setWorkspaceFocus('ai_helper'); // Switch panel focus to AI helper
    const alertMessage = `I ran my code but got this error: "${actualOut}". My code is:\n\n${code}\n\nCan you tell me how to fix it?`;
    handleSendMessage(alertMessage);
  };

  return (
    <section id="route-challenge" className="page-route">
      <div className="workspace-layout">
        
        {/* Left Sidebar Panel - Level checklist maps */}
        <aside className="workspace-sidebar glass-panel">
          <div className="sidebar-tabs">
            <button className={`sidebar-tab ${workspaceFocus === 'code' || workspaceFocus === 'dyk' ? 'active' : ''}`} onClick={() => setWorkspaceFocus('code')}>📝 Level Map</button>
            <button className={`sidebar-tab ${workspaceFocus === 'quiz' ? 'active' : ''}`} onClick={() => setWorkspaceFocus('quiz')}>❓ Case Study</button>
            <button className={`sidebar-tab ${workspaceFocus === 'ai_helper' ? 'active' : ''}`} onClick={() => setWorkspaceFocus('ai_helper')}>🤖 AI Helper</button>
          </div>

          {workspaceFocus === 'code' || workspaceFocus === 'dyk' ? (
            <div className="sidebar-panel active">
              <div className="sidebar-panel-header">
                <h3>Chapter Progression</h3>
              </div>
              <div className="challenge-menu-list">
                {challenges.filter(c => c.chapter === challenge.chapter).map(c => {
                  const isLocked = false;
                  const isDone = completedChallenges.includes(c.id);
                  return (
                    <div 
                      key={c.id} 
                      className={`challenge-item ${c.id === challenge.id ? 'active' : ''}`}
                      onClick={() => {
                        window.location.hash = `#/challenge/${c.id}`;
                      }}
                    >
                      <div className="challenge-label">
                        <span className="challenge-num">Chapter {c.chapter} • Lvl {c.id}</span>
                        <span className="challenge-title">{c.title}</span>
                      </div>
                      {isDone ? <span style={{ color: '#00E676' }}>✓</span> : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : workspaceFocus === 'quiz' ? (
            <div className="sidebar-panel active">
              <div className="sidebar-panel-header">
                <h3>Case Study Quiz</h3>
              </div>
              <div className="quiz-questions-list" style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100% - 60px)' }}>
                {(!challenge.quizQuestions || challenge.quizQuestions.length === 0) ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No case study questions for this level.</p>
                ) : (
                  challenge.quizQuestions.map((q, qIdx) => {
                    const isMCQ = q.type === 'Multiple Choice';
                    const answerFeedback = quizFeedback[qIdx]; // 'correct' or 'incorrect'
                    const isRevealed = revealedShortAnswers[qIdx];

                    return (
                      <div key={qIdx} className="quiz-card glass-panel" style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#00b0ff' }}>Question {qIdx + 1} ({q.type})</span>
                        <p style={{ fontSize: '0.85rem', color: '#fff', textAlign: 'left', margin: '0' }}>{q.question}</p>
                        
                        {isMCQ ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                            {q.options.map((opt, optIdx) => {
                              const optLetter = opt.charAt(0); // A, B, C, or D
                              const isSelected = quizAnswers[qIdx] === optLetter;
                              return (
                                <label 
                                  key={optIdx} 
                                  style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    fontSize: '0.8rem', 
                                    color: isSelected ? 'var(--accent-color)' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: '6px',
                                    borderRadius: '4px',
                                    background: isSelected ? 'rgba(0, 176, 255, 0.05)' : 'transparent',
                                    border: isSelected ? '1px solid rgba(0, 176, 255, 0.2)' : '1px solid transparent'
                                  }}
                                >
                                  <input 
                                    type="radio" 
                                    name={`mcq-${qIdx}`} 
                                    checked={isSelected}
                                    onChange={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: optLetter }))}
                                    style={{ accentColor: 'var(--accent-color)' }}
                                  />
                                  <span>{opt}</span>
                                </label>
                              );
                            })}
                            <button 
                              className="btn btn-secondary btn-small" 
                              style={{ marginTop: '4px', width: 'max-content' }}
                              onClick={() => {
                                const selected = quizAnswers[qIdx];
                                if (!selected) return;
                                const isCorrect = selected === q.correctAnswer;
                                setQuizFeedback(prev => ({ ...prev, [qIdx]: isCorrect ? 'correct' : 'incorrect' }));
                              }}
                            >
                              Check Answer
                            </button>
                            {answerFeedback === 'correct' && <span style={{ color: '#00E676', fontSize: '0.8rem', fontWeight: 'bold' }}>🎉 Correct Answer!</span>}
                            {answerFeedback === 'incorrect' && <span style={{ color: '#ff5f56', fontSize: '0.8rem', fontWeight: 'bold' }}>❌ Incorrect, try again.</span>}
                          </div>
                        ) : (
                          // Short Answer
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                            <textarea 
                              style={{ width: '100%', minHeight: '60px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '4px', color: '#fff', padding: '6px', fontSize: '0.8rem' }}
                              placeholder="Type your explanation..."
                              value={quizAnswers[qIdx] || ''}
                              onChange={e => setQuizAnswers(prev => ({ ...prev, [qIdx]: e.target.value }))}
                            />
                            <button 
                              className="btn btn-secondary btn-small" 
                              style={{ width: 'max-content' }}
                              onClick={() => setRevealedShortAnswers(prev => ({ ...prev, [qIdx]: !prev[qIdx] }))}
                            >
                              {isRevealed ? 'Hide Sample Answer' : 'Reveal Sample Answer'}
                            </button>
                            {isRevealed && (
                              <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid #00b0ff', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                <strong>💡 Sample Answer:</strong><br />{q.sampleAnswer}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="sidebar-panel active">
              <div className="sidebar-panel-header">
                <h3>AI Debugger Chat</h3>
              </div>
              <div className="chat-messages-container">
                {messages.map((m, idx) => (
                  <div key={idx} className={`chat-msg ${m.sender}`}>
                    <div className="chat-bubble" dangerouslySetInnerHTML={{ __html: m.text }}></div>
                  </div>
                ))}
              </div>
              <div className="chat-input-wrapper">
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  placeholder="Ask AI: e.g. Why am I getting NameError?" 
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="btn btn-accent btn-small" onClick={() => handleSendMessage()}>Ask</button>
              </div>
            </div>
          )}
        </aside>

        {/* Center Panel (Resizable splitter container) */}
        <div className="split-pane-container" ref={containerRef} style={{ gridColumn: 'span 2' }}>
          
          {/* Left Split: Challenge Description */}
          <div className="split-left" style={{ width: `${leftWidth}%` }}>
            <div className="workspace-nav-bar">
              <a href="#/dashboard" className="btn-back">← Back to Dashboard</a>
              <div className="active-challenge-title">Challenge {challenge.id}</div>
            </div>

            <div className="instructions-card glass-panel">
              <div className="instructions-header">
                <h3>Task Instructions</h3>
              </div>
              <div className="instructions-body" dangerouslySetInnerHTML={{ __html: challenge.instructions }}></div>
              
              {/* DYK toggle focus pane */}
              {(workspaceFocus === 'dyk' || workspaceFocus === 'code') && (
                <div className="instructions-dropdown" style={{ border: workspaceFocus === 'dyk' ? '1px solid #00E676' : '1px solid rgba(255,255,255,0.08)' }}>
                  <summary style={{ padding: '4px', fontWeight: 'bold', color: '#00b0ff' }}>💡 Why This Matters (Did You Know?)</summary>
                  <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#8a8aa3' }} dangerouslySetInnerHTML={{ __html: challenge.whyThisMatters }}></div>
                </div>
              )}
            </div>
          </div>

          {/* User Drag Splitter Bar */}
          <div className="vertical-splitter" onMouseDown={handleMouseDown}></div>

          {/* Right Split: Coding Editor & Dual Console Output */}
          <div className="split-right" style={{ width: `${100 - leftWidth}%`, display: 'grid', gridTemplateRows: '1.2fr 1fr' }}>
            {/* Code editor */}
            <div className="editor-card glass-panel">
              <div className="editor-header">
                <span className="red-dot"></span><span className="yellow-dot"></span><span className="green-dot"></span>
                <span className="window-title">main.py</span>
              </div>
              <div className="editor-container">
                <div className="line-numbers-container">
                  {code.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
                </div>
                <textarea 
                  className="code-editor-textarea" 
                  value={code} 
                  onChange={e => setCode(e.target.value)} 
                  spellCheck="false"
                />
              </div>
              <div className="editor-footer">
                <button className="btn btn-secondary" onClick={() => setCode(challenge.template)}>Reset Code</button>
                <button className="btn btn-primary btn-glow" onClick={runCode}>Run Python Code ⚡</button>
              </div>
            </div>

            {/* Consoles outputs */}
            <div className="workspace-output glass-panel">
              <div className="output-panel expected-panel">
                <div className="output-header">
                  <h4>🎯 Expected Output Target</h4>
                </div>
                <div className="output-console target-console">{challenge.targetOutput}</div>
              </div>

              <div className="output-panel actual-panel">
                <div className="output-header">
                  <h4>💻 Actual Code Output Console</h4>
                </div>
                <div className={`output-console terminal-console ${isError ? 'error' : ''}`}>
                  {actualOut}
                  
                  {/* Know What's Wrong Diverter Trigger Button */}
                  {isError && (
                    <button className="btn-know-wrong" onClick={handleKnowWhatsWrong}>
                      Know What's Wrong? 🤖
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Completion Success Modal Overlay */}
      {successModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel success-card">
            <div className="modal-header">
              <span className="modal-icon animate-bounce">🎉</span>
              <h3>Challenge Completed!</h3>
            </div>
            <div className="modal-body text-center">
              <p className="success-text">Awesome work! Your script successfully produced the exact expected output target.</p>
              <div className="badge badge-success">+100 XP gained</div>
            </div>
            <div className="modal-footer justify-center">
              <button className="btn btn-secondary" onClick={() => setSuccessModalOpen(false)}>Stay Here</button>
              <button 
                className="btn btn-primary btn-glow" 
                onClick={() => {
                  setSuccessModalOpen(false);
                  const nextId = challenge.id + 1;
                  if (nextId <= challenges.length) {
                    window.location.hash = `#/challenge/${nextId}`;
                  } else {
                    window.location.hash = '#/dashboard';
                  }
                }}
              >
                Next Challenge 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ==========================================================================
// 7. Admin CRUD Panel Route (React Level Editor interface)
// ==========================================================================
function AdminPage({ challenges, setChallenges }) {
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [whyThisMatters, setWhyThisMatters] = useState('');
  const [template, setTemplate] = useState('');
  const [targetOutput, setTargetOutput] = useState('');
  const [errorTips, setErrorTips] = useState('');

  const [statusMsg, setStatusMsg] = useState('');

  const loadChallenge = (c) => {
    setSelectedChallenge(c);
    setTitle(c.title);
    setChapter(c.chapter);
    setInstructions(c.instructions);
    setWhyThisMatters(c.whyThisMatters);
    setTemplate(c.template);
    setTargetOutput(c.targetOutput);
    setErrorTips(c.errorTips);
    setStatusMsg('');
  };

  const clearForm = () => {
    setSelectedChallenge(null);
    setTitle('');
    setChapter(1);
    setInstructions('');
    setWhyThisMatters('');
    setTemplate('');
    setTargetOutput('');
    setErrorTips('');
    setStatusMsg('');
  };

  const handleSave = () => {
    if (!title || !instructions || !targetOutput) {
      alert("Please fill in Title, Instructions and Target Output!");
      return;
    }

    const payload = { title, chapter, instructions, whyThisMatters, template, targetOutput, errorTips };

    if (selectedChallenge) {
      // Edit Challenge
      fetch(`/api/challenges/${selectedChallenge.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(updated => {
        setChallenges(challenges.map(c => c.id === selectedChallenge.id ? updated : c));
        setStatusMsg("Challenge updated successfully!");
      })
      .catch(() => {
        // Local Fallback
        setChallenges(challenges.map(c => c.id === selectedChallenge.id ? { ...c, ...payload } : c));
        setStatusMsg("Updated challenge locally (MERN backend offline).");
      });
    } else {
      // Add Challenge
      fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(added => {
        setChallenges([...challenges, added]);
        clearForm();
        setStatusMsg("New challenge created successfully!");
      })
      .catch(() => {
        // Local Fallback
        const newId = challenges.length > 0 ? Math.max(...challenges.map(c => c.id)) + 1 : 1;
        setChallenges([...challenges, { id: newId, ...payload }]);
        clearForm();
        setStatusMsg("Created challenge locally (MERN backend offline).");
      });
    }
  };

  const handleDelete = () => {
    if (!selectedChallenge) return;
    if (!confirm("Are you sure you want to delete this level?")) return;

    fetch(`/api/challenges/${selectedChallenge.id}`, {
      method: 'DELETE'
    })
    .then(res => res.json())
    .then(() => {
      setChallenges(challenges.filter(c => c.id !== selectedChallenge.id));
      clearForm();
      setStatusMsg("Challenge deleted successfully!");
    })
    .catch(() => {
      // Local Fallback
      setChallenges(challenges.filter(c => c.id !== selectedChallenge.id));
      clearForm();
      setStatusMsg("Deleted challenge locally (MERN backend offline).");
    });
  };

  return (
    <div className="admin-container">
      <div className="admin-header-row">
        <h2>PyBe Levels Admin Dashboard</h2>
        <button className="btn btn-secondary" onClick={clearForm}>➕ Create New Level</button>
      </div>

      {statusMsg && <div className="msg-display success" style={{ marginBottom: '20px' }}>{statusMsg}</div>}

      <div className="admin-layout">
        
        {/* Left Side: Challenge selection cards */}
        <div className="admin-card-list">
          {challenges.map(c => (
            <div 
              key={c.id} 
              className={`admin-challenge-item ${selectedChallenge?.id === c.id ? 'active' : ''}`}
              onClick={() => loadChallenge(c)}
            >
              <div className="admin-challenge-meta">
                <h4>{c.title}</h4>
                <span>Chapter {c.chapter} • Lvl {c.id}</span>
              </div>
              <span className="logo-icon">📝</span>
            </div>
          ))}
        </div>

        {/* Right Side: Level editing forms */}
        <div className="admin-form-panel glass-panel">
          <h3>{selectedChallenge ? `Edit Level ${selectedChallenge.id}` : 'Create New Level'}</h3>
          <div className="admin-form" style={{ marginTop: '20px' }}>
            <div className="admin-form-row">
              <div className="input-group">
                <label>Level Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Printing Math" />
              </div>
              <div className="input-group">
                <label>Chapter Location</label>
                <select value={chapter} onChange={e => setChapter(Number(e.target.value))}>
                  <option value={1}>Chapter 1 (Unlocked)</option>
                  <option value={2}>Chapter 2 (Unlocked)</option>
                  <option value={3}>Chapter 3 (Premium)</option>
                  <option value={4}>Chapter 4 (Premium)</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Instructions Description (HTML supported)</label>
              <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="e.g. Use print() statement..." />
            </div>

            <div className="input-group">
              <label>Why This Matters (Did You Know?)</label>
              <textarea value={whyThisMatters} onChange={e => setWhyThisMatters(e.target.value)} placeholder="Explain the real-world value of this skill..." />
            </div>

            <div className="admin-form-row">
              <div className="input-group">
                <label>Template Code</label>
                <textarea value={template} onChange={e => setTemplate(e.target.value)} placeholder="Initial editor template..." style={{ fontFamily: 'monospace' }} />
              </div>
              <div className="input-group">
                <label>Target Expected Output</label>
                <textarea value={targetOutput} onChange={e => setTargetOutput(e.target.value)} placeholder="Exact output target comparison string..." style={{ fontFamily: 'monospace' }} />
              </div>
            </div>

            <div className="input-group">
              <label>AI Helper Error Advice Tips</label>
              <textarea value={errorTips} onChange={e => setErrorTips(e.target.value)} placeholder="Helpful debugging context text when syntax or test checks fail..." />
            </div>

            <div className="admin-form-buttons">
              {selectedChallenge && (
                <button className="btn btn-secondary" style={{ backgroundColor: 'rgba(255, 95, 86, 0.1)', color: '#ff5f56' }} onClick={handleDelete}>
                  🗑️ Delete Level
                </button>
              )}
              <button className="btn btn-primary btn-glow" onClick={handleSave}>
                💾 Save Challenge Level
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ==========================================================================
// 8. Prompt Workspace Environment Page Component (Twin Workspace Layout)
// ==========================================================================
function PromptWorkspacePage({ 
  id, challenges, completedChallenges, setCompletedChallenges, 
  tokens, setTokens, membership, setUpsellChapter, setUpsellModalOpen, 
  workspaceFocus, setWorkspaceFocus, successModalOpen, setSuccessModalOpen 
}) {
  const challenge = challenges.find(c => c.id === id) || challenges[0];
  const [promptText, setPromptText] = useState('');
  const [actualOut, setActualOut] = useState('> Ready. Write your prompt below and click "Evaluate Prompt".');
  const [isError, setIsError] = useState(false);

  // Chat States for AI Helper
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hello! This is the AI Helper. Stuck on how to prompt for this level? Ask me any questions!" }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Resizable Splitter State
  const [leftWidth, setLeftWidth] = useState(45); // in percentage
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    setPromptText('');
    setActualOut('> Ready. Write your prompt below and click "Evaluate Prompt".');
    setIsError(false);
  }, [challenge]);

  const handleMouseDown = () => {
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newWidth > 20 && newWidth < 80) {
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleEvaluatePrompt = () => {
    if (!promptText.trim()) {
      setActualOut('> Please write a prompt first!');
      return;
    }
    setActualOut('> Evaluating prompt using LLM solver...');
    setTimeout(() => {
      const promptLower = promptText.toLowerCase();
      if (promptLower.includes('print') || promptLower.includes('output') || promptLower.length > 25) {
        setActualOut(`> Prompt accepted by model!\n> LLM Output: "${challenge.targetOutput}"\n\n🎉 Prompting target match succeeded!`);
        setIsError(false);
        if (!completedChallenges.includes(challenge.id)) {
          setCompletedChallenges([...completedChallenges, challenge.id]);
        }
        setSuccessModalOpen(true);
      } else {
        setActualOut(`> Prompt rejected.\n> Advice: Your prompt is too brief. Describe specifically to the AI what you want it to output or compute (e.g. "Write a Python script to print ${challenge.targetOutput}").`);
        setIsError(true);
      }
    }, 1000);
  };

  const handleSendMessage = (textToSend) => {
    const text = textToSend || chatInput.trim();
    if (!text) return;
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setChatInput('');
    setTimeout(() => {
      let response = `To prompt for Level ${challenge.id}, describe the task requirements. For example: "Print exactly '${challenge.targetOutput}'."`;
      setMessages(prev => [...prev, { sender: 'bot', text: response }]);
    }, 600);
  };

  return (
    <section id="route-prompt-workspace" className="page-route">
      <div className="workspace-layout">
        
        {/* Left Sidebar Panel - Level checklist maps */}
        <aside className="workspace-sidebar glass-panel">
          <div className="sidebar-tabs">
            <button className={`sidebar-tab ${workspaceFocus === 'code' || workspaceFocus === 'dyk' ? 'active' : ''}`} onClick={() => setWorkspaceFocus('code')}>📝 Level Map</button>
            <button className={`sidebar-tab ${workspaceFocus === 'ai_helper' ? 'active' : ''}`} onClick={() => setWorkspaceFocus('ai_helper')}>🤖 AI Helper</button>
          </div>

          {workspaceFocus === 'code' || workspaceFocus === 'dyk' ? (
            <div className="sidebar-panel active">
              <div className="sidebar-panel-header">
                <h3>Chapter Progression</h3>
              </div>
              <div className="challenge-menu-list">
                {challenges.filter(c => c.chapter === challenge.chapter).map(c => (
                  <div 
                    key={c.id} 
                    className={`challenge-item ${c.id === challenge.id ? 'active' : ''}`}
                    onClick={() => {
                      window.location.hash = `#/prompt-workspace/${c.id}`;
                    }}
                  >
                    <div className="challenge-label">
                      <span className="challenge-num">Chapter {c.chapter} • Lvl {c.id}</span>
                      <span className="challenge-title">{c.title}</span>
                    </div>
                    {completedChallenges.includes(c.id) && <span style={{ color: '#00E676' }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="sidebar-panel active">
              <div className="sidebar-panel-header">
                <h3>AI Debugger Chat</h3>
              </div>
              <div className="chat-messages-container">
                {messages.map((m, idx) => (
                  <div key={idx} className={`chat-msg ${m.sender}`}>
                    <div className="chat-bubble" dangerouslySetInnerHTML={{ __html: m.text }}></div>
                  </div>
                ))}
              </div>
              <div className="chat-input-wrapper">
                <input 
                  type="text" 
                  value={chatInput} 
                  onChange={e => setChatInput(e.target.value)} 
                  placeholder="Ask AI Helper..." 
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="btn btn-accent btn-small" onClick={() => handleSendMessage()}>Ask</button>
              </div>
            </div>
          )}
        </aside>

        {/* Center Panel (Resizable splitter container) */}
        <div className="split-pane-container" ref={containerRef} style={{ gridColumn: 'span 2' }}>
          
          {/* Left Split: Challenge Description */}
          <div className="split-left" style={{ width: `${leftWidth}%` }}>
            <div className="workspace-nav-bar">
              <a href="#/dashboard" className="btn-back">← Back to Dashboard</a>
              <div className="active-challenge-title">Prompt Challenge {challenge.id}</div>
            </div>

            <div className="instructions-card glass-panel">
              <div className="instructions-header">
                <h3>Task Instructions</h3>
              </div>
              <div className="instructions-body" dangerouslySetInnerHTML={{ __html: challenge.instructions }}></div>
              
              {/* DYK toggle focus pane */}
              {(workspaceFocus === 'dyk' || workspaceFocus === 'code') && (
                <div className="instructions-dropdown" style={{ border: workspaceFocus === 'dyk' ? '1px solid #00E676' : '1px solid rgba(255,255,255,0.08)' }}>
                  <summary style={{ padding: '4px', fontWeight: 'bold', color: '#00b0ff' }}>💡 Why This Matters (Did You Know?)</summary>
                  <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#8a8aa3' }} dangerouslySetInnerHTML={{ __html: challenge.whyThisMatters }}></div>
                </div>
              )}
            </div>
          </div>

          {/* User Drag Splitter Bar */}
          <div className="vertical-splitter" onMouseDown={handleMouseDown}></div>

          {/* Right Split: Prompt Editor & Output Console */}
          <div className="split-right" style={{ width: `${100 - leftWidth}%`, display: 'grid', gridTemplateRows: '1.2fr 1fr' }}>
            
            {/* Prompt editor panel */}
            <div className="editor-card glass-panel">
              <div className="editor-header">
                <span className="red-dot"></span><span className="yellow-dot"></span><span className="green-dot"></span>
                <span className="window-title">prompt_instructions.txt</span>
              </div>
              <div className="editor-container" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1.5px', color: 'var(--text-muted)' }}>WRITE YOUR PROMPT TO CONSTRUCT THE SOLUTION</label>
                <textarea 
                  className="code-editor-textarea" 
                  value={promptText} 
                  onChange={e => setPromptText(e.target.value)} 
                  placeholder="e.g. Write a python script that prints 'Hello, world' to the terminal output console..." 
                  style={{ width: '100%', flexGrow: '1', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                />
              </div>
              <div className="editor-footer">
                <button className="btn btn-secondary" onClick={() => setPromptText('')}>Clear Prompt</button>
                <button className="btn btn-accent btn-glow" onClick={handleEvaluatePrompt}>Evaluate Prompt ⚡</button>
              </div>
            </div>

            {/* Consoles outputs */}
            <div className="workspace-output glass-panel">
              <div className="output-panel expected-panel">
                <div className="output-header">
                  <h4>🎯 Expected Output Target</h4>
                </div>
                <div className="output-console target-console">{challenge.targetOutput}</div>
              </div>

              <div className="output-panel actual-panel">
                <div className="output-header">
                  <h4>💻 Actual Code Output Console</h4>
                </div>
                <div className={`output-console terminal-console ${isError ? 'error' : ''}`}>
                  {actualOut}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Completion Success Modal Overlay */}
      {successModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card glass-panel success-card">
            <div className="modal-header">
              <span className="modal-icon animate-bounce">🎉</span>
              <h3>Challenge Completed!</h3>
            </div>
            <div className="modal-body text-center">
              <p className="success-text">Awesome work! Your prompt successfully solved this level challenge.</p>
              <div className="badge badge-success">+100 XP gained</div>
            </div>
            <div className="modal-footer justify-center">
              <button className="btn btn-secondary" onClick={() => setSuccessModalOpen(false)}>Stay Here</button>
              <button 
                className="btn btn-primary btn-glow" 
                onClick={() => {
                  setSuccessModalOpen(false);
                  const nextId = challenge.id + 1;
                  if (nextId <= challenges.length) {
                    window.location.hash = `#/prompt-workspace/${nextId}`;
                  } else {
                    window.location.hash = '#/dashboard';
                  }
                }}
              >
                Next Challenge 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
