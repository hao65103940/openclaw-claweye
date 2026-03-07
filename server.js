/**
 * Agent 监控平台 - API 桥接服务
 * 
 * 调用 OpenClaw CLI 获取真实数据
 */

import express from 'express';
import cors from 'cors';
import { execSync } from 'child_process';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

/**
 * 执行 OpenClaw CLI 命令
 */
function runOpenClawCommand(command) {
  try {
    // 使用完整路径
    const fullCommand = `/root/.nvm/versions/node/v24.13.0/bin/${command}`;
    const output = execSync(fullCommand, {
      encoding: 'utf-8',
      timeout: 10000, // 10 秒超时
      env: { ...process.env, PATH: `/root/.nvm/versions/node/v24.13.0/bin:${process.env.PATH}` },
    });
    return JSON.parse(output);
  } catch (error) {
    console.error(`[CLI] 命令失败：${command}`, error.message);
    throw error;
  }
}

/**
 * 格式化 Agent 数据
 */
function formatAgent(session, label) {
  return {
    id: session.sessionKey || `session:${session.id || Date.now()}`,
    agentId: 'agent:main',
    status: 'done', // 存储的会话都是已完成的
    task: label || '未知任务',
    label: label || '会话',
    runtimeMs: (session.updatedAt - session.createdAt) || 0,
    runtime: formatDuration((session.updatedAt - session.createdAt) || 0),
    model: session.model || 'qwen3.5-plus',
    totalTokens: session.totalTokens || session.tokenUsage?.total || 0,
    inputTokens: session.inputTokens || session.tokenUsage?.input || 0,
    outputTokens: session.outputTokens || session.tokenUsage?.output || 0,
    startedAt: session.createdAt,
    endedAt: session.updatedAt,
  };
}

/**
 * 格式化时长
 */
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

/**
 * GET /api/subagents/list
 * 获取子 Agent 列表（从 sessions 获取）
 */
app.get('/api/subagents/list', (req, res) => {
  try {
    // 获取最近的会话
    const sessionsData = runOpenClawCommand('openclaw sessions --json');
    const sessions = sessionsData.sessions || [];
    
    // 限制最近 20 条
    const recent = sessions.slice(0, 20).map((s, i) => 
      formatAgent(s, s.key || `会话-${i + 1}`)
    );
    
    // 活跃 Agent（最近 5 分钟内更新的）
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    const active = sessions
      .filter(s => s.updatedAt > fiveMinAgo)
      .map((s, i) => ({
        ...formatAgent(s, s.key || `会话-${i + 1}`),
        status: 'running',
      }));
    
    res.json({
      total: sessions.length,
      active: active.slice(0, 5), // 最多显示 5 个活跃的
      recent: recent,
    });
  } catch (error) {
    console.error('[API] 获取子 Agent 列表失败:', error.message);
    res.status(500).json({ 
      error: '获取数据失败',
      details: error.message,
    });
  }
});

/**
 * GET /api/sessions/list
 * 获取会话列表
 */
app.get('/api/sessions/list', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const sessionsData = runOpenClawCommand('openclaw sessions --json');
    const sessions = (sessionsData.sessions || []).slice(0, limit);
    
    res.json({
      sessions: sessions.map(s => ({
        sessionKey: s.key,
        label: s.key || '未知会话',
        createdAt: s.updatedAt - (s.ageMs || 0),
        updatedAt: s.updatedAt,
        messageCount: 0, // OpenClaw 不提供
        agentId: s.agentId || 'main',
        model: s.model,
        tokens: s.totalTokens,
      })),
      total: sessions.length,
    });
  } catch (error) {
    console.error('[API] 获取会话列表失败:', error.message);
    res.status(500).json({ 
      error: '获取数据失败',
      details: error.message,
    });
  }
});

/**
 * GET /api/stats
 * 获取统计数据
 */
app.get('/api/stats', (req, res) => {
  try {
    const sessionsData = runOpenClawCommand('openclaw sessions --json');
    const sessions = sessionsData.sessions || [];
    
    // 统计
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    const activeCount = sessions.filter(s => s.updatedAt > fiveMinAgo).length;
    const completedCount = sessions.filter(s => s.updatedAt <= fiveMinAgo).length;
    
    const totalTokens = sessions.reduce((sum, s) => {
      return sum + (s.totalTokens || 0);
    }, 0);
    
    const totalRuntime = sessions.reduce((sum, s) => {
      return sum + (s.ageMs || 0);
    }, 0);
    
    // 统计模型使用
    const modelUsage = {};
    sessions.forEach(s => {
      const model = s.model || 'unknown';
      modelUsage[model] = (modelUsage[model] || 0) + 1;
    });
    
    res.json({
      totalAgents: sessions.length,
      activeAgents: activeCount,
      completedAgents: completedCount,
      failedAgents: 0,
      totalTokens,
      totalRuntime,
      avgRuntime: completedCount > 0 ? totalRuntime / completedCount : 0,
      modelUsage,
    });
  } catch (error) {
    console.error('[API] 获取统计数据失败:', error.message);
    res.status(500).json({ 
      error: '获取数据失败',
      details: error.message,
    });
  }
});

/**
 * GET /api/health
 * 健康检查
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    mode: 'real-data',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Agent 监控平台 API 服务已启动`);
  console.log(`📡 监听端口：http://0.0.0.0:${PORT}`);
  console.log(`📊 可用端点:`);
  console.log(`   GET /api/subagents/list - 获取子 Agent 列表`);
  console.log(`   GET /api/sessions/list  - 获取会话列表`);
  console.log(`   GET /api/stats          - 获取统计数据`);
  console.log(`   GET /api/health         - 健康检查`);
  console.log(`💡 当前使用 **真实数据** (OpenClaw CLI)`);
  console.log(`🌐 可从外部访问（需要防火墙开放端口）`);
});
