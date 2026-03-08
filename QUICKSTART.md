# 🚀 ClawEye 快速上手指南

**版本**：1.0.0  
**最后更新**：2026-03-08  
**适用系统**：Linux / Windows (WSL) / macOS

---

## 📋 目录

1. [项目简介](#1-项目简介)
2. [系统要求](#2-系统要求)
3. [安装步骤](#3-安装步骤)
4. [配置文件说明](#4-配置文件说明)
5. [JSONL 数据源说明](#5-jsonl 数据源说明)
6. [启动服务](#6-启动服务)
7. [验证安装](#7-验证安装)
8. [常见问题](#8-常见问题)

---

## 1. 项目简介

**ClawEye** - OpenClaw 智能监控平台

### 核心功能

| 模块 | 功能 | 说明 |
|------|------|------|
| 📊 **Dashboard** | 实时监控 | 会话状态、Token 趋势、告警通知 |
| 📈 **Analytics** | 深度分析 | Token 分析、会话行为、模型统计、渠道分析 |
| 📝 **Logs** | 日志查看 | 实时日志推送、历史查询 |
| 🔗 **Trace** | 链路追踪 | 会话关系图、子 Agent 链路 |

### 技术栈

- **前端**：React 18 + TypeScript + Vite + TailwindCSS
- **后端**：Express + Node.js + Socket.IO
- **图表**：ECharts
- **状态管理**：Zustand

---

## 2. 系统要求

### 硬件要求

| 组件 | 最低配置 | 推荐配置 |
|------|---------|---------|
| CPU | 2 核心 | 4 核心+ |
| 内存 | 2 GB | 4 GB+ |
| 磁盘 | 500 MB | 1 GB+ |
| 网络 | 本地访问 | 局域网访问 |

### 软件要求

| 软件 | 版本 | 必需 | 说明 |
|------|------|------|------|
| Node.js | v20+ | ✅ | 推荐 v24+ |
| npm | v9+ | ✅ | 随 Node.js 安装 |
| OpenClaw | 2026.3+ | ✅ | 监控目标 |
| Git | 任意 | ⚠️ | 可选，用于版本管理 |

### 前置依赖

**ClawEye 依赖 OpenClaw 运行**，确保已安装并配置好 OpenClaw：

```bash
# 验证 OpenClaw 已安装
openclaw --version

# 验证 OpenClaw 服务运行中
openclaw gateway status
```

---

## 3. 安装步骤

### Linux (Ubuntu/Debian)

#### 步骤 1：进入项目目录

```bash
cd /root/.openclaw/claweye
```

#### 步骤 2：安装依赖

```bash
npm install
```

#### 步骤 3：配置环境变量

```bash
# 复制示例配置
cp .env.example .env

# 编辑配置（根据实际情况修改）
nano .env
```

#### 步骤 4：设置文件权限

```bash
chmod 600 .env
chmod 700 logs/
```

#### 步骤 5：启动服务

```bash
# 方式 1：使用启动脚本（推荐）
./start.sh

# 方式 2：使用 npm
npm run start

# 方式 3：分别启动前后端
npm run dev:backend & npm run dev:frontend
```

#### 步骤 6：访问平台

```
前端：http://localhost:3000
后端：http://localhost:3001
```

---

### Windows (WSL2)

#### 步骤 1：安装 WSL2

```powershell
# PowerShell（管理员）
wsl --install -d Ubuntu-22.04
```

重启后完成 Ubuntu 用户设置。

#### 步骤 2：在 WSL 中安装 OpenClaw

```bash
# 进入 WSL
wsl

# 安装 OpenClaw（如未安装）
npm install -g openclaw

# 验证
openclaw --version
```

#### 步骤 3：安装 ClawEye

```bash
# 克隆项目（或从现有目录访问）
cd /root/.openclaw/claweye

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
nano .env

# 启动服务
./start.sh
```

#### 步骤 4：访问平台

在 Windows 浏览器中访问：
```
http://localhost:3000
```

---

### macOS

```bash
# 安装 Node.js（如未安装）
brew install node@24

# 进入项目目录
cd ~/.openclaw/claweye

# 安装依赖
npm install

# 配置
cp .env.example .env
nano .env

# 启动
npm run start
```

---

## 4. 配置文件说明

### 4.1 环境变量（.env）

**文件位置**：`/root/.openclaw/claweye/.env`

**配置模板**：

```bash
# ==================== 前端配置 ====================

# API 服务地址（后端地址）
VITE_API_BASE_URL=http://localhost:3001/api

# 数据模式：true=模拟数据，false=真实数据
VITE_USE_MOCK_DATA=false

# ==================== 后端配置 ====================

# 后端服务端口
PORT=3001

# 后端服务监听地址（0.0.0.0=允许外部访问）
HOST=0.0.0.0

# OpenClaw CLI 路径（使用 nvm 安装时）
OPENCLAW_CLI_PATH=/root/.nvm/versions/node/v24.13.0/bin/openclaw

# Node.js 路径（使用 nvm 安装时）
NODE_PATH=/root/.nvm/versions/node/v24.13.0/bin/node

# OpenClaw 基础路径
OPENCLAW_BASE_PATH=/root/.openclaw

# Agent 数据路径
OPENCLAW_AGENTS_PATH=/root/.openclaw/agents

# Workspace 路径
OPENCLAW_WORKSPACE_PATH=/root/.openclaw/workspace

# 日志文件路径
LOG_PATH=/root/.openclaw/claweye/logs

# ==================== 缓存配置 ====================

# 缓存过期时间（毫秒）
CACHE_TTL=5000

# ==================== 安全配置 ====================

# 允许访问的基础路径（逗号分隔）
ALLOWED_BASE_PATHS=/root/.openclaw
```

**配置说明**：

| 配置项 | 默认值 | 说明 | 是否必须修改 |
|--------|--------|------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:3001/api` | 前端访问后端的地址 | 否 |
| `VITE_USE_MOCK_DATA` | `false` | `true`=模拟数据，`false`=真实数据 | 否 |
| `PORT` | `3001` | 后端服务端口 | 否（如冲突则改） |
| `HOST` | `0.0.0.0` | `0.0.0.0`=允许外部访问，`127.0.0.1`=仅本地 | 根据需要 |
| `OPENCLAW_CLI_PATH` | 自动检测 | OpenClaw CLI 路径 | 如非 nvm 安装则改 |
| `LOG_PATH` | `/root/.openclaw/claweye/logs` | 日志存储路径 | 否 |

---

### 4.2 主配置（config.json）

**文件位置**：`/root/.openclaw/claweye/config.json`

**配置示例**：

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
    "cacheTTL": 5000,
    "logPath": "/root/.openclaw/claweye/logs"
  },
  "frontend": {
    "devPort": 3000,
    "apiBaseUrl": "http://localhost:3001/api"
  },
  "security": {
    "allowedBasePaths": [
      "/root/.openclaw"
    ]
  }
}
```

**注意**：
- 此文件不包含敏感凭证
- 路径配置应与 `.env` 保持一致
- 可安全提交到 Git

---

## 5. JSONL 数据源说明

### 什么是 JSONL

**JSON Lines** 是一种日志格式，每行是一个独立的 JSON 对象：

```json
{"ts":1772928327492,"jobId":"xxx","action":"finished","status":"ok"}
{"ts":1772928327500,"jobId":"xxx","action":"started","status":"running"}
```

**优点**：
- ✅ 便于流式处理
- ✅ 每行独立，易解析
- ✅ 支持追加写入
- ✅ 兼容 `tail`、`grep` 等命令

---

### ClawEye 使用的 JSONL 文件

#### 1. Cron 任务执行记录

**位置**：`/root/.openclaw/cron/runs/<job-id>.jsonl`

**示例**：
```json
{"ts":1772928327492,"jobId":"7c450201-d3c4-41bf-bd2b-9e2955cb7b3f","action":"finished","status":"ok","summary":"任务完成","delivered":true,"sessionId":"xxx","durationMs":327480}
```

**字段说明**：
| 字段 | 类型 | 说明 |
|------|------|------|
| `ts` | number | 时间戳（毫秒） |
| `jobId` | string | 任务 ID |
| `action` | string | 动作（started/finished/error） |
| `status` | string | 状态（ok/error） |
| `summary` | string | 执行摘要 |
| `sessionId` | string | 会话 ID |
| `durationMs` | number | 执行耗时 |

---

#### 2. 消息投递记录

**位置**：`/root/.openclaw/delivery-queue/*.jsonl`

**示例**：
```json
{"ts":1772928327492,"messageId":"om_xxx","channel":"feishu","status":"delivered"}
```

---

#### 3. 会话日志（如有）

**位置**：`/root/.openclaw/logs/*.jsonl`

---

### JSONL 文件初始化

**ClawEye 不需要手动初始化 JSONL 文件**，这些文件由 OpenClaw 系统自动创建：

```bash
# Cron 任务首次运行时自动创建
/root/.openclaw/cron/runs/<job-id>.jsonl

# 消息投递时自动创建
/root/.openclaw/delivery-queue/<date>.jsonl
```

**如需查看现有 JSONL 文件**：
```bash
# 查看 Cron 执行记录
ls -lh /root/.openclaw/cron/runs/

# 查看文件内容（最后 10 行）
tail -n 10 /root/.openclaw/cron/runs/<job-id>.jsonl

# 统计行数（执行次数）
wc -l /root/.openclaw/cron/runs/<job-id>.jsonl
```

---

### JSONL 数据解析示例

**ClawEye 后端解析代码**（server.js）：

```javascript
// 读取 JSONL 文件
function readJsonlFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  return lines.map(line => JSON.parse(line));
}

// 解析 Cron 执行记录
function parseCronRuns() {
  const runsDir = '/root/.openclaw/cron/runs';
  const files = fs.readdirSync(runsDir);
  
  const allRuns = [];
  for (const file of files.filter(f => f.endsWith('.jsonl'))) {
    const runs = readJsonlFile(path.join(runsDir, file));
    allRuns.push(...runs);
  }
  
  return allRuns;
}
```

---

## 6. 启动服务

### 方式 1：使用启动脚本（推荐）

```bash
cd /root/.openclaw/claweye

# 启动
./start.sh

# 停止
./stop.sh

# 重启
./stop.sh && ./start.sh
```

### 方式 2：使用 npm

```bash
# 启动（前后端一起）
npm run start

# 仅启动后端
npm run dev:backend

# 仅启动前端
npm run dev:frontend

# 生产环境构建
npm run build
npm run preview
```

### 方式 3：后台运行（生产环境）

```bash
# 使用 nohup
nohup npm run dev:backend > logs/backend.log 2>&1 &
nohup npm run dev:frontend > logs/frontend.log 2>&1 &

# 使用 PM2（推荐）
npm install -g pm2
pm2 start npm --name "claweye-backend" -- run dev:backend
pm2 start npm --name "claweye-frontend" -- run dev:frontend
pm2 save
```

---

### 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端 | 3000 | React 开发服务器 |
| 后端 | 3001 | Express API 服务 |
| WebSocket | 3001 | Socket.IO 实时通信 |

---

## 7. 验证安装

### 7.1 基础检查

```bash
# 1. 检查 Node.js 版本
node --version  # 应 >= v20

# 2. 检查依赖安装
ls node_modules/  # 应有大量文件夹

# 3. 检查配置文件
cat .env  # 应显示配置内容
cat config.json  # 应显示 JSON 配置

# 4. 检查文件权限
ls -la .env  # 应为 -rw------- (600)
ls -la logs/  # 应为 drwx------ (700)
```

---

### 7.2 服务状态检查

```bash
# 1. 检查端口监听
netstat -tlnp | grep -E "3000|3001"

# 或使用 lsof
lsof -i :3000
lsof -i :3001

# 2. 检查进程
ps aux | grep -E "node|vite"

# 3. 查看日志
tail -f logs/server.log
tail -f logs/frontend.log
```

---

### 7.3 API 测试

```bash
# 健康检查
curl http://localhost:3001/api/health

# 获取会话列表
curl http://localhost:3001/api/sessions/list

# 获取统计数据
curl http://localhost:3001/api/stats

# 获取子 Agent 列表
curl http://localhost:3001/api/subagents/list
```

**预期响应**：
```json
// /api/health
{"status":"ok","timestamp":1772928327492}

// /api/sessions/list
{"sessions":[...],"total":8}
```

---

### 7.4 前端访问

在浏览器中访问：
```
http://localhost:3000
```

**检查项**：
- [ ] Dashboard 页面正常加载
- [ ] 显示会话列表（应有数据）
- [ ] Token 趋势图正常显示
- [ ] Analytics 页面可访问
- [ ] Logs 页面可查看实时日志

---

### 7.5 自检清单

```
□ Node.js 版本 >= 20
□ npm 依赖已安装（node_modules 存在）
□ .env 文件已创建且权限为 600
□ config.json 配置正确
□ OpenClaw 服务运行中
□ 后端服务运行（端口 3001）
□ 前端服务运行（端口 3000）
□ API 测试通过
□ 前端页面可访问
□ 日志文件正常写入
```

---

## 8. 常见问题

### Q1: 端口被占用

**症状**：
```bash
Error: listen EADDRINUSE: address already in use :::3001
```

**解决方案**：
```bash
# 1. 查找占用进程
lsof -i :3001

# 2. 杀死进程
kill -9 <PID>

# 3. 或修改端口
nano .env
# 修改 PORT=3002

# 4. 重启服务
./stop.sh && ./start.sh
```

---

### Q2: OpenClaw CLI 找不到

**症状**：
```bash
Error: OpenClaw CLI not found at /root/.nvm/versions/node/v24.13.0/bin/openclaw
```

**解决方案**：
```bash
# 1. 验证 OpenClaw 安装
openclaw --version

# 2. 查找实际路径
which openclaw

# 3. 更新配置
nano .env
# 修改 OPENCLAW_CLI_PATH=<实际路径>

# 4. 重启服务
./stop.sh && ./start.sh
```

---

### Q3: 前端无法连接后端

**症状**：
```
Network Error: Failed to fetch
```

**解决方案**：
```bash
# 1. 检查后端是否运行
curl http://localhost:3001/api/health

# 2. 检查前端配置
cat .env | grep VITE_API_BASE_URL
# 应为：VITE_API_BASE_URL=http://localhost:3001/api

# 3. 检查 CORS 设置
# 确保后端 HOST=0.0.0.0 允许外部访问

# 4. 重启服务
./stop.sh && ./start.sh
```

---

### Q4: 数据为空或显示"无数据"

**症状**：
```
Dashboard 显示 0 个会话
Analytics 无数据
```

**解决方案**：
```bash
# 1. 检查 OpenClaw 是否有会话数据
openclaw sessions list

# 2. 检查 JSONL 文件是否存在
ls -lh /root/.openclaw/cron/runs/

# 3. 检查后端日志
tail -f logs/server.log

# 4. 测试 API 直接返回
curl http://localhost:3001/api/sessions/list

# 5. 确认 VITE_USE_MOCK_DATA=false
cat .env | grep MOCK
```

---

### Q5: WebSocket 连接失败

**症状**：
```
WebSocket connection failed
```

**解决方案**：
```bash
# 1. 检查端口 3001 是否监听
netstat -tlnp | grep 3001

# 2. 检查防火墙
sudo ufw status
sudo ufw allow 3001

# 3. 检查 Socket.IO 是否启用
# 查看 server.js 中是否有 Socket.IO 初始化代码

# 4. 查看浏览器控制台错误
F12 → Console → 查看 WebSocket 错误
```

---

### Q6: 日志文件权限错误

**症状**：
```bash
Error: EACCES: permission denied, open '/root/.openclaw/claweye/logs/server.log'
```

**解决方案**：
```bash
# 1. 修复日志目录权限
chmod 700 /root/.openclaw/claweye/logs/
chmod 600 /root/.openclaw/claweye/logs/*.log

# 2. 检查当前用户
whoami
ls -la /root/.openclaw/claweye/

# 3. 如有必要，修改所有者
sudo chown -R $USER:$USER /root/.openclaw/claweye/
```

---

### Q7: 生产环境部署

**需求**：后台运行、开机自启

**解决方案**（使用 PM2）：
```bash
# 1. 安装 PM2
npm install -g pm2

# 2. 启动服务
cd /root/.openclaw/claweye
pm2 start npm --name "claweye-backend" -- run dev:backend
pm2 start npm --name "claweye-frontend" -- run dev:frontend

# 3. 保存配置
pm2 save

# 4. 设置开机自启
pm2 startup
# 按提示执行生成的命令

# 5. 管理命令
pm2 status          # 查看状态
pm2 logs            # 查看日志
pm2 restart all     # 重启所有
pm2 stop all        # 停止所有
```

---

## 📞 获取帮助

### 官方文档
- **ClawEye 仓库**：https://github.com/hao65103940/openclaw-claweye
- **OpenClaw 文档**：https://docs.openclaw.ai

### 社区支持
- **Discord**：https://discord.com/invite/clawd
- **GitHub Issues**：提交问题

### 本地帮助
```bash
# 查看日志
tail -f logs/server.log
tail -f logs/frontend.log

# 检查服务状态
./start.sh status

# 安全审计
cat SECURITY_AUDIT.md
```

---

## 🔐 安全提醒

1. **保护 .env 文件** - 权限设为 600，切勿提交到 Git
2. **定期清理日志** - 日志文件可能包含敏感信息
3. **限制外部访问** - 生产环境使用防火墙限制 IP
4. **更新依赖** - 定期运行 `npm audit` 和 `npm update`
5. **监控资源使用** - 避免内存泄漏

---

*祝你使用愉快！遇到问题随时联系夏娃 (Eve) 获取帮助 ✨*

**ClawEye - 洞察一切 · 掌控全局** 👁️
