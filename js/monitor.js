/**
 * Cyber Threat Intelligence Framework - Security Activity Monitor & SOC Controller
 * Manages live telemetry feed, attention trace inspections, mitigation triggers,
 * and automated STIX 2.1 / SIEM rule exports.
 */

class SecurityMonitor {
  constructor(gatEngine) {
    this.gat = gatEngine;
    this.feedList = document.getElementById('activityFeedList');
    this.feedCount = 0;
    this.mitigationsCount = 14;

    this.setupListeners();
    this.populateInitialFeed();
  }

  setupListeners() {
    // Attention heads switcher buttons
    document.querySelectorAll('.head-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.head-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const headIndex = parseInt(chip.getAttribute('data-head'), 10);
        this.gat.setAttentionHead(headIndex);
        
        // Update dossier if a node is selected
        if (this.gat.selectedNode) {
          this.updateDossier(this.gat.selectedNode, this.gat.getNodeDossier(this.gat.selectedNode));
        }

        this.showToast(`Active GAT Attention Focus: ${this.gat.headLabels[headIndex]}`);
      });
    });

    // Canvas control buttons
    const resetBtn = document.getElementById('btnResetCanvas');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.gat.resetZoomPan();
        this.showToast('Graph viewport recentered');
      });
    }

    // Export STIX Button
    const exportStixBtn = document.getElementById('btnExportSTIX');
    if (exportStixBtn) {
      exportStixBtn.addEventListener('click', () => this.showSTIXModal());
    }

    // Mitigation Trigger Buttons
    const btnMitigateSiem = document.getElementById('btnMitigateSiem');
    const btnMitigateFirewall = document.getElementById('btnMitigateFirewall');
    const btnFreezeCrypto = document.getElementById('btnFreezeCrypto');

    if (btnMitigateSiem) {
      btnMitigateSiem.addEventListener('click', () => this.deploySiemRule());
    }
    if (btnMitigateFirewall) {
      btnMitigateFirewall.addEventListener('click', () => this.pushFirewallBlock());
    }
    if (btnFreezeCrypto) {
      btnFreezeCrypto.addEventListener('click', () => this.freezeWalletAddress());
    }

    // Node selection callback hook from GAT engine
    window.onNodeSelectedCallback = (node, dossier) => {
      this.updateDossier(node, dossier);
    };
  }

  populateInitialFeed() {
    const initialEvents = [
      {
        id: 'EVT-901',
        title: 'Zero-day PAN-OS RCE (CVE-2024-3400) Weaponized in Underground Forum',
        time: '2m ago',
        severity: 'critical',
        badge: 'CRITICAL',
        actor: 'LockBitSupp_v3',
        source: 'breachforums-v4.onion',
        nodeId: 'CVE-01',
        score: 96
      },
      {
        id: 'EVT-902',
        title: 'Target Asset Telemetry: Exfiltration auction targeting Global_Defense_Logistics',
        time: '7m ago',
        severity: 'critical',
        badge: 'CRITICAL',
        actor: 'VoltTyphoon_Cell',
        source: '0day-bazaar.onion',
        nodeId: 'TARGET-01',
        score: 95
      },
      {
        id: 'EVT-903',
        title: 'Mempool Transaction: 42.8 BTC Escrow linked to Ransomware Depository',
        time: '14m ago',
        severity: 'high',
        badge: 'HIGH',
        actor: 'LockBitSupp_v3',
        source: 'BTC: 1F1tAaz5x1HUX...',
        nodeId: 'BTC-01',
        score: 88
      },
      {
        id: 'EVT-904',
        title: 'Credential Harvest Auction: 4.8M SQL records from Apex_Fintech_Holdings',
        time: '22m ago',
        severity: 'high',
        badge: 'HIGH',
        actor: 'ShinyHunters_Reseller',
        source: 'breachforums-v4.onion',
        nodeId: 'TARGET-02',
        score: 87
      },
      {
        id: 'EVT-905',
        title: 'Payload Signature Ingestion: RustStealer.x64.dll memory DLL hash observed',
        time: '34m ago',
        severity: 'medium',
        badge: 'MEDIUM',
        actor: 'DarkWeb Scraper Node',
        source: '0day-bazaar.onion',
        nodeId: 'HASH-01',
        score: 85
      }
    ];

    initialEvents.forEach(evt => this.addFeedItem(evt, false));
  }

  addFeedItem(evt, isNew = true) {
    if (!this.feedList) return;

    const item = document.createElement('div');
    item.className = `activity-feed-item sev-${evt.severity}`;
    item.setAttribute('data-node-id', evt.nodeId || '');
    item.innerHTML = `
      <div class="activity-header">
        <span class="activity-badge badge-${evt.severity}">${evt.badge || evt.severity}</span>
        <span class="activity-time">${evt.time || 'Just now'}</span>
      </div>
      <div class="activity-title">${this.escapeHtml(evt.title)}</div>
      <div class="activity-meta">
        <span>Actor: ${this.escapeHtml(evt.actor || 'Unknown')}</span>
        <span>Threat: ${evt.score || 85}/100</span>
      </div>
    `;

    item.addEventListener('click', () => {
      if (evt.nodeId) {
        const targetNode = this.gat.nodes.find(n => n.id === evt.nodeId);
        if (targetNode) {
          this.gat.selectNode(targetNode);
          this.gat.panX = this.gat.canvas.width / 2 - targetNode.x * this.gat.zoom;
          this.gat.panY = this.gat.canvas.height / 2 - targetNode.y * this.gat.zoom;
        }
      }
    });

    this.feedList.prepend(item);
    this.feedCount++;

    // Increment anomalies stat box
    const anomalyStat = document.getElementById('statHighAnomalies');
    if (anomalyStat && isNew) {
      let cur = parseInt(anomalyStat.innerText, 10) || 12;
      anomalyStat.innerText = cur + 1;
    }
  }

  updateDossier(node, dossier) {
    const dossierEmpty = document.getElementById('dossierEmptyState');
    const dossierContent = document.getElementById('dossierContentState');

    if (!dossierEmpty || !dossierContent) return;

    dossierEmpty.style.display = 'none';
    dossierContent.style.display = 'flex';

    // Set labels
    document.getElementById('dossierNodeTitle').innerText = node.label;
    document.getElementById('dossierNodeType').innerText = node.type.replace('_', ' ');
    document.getElementById('dossierThreatVal').innerText = `${node.threatScore}/100`;

    // Fill score bar
    const fillBar = document.getElementById('dossierThreatFill');
    if (fillBar) {
      fillBar.style.width = `${node.threatScore}%`;
    }

    // Set details text
    document.getElementById('dossierDetails').innerText = node.details || 'No additional threat intel telemetry.';

    // Populate Attention Neighbor Breakdown
    const neighborsList = document.getElementById('dossierNeighborsList');
    if (neighborsList) {
      neighborsList.innerHTML = '';
      if (!dossier.neighbors || dossier.neighbors.length === 0) {
        neighborsList.innerHTML = '<div style="font-size:0.72rem; color:#64748b;">No direct attention edges connected.</div>';
      } else {
        dossier.neighbors.forEach(nbr => {
          const row = document.createElement('div');
          row.className = 'attn-neighbor-row';
          row.innerHTML = `
            <div>
              <div style="font-weight:600; color:#f1f5f9;">${this.escapeHtml(nbr.neighborLabel)}</div>
              <div style="font-size:0.65rem; color:#94a3b8;">${this.escapeHtml(nbr.relation)} (${nbr.neighborType})</div>
            </div>
            <div class="attn-coeff">α = ${nbr.attentionWeight}</div>
          `;
          row.style.cursor = 'pointer';
          row.addEventListener('click', () => {
            const target = this.gat.nodes.find(n => n.id === nbr.neighborId);
            if (target) this.gat.selectNode(target);
          });
          neighborsList.appendChild(row);
        });
      }
    }

    // Populate 8-dim feature tensor in table
    const tensorBox = document.getElementById('dossierFeatureTensor');
    if (tensorBox && node.features) {
      tensorBox.innerHTML = node.features.map((f, i) => {
        return `<span style="background:#1e2738; padding:2px 5px; border-radius:3px; margin:2px; display:inline-block; font-size:0.68rem; color:#38bdf8;">h[${i}]=${f.toFixed(2)}</span>`;
      }).join(' ');
    }
  }

  deploySiemRule() {
    const selected = this.gat.selectedNode;
    const ruleTarget = selected ? selected.label : 'CVE-2024-3400';
    const ruleContent = `
alert tcp $EXTERNAL_NET any -> $HOME_NET [80,443,8443] (
  msg:"CTI-GAT CRITICAL ALERT: Dark Web Weaponized Exploit Target [${ruleTarget}]";
  flow:established,to_server;
  content:"/ssl-vpn/hipreport.esp"; http_uri;
  threshold:type limit, track by_src, count 1, seconds 3600;
  classtype:attempted-admin;
  sid:9002401; rev:1;
  metadata:gat_attention_weight "0.96", attribution "LockBitSupp_v3";
)`;

    this.showRuleModal('SIEM Suricata Detection Rule Generated', ruleContent);
    this.showToast(`SIEM Rule deployed to enterprise collectors for: ${ruleTarget}`);
  }

  pushFirewallBlock() {
    const selected = this.gat.selectedNode;
    const blockTarget = selected ? selected.label : '185.220.101.5';
    this.showToast(`IOC Pushed: Perimeter blocklist updated with ${blockTarget}`);
  }

  freezeWalletAddress() {
    const btcWallet = '1F1tAaz5x1HUXrCNLbtMDqcw6o5GNn4xqX';
    this.showToast(`Crypto Alert Dispatched: Chainalysis / TRM Labs notified to flag ${btcWallet}`);
  }

  showSTIXModal() {
    const stixJson = this.gat.exportSTIX();
    this.showRuleModal('STIX 2.1 CTI Threat Intel Bundle (GAT Annotated)', stixJson);
  }

  showRuleModal(title, code) {
    const modalBackdrop = document.getElementById('genericModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    if (!modalBackdrop || !modalTitle || !modalBody) return;

    modalTitle.innerText = title;
    modalBody.innerHTML = `
      <pre style="background:#070a10; color:#38bdf8; padding:12px; border-radius:4px; font-family:monospace; font-size:0.75rem; overflow-x:auto; max-height:400px; white-space:pre-wrap;">${this.escapeHtml(code)}</pre>
    `;

    modalBackdrop.classList.add('show');

    const closeBtn = document.getElementById('modalCloseBtn');
    if (closeBtn) {
      closeBtn.onclick = () => modalBackdrop.classList.remove('show');
    }
  }

  showToast(message, isCritical = false) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${isCritical ? 'critical' : ''}`;
    toast.innerHTML = `
      <span style="font-size:1rem;">${isCritical ? '🚨' : '🛡️'}</span>
      <span>${this.escapeHtml(message)}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
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

window.SecurityMonitor = SecurityMonitor;
