import { create } from 'zustand';
import type { Agent, Stats } from '@/types';
import { getSubagents, getStats } from '@/services/api';

interface AgentState {
  // 数据
  activeAgents: Agent[];
  recentAgents: Agent[];
  stats: Stats | null;
  
  // 状态
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  
  // WebSocket 连接
  wsConnected: boolean;
  
  // 刷新控制
  refreshInterval: number; // 刷新间隔（毫秒）
  autoRefresh: boolean; // 是否自动刷新
  apiStopped: boolean; // API 是否已停止（连续失败后）
  failCount: number; // 失败计数器（每次 refreshAll 计数 1 次）
  modalOpen: boolean; // 是否有弹窗打开（日志详情等）
  
  // 操作
  fetchAgents: () => Promise<void>;
  fetchStats: () => Promise<void>;
  refreshAll: () => Promise<void>;
  setWsConnected: (connected: boolean) => void;
  clearError: () => void;
  setRefreshInterval: (interval: number) => void;
  toggleAutoRefresh: () => void;
  resetApiRetry: () => void;
  setModalOpen: (open: boolean) => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  // 初始状态
  activeAgents: [],
  recentAgents: [],
  stats: null,
  loading: false,
  error: null,
  lastUpdated: null,
  wsConnected: false,
  refreshInterval: 30000, // 默认 30 秒
  autoRefresh: true, // 默认开启自动刷新
  apiStopped: false, // API 未停止
  failCount: 0, // 失败计数 0
  modalOpen: false, // 弹窗关闭状态

  // 获取 Agent 列表
  fetchAgents: async () => {
    try {
      set({ loading: true, error: null });
      const data = await getSubagents();
      
      set({
        activeAgents: data.active || [],
        recentAgents: data.recent || [],
        loading: false,
        lastUpdated: Date.now(),
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取 Agent 列表失败',
        loading: false,
      });
      throw error; // 抛出错误，让 refreshAll 捕获
    }
  },

  // 获取统计数据
  fetchStats: async () => {
    try {
      const stats = await getStats();
      set({ stats });
    } catch (error) {
      console.debug('获取统计数据失败:', error instanceof Error ? error.message : error);
      throw error; // 抛出错误，让 refreshAll 捕获
    }
  },

  // 刷新所有数据
  refreshAll: async () => {
    const state = get();
    
    // 如果 API 已停止，不再刷新
    if (state.apiStopped) {
      console.warn('[Store] API 已停止，跳过 refreshAll');
      return;
    }
    
    // 如果有弹窗打开，跳过刷新（避免影响用户体验和浪费资源）
    if (state.modalOpen) {
      console.debug('[Store] 弹窗打开中，跳过 refreshAll');
      return;
    }
    
    // 执行刷新
    const results = await Promise.allSettled([
      get().fetchAgents(),
      get().fetchStats(),
    ]);
    
    // 检查是否有失败
    const hasFailure = results.some(r => r.status === 'rejected');
    
    if (hasFailure) {
      const newFailCount = state.failCount + 1;
      console.log(`[Store] 刷新失败 (${newFailCount}/3)`);
      
      if (newFailCount >= 3) {
        // 达到 3 次失败，停止 API
        set({ apiStopped: true, failCount: newFailCount });
        // 通知 API 模块
        import('@/services/api').then(({ markApiStopped }) => {
          markApiStopped();
        });
        console.warn('[Store] 连续失败 3 次，已停止 API 刷新');
      } else {
        set({ failCount: newFailCount });
      }
    } else {
      // 成功后重置计数器
      set({ failCount: 0 });
    }
  },

  // 设置 WebSocket 连接状态
  setWsConnected: (connected: boolean) => {
    set({ wsConnected: connected });
  },

  // 清除错误
  clearError: () => {
    set({ error: null });
  },

  // 设置刷新间隔
  setRefreshInterval: (interval: number) => {
    set({ refreshInterval: interval });
  },

  // 切换自动刷新
  toggleAutoRefresh: () => {
    set({ autoRefresh: !get().autoRefresh });
  },

  // 重置 API 重试（手动触发）
  resetApiRetry: () => {
    set({ apiStopped: false, failCount: 0 });
    // 调用 API 模块的重置函数
    import('@/services/api').then(({ resetApiStopped }) => {
      resetApiStopped();
      console.log('[Store] API 重试计数器已重置');
    });
  },

  // 设置弹窗状态
  setModalOpen: (open: boolean) => {
    set({ modalOpen: open });
    if (open) {
      console.log('[Store] 弹窗打开，暂停自动刷新');
    } else {
      console.log('[Store] 弹窗关闭，恢复自动刷新');
    }
  },
}));
