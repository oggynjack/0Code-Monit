# 0Code SDK

Developer SDK and client libraries for **0Code-Monit**.

- Maintained by: [oggynjack/0Code-Monit](https://github.com/oggynjack/0Code-Monit)
- License: MIT

---

## 📦 Packages

### 1. [`@oggynjack/ping`](https://www.npmjs.com/package/@oggynjack/ping) (v0.4.4-mod.1)
> High-performance ICMP ping utility for Node.js.

- **NPM**: `npm install @oggynjack/ping`
- **Used in**: 0Code-Monit core for ICMP ping monitoring

### 2. [`@oggynjack/sqlite3`](https://www.npmjs.com/package/@oggynjack/sqlite3) (v15.1.7)
> Optimized SQLite3 bindings for Node.js.

- **NPM**: `npm install @oggynjack/sqlite3`
- **Used in**: 0Code-Monit SQLite database engine

### 3. [`@oggynjack/0code-pr`](https://www.npmjs.com/package/@oggynjack/0code-pr) (v1.0.1)
> CLI helper to test pull request branches against 0Code-Monit.

- **NPM**: `npx @oggynjack/0code-pr <GitHubUser>:<branch>`
- **Source**: `0code-sdk/0code-pr/` in this repository

```bash
npx @oggynjack/0code-pr oggynjack:feature/new-monitor-type
```

### 4. [`@oggynjack/0code-push`](https://www.npmjs.com/package/@oggynjack/0code-push) (v1.0.1)
> Lightweight push health check agent for 0Code-Monit.

- **NPM**: `npm install @oggynjack/0code-push`
- **Docker**: `oggynjack/0code-push:latest`
- **Go source**: `0code-sdk/0code-push/go-src/main.go`
- **Build**: `node 0code-sdk/0code-push/build.js`

```bash
# Direct binary usage
0code-push "https://monit.0code.uk/api/push/YOUR_TOKEN?status=up&msg=OK&ping=" 60

# Docker container
docker run -d --restart=always \
  --name 0code-push \
  oggynjack/0code-push:latest \
  "https://monit.0code.uk/api/push/YOUR_TOKEN?status=up&msg=OK&ping=" 60
```

### 5. `0code-monit` (v1.0.2) — Server
> Fast, reliable monitoring server with live analytics, status pages, and instant alerts.

- **Local Dev**: `npm install && npm run dev`
- **Production Build**: `npm run build && npm start`
- **GitHub**: [oggynjack/0Code-Monit](https://github.com/oggynjack/0Code-Monit)

---

## 📁 Repository Layout

```
0Code-Monit/
├── 0code-sdk/                        ← SDK monorepo
│   ├── README.md                      ← Documentation
│   ├── package.json
│   ├── 0code-pr/                      ← PR test CLI tool
│   └── 0code-push/                    ← Push notification binary (Go + build script)
│       ├── package.json
│       ├── build.js
│       └── go-src/
│           ├── go.mod
│           └── main.go
├── server/                            ← Backend Express / Socket.io server
├── src/                               ← Vue 3 frontend application
├── extra/                             ← Auxiliary scripts and tools
└── package.json                       ← Main application definition
```

---

## 🤝 Contributing

All 0Code-Monit packages are distributed under the MIT license.  
Issues & discussions: [github.com/oggynjack/0Code-Monit/issues](https://github.com/oggynjack/0Code-Monit/issues)
