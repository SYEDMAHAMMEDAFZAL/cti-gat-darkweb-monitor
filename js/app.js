/**
 * Main Application Orchestrator for Cyber Threat Intelligence (CTI) Framework
 * Connects GATEngine, DarkWebSimulator, and SecurityMonitor with real-time events,
 * split cockpit views, and tactical Web Audio telemetry sound.
 */

class CTIApplication {
  constructor() {
    this.currentView = 'soc';
    this.soundEnabled = true;
    this.audioCtx = null;

    this.initAudio();
    this.initComponents();
    this.setupViewNavigation();
    this.setupSplitCockpit();
  }

  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn('Web Audio not supported in this environment');
    }
  }

  playTacticalBlip(freq = 440, type = 'sine', duration = 0.08) {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (err) {
      // Audio playback safe ignore
    }
  }

  initComponents() {
    // 1. Initialize Graph Attention Network Engine
    this.gat = new GATEngine('gatCanvas');

    // 2. Initialize Dark Web Simulator
    this.darkweb = new DarkWebSimulator();

    // 3. Initialize SOC Security Activity Monitor
    this.monitor = new SecurityMonitor(this.gat);

    // Audio toggle button
    const audioToggleBtn = document.getElementById('btnToggleAudio');
    if (audioToggleBtn) {
      audioToggleBtn.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        audioToggleBtn.innerHTML = this.soundEnabled ? '🔊 Audio: ON' : '🔇 Audio: OFF';
        this.playTacticalBlip(520, 'triangle', 0.05);
      });
    }
  }

  setupViewNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetView = btn.getAttribute('data-view');
        this.switchView(targetView);
        this.playTacticalBlip(600, 'sine', 0.04);
      });
    });
  }

  switchView(viewName) {
    this.currentView = viewName;

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      if (btn.getAttribute('data-view') === viewName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update view containers
    document.querySelectorAll('.view-container').forEach(container => {
      if (container.id === `view-${viewName}`) {
        container.classList.add('active-view');
      } else {
        container.classList.remove('active-view');
      }
    });

    // Resize canvas if returning to SOC or Split view
    if (viewName === 'soc') {
      setTimeout(() => this.gat.initCanvasSize(), 50);
    } else if (viewName === 'split') {
      this.refreshSplitView();
    }
  }

  setupSplitCockpit() {
    // Clones active dark web threads and GAT alerts into split container
    const splitThreatForm = document.getElementById('splitNewPostForm');
    if (splitThreatForm) {
      splitThreatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('splitPostTitleInput').value.trim();
        const target = document.getElementById('splitPostTargetInput').value.trim();
        const cve = document.getElementById('splitPostCveInput').value.trim();

        if (!title) return;

        this.triggerDarkWebAlert({
          title: title,
          actor: 'SplitView_Operator',
          target: target || 'Critical_Infrastructure_Subnet',
          cve: cve || 'CVE-2024-EXPLOIT',
          severity: 'critical',
          threatScore: 97,
          type: 'CVE_VULN',
          details: `Dual Cockpit Threat Intercept: ${title} targeting ${target}`
        });

        document.getElementById('splitPostTitleInput').value = '';
        this.monitor.showToast('Thread injected via Split Cockpit into Tor network!');
      });
    }
  }

  refreshSplitView() {
    const splitGatCanvas = document.getElementById('splitGatCanvas');
    if (!splitGatCanvas) return;
    
    // Create mini canvas mirror
    const splitCtx = splitGatCanvas.getContext('2d');
    splitGatCanvas.width = splitGatCanvas.parentElement.clientWidth || 500;
    splitGatCanvas.height = 360;

    const renderSplit = () => {
      if (this.currentView !== 'split') return;
      splitCtx.clearRect(0, 0, splitGatCanvas.width, splitGatCanvas.height);
      splitCtx.save();
      splitCtx.drawImage(this.gat.canvas, 0, 0, splitGatCanvas.width, splitGatCanvas.height);
      splitCtx.restore();
      requestAnimationFrame(renderSplit);
    };
    requestAnimationFrame(renderSplit);
  }

  /**
   * Central cross-correlation event handler:
   * Called when activity happens on the dark web (posting threads, market transactions, scraper hits).
   */
  triggerDarkWebAlert(eventData) {
    this.playTacticalBlip(880, 'sawtooth', 0.15);

    // 1. Ingest into GAT Engine to update graph & recalculate attention coefficients
    const newNode = this.gat.injectThreatEvent(eventData);

    // 2. Add to Activity Monitor Intercept Stream
    this.monitor.addFeedItem({
      id: newNode.id,
      title: eventData.title,
      time: 'Just now',
      severity: eventData.severity || 'critical',
      badge: (eventData.severity || 'CRITICAL').toUpperCase(),
      actor: eventData.actor,
      source: 'Tor Intercept Scraper',
      nodeId: newNode.id,
      score: eventData.threatScore || 95
    }, true);

    // 3. Update Split Cockpit live correlation display
    const splitFeed = document.getElementById('splitCorrelationFeed');
    if (splitFeed) {
      const item = document.createElement('div');
      item.style.background = '#141a27';
      item.style.border = '1px solid #ef4444';
      item.style.borderLeft = '3px solid #ef4444';
      item.style.borderRadius = '4px';
      item.style.padding = '8px';
      item.style.fontSize = '0.74rem';
      item.style.color = '#f1f5f9';
      item.style.marginBottom = '6px';
      item.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
          <span style="color:#ef4444; font-weight:700;">GAT HIGH-ATTENTION ALERT</span>
          <span style="color:#94a3b8; font-family:monospace;">${new Date().toTimeString().split(' ')[0]}</span>
        </div>
        <div><strong>Node:</strong> ${newNode.label} (${newNode.type})</div>
        <div style="color:#38bdf8;">Attention Score α = ${(0.85 + Math.random() * 0.14).toFixed(3)} (Re-weighted across Head 2 & 4)</div>
      `;
      splitFeed.prepend(item);
    }

    // 4. Alert operator with toast
    this.monitor.showToast(`🚨 High-Priority Threat Correlated: ${eventData.title}`, true);
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.ctiApp = new CTIApplication();
});
