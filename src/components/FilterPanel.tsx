import React, { useState, useEffect } from 'react';

interface FilterState {
  sessionTypes: string[];
  statuses: string[];
  channels: string[];
  keyword: string;
  dateRange: {
    start: string;
    end: string;
  };
}

interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

const SESSION_TYPES = [
  { value: 'direct', label: '直接会话', icon: '💬' },
  { value: 'group', label: '群组会话', icon: '👥' },
  { value: 'cron', label: '定时任务', icon: '⏰' },
  { value: 'subagent', label: '子 Agent', icon: '🤖' },
];

const CHANNELS = [
  { value: 'feishu', label: '飞书', icon: '📝' },
  { value: 'wecom', label: '企业微信', icon: '💼' },
  { value: 'control-ui', label: 'Control-UI', icon: '🖥️' },
  { value: 'cron', label: '定时任务', icon: '⏰' },
];

const STATUSES = [
  { value: 'running', label: '运行中', icon: '🟢', color: 'green' },
  { value: 'completed', label: '已完成', icon: '✅', color: 'blue' },
  { value: 'failed', label: '失败', icon: '❌', color: 'red' },
];

function FilterPanel({ onFilterChange, onReset }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>({
    sessionTypes: [],
    statuses: [],
    channels: [],
    keyword: '',
    dateRange: {
      start: '',
      end: '',
    },
  });

  const [isOpen, setIsOpen] = useState(false);

  // 处理筛选条件变化
  const handleFilterChange = (
    category: keyof FilterState,
    value: string,
    checked: boolean
  ) => {
    setFilters((prev) => {
      const current = prev[category] as string[];
      const updated = checked
        ? [...current, value]
        : current.filter((v) => v !== value);

      const newFilters = { ...prev, [category]: updated };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  // 处理关键词搜索
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, keyword: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // 重置所有筛选
  const handleReset = () => {
    const emptyFilters: FilterState = {
      sessionTypes: [],
      statuses: [],
      channels: [],
      keyword: '',
      dateRange: {
        start: '',
        end: '',
      },
    };
    setFilters(emptyFilters);
    onReset();
  };

  // 计算活跃筛选数量
  const activeFilterCount =
    filters.sessionTypes.length +
    filters.statuses.length +
    filters.channels.length +
    (filters.keyword ? 1 : 0);

  return (
    <div className="space-y-3">
      {/* 筛选按钮 */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
            isOpen || activeFilterCount > 0
              ? 'bg-blue-700 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <span>🔍 筛选</span>
          {activeFilterCount > 0 && (
            <span className="bg-white text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
          >
            ✖️ 重置
          </button>
        )}
      </div>

      {/* 筛选面板 */}
      {isOpen && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* 关键词搜索 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              🔎 关键词搜索
            </label>
            <input
              type="text"
              value={filters.keyword}
              onChange={handleKeywordChange}
              placeholder="搜索任务描述、Agent ID..."
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 会话类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              📝 会话类型
            </label>
            <div className="flex flex-wrap gap-2">
              {SESSION_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`px-3 py-2 rounded-lg border cursor-pointer transition-all flex items-center space-x-2 ${
                    filters.sessionTypes.includes(type.value)
                      ? 'bg-blue-700 border-blue-500 text-white'
                      : 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={filters.sessionTypes.includes(type.value)}
                    onChange={(e) =>
                      handleFilterChange('sessionTypes', type.value, e.target.checked)
                    }
                    className="hidden"
                  />
                  <span>{type.icon}</span>
                  <span className="text-sm">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 状态筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              📊 状态
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((status) => (
                <label
                  key={status.value}
                  className={`px-3 py-2 rounded-lg border cursor-pointer transition-all flex items-center space-x-2 ${
                    filters.statuses.includes(status.value)
                      ? `bg-${status.color}-700 border-${status.color}-500 text-white`
                      : 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={filters.statuses.includes(status.value)}
                    onChange={(e) =>
                      handleFilterChange('statuses', status.value, e.target.checked)
                    }
                    className="hidden"
                  />
                  <span>{status.icon}</span>
                  <span className="text-sm">{status.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 渠道筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              🌐 渠道
            </label>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((channel) => (
                <label
                  key={channel.value}
                  className={`px-3 py-2 rounded-lg border cursor-pointer transition-all flex items-center space-x-2 ${
                    filters.channels.includes(channel.value)
                      ? 'bg-purple-700 border-purple-500 text-white'
                      : 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={filters.channels.includes(channel.value)}
                    onChange={(e) =>
                      handleFilterChange('channels', channel.value, e.target.checked)
                    }
                    className="hidden"
                  />
                  <span>{channel.icon}</span>
                  <span className="text-sm">{channel.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterPanel;
