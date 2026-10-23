/**
 * Cyber Threat Intelligence Framework - Graph Attention Network (GAT) Engine
 * Implements Heterogeneous Threat Graph, Multi-Head Attention Mechanism,
 * Dynamic Force Simulation, and Real-time Dark Web Event Ingestion.
 */

class GATEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // Multi-head attention settings
    this.numHeads = 4;
    this.currentHead = 0; // 0 = Averaged / Ensemble, 1 = Financial, 2 = Exploit, 3 = Infrastructure, 4 = Target
    this.headLabels = [
      'Multi-Head Ensemble',
      'Head 1: Financial Flow',
      'Head 2: Exploit Propagation',
      'Head 3: Infrastructure Attribution',
      'Head 4: Target Infiltration Risk'
    ];

    // Node entity types and muted tactical colors
    this.entityColors = {
      THREAT_ACTOR: '#c084fc',   // Muted Purple
      ONION_SERVICE: '#38bdf8',  // Muted Cyan
      CRYPTO_WALLET: '#f59e0b',  // Muted Amber
      CVE_VULN: '#ef4444',       // Muted Red
      TARGET_ORG: '#10b981',     // Muted Emerald
      MALWARE_HASH: '#fb7185'    // Muted Rose
    };

    // State
    this.nodes = [];
    this.edges = [];
    this.selectedNode = null;
    this.hoveredNode = null;
    this.particles = [];
    
    // Viewport transform
    this.panX = 0;
    this.panY = 0;
    this.zoom = 1;
    this.isDragging = false;
    this.draggedNode = null;
    this.lastMousePos = { x: 0, y: 0 };

    this.initCanvasSize();
    this.setupListeners();
    this.seedDefaultGraph();
    this.computeGATAttention();
    this.startAnimationLoop();
  }

  initCanvasSize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width || 800;
    this.canvas.height = rect.height || 520;
    this.panX = this.canvas.width / 2;
    this.panY = this.canvas.height / 2;
  }

  seedDefaultGraph() {
    // 8-dim feature vector per node:
    // [ThreatScore, MentionFreq, SeverityIndex, FinancialFlow, NetworkDegree, SentimentPolarity, ExploitMaturity, TargetValue]
    this.nodes = [
      {
        id: 'TA-01',
        label: 'LockBitSupp_v3',
        type: 'THREAT_ACTOR',
        threatScore: 94,
        features: [0.94, 0.88, 0.95, 0.85, 0.75, -0.82, 0.90, 0.80],
        x: -180, y: -90, vx: 0, vy: 0, radius: 14,
        details: 'High-profile ransomware affiliate syndicate. Extensively active on .onion leak forums.'
      },
      {
        id: 'TA-02',
        label: 'VoltTyphoon_Cell',
        type: 'THREAT_ACTOR',
        threatScore: 89,
        features: [0.89, 0.72, 0.98, 0.30, 0.65, -0.70, 0.95, 0.95],
        x: 190, y: -130, vx: 0, vy: 0, radius: 13,
        details: 'State-sponsored cyber espionage group targeting critical infrastructure systems.'
      },
      {
        id: 'TA-03',
        label: 'ShinyHunters_Reseller',
        type: 'THREAT_ACTOR',
        threatScore: 82,
        features: [0.82, 0.95, 0.70, 0.92, 0.80, -0.65, 0.60, 0.85],
        x: -120, y: 150, vx: 0, vy: 0, radius: 12,
        details: 'Prolific darknet data breach broker specialized in cloud credential dumps.'
      },
      {
        id: 'ONION-01',
        label: 'breachforums-v4.onion',
        type: 'ONION_SERVICE',
        threatScore: 78,
        features: [0.78, 0.99, 0.65, 0.50, 0.90, -0.45, 0.70, 0.60],
        x: -50, y: -40, vx: 0, vy: 0, radius: 11,
        details: 'Tor hidden service dedicated to selling stolen credentials and private databases.'
      },
      {
        id: 'ONION-02',
        label: 'lockbit3-vault.onion',
        type: 'ONION_SERVICE',
        threatScore: 92,
        features: [0.92, 0.85, 0.90, 0.75, 0.60, -0.90, 0.85, 0.75],
        x: -240, y: 20, vx: 0, vy: 0, radius: 12,
        details: 'Ransomware negotiation portal and victim data publication site.'
      },
      {
        id: 'ONION-03',
        label: '0day-bazaar.onion',
        type: 'ONION_SERVICE',
        threatScore: 86,
        features: [0.86, 0.65, 0.95, 0.88, 0.55, -0.75, 0.92, 0.85],
        x: 80, y: -50, vx: 0, vy: 0, radius: 11,
        details: 'Underground exploit marketplace offering weaponized zero-day vulnerability POCs.'
      },
      {
        id: 'CVE-01',
        label: 'CVE-2024-3400',
        type: 'CVE_VULN',
        threatScore: 96,
        features: [0.96, 0.92, 0.99, 0.10, 0.85, -0.85, 0.98, 0.95],
        x: -40, y: -160, vx: 0, vy: 0, radius: 13,
        details: 'PAN-OS GlobalProtect Gateway Arbitrary Command Execution (CVSS 10.0).'
      },
      {
        id: 'CVE-02',
        label: 'CVE-2024-21887',
        type: 'CVE_VULN',
        threatScore: 91,
        features: [0.91, 0.80, 0.92, 0.20, 0.70, -0.80, 0.95, 0.90],
        x: 120, y: 40, vx: 0, vy: 0, radius: 12,
        details: 'Ivanti Connect Secure and Policy Secure Remote Code Execution.'
      },
      {
        id: 'BTC-01',
        label: 'BTC: 1F1tAaz5x1HUX...x4xqX',
        type: 'CRYPTO_WALLET',
        threatScore: 88,
        features: [0.88, 0.75, 0.60, 0.98, 0.75, -0.40, 0.30, 0.50],
        x: -220, y: -180, vx: 0, vy: 0, radius: 11,
        details: 'Identified ransomware extortion depository with 42.8 BTC cumulative volume.'
      },
      {
        id: 'BTC-02',
        label: 'BTC: 3J98t1WpEZ73...RhWNLy',
        type: 'CRYPTO_WALLET',
        threatScore: 74,
        features: [0.74, 0.60, 0.50, 0.92, 0.50, -0.30, 0.20, 0.40],
        x: -30, y: 120, vx: 0, vy: 0, radius: 10,
        details: 'Marketplace escrow settlement wallet flagged for crypto tumbling hops.'
      },
      {
        id: 'TARGET-01',
        label: 'Global_Defense_Logistics',
        type: 'TARGET_ORG',
        threatScore: 95,
        features: [0.95, 0.89, 0.90, 0.40, 0.65, -0.92, 0.85, 0.99],
        x: 20, y: -220, vx: 0, vy: 0, radius: 13,
        details: 'Critical defense aerospace contractor identified in ongoing exfiltration discussions.'
      },
      {
        id: 'TARGET-02',
        label: 'Apex_Fintech_Holdings',
        type: 'TARGET_ORG',
        threatScore: 87,
        features: [0.87, 0.94, 0.82, 0.85, 0.75, -0.88, 0.70, 0.92],
        x: -160, y: 220, vx: 0, vy: 0, radius: 12,
        details: 'Tier-1 payments provider whose internal SQL customer dumps are auctioned on forum.'
      },
      {
        id: 'TARGET-03',
        label: 'BioHealth_Genomics_Corp',
        type: 'TARGET_ORG',
        threatScore: 79,
        features: [0.79, 0.68, 0.80, 0.55, 0.45, -0.72, 0.65, 0.88],
        x: 220, y: -30, vx: 0, vy: 0, radius: 11,
        details: 'Biotech healthcare enterprise victim of recent ransomware double-extortion.'
      },
      {
        id: 'HASH-01',
        label: 'RustStealer.x64.dll',
        type: 'MALWARE_HASH',
        threatScore: 85,
        features: [0.85, 0.78, 0.88, 0.40, 0.60, -0.85, 0.85, 0.70],
        x: 60, y: 160, vx: 0, vy: 0, radius: 10,
        details: 'Memory-resident information stealer targeting browser cookies and API tokens.'
      },
      {
        id: 'HASH-02',
        label: 'CobaltStrike_Beacon_4.9',
        type: 'MALWARE_HASH',
        threatScore: 93,
        features: [0.93, 0.88, 0.94, 0.50, 0.75, -0.90, 0.90, 0.85],
        x: 180, y: 80, vx: 0, vy: 0, radius: 11,
        details: 'Customized adversary simulation payload equipped with domain fronting.'
      }
    ];

    this.edges = [
      { source: 'TA-01', target: 'ONION-02', relation: 'OPERATES_INFRA', baseWeight: 0.95 },
      { source: 'TA-01', target: 'BTC-01', relation: 'CONTROLS_WALLET', baseWeight: 0.92 },
      { source: 'TA-01', target: 'CVE-01', relation: 'WEAPONIZES', baseWeight: 0.96 },
      { source: 'CVE-01', target: 'TARGET-01', relation: 'EXPLOITS_SYSTEM', baseWeight: 0.98 },
      { source: 'TA-01', target: 'ONION-01', relation: 'DISCUSSES_ON', baseWeight: 0.85 },
      { source: 'TA-03', target: 'ONION-01', relation: 'SELLER_ON', baseWeight: 0.90 },
      { source: 'TA-03', target: 'BTC-02', relation: 'RECEIVES_ESCROW', baseWeight: 0.88 },
      { source: 'TA-03', target: 'TARGET-02', relation: 'LEAKS_DATA_OF', baseWeight: 0.94 },
      { source: 'TA-02', target: 'CVE-01', relation: 'EXPLOITS', baseWeight: 0.89 },
      { source: 'TA-02', target: 'CVE-02', relation: 'ACTIVE_CAMPAIGN', baseWeight: 0.93 },
      { source: 'CVE-02', target: 'HASH-02', relation: 'DROPS_PAYLOAD', baseWeight: 0.87 },
      { source: 'HASH-02', target: 'TARGET-01', relation: 'INFECTS', baseWeight: 0.88 },
      { source: 'ONION-03', target: 'CVE-01', relation: 'AUCTIONS_POC', baseWeight: 0.86 },
      { source: 'ONION-03', target: 'BTC-02', relation: 'ESCROW_SETTLEMENT', baseWeight: 0.79 },
      { source: 'TA-01', target: 'TARGET-03', relation: 'EXTORTS', baseWeight: 0.89 },
      { source: 'HASH-01', target: 'TARGET-02', relation: 'EXFILTRATES_FROM', baseWeight: 0.81 },
      { source: 'TA-03', target: 'HASH-01', relation: 'BUYS_LOGS_FROM', baseWeight: 0.77 }
    ];

    // Connect node references directly for simulation
    this.linkEdgesToNodes();
  }

  linkEdgesToNodes() {
    this.edges.forEach(edge => {
      if (typeof edge.source === 'string') {
        edge.sourceNode = this.nodes.find(n => n.id === edge.source);
      } else {
        edge.sourceNode = edge.source;
      }
      if (typeof edge.target === 'string') {
        edge.targetNode = this.nodes.find(n => n.id === edge.target);
      } else {
        edge.targetNode = edge.target;
      }
    });
  }

  /**
   * Computes Multi-Head Graph Attention (GAT) Coefficients:
   * e_ij = LeakyReLU(a^T [Wh_i || Wh_j])
   * alpha_ij = exp(e_ij) / sum_k(exp(e_ik))
   */
  computeGATAttention() {
    // Distinct projection weight focuses for each head
    const headWeights = [
      [0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25], // Head 0: Balanced ensemble
      [0.05, 0.10, 0.10, 0.95, 0.40, 0.10, 0.10, 0.50], // Head 1: Financial flow
      [0.85, 0.30, 0.95, 0.05, 0.40, 0.60, 0.98, 0.40], // Head 2: Exploit propagation
      [0.70, 0.90, 0.40, 0.20, 0.90, 0.30, 0.40, 0.50], // Head 3: Infrastructure / Actor
      [0.60, 0.40, 0.80, 0.30, 0.50, 0.80, 0.70, 0.98]  // Head 4: Target infiltration
    ];

    // Compute attention for each edge
    this.edges.forEach(edge => {
      const u = edge.sourceNode;
      const v = edge.targetNode;
      if (!u || !v) return;

      edge.headAttentions = [];

      for (let h = 0; h < 5; h++) {
        const w = headWeights[h];
        // Compute dot product of feature difference and similarity
        let score = 0;
        for (let i = 0; i < 8; i++) {
          score += w[i] * (u.features[i] * v.features[i] + 0.1 * edge.baseWeight);
        }
        // LeakyReLU non-linearity (alpha = 0.2)
        const leakyScore = score >= 0 ? score : 0.2 * score;
        edge.headAttentions.push(leakyScore);
      }
    });

    // Softmax normalization over outgoing neighborhood of each node
    this.nodes.forEach(node => {
      const incidentEdges = this.edges.filter(
        e => e.sourceNode === node || e.targetNode === node
      );

      for (let h = 0; h < 5; h++) {
        const sumExp = incidentEdges.reduce((acc, e) => {
          return acc + Math.exp(Math.min(e.headAttentions[h], 10));
        }, 0);

        incidentEdges.forEach(e => {
          if (!e.normalizedAttn) e.normalizedAttn = [];
          const expVal = Math.exp(Math.min(e.headAttentions[h], 10));
          e.normalizedAttn[h] = sumExp > 0 ? Number((expVal / sumExp).toFixed(4)) : 0.2;
        });
      }
    });

    this.rebuildAttentionParticles();
  }

  setAttentionHead(headIndex) {
    this.currentHead = headIndex;
    this.rebuildAttentionParticles();
  }

  rebuildAttentionParticles() {
    this.particles = [];
    this.edges.forEach(edge => {
      const attn = (edge.normalizedAttn && edge.normalizedAttn[this.currentHead]) || 0.3;
      const count = Math.max(1, Math.floor(attn * 4));
      for (let i = 0; i < count; i++) {
        this.particles.push({
          edge: edge,
          progress: Math.random(),
          speed: 0.004 + attn * 0.012
        });
      }
    });
  }

  /**
   * Adds a newly intercepted dark web entity or relation dynamically
   * and updates GAT attention coefficients in real-time.
   */
  injectThreatEvent(event) {
    // Generate new node or link to existing
    const newId = 'EVT-' + Math.floor(1000 + Math.random() * 9000);
    const newNode = {
      id: newId,
      label: event.target || event.title.substring(0, 18),
      type: event.type || 'CVE_VULN',
      threatScore: event.threatScore || 85,
      features: [
        event.threatScore / 100,
        0.95,
        0.88,
        0.60,
        0.50,
        -0.85,
        0.90,
        0.85
      ],
      x: (Math.random() - 0.5) * 300,
      y: (Math.random() - 0.5) * 300,
      vx: 0,
      vy: 0,
      radius: 12,
      details: event.details || event.title,
      isNew: true
    };

    this.nodes.push(newNode);

    // Link to relevant existing nodes (e.g. forum, actor, or CVE)
    const relatedActor = this.nodes.find(n => n.type === 'THREAT_ACTOR' && n.label.includes(event.actor || 'LockBit'));
    const targetForum = this.nodes.find(n => n.type === 'ONION_SERVICE');

    if (relatedActor) {
      this.edges.push({
        source: relatedActor.id,
        target: newNode.id,
        relation: 'DISCUSSED_BY',
        baseWeight: 0.95,
        sourceNode: relatedActor,
        targetNode: newNode
      });
    }

    if (targetForum) {
      this.edges.push({
        source: targetForum.id,
        target: newNode.id,
        relation: 'POSTED_ON',
        baseWeight: 0.88,
        sourceNode: targetForum,
        targetNode: newNode
      });
    }

    this.computeGATAttention();
    this.selectNode(newNode);
    return newNode;
  }

  setupListeners() {
    window.addEventListener('resize', () => this.initCanvasSize());

    this.canvas.addEventListener('mousedown', (e) => {
      const mouse = this.getCanvasCoords(e);
      const clicked = this.findNodeAt(mouse.x, mouse.y);
      if (clicked) {
        this.draggedNode = clicked;
        this.selectNode(clicked);
      } else {
        this.isDragging = true;
        this.lastMousePos = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mousemove', (e) => {
      const mouse = this.getCanvasCoords(e);
      if (this.draggedNode) {
        this.draggedNode.x = mouse.x;
        this.draggedNode.y = mouse.y;
        this.draggedNode.vx = 0;
        this.draggedNode.vy = 0;
      } else if (this.isDragging) {
        const dx = e.clientX - this.lastMousePos.x;
        const dy = e.clientY - this.lastMousePos.y;
        this.panX += dx;
        this.panY += dy;
        this.lastMousePos = { x: e.clientX, y: e.clientY };
      } else {
        this.hoveredNode = this.findNodeAt(mouse.x, mouse.y);
        this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'grab';
      }
    });

    window.addEventListener('mouseup', () => {
      this.draggedNode = null;
      this.isDragging = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      this.zoom = Math.min(Math.max(this.zoom * zoomFactor, 0.4), 2.8);
    });
  }

  getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    return {
      x: (rawX - this.panX) / this.zoom,
      y: (rawY - this.panY) / this.zoom
    };
  }

  findNodeAt(x, y) {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];
      const dist = Math.hypot(node.x - x, node.y - y);
      if (dist <= node.radius + 6) return node;
    }
    return null;
  }

  selectNode(node) {
    this.selectedNode = node;
    if (window.onNodeSelectedCallback) {
      window.onNodeSelectedCallback(node, this.getNodeDossier(node));
    }
  }

  getNodeDossier(node) {
    // Gather connected edges and attention weights
    const incident = this.edges.filter(
      e => e.sourceNode === node || e.targetNode === node
    );

    const neighbors = incident.map(e => {
      const neighbor = e.sourceNode === node ? e.targetNode : e.sourceNode;
      const attn = (e.normalizedAttn && e.normalizedAttn[this.currentHead]) || 0.25;
      return {
        neighborId: neighbor.id,
        neighborLabel: neighbor.label,
        neighborType: neighbor.type,
        relation: e.relation,
        attentionWeight: attn
      };
    }).sort((a, b) => b.attentionWeight - a.attentionWeight);

    return {
      node: node,
      incidentCount: incident.length,
      neighbors: neighbors,
      attentionHeadName: this.headLabels[this.currentHead]
    };
  }

  startAnimationLoop() {
    const render = () => {
      this.updatePhysics();
      this.draw();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  updatePhysics() {
    // Repulsion between all node pairs
    const kRepel = 2400;
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i];
        const b = this.nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 320) {
          const force = kRepel / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          a.vx -= fx;
          a.vy -= fy;
          b.vx += fx;
          b.vy += fy;
        }
      }
    }

    // Spring attraction along edges weighted by attention
    const restLen = 110;
    this.edges.forEach(edge => {
      const u = edge.sourceNode;
      const v = edge.targetNode;
      if (!u || !v) return;

      const dx = v.x - u.x;
      const dy = v.y - u.y;
      const dist = Math.hypot(dx, dy) || 1;
      const attn = (edge.normalizedAttn && edge.normalizedAttn[this.currentHead]) || 0.3;
      
      const springForce = (dist - restLen) * (0.015 + attn * 0.035);
      const fx = (dx / dist) * springForce;
      const fy = (dy / dist) * springForce;

      u.vx += fx;
      u.vy += fy;
      v.vx -= fx;
      v.vy -= fy;
    });

    // Center gravity & damping
    this.nodes.forEach(node => {
      if (node === this.draggedNode) return;
      node.vx -= node.x * 0.001;
      node.vy -= node.y * 0.001;
      node.vx *= 0.88;
      node.vy *= 0.88;
      node.x += node.vx;
      node.y += node.vy;
    });

    // Update attention pulse particles
    this.particles.forEach(p => {
      p.progress += p.speed;
      if (p.progress >= 1) p.progress = 0;
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(this.panX, this.panY);
    this.ctx.scale(this.zoom, this.zoom);

    // Draw subtle grid
    this.drawBackgroundGrid();

    // Draw edges with GAT attention weight thickness and glow
    this.edges.forEach(edge => {
      const u = edge.sourceNode;
      const v = edge.targetNode;
      if (!u || !v) return;

      const attn = (edge.normalizedAttn && edge.normalizedAttn[this.currentHead]) || 0.25;
      const isConnectedToSelected = this.selectedNode && (u === this.selectedNode || v === this.selectedNode);
      const isConnectedToHovered = this.hoveredNode && (u === this.hoveredNode || v === this.hoveredNode);

      this.ctx.beginPath();
      this.ctx.moveTo(u.x, u.y);
      this.ctx.lineTo(v.x, v.y);

      if (isConnectedToSelected || isConnectedToHovered) {
        this.ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + attn * 0.5})`;
        this.ctx.lineWidth = 1.5 + attn * 4;
      } else {
        this.ctx.strokeStyle = `rgba(74, 85, 104, ${0.15 + attn * 0.3})`;
        this.ctx.lineWidth = 1 + attn * 2.5;
      }
      this.ctx.stroke();

      // Relation label on edge if connected to selected
      if (isConnectedToSelected) {
        const midX = (u.x + v.x) / 2;
        const midY = (u.y + v.y) / 2;
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '9px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${edge.relation} (α=${attn})`, midX, midY - 4);
      }
    });

    // Draw attention flow particles
    this.particles.forEach(p => {
      const u = p.edge.sourceNode;
      const v = p.edge.targetNode;
      if (!u || !v) return;

      const px = u.x + (v.x - u.x) * p.progress;
      const py = u.y + (v.y - u.y) * p.progress;

      this.ctx.beginPath();
      this.ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      this.ctx.fillStyle = '#38bdf8';
      this.ctx.shadowColor = '#38bdf8';
      this.ctx.shadowBlur = 6;
      this.ctx.fill();
      this.ctx.shadowBlur = 0; // Reset
    });

    // Draw nodes
    this.nodes.forEach(node => {
      const isSelected = node === this.selectedNode;
      const isHovered = node === this.hoveredNode;
      const color = this.entityColors[node.type] || '#94a3b8';

      // Outer glow for selected or high threat
      if (isSelected || isHovered || node.isNew) {
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${this.hexToRgb(color)}, 0.22)`;
        this.ctx.fill();
      }

      // Base circle
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = '#101522';
      this.ctx.fill();
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = isSelected ? 3 : 1.8;
      this.ctx.stroke();

      // Inner dot indicating threat severity
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.fill();

      // Label below node
      this.ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      this.ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(node.label, node.x, node.y + node.radius + 14);

      // Threat score badge
      this.ctx.font = '8px monospace';
      this.ctx.fillStyle = node.threatScore >= 90 ? '#ef4444' : '#f59e0b';
      this.ctx.fillText(`[${node.threatScore}]`, node.x, node.y - node.radius - 6);
    });

    this.ctx.restore();
  }

  drawBackgroundGrid() {
    const size = 60;
    const left = -this.panX / this.zoom;
    const top = -this.panY / this.zoom;
    const right = (this.canvas.width - this.panX) / this.zoom;
    const bottom = (this.canvas.height - this.panY) / this.zoom;

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    this.ctx.lineWidth = 1 / this.zoom;

    const startX = Math.floor(left / size) * size;
    const endX = Math.ceil(right / size) * size;
    const startY = Math.floor(top / size) * size;
    const endY = Math.ceil(bottom / size) * size;

    this.ctx.beginPath();
    for (let x = startX; x <= endX; x += size) {
      this.ctx.moveTo(x, top);
      this.ctx.lineTo(x, bottom);
    }
    for (let y = startY; y <= endY; y += size) {
      this.ctx.moveTo(left, y);
      this.ctx.lineTo(right, y);
    }
    this.ctx.stroke();
  }

  hexToRgb(hex) {
    const c = hex.replace('#', '');
    const bigint = parseInt(c, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  }

  resetZoomPan() {
    this.panX = this.canvas.width / 2;
    this.panY = this.canvas.height / 2;
    this.zoom = 1;
  }

  exportSTIX() {
    const stixBundle = {
      type: 'bundle',
      id: `bundle--${Math.random().toString(36).substring(2, 10)}`,
      spec_version: '2.1',
      objects: this.nodes.map(n => ({
        type: n.type === 'THREAT_ACTOR' ? 'threat-actor' :
              n.type === 'CVE_VULN' ? 'vulnerability' :
              n.type === 'MALWARE_HASH' ? 'malware' : 'indicator',
        id: `${n.type.toLowerCase()}--${n.id}`,
        created: new Date().toISOString(),
        name: n.label,
        description: n.details,
        confidence: n.threatScore,
        custom_gat_features: n.features
      }))
    };
    return JSON.stringify(stixBundle, null, 2);
  }
}

window.GATEngine = GATEngine;
