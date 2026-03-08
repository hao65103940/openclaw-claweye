# 👁️ ClawEye

> **ClawEye - OpenClaw AI Agent 监控平台**
> 
> *洞察一切 · 掌控全局*

---

## 🎯 项目简介

ClawEye 是专为 OpenClaw 打造的智能监控平台，提供实时会话监控、Token 消耗分析、执行链路追踪和性能洞察。

通过可视化的 Dashboard、Analytics、Trace 和 Logs 四大模块，让你对 Agent 的运行状态了如指掌。

---

## 🚀 快速开始

### 环境要求

- **Node.js**: v18.0+
- **npm**: v8.0+
- **OpenClaw**: 已安装并配置完成

### 安装步骤

```bash
# 1. 进入项目目录
cd /root/.openclaw/claweye

# 2. 安装依赖
npm install

# 3. 配置环境变量（可选，默认配置通常无需修改）
cp .env.example .env

# 4. 启动服务
./start.sh

# 5. 访问
# 前端：http://localhost:3000
# 后端：http://localhost:3001/api/health
```

### 停止服务

```bash
./stop.sh
```

---

## 📊 核心功能

### 1. Dashboard（仪表盘）📊

实时监控 Agent 运行状态：

- ✅ 活跃/已完成会话列表
- ✅ Token 使用趋势图（输入/输出/上下文）
- ✅ 执行耗时统计
- ✅ 模型使用分布
- ✅ 搜索和过滤功能

### 2. Analytics（性能分析）📈

深度数据分析模块：

**Token 分析**
- Token 使用趋势（7/30/90 天）
- Token 效率分析（Top 会话）
- 成本估算（月度预测）

**会话行为**
- 24 小时活跃分布
- 会话类型分布
- 失败会话分析

**模型统计**
- 模型使用次数
- Token 消耗对比
- 性能瓶颈分析（P50/P90/P99）

**渠道分析**
- 渠道会话统计（飞书/企微/Control-UI）
- 渠道 Token 消耗
- 渠道失败率

### 3. Trace（执行链路）🔗

可视化执行流程追踪：

- ✅ 会话执行时间线
- ✅ 子 Agent 链路图
- ✅ Agent 协作关系图
- ✅ 工具调用追踪

### 4. Logs（日志查看）📝

实时日志和历史查询：

- ✅ 实时日志推送（WebSocket）
- ✅ 历史日志查询
- ✅ 多日志源切换（server.log/frontend.log）
- ✅ 自动刷新（可暂停）

### 5. Configs（配置管理）⚙️

Agent 配置查看和编辑：

- ✅ 配置文件列表
- ✅ 在线编辑（.md/.json）
- ✅ 实时保存

---

## 🛠️ 技术架构

```
┌─────────────────────────────────────┐
│         前端 (React + Vite)         │
│  端口：3000                          │
│  技术：React 18, TypeScript,         │
│        Tailwind CSS, ECharts        │
└──────────────┬──────────────────────┘
               │ HTTP/WebSocket
               ▼
┌─────────────────────────────────────┐
│       后端 API (Node.js + Express)  │
│  端口：3001                          │
│  功能：数据聚合、格式转换、缓存      │
└──────────────┬──────────────────────┘
               │ CLI 调用 + 文件读取
               ▼
┌─────────────────────────────────────┐
│      OpenClaw 数据源                 │
│  - OpenClaw CLI                     │
│  - Session JSONL 文件               │
│  - 配置文件 (.md, .json)            │
└─────────────────────────────────────┘
```

### 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 18 + TypeScript + Vite |
| **状态管理** | Zustand |
| **图表** | ECharts + echarts-for-react |
| **样式** | TailwindCSS |
| **后端** | Node.js + Express |
| **实时通信** | Socket.IO |
| **数据源** | OpenClaw CLI + JSONL 文件 |

---

## 📁 项目结构

```
claweye/
├── src/                      # 前端源码
│   ├── components/           # 可复用组件（15 个）
│   │   ├── TokenTrend.tsx
│   │   ├── TokenHistory.tsx
│   │   ├── ModelStats.tsx
│   │   ├── ChannelDetail.tsx
│   │   └── ...
│   ├── pages/                # 页面组件（5 个）
│   │   ├── Dashboard.tsx
│   │   ├── Analytics.tsx
│   │   ├── Trace.tsx
│   │   ├── Logs.tsx
│   │   └── Configs.tsx
│   ├── services/             # API 服务
│   ├── store/                # Zustand 状态管理
│   ├── types/                # TypeScript 类型定义
│   └── utils/                # 工具函数
├── server.js                 # 后端 API 服务（26 个端点）
├── config.json               # 基础配置
├── .env                      # 环境变量
├── .env.example              # 配置模板
├── logs/                     # 日志目录
├── start.sh                  # 启动脚本
├── stop.sh                   # 停止脚本
└── package.json              # 依赖配置
```

---

## ⚙️ 配置说明

### config.json - 基础配置

```json
{
  "openclaw": {
    "cliPath": "/root/.nvm/versions/node/v24.13.0/bin/openclaw",
    "nodePath": "/root/.nvm/versions/node/v24.13.0/bin/node",
    "basePath": "/root/.openclaw",
    "agentsPath": "/root/.openclaw/agents",
    "workspacePath": "/root/.openclaw/workspace"
  },
  "server": {
    "port": 3001,
    "host": "0.0.0.0",
    "cacheTTL": 20000,
    "logPath": "/root/.openclaw/claweye/logs",
    "logLevel": "info"
  },
  "security": {
    "allowedBasePaths": "/root/.openclaw"
  }
}
```

### .env - 环境变量

```bash
# 日志级别：debug | info | warn | error
LOG_LEVEL=info

# 端口配置
PORT=3001
HOST=0.0.0.0

# OpenClaw 路径
OPENCLAW_BASE_PATH=/root/.openclaw
OPENCLAW_CLI_PATH=/root/.nvm/versions/node/v24.13.0/bin/openclaw

# 安全配置
ALLOWED_BASE_PATHS=/root/.openclaw
```

---

## 📡 API 端点

### 基础 API

| 端点 | 说明 |
|------|------|
| `GET /api/health` | 健康检查 |
| `GET /api/subagents/list` | 子 Agent 列表 |
| `GET /api/sessions/list` | 会话列表 |
| `GET /api/stats` | 统计数据 |

### 分析 API

| 端点 | 说明 |
|------|------|
| `GET /api/analytics/token-trends` | Token 趋势 |
| `GET /api/analytics/token-history` | Token 历史 |
| `GET /api/analytics/token-efficiency` | Token 效率 |
| `GET /api/analytics/cost-estimate` | 成本估算 |
| `GET /api/analytics/session-lifecycle` | 会话生命周期 |
| `GET /api/analytics/session-types` | 会话类型 |
| `GET /api/analytics/failure-analysis` | 失败分析 |
| `GET /api/analytics/model-stats` | 模型统计 |
| `GET /api/analytics/performance-bottleneck` | 性能瓶颈 |
| `GET /api/analytics/tool-usage` | 工具使用 |
| `GET /api/analytics/channels` | 渠道分析 |
| `GET /api/analytics/channel-detail` | 渠道详情 |
| `GET /api/analytics/subagent-stats` | 子 Agent 统计 |

### 链路追踪 API

| 端点 | 说明 |
|------|------|
| `GET /api/trace/flow` | 执行流程 |
| `GET /api/trace/subagents` | 子 Agent 链路 |
| `GET /api/trace/relationships` | 关系图 |

### 配置和日志 API

| 端点 | 说明 |
|------|------|
| `GET /api/agents/config/list` | 配置列表 |
| `GET /api/file/read` | 读取文件 |
| `GET /api/logs/list` | 日志列表 |
| `GET /api/logs/read` | 读取日志 |
| `GET /api/gateway-logs` | Gateway 日志 |
| `GET /api/sessions/:sessionId/history` | 会话历史 |

---

## 🔐 安全特性

### 1. 路径白名单

只允许访问配置的 OpenClaw 路径，防止目录遍历攻击。

### 2. 日志级别控制

支持 `debug/info/warn/error` 四级日志，生产环境可减少日志输出。

### 3. 数据验证

自动过滤无效会话数据，确保数据准确性。

### 4. 依赖安全

定期执行 `npm audit`，及时修复安全漏洞。

---

## 🛠️ 故障排查

### 后端服务无法启动

```bash
# 检查端口占用
lsof -i:3001

# 查看日志
tail -f logs/server.log

# 检查 Node.js 版本
node --version
```

### 前端无法连接 API

```bash
# 测试 API
curl http://localhost:3001/api/health

# 检查 .env 配置
cat .env | grep API_BASE_URL
```

### 日志文件权限问题

```bash
# 检查日志目录权限
ls -la logs/

# 修复权限
chmod 700 logs/
```

---

## 📚 文档

- **[快速上手指南](QUICKSTART.md)** - 详细安装步骤、配置说明、常见问题

---

## 🌐 项目链接

- **GitHub**: https://github.com/hao65103940/openclaw-claweye
- **OpenClaw**: https://github.com/openclaw/openclaw
- **OpenClaw 文档**: https://docs.openclaw.ai

---

## 📄 License

Apache 2.0

---

**ClawEye - 洞察一切 · 掌控全局** 👁️

*让 Agent 运行一目了然！*
