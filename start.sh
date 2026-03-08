#!/bin/bash

# Monitor Platform 启动脚本
# 自动启动后端 API 服务和前端开发服务器（一起启动）

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 启动 Monitor Platform..."
echo ""

# 确保日志目录存在
mkdir -p logs

# 检查配置文件
if [ ! -f ".env" ]; then
    echo "⚠️  .env 文件不存在，从 .env.example 复制..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件"
    echo ""
fi

# 检查 config.json
if [ ! -f "config.json" ]; then
    echo "⚠️  config.json 文件不存在..."
    echo "请创建配置文件并设置正确的路径"
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "⚠️  依赖未安装，正在安装..."
    npm install
    echo ""
fi

# 停止旧的后端进程（如果有）
if pgrep -f "node server.js" > /dev/null; then
    echo "🔄 检测到后端服务已在运行，正在重启..."
    pkill -f "node server.js"
    sleep 1
fi

# 启动后端服务
echo "📡 启动后端 API 服务..."
nohup node server.js > logs/server.log 2>&1 &
BACKEND_PID=$!
sleep 2

if pgrep -f "node server.js" > /dev/null; then
    echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"
else
    echo "❌ 后端服务启动失败，请查看 logs/server.log"
    exit 1
fi

# 等待后端就绪
echo "⏳ 等待后端服务就绪..."
for i in {1..10}; do
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ 后端服务已就绪"
        break
    fi
    sleep 1
done

# 检查后端是否真的就绪
if ! curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "⚠️  后端服务未完全就绪，但继续启动前端..."
fi

# 启动前端服务
echo ""
echo "🎨 启动前端开发服务器..."
nohup npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 3

if ps -p $FRONTEND_PID > /dev/null 2>&1; then
    echo "✅ 前端服务已启动 (PID: $FRONTEND_PID)"
else
    echo "❌ 前端服务启动失败，请查看 logs/frontend.log"
    echo "⚠️  后端服务继续运行"
fi

# 保存 PID 到文件
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

echo ""
echo "=========================================="
echo "✅ Monitor Platform 启动完成！"
echo "=========================================="
echo ""
echo "📊 访问地址："
echo "   前端：http://localhost:3000"
echo "   后端：http://localhost:3001/api/health"
echo ""
echo "📖 查看日志："
echo "   后端：tail -f logs/server.log"
echo "   前端：tail -f logs/frontend.log"
echo ""
echo "🛑 停止服务："
echo "   ./stop.sh"
echo ""
echo "📋 进程 ID："
echo "   后端：$BACKEND_PID"
echo "   前端：$FRONTEND_PID"
echo ""
