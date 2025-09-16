/ (root)
├── manifest.json
├── background/
│   ├── background.js              ← Service worker, messaging, basic monitoring
│   ├── test-orchestrator.js       ← Main test coordinator (renamed from epic-engine.js)
│   ├── ai/                        ← AI & Pattern Detection
│   │   ├── pattern-detector.js    ← TensorFlow.js pattern analysis
│   │   ├── throttling-detector.js ← ISP throttling detection
│   │   └── threat-detector.js     ← Dangerous network detection
│   └── tests/                     ← Modular test implementations
│       ├── speed-tests.js         ← Download/upload speed testing
│       ├── latency-tests.js       ← Ping, jitter, packet loss
│       ├── security-tests.js      ← VPN, WARP, portal detection
│       ├── protocol-tests.js      ← IPv6, HTTP/3, CDN testing
│       ├── gaming-tests.js        ← Gaming-specific network tests
│       ├── streaming-tests.js     ← Streaming optimization tests
│       └── stability-tests.js     ← Connection stability & reliability
├── dashboard/
│   ├── dashboard.html
│   ├── dashboard.js
│   ├── dashboard.css
│   ├── epic-overlay.html
│   ├── epic-overlay.js
│   ├── epic-overlay.css
│   └── settings-panel-complete.html
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── settings/
│   ├── settings.html
│   ├── settings.js
│   ├── settings.css
│   ├── full-settings.html
│   └── full-settings.js
├── themes/
│   ├── theme-manager.js
│   ├── theme-variables.css
│   └── custom-theme-builder/
│       ├── custom-theme-builder.html
│       ├── custom-theme-builder.js
│       └── custom-theme-builder.css
├── shared/
│   ├── utils.js
│   └── constants.js
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png