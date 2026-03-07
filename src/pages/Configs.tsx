import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface ConfigFile {
  name: string;
  path: string;
  fullPath?: string;
  size: number;
  type: string;
  ext: string;
}

interface ConfigGroup {
  id: string;
  name: string;
  path: string;
  files: ConfigFile[];
  category: 'agent' | 'workspace' | 'skill';
}

function ConfigCard({ config, onExpand, isExpanded }: { 
  config: ConfigGroup; 
  onExpand: (id: string) => void;
  isExpanded: boolean;
}) {
  const [fileContent, setFileContent] = useState<{path: string, content: string} | null>(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [loadingFile, setLoadingFile] = useState<string | null>(null);

  const handleFileClick = async (file: ConfigFile) => {
    if (fileContent?.path === file.path && !fileContent.content) {
      // 已打开，折叠
      setFileContent(null);
      return;
    }

    if (fileContent?.path === file.path) {
      // 已加载，折叠
      setFileContent(null);
      return;
    }

    // 加载文件内容
    try {
      setLoadingFile(file.path);
      const response = await api.get('/file/read', {
        params: { path: file.fullPath || file.path },
      });
      
      setFileContent({
        path: file.path,
        content: response.data.content,
      });
      setEditContent(response.data.content);
      setMessage(null);
    } catch (error) {
      console.error('加载文件失败:', error);
      setMessage({ 
        type: 'error', 
        text: `加载失败：${error instanceof Error ? error.message : '未知错误'}` 
      });
    } finally {
      setLoadingFile(null);
    }
  };

  const handleEdit = () => {
    // 进入编辑模式
  };

  const handleSave = async () => {
    if (!fileContent) return;
    
    setSaving(true);
    try {
      const filePath = config.files.find(f => f.path === fileContent.path)?.fullPath || fileContent.path;
      
      const response = await api.put('/file/save', {
        path: filePath,
        content: editContent,
      });
      
      if (response.data.success) {
        setFileContent({
          path: fileContent.path,
          content: editContent,
        });
        setMessage({ type: 'success', text: `✅ 文件已保存` });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('保存失败');
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `保存失败：${error instanceof Error ? error.message : '未知错误'}` 
      });
    } finally {
      setSaving(false);
    }
  };

  const getFileIcon = (type: string) => {
    const icons: Record<string, string> = {
      markdown: '📝',
      text: '📄',
      json: '📋',
      javascript: '📜',
      typescript: '📘',
      python: '🐍',
      yaml: '📝',
      html: '🌐',
      css: '🎨',
      shell: '💻',
      env: '⚙️',
    };
    return icons[type] || '📄';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      agent: 'border-blue-500 bg-blue-900/20',
      workspace: 'border-green-500 bg-green-900/20',
      skill: 'border-purple-500 bg-purple-900/20',
    };
    return colors[category] || 'border-gray-500 bg-gray-900/20';
  };

  return (
    <div className={`border-l-4 rounded-lg overflow-hidden ${getCategoryColor(config.category)}`}>
      {/* 卡片头部 */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
        onClick={() => onExpand(config.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">
              {config.category === 'agent' ? '🤖' : config.category === 'skill' ? '🛠️' : '📁'}
            </span>
            <div>
              <h3 className="text-white font-semibold">{config.name}</h3>
              <p className="text-xs text-gray-400">{config.files.length} 个文件 • {config.path}</p>
            </div>
          </div>
          <span className={`text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>
      </div>

      {/* 展开的文件列表 */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-700">
          {/* 消息提示 */}
          {message && (
            <div className={`mt-3 p-3 rounded ${
              message.type === 'success' ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'
            }`}>
              {message.text}
            </div>
          )}

          {/* 文件列表 */}
          <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
            {config.files.map((file) => (
              <div key={file.path}>
                <button
                  onClick={() => handleFileClick(file)}
                  className={`w-full text-left p-3 rounded border transition-colors ${
                    fileContent?.path === file.path
                      ? 'bg-blue-900/30 border-blue-600'
                      : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <span className="text-lg flex-shrink-0">{getFileIcon(file.type)}</span>
                      <span className="text-white text-sm truncate" title={file.path}>{file.path}</span>
                    </div>
                    <div className="flex items-center space-x-3 flex-shrink-0 ml-2">
                      <span className="text-xs text-gray-500 whitespace-nowrap">{(file.size / 1024).toFixed(1)} KB</span>
                      {loadingFile === file.path && (
                        <span className="animate-spin flex-shrink-0">🔄</span>
                      )}
                    </div>
                  </div>
                </button>

                {/* 文件内容编辑区 */}
                {fileContent?.path === file.path && (
                  <div className="mt-2 p-3 bg-gray-900 rounded border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">
                        {fileContent.content.split('\n').length} 行 • {(fileContent.content.length / 1024).toFixed(1)} KB
                      </span>
                      <div className="space-x-2">
                        <button
                          onClick={() => setFileContent({ path: file.path, content: '' })}
                          className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                        >
                          折叠
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white rounded transition-colors"
                        >
                          {saving ? '保存中...' : '💾 保存'}
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-64 bg-gray-800 text-gray-100 font-mono text-sm p-3 rounded border border-gray-700 focus:border-blue-500 focus:outline-none resize-y"
                      style={{ minHeight: '200px' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700 bg-gray-850">
      <div className="text-sm text-gray-400">
        第 {currentPage} 页，共 {totalPages} 页
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 rounded transition-colors"
        >
          上一页
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 rounded transition-colors"
        >
          下一页
        </button>
      </div>
    </div>
  );
}

function Configs() {
  const [configs, setConfigs] = useState<{ agents: ConfigGroup[]; workspace: ConfigGroup[]; skills: ConfigGroup[] }>({ 
    agents: [], 
    workspace: [], 
    skills: [] 
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'agents' | 'workspace' | 'skills'>('all');
  const [expandedConfig, setExpandedConfig] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // 加载配置列表
  useEffect(() => {
    async function loadConfigs() {
      try {
        const response = await api.get('/agents/config/list');
        setConfigs({
          agents: response.data.agents || [],
          workspace: response.data.workspace || [],
          skills: response.data.skills || [],
        });
        setLoading(false);
        console.log('[Config] 已加载 - Agents:', response.data.agents?.length, 
                    'Workspace:', response.data.workspace?.length, 
                    'Skills:', response.data.skills?.length);
      } catch (error) {
        console.error('加载配置列表失败:', error);
        setLoading(false);
      }
    }
    
    loadConfigs();
  }, []);

  // 根据 tab 和搜索筛选
  const allConfigs = activeTab === 'all' 
    ? [...configs.agents, ...configs.workspace, ...configs.skills]
    : activeTab === 'agents' 
      ? configs.agents
      : activeTab === 'workspace'
        ? configs.workspace
        : configs.skills;

  const filteredConfigs = allConfigs.filter(config => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return config.name.toLowerCase().includes(search) ||
           config.files.some(f => f.name.toLowerCase().includes(search));
  });

  // 分页
  const totalPages = Math.ceil(filteredConfigs.length / pageSize);
  const paginatedConfigs = filteredConfigs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 重置页码当筛选条件变化时
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchText]);

  const totalAgents = configs.agents.length;
  const totalWorkspace = configs.workspace.length;
  const totalSkills = configs.skills.length;
  const totalFiles = [...configs.agents, ...configs.workspace, ...configs.skills]
    .reduce((sum, c) => sum + c.files.length, 0);

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-blue-500 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Agents</p>
              <p className="text-3xl font-bold mt-2 text-white">{totalAgents}</p>
            </div>
            <div className="text-4xl opacity-80">🤖</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-green-500 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">工作区</p>
              <p className="text-3xl font-bold mt-2 text-white">{totalWorkspace}</p>
            </div>
            <div className="text-4xl opacity-80">📁</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-purple-500 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Skills</p>
              <p className="text-3xl font-bold mt-2 text-white">{totalSkills}</p>
            </div>
            <div className="text-4xl opacity-80">🛠️</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border-l-4 border-yellow-500 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">配置文件</p>
              <p className="text-3xl font-bold mt-2 text-white">{totalFiles}</p>
            </div>
            <div className="text-4xl opacity-80">📄</div>
          </div>
        </div>
      </div>

      {/* 搜索和 Tab */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            全部 ({totalAgents + totalWorkspace + totalSkills})
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'agents'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            🤖 Agents ({totalAgents})
          </button>
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'workspace'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            📁 工作区 ({totalWorkspace})
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'skills'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            🛠️ Skills ({totalSkills})
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="搜索文件..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full md:w-64 px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* 配置列表 */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 bg-gray-850">
          <h2 className="text-lg font-semibold text-white">⚙️ 配置管理</h2>
          <p className="text-sm text-gray-400 mt-1">点击配置卡片展开查看和编辑文件</p>
        </div>

        <div className="p-6 space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-400">
              🔄 正在加载配置...
            </div>
          ) : paginatedConfigs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              📭 暂无配置
            </div>
          ) : (
            paginatedConfigs.map((config) => (
              <ConfigCard
                key={config.id}
                config={config}
                isExpanded={expandedConfig === config.id}
                onExpand={(id) => setExpandedConfig(expandedConfig === id ? null : id)}
              />
            ))
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

export default Configs;
