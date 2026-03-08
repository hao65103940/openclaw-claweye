# 👁️ ClawEye

> **ClawEye - AI Agent 监控平台**
> 
> *洞察一切 · 掌控全局*

---

## 🎯 项目简介

ClawEye 是专为 OpenClaw 打造的智能监控平台，提供实时会话监控、Token 分析和性能洞察。

### 核心功能

- 📊 **Dashboard** - 实时会话状态、Token 趋势图、告警通知
- 📈 **Analytics** - Token 深度分析、会话行为、模型统计、渠道分析
- 📝 **Logs** - 实时日志推送、历史查询
- 🔗 **Trace** - 会话关系图、子 Agent 链路

---

## 🚀 快速开始

```bash
# 进入项目目录
cd /root/.openclaw/claweye

# 安装依赖
npm install

# 启动服务（前后端一起）
npm run start

# 访问：http://localhost:3000
```

---

## 📊 Analytics 分析模块

### 阶段 1：Token 深度分析
- Token 使用趋势（7/30/90 天）
- Token 效率分析（Top 10 会话）
- 成本估算（月度预测）

### 阶段 2：会话行为分析
- 24 小时活跃分布
- 会话类型分布
- 失败会话分析

### 阶段 3：模型与性能分析
- 模型使用统计
- 性能瓶颈（P50/P90/P99）

### 阶段 4：渠道与子 Agent 分析
- 渠道详细分析
- 子 Agent 统计

---

## 🛠️ 技术栈

- **前端**：React 18 + TypeScript + Vite
- **后端**：Express + Node.js
- **状态管理**：Zustand
- **图表**：ECharts
- **样式**：TailwindCSS
- **实时通信**：Socket.IO

---

## 📁 项目结构

```
claweye/
├── src/
│   ├── components/    # 11 个分析组件
│   ├── pages/         # Dashboard, Analytics, Logs, Trace
│   ├── services/      # API 服务
│   └── store/         # Zustand 状态
├── server.js          # 后端 API（11 个分析接口）
└── package.json
```

---

## 📄 License

Apache 2.0

---

**ClawEye - 洞察一切 · 掌控全局** 👁️

**GitHub**: https://github.com/hao65103940/openclaw-claweye
