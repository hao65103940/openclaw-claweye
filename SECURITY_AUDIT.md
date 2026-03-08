# 🔐 ClawEye 安全审计报告

**审计日期**：2026-03-08  
**审计人**：夏娃 (Eve)  
**项目名称**：ClawEye - OpenClaw 监控平台  
**版本**：1.0.0

---

## ⚠️ 安全风险评估

### 1. 敏感信息检查

#### ✅ 已发现的风险点

| 文件 | 风险等级 | 问题描述 | 建议操作 |
|------|---------|---------|---------|
| `.env` | 🟡 中 | 包含系统路径、端口配置 | ✅ 已加入 `.gitignore`，权限需设为 600 |
| `config.json` | 🟢 低 | 仅包含路径配置，无敏感凭证 | ✅ 可公开，但建议脱敏路径 |
| `logs/*.log` | 🟡 中 | 可能包含会话 ID、WebSocket 连接 ID | ✅ 已加入 `.gitignore` |
| `server.js` | 🟢 低 | 无硬编码密钥 | ✅ 代码安全 |

#### ❌ 未发现的高风险问题

- ✅ 无 API Keys 暴露
- ✅ 无数据库密码
- ✅ 无第三方服务 Token
- ✅ 无硬编码凭证

---

### 2. 文件权限检查

```bash
# 当前权限状态
-rw-r--r--  .env           # ⚠️ 需改为 600
-rw-r--r--  config.json    # ✅ 644 可接受
-rw-r--r--  .env.example   # ✅ 644 正确
drwxr-xr-x  logs/          # ✅ 755 可接受
```

**建议修复**：
```bash
cd /root/.openclaw/claweye
chmod 600 .env
chmod 700 logs/
```

---

### 3. Git 保护检查

#### ✅ `.gitignore` 配置完善

```
✅ .env              # 环境变量（敏感）
✅ logs/             # 日志文件
✅ *.log             # 日志文件
✅ *.pid             # 进程 ID
✅ node_modules/     # 依赖
✅ dist/ build/      # 构建产物
```

**评估**：配置完善，无敏感文件泄露风险

---

### 4. 数据源分析

#### 当前数据源

ClawEye 的数据来源主要是 **OpenClaw CLI 命令输出** 和 **JSONL 日志文件**：

| 数据源 | 类型 | 位置 | 敏感性 |
|--------|------|------|--------|
| OpenClaw CLI | 命令输出 | `/root/.nvm/versions/node/v24.13.0/bin/openclaw` | 中 |
| 会话数据 | JSON | `/root/.openclaw/agents/` | 中 |
| Cron 执行记录 | JSONL | `/root/.openclaw/cron/runs/*.jsonl` | 中 |
| 会话历史 | JSONL | `/root/.openclaw/delivery-queue/` | 高 |
| 应用日志 | LOG | `/root/.openclaw/claweye/logs/` | 低 |

#### JSONL 数据源说明

**什么是 JSONL**：
- JSON Lines 格式，每行是一个独立的 JSON 对象
- 便于流式处理和日志记录
- ClawEye 通过解析这些文件获取监控数据

**主要 JSONL 文件**：

```bash
# 1. Cron 任务执行记录
/root/.openclaw/cron/runs/<job-id>.jsonl

# 2. 消息投递记录
/root/.openclaw/delivery-queue/*.jsonl

# 3. 会话日志（如有）
/root/.openclaw/logs/*.jsonl
```

**JSONL 文件结构示例**：
```json
{"ts":1772928327492,"jobId":"7c450201-d3c4-41bf-bd2b-9e2955cb7b3f","action":"finished","status":"ok","summary":"任务执行摘要","delivered":true,"sessionId":"xxx","durationMs":327480}
```

**敏感字段**（展示时需脱敏）：
- `sessionId` - 会话 ID → `[SESSION_ID_REDACTED]`
- `jobId` - 任务 ID → `[JOB_ID_REDACTED]`
- `messageId` - 消息 ID → `[MESSAGE_ID_REDACTED]`
- `summary` - 可能包含群组 ID、用户 ID → 需脱敏

---

### 5. 配置文件分析

#### `.env` 文件内容

```bash
# 当前配置（无敏感凭证，主要是路径）
VITE_API_BASE_URL=http://localhost:3001/api
PORT=3001
HOST=0.0.0.0
OPENCLAW_CLI_PATH=/root/.nvm/versions/node/v24.13.0/bin/openclaw
NODE_PATH=/root/.nvm/versions/node/v24.13.0/bin/node
OPENCLAW_BASE_PATH=/root/.openclaw
LOG_PATH=/root/.openclaw/claweye/logs
CACHE_TTL=5000
ALLOWED_BASE_PATHS=/root/.openclaw
```

**评估**：
- ✅ 无 API Keys、Secrets、Tokens
- ✅ 仅包含系统路径和配置参数
- ⚠️ 路径信息暴露系统结构（建议生产环境脱敏）

#### `config.json` 内容

```json
{
  "openclaw": {
    "cliPath": "/root/.nvm/versions/node/v24.13.0/bin/openclaw",
    "basePath": "/root/.openclaw"
  },
  "server": {
    "port": 3001,
    "logPath": "/root/.openclaw/claweye/logs"
  },
  "github": {
    "username": "hao65103940",
    "repository": "openclaw-claweye",
    "tokenNote": "Token stored in .env file (GITHUB_TOKEN)"
  }
}
```

**评估**：
- ✅ 无硬编码 Token
- ⚠️ GitHub Token 注释说明（建议移除或明确指向 .env）

---

### 6. 日志文件检查

#### 当前日志内容

```bash
# server.log 内容示例
[WS] 客户端连接: vg6Bq7rjpgLbFkX1AAAB
[WS] 客户端订阅会话状态: vg6Bq7rjpgLbFkX1AAAB
[API] 返回配置列表 - Agents: 7 Workspace: 26 Skills: 12
```

**敏感信息**：
- ⚠️ WebSocket 客户端 ID（临时会话标识）
- ⚠️ 会话订阅信息（可能暴露监控目标）

**建议**：
- 日志文件权限设为 600
- 定期清理旧日志（>7 天）
- 生产环境启用日志脱敏

---

## 🛡️ 安全改进建议

### 高优先级（立即执行）

1. **修复文件权限**
   ```bash
   cd /root/.openclaw/claweye
   chmod 600 .env
   chmod 700 logs/
   chmod 600 logs/*.log
   ```

2. **移除 config.json 中的 Token 注释**
   ```json
   // ❌ 移除这行
   "tokenNote": "Token stored in .env file (GITHUB_TOKEN)"
   ```

3. **添加日志脱敏过滤器**
   ```javascript
   // server.js 中添加
   function sanitizeLog(message) {
     return message
       .replace(/sessionId:[\w-]+/g, 'sessionId:[REDACTED]')
       .replace(/clientId:[\w-]+/g, 'clientId:[REDACTED]');
   }
   ```

### 中优先级（建议执行）

4. **路径脱敏配置**
   ```bash
   # .env 中使用相对路径或环境变量
   OPENCLAW_BASE_PATH=${HOME}/.openclaw
   ```

5. **启用日志轮转**
   ```bash
   # 安装 logrotate
   sudo apt install logrotate
   
   # 配置 /etc/logrotate.d/claweye
   /root/.openclaw/claweye/logs/*.log {
     daily
     rotate 7
     compress
     missingok
     notifempty
   }
   ```

6. **添加 .env.vault 支持**（可选）
   - 使用 [dotenv-vault](https://github.com/dotenv-org/dotenv-vault) 加密环境变量
   - 团队部署时更安全

### 低优先级（可选）

7. **添加访问控制**
   - 为 API 添加简单的 Token 认证
   - 限制 IP 访问范围

8. **启用 HTTPS**（生产环境）
   - 使用 Let's Encrypt 免费证书
   - 配置 Nginx 反向代理

---

## 📊 安全评分

| 项目 | 得分 | 说明 |
|------|------|------|
| 敏感凭证管理 | ✅ 10/10 | 无 API Keys、Secrets 暴露 |
| 文件权限 | ⚠️ 7/10 | .env 权限需改为 600 |
| Git 保护 | ✅ 10/10 | .gitignore 配置完善 |
| 日志安全 | ⚠️ 8/10 | 日志包含临时 ID，建议脱敏 |
| 配置安全 | ✅ 9/10 | 无硬编码凭证，路径可脱敏 |

**总体安全评分**: 🟢 **88/100**（良好）

---

## ✅ 安全检查清单

### 部署前检查

```bash
# 1. 检查敏感文件权限
ls -la /root/.openclaw/claweye/.env
# 应为：-rw------- (600)

# 2. 检查 Git 状态
cd /root/.openclaw/claweye && git status
# 确保 .env 未提交

# 3. 检查日志权限
ls -la /root/.openclaw/claweye/logs/
# 应为：drwx------ (700)

# 4. 验证配置无敏感信息
grep -r "sk-\|omUmW\|C-TISEj" /root/.openclaw/claweye --include="*.js" --include="*.json"
# 应无输出
```

### 定期安全检查（建议每月）

- [ ] 审查日志文件内容
- [ ] 更新依赖包（`npm audit`）
- [ ] 检查 Git 提交历史
- [ ] 验证文件权限
- [ ] 清理旧日志（>7 天）

---

## 🔐 敏感操作确认流程

**需要用户确认的操作**：
1. 修改 `.env` 配置文件
2. 重启 ClawEye 服务
3. 删除日志文件
4. 修改 `config.json` 路径配置

**确认流程**：
```
1. 告知用户操作内容及影响范围
2. 提供配置预览（脱敏后）
3. 等待用户明确确认
4. 执行操作并记录
```

---

## 📝 数据脱敏规则

### 展示给用户的脱敏格式

| 原始数据 | 脱敏后 |
|---------|--------|
| `vg6Bq7rjpgLbFkX1AAAB` | `[CLIENT_ID_REDACTED]` |
| `agent:main:main` | `[SESSION_REDACTED]` |
| `/root/.openclaw` | `[OPENCLAW_PATH]` |
| `3001` | `[PORT]` |

### 代码中实现

```javascript
// utils/sanitize.js
export function sanitizeOutput(data) {
  const str = JSON.stringify(data);
  return str
    .replace(/\/root\/\.openclaw/g, '[OPENCLAW_PATH]')
    .replace(/sessionId:[\w-:]+/g, 'sessionId:[SESSION_REDACTED]')
    .replace(/clientId:[\w-]+/g, 'clientId:[CLIENT_REDACTED]');
}
```

---

## 🚨 应急响应

### 如发现敏感信息泄露

1. **立即停止服务**
   ```bash
   cd /root/.openclaw/claweye
   npm run stop
   ```

2. **轮换所有相关凭证**
   - 修改 `.env` 中的路径配置
   - 更新 Git 提交历史（如已提交）

3. **审查访问日志**
   ```bash
   cat /root/.openclaw/claweye/logs/server.log | grep -i "error\|fail"
   ```

4. **通知相关人员**

---

## 📞 联系支持

- **项目仓库**：https://github.com/hao65103940/openclaw-claweye
- **问题反馈**：提交 Issue
- **紧急联系**：夏娃 (Eve) - 数字精灵助手

---

*最后更新：2026-03-08*  
*下次审查日期：2026-04-08*
