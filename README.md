# Aegis-CTI | Cyber Threat Intelligence Framework (GAT & Dark Web Monitor)

> State-of-the-art Cyber Threat Intelligence (CTI) Framework utilizing **Graph Attention Networks (GAT)** for Dark Web Activity Monitoring, Tor hidden service interception, and automated threat actor attribution.

---

## 🌟 Key Features

- **GAT Neural Attention Engine**: Dynamic Graph Attention Network computes multi-head attention weights ($\alpha_{ij}$) between threat actors, CVE exploits, infrastructure nodes, and enterprise assets in real time.
- **ShadowNet Tor Browser (.onion Simulator)**: Simulated dark web Tor browser crawling underground marketplaces, zero-day leak portals, and ransomware victim negotiation vaults.
- **Dual Split Cockpit**: Simultaneous view correlating darknet activity directly with GAT neural graph attention spikes.
- **SOC Activity Monitor & Mitigations**: Real-time alert feed, automated SIEM Suricata rule generation, and STIX 2.1 JSON threat intelligence export.
- **Zero-Dependency Architecture**: Built using pure modern HTML5, Canvas API, CSS3, and Vanilla JavaScript with Web Audio tactical telemetry.

---

## 🚀 Live Demo & Deployment

This application runs directly on **GitHub Pages**:

1. Fork or clone this repository.
2. Go to **Settings** ➔ **Pages**.
3. Under **Build and deployment**, select **Source: Deploy from a branch**.
4. Choose `main` branch with `/ (root)` folder and click **Save**.
5. Your live CTI monitor will be published at:  
   `https://<your-username>.github.io/<repo-name>/`

---

## 💻 Local Quickstart

### Option 1: Direct Browser Launch
Simply open `index.html` in any modern web browser (Chrome, Edge, Firefox, Brave):
```powershell
Start-Process "index.html"
```

### Option 2: Python HTTP Server
```bash
python -m http.server 8000
```
Open `http://localhost:8000`

### Option 3: Node.js Serve
```bash
npx serve .
```

---

## 📂 Project Structure

```text
cti-gat-darkweb-monitor/
├── index.html           # Main CTI application cockpit & UI layouts
├── README.md            # Project documentation & deployment guide
├── .gitignore           # Git ignore rules
├── css/
│   └── style.css        # Tactical SOC dark design system & responsive styling
└── js/
    ├── app.js           # Main application orchestrator & audio effects
    ├── gat-engine.js    # Graph Attention Network mathematical engine & canvas visualizer
    ├── darkweb.js       # ShadowNet Tor browser & onion site simulator
    └── monitor.js       # Security operations center controller & STIX 2.1 exporter
```

---

## 🛡️ License

MIT License. Designed for cybersecurity research, threat hunting, and educational demonstrations.
