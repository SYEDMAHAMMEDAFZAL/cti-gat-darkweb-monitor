/**
 * Dark Web Activity Simulator ("ShadowNet Tor Onion Browser")
 * Realistic simulation of Tor hidden services, underground forums,
 * 0-day exploit markets, ransomware leak sites, and dynamic threat posting.
 */

class DarkWebSimulator {
  constructor() {
    this.currentSite = 'breachforums';
    this.history = ['breachforums'];
    this.historyIndex = 0;
    
    this.urls = {
      breachforums: 'http://breachforums-v47x92kp.onion/threads',
      bazaar: 'http://0day-bazaar-underground.onion/market',
      lockbit: 'http://lockbit3-ransom-vault.onion/victims',
      mixer: 'http://xmr-btc-tumbler-shield.onion/clean'
    };

    this.onionCircuits = [
      'Guard: [DE] 185.220.101.5 ➔ Middle: [CH] 194.26.29.11 ➔ Exit: [IS] 46.227.67.102 ➔ Rend: .onion',
      'Guard: [NL] 45.154.255.89 ➔ Middle: [SE] 185.195.233.4 ➔ Exit: [RO] 89.44.195.12 ➔ Rend: .onion',
      'Guard: [FR] 51.15.24.180 ➔ Middle: [NO] 185.100.86.100 ➔ Exit: [FI] 95.217.163.24 ➔ Rend: .onion'
    ];

    this.setupListeners();
    this.startTerminalTelemetry();
    this.startRansomTimers();
  }

  setupListeners() {
    // Browser navigation buttons
    const backBtn = document.getElementById('dwBackBtn');
    const fwdBtn = document.getElementById('dwFwdBtn');
    const refreshBtn = document.getElementById('dwRefreshBtn');
    const urlInput = document.getElementById('dwUrlInput');

    if (backBtn) backBtn.addEventListener('click', () => this.goBack());
    if (fwdBtn) fwdBtn.addEventListener('click', () => this.goForward());
    if (refreshBtn) refreshBtn.addEventListener('click', () => this.refresh());
    if (urlInput) {
      urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.handleUrlEnter(urlInput.value);
        }
      });
    }

    // Browser tabs
    document.querySelectorAll('.browser-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const siteKey = tab.getAttribute('data-site');
        if (siteKey) this.navigateTo(siteKey);
      });
    });

    // Threat post form submission
    const threatForm = document.getElementById('dwNewPostForm');
    if (threatForm) {
      threatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitThreatPost();
      });
    }
  }

  navigateTo(siteKey, addToHistory = true) {
    this.currentSite = siteKey;
    if (addToHistory) {
      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push(siteKey);
      this.historyIndex = this.history.length - 1;
    }

    // Update active tab styles
    document.querySelectorAll('.browser-tab').forEach(tab => {
      if (tab.getAttribute('data-site') === siteKey) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Update URL bar
    const urlInput = document.getElementById('dwUrlInput');
    if (urlInput && this.urls[siteKey]) {
      urlInput.value = this.urls[siteKey];
    }

    // Update circuit
    const circuitSpan = document.getElementById('dwCircuitDisplay');
    if (circuitSpan) {
      const randCircuit = this.onionCircuits[Math.floor(Math.random() * this.onionCircuits.length)];
      circuitSpan.innerText = randCircuit;
    }

    // Update active page content
    document.querySelectorAll('.darkweb-page').forEach(page => {
      if (page.id === `page-${siteKey}`) {
        page.classList.add('active-page');
      } else {
        page.classList.remove('active-page');
      }
    });

    // Trigger visual loading feedback
    this.simulateTorLatency();
  }

  goBack() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.navigateTo(this.history[this.historyIndex], false);
    }
  }

  goForward() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.navigateTo(this.history[this.historyIndex], false);
    }
  }

  refresh() {
    this.simulateTorLatency();
  }

  handleUrlEnter(val) {
    if (val.includes('0day') || val.includes('bazaar')) {
      this.navigateTo('bazaar');
    } else if (val.includes('lockbit') || val.includes('ransom')) {
      this.navigateTo('lockbit');
    } else if (val.includes('mixer') || val.includes('tumbler')) {
      this.navigateTo('mixer');
    } else {
      this.navigateTo('breachforums');
    }
  }

  simulateTorLatency() {
    const viewport = document.getElementById('dwViewport');
    if (!viewport) return;
    viewport.style.opacity = '0.35';
    viewport.style.pointerEvents = 'none';

    setTimeout(() => {
      viewport.style.opacity = '1';
      viewport.style.pointerEvents = 'auto';
    }, 280);
  }

  submitThreatPost() {
    const title = document.getElementById('postTitleInput').value.trim();
    const actor = document.getElementById('postActorInput').value.trim();
    const target = document.getElementById('postTargetInput').value.trim();
    const cve = document.getElementById('postCveInput').value.trim();
    const price = document.getElementById('postPriceInput').value.trim();
    const snippet = document.getElementById('postSnippetInput').value.trim();

    if (!title) return;

    // Create realistic forum card DOM
    const threadCard = document.createElement('div');
    threadCard.className = 'forum-thread-card';
    threadCard.innerHTML = `
      <div class="thread-tag-row">
        <span class="thread-tag exploit">INTERCEPTED</span>
        <span class="thread-tag database">${cve || 'ZERO-DAY'}</span>
        <span class="thread-tag ransomware">${target || 'ENTERPRISE'}</span>
      </div>
      <div class="thread-title">${this.escapeHtml(title)}</div>
      <div class="thread-snippet">${this.escapeHtml(snippet || 'Exfiltrated databases and weaponized exploitation script. Serious buyers only.')}</div>
      <div class="thread-footer">
        <span>Vendor: <span class="thread-actor">${this.escapeHtml(actor || 'Anonymous_Op')}</span> (PGP Verified)</span>
        <span>Price: ${this.escapeHtml(price || '1.8 BTC')}</span>
        <span>Just now</span>
      </div>
    `;

    const threadsList = document.getElementById('forumThreadsList');
    if (threadsList) {
      threadsList.prepend(threadCard);
    }

    // Reset inputs
    document.getElementById('postTitleInput').value = '';
    document.getElementById('postSnippetInput').value = '';

    // Dispatch cross-framework CTI alert
    if (window.ctiApp) {
      window.ctiApp.triggerDarkWebAlert({
        title: title,
        actor: actor || 'LockBitSupp_v3',
        target: target || 'Global_Defense_Logistics',
        cve: cve || 'CVE-2024-3400',
        price: price || '2.4 BTC',
        severity: 'critical',
        threatScore: 96,
        type: 'CVE_VULN',
        details: snippet || `Dark web intercept: Exploit auction matching ${cve} targeting ${target}`
      });
    }
  }

  purchaseItem(itemName, price, vendor) {
    if (window.ctiApp) {
      window.ctiApp.triggerDarkWebAlert({
        title: `Escrow Transaction Initiated: ${itemName}`,
        actor: vendor,
        target: 'BlackMarket Escrow Relay',
        cve: 'FINANCIAL_TRANSACTION',
        price: price,
        severity: 'high',
        threatScore: 88,
        type: 'CRYPTO_WALLET',
        details: `Underground purchase escrow locked: ${price} transferred to tumbler wallet for ${itemName}`
      });
    }
  }

  startRansomTimers() {
    setInterval(() => {
      document.querySelectorAll('.countdown-timer').forEach(timer => {
        let text = timer.innerText;
        let parts = text.split(':').map(Number);
        if (parts.length === 3) {
          let [h, m, s] = parts;
          s--;
          if (s < 0) { s = 59; m--; }
          if (m < 0) { m = 59; h--; }
          if (h >= 0) {
            timer.innerText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
          }
        }
      });
    }, 1000);
  }

  startTerminalTelemetry() {
    const rawTerminal = document.getElementById('dwRawTerminal');
    if (!rawTerminal) return;

    const sampleLogs = [
      '[TOR SCRAPER] Synchronizing rendezvous circuit for .onion directory hash: 9d8f...3a1e',
      '[INTERCEPT ENGINE] Discovered high-entropy PGP block from key fingerprint 0x7E4A...B901',
      '[NLP ENTITY EXTRACTOR] Identified token "CVE-2024-3400" in thread ID #88491 (BreachForums)',
      '[WALLET TRACKER] Inbound mempool transaction to flagged address 1F1tAaz5x1HUX... [3.45 BTC]',
      '[GAT ADAPTIVE SAMPLER] Re-weighting attention head #2 for exploit propagation graph',
      '[TOR RELAY HEARTBEAT] 1,480 active microdescriptors received across circuit hops'
    ];

    let index = 0;
    setInterval(() => {
      const line = document.createElement('div');
      line.style.fontSize = '0.7rem';
      line.style.fontFamily = 'monospace';
      line.style.color = '#94a3b8';
      line.style.marginBottom = '2px';
      
      const time = new Date().toTimeString().split(' ')[0];
      line.innerText = `[${time}] ${sampleLogs[index % sampleLogs.length]}`;
      rawTerminal.appendChild(line);
      rawTerminal.scrollTop = rawTerminal.scrollHeight;

      if (rawTerminal.childNodes.length > 50) {
        rawTerminal.removeChild(rawTerminal.firstChild);
      }
      index++;
    }, 4500);
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

window.DarkWebSimulator = DarkWebSimulator;
