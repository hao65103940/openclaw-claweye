# Monitor Platform 项目总结

## 📋 项目定位

**OpenClaw Agent 监控系统** - 可视化的 Agent 运行监控平台

---

## 🎯 核心功能

### 1. 仪表盘（Dashboard）
- 实时查看活跃/已完成 Agent
- Token 消耗统计
- 执行耗时分析
- 模型使用分布

### 2. 执行链路（Trace）
- 执行流程时间线
- 子 Agent 链路追踪
- 渠道维度分析（飞书/企微/Control-UI）
- Agent 协作统计

### 3. 性能分析（Analytics）
- Token 使用趋势
- 耗时分布分析
- 渠道统计
- Agent 排名

### 4. 配置管理（Configs）
- 查看/编辑 Agent 配置文件
- 支持 .md 和 .json 格式
- 实时保存

### 5. 日志详情（Log Detail）
- 真实历史消息（从 JSONL 文件读取）
- 工具调用记录
- 对话消息展示
- 自动刷新（3 秒轮询）

---

## 🔧 技术架构

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

---

## 📁 项目结构

```
monitor-platform/
├── src/                      # 前端源码
│   ├── components/           # 可复用组件
│   │   ├── LogDetailModal.tsx
│   │   └── ...
│   ├── pages/                # 页面组件
│   │   ├── Dashboard.tsx
│   │   ├── Trace.tsx
│   │   ├── Analytics.tsx
│   │   └── Configs.tsx
│   ├── services/             # API 服务
│   ├── store/                # 状态管理
│   ├── types/                # TypeScript 类型
│   └── utils/                # 工具函数
├── server.js                 # 后端 API 服务
├── config.json               # 基础配置 ⭐
├── .env                      # 环境变量 ⭐
├── .env.example              # 环境变量模板
├── logs/                     # 日志目录
│   └── server.log
├── start.sh                  # 启动脚本
├── stop.sh                   # 停止脚本
├── DEPLOYMENT.md             # 部署文档 ⭐
├── README.md                 # 使用文档
├── package.json
└── PROJECT-SUMMARY.md        # 本文档
```

---

## ⚙️ 配置说明

### config.json - 基础配置

```json
{
  "openclaw": {
    "cliPath": "/root/.nvm/versions/node/v24.13.0/bin/openclaw",
    "basePath": "/root/.openclaw",
    "agentsPath": "/root/.openclaw/agents",
    "workspacePath": "/root/.openclaw/workspace"
  },
  "server": {
    "port": 3001,
    "host": "0.0.0.0",
    "cacheTTL": 5000,
    "logPath": "/root/.openclaw/monitor-platform/logs"
  },
  "security": {
    "allowedBasePaths": ["/root/.openclaw"]
  }
}
```

### .env - 环境变量

```bash
# 前端配置
VITE_API_BASE_URL=http://localhost:3001/api
VITE_USE_MOCK_DATA=false

# 后端配置
PORT=3001
OPENCLAW_BASE_PATH=/root/.openclaw
OPENCLAW_AGENTS_PATH=/root/.openclaw/agents

# 缓存配置
CACHE_TTL=5000

# 安全配置
ALLOWED_BASE_PATHS=/root/.openclaw
```

---

## 🚀 快速开始

### 部署位置（推荐）

```
/root/.openclaw/monitor-platform/
```

**理由：**
- ✅ 作为 OpenClaw 子项目，便于管理
- ✅ 路径配置简单（相对路径）
- ✅ 直接访问 OpenClaw 数据
- ✅ 统一备份和维护

### 启动步骤

```bash
# 1. 进入目录
cd /root/.openclaw/monitor-platform

# 2. 安装依赖
npm install

# 3. 启动服务
./start.sh

# 4. 访问
# 前端：http://localhost:3000
# 后端：http://localhost:3001/api/health
```

---

## 📊 API 端点

### 基础 API
| 端点 | 说明 |
|------|------|
| `GET /api/health` | 健康检查 |
| `GET /api/subagents/list` | 子 Agent 列表 |
| `GET /api/sessions/list` | 会话列表 |
| `GET /api/stats` | 统计数据 |

### 链路追踪 API
| 端点 | 说明 |
|------|------|
| `GET /api/trace/flow` | 执行流程 |
| `GET /api/trace/subagents` | 子 Agent 链路 |
| `GET /api/analytics/channels` | 渠道分析 |

### 会话历史 API
| 端点 | 说明 |
|------|------|
| `GET /api/sessions/:id/history` | 会话历史（JSONL） |

### 配置管理 API
| 端点 | 说明 |
|------|------|
| `GET /api/agents/config/list` | 配置列表 |
| `GET /api/agents/:id/config/:file` | 读取配置 |
| `PUT /api/agents/:id/config/:file` | 保存配置 |

### 日志 API
| 端点 | 说明 |
|------|------|
| `GET /api/logs/list` | 日志列表 |
| `GET /api/logs/read` | 读取日志 |

---

## 🔐 安全特性

### 1. 路径白名单
```javascript
// 只允许访问配置的路径
const ALLOWED_BASE_PATHS = ['/root/.openclaw'];
```

### 2. 输出脱敏
- API Keys → `[API_KEY_REDACTED]`
- Tokens → `[TOKEN_REDACTED]`
- IP 地址 → `[IP_REDACTED]`
- 用户 ID → `[USER_ID_REDACTED]`

### 3. 访问控制
- 建议通过 SSH 隧道访问
- 生产环境配置防火墙
- 支持 Nginx 反向代理

---

## 📝 开发历史

### 2026-03-08 - 配置化改造 ⭐
- ✅ 提取配置到 config.json 和 .env
- ✅ 支持环境变量覆盖
- ✅ 所有路径使用配置变量
- ✅ 创建部署文档 DEPLOYMENT.md
- ✅ 更新启动脚本

### 2026-03-08 - 日志功能修复
- ✅ 使用 JSONL 文件读取真实历史
- ✅ 移除 WebSocket 依赖
- ✅ 改用轮询（3 秒）
- ✅ 支持暂停/继续

### 2026-03-07 - 初始功能
- ✅ 仪表盘
- ✅ 执行链路
- ✅ 性能分析
- ✅ 配置管理

---

## 🎯 下一步计划

### P1 - 短期
- [ ] Docker 容器化部署
- [ ] 多实例监控支持
- [ ] 告警通知功能
- [ ] 数据导出（CSV/JSON）

### P2 - 中期
- [ ] 实时日志流（WebSocket）
- [ ] 日志搜索和过滤
- [ ] 性能优化（虚拟滚动）
- [ ] 移动端适配

### P3 - 长期
- [ ] 日志持久化（PostgreSQL）
- [ ] 日志检索（Elasticsearch）
- [ ] 可视化报表
- [ ] 插件系统

---

## 📞 技术支持

- **文档**: `README.md`, `DEPLOYMENT.md`
- **日志**: `tail -f logs/server.log`
- **API 测试**: `curl http://localhost:3001/api/health`
- **配置**: `config.json`, `.env`

---

**OpenClaw 监控系统 - 让 Agent 运行一目了然！** ✨
