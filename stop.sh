#!/bin/bash

# Monitor Platform 停止脚本
# 同时停止后端和前端服务，并确保 3000 和 3001 端口被释放

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🛑 停止 Monitor Platform..."
echo ""

# 尝试从 PID 文件读取
STOPPED=0

if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "📡 停止后端服务 (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
        sleep 1
        if ! ps -p $BACKEND_PID > /dev/null 2>&1; then
            echo "✅ 后端服务已停止"
            STOPPED=$((STOPPED + 1))
        else
            echo "⚠️  后端服务未能正常停止，尝试强制停止..."
            kill -9 $BACKEND_PID 2>/dev/null
            sleep 1
        fi
    fi
    rm -f .backend.pid
fi

if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "🎨 停止前端服务 (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
        sleep 1
        if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
            echo "✅ 前端服务已停止"
            STOPPED=$((STOPPED + 1))
        else
            echo "⚠️  前端服务未能正常停止，尝试强制停止..."
            kill -9 $FRONTEND_PID 2>/dev/null
            sleep 1
        fi
    fi
    rm -f .frontend.pid
fi

# 如果 PID 文件不存在或进程已不存在，尝试通过进程名停止
if [ $STOPPED -eq 0 ]; then
    echo "ℹ️  未找到 PID 文件，尝试通过进程名停止..."
    
    # 停止后端
    if pgrep -f "node server.js" > /dev/null; then
        echo "📡 停止后端服务..."
        pkill -f "node server.js"
        sleep 1
        if ! pgrep -f "node server.js" > /dev/null; then
            echo "✅ 后端服务已停止"
        else
            echo "⚠️  后端服务未能正常停止"
        fi
    else
        echo "ℹ️  后端服务未运行"
    fi
    
    # 停止前端
    if pgrep -f "npm run dev" > /dev/null; then
        echo "🎨 停止前端服务..."
        pkill -f "npm run dev"
        sleep 1
        if ! pgrep -f "npm run dev" > /dev/null; then
            echo "✅ 前端服务已停止"
        else
            echo "⚠️  前端服务未能正常停止"
        fi
    else
        echo "ℹ️  前端服务未运行"
    fi
fi

# 清理残留进程
sleep 1
REMAINING=$(pgrep -f "node server.js|npm run dev" | wc -l)
if [ $REMAINING -gt 0 ]; then
    echo "⚠️  检测到 $REMAINING 个残留进程，强制停止..."
    pkill -9 -f "node server.js" 2>/dev/null
    pkill -9 -f "npm run dev" 2>/dev/null
    sleep 1
fi

# ==========================================
# 强制清理 3000 和 3001 端口
# ==========================================
echo ""
echo "🧹 强制清理端口..."

# 清理 3001 端口
if lsof -ti:3001 > /dev/null 2>&1; then
    echo "⚠️  端口 3001 仍被占用，强制清理..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    sleep 1
    if ! lsof -ti:3001 > /dev/null 2>&1; then
        echo "✅ 端口 3001 已清理"
    else
        echo "⚠️  端口 3001 清理失败，请手动检查"
    fi
else
    echo "✅ 端口 3001 已释放"
fi

# 清理 3000 端口
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "⚠️  端口 3000 仍被占用，强制清理..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
    if ! lsof -ti:3000 > /dev/null 2>&1; then
        echo "✅ 端口 3000 已清理"
    else
        echo "⚠️  端口 3000 清理失败，请手动检查"
    fi
else
    echo "✅ 端口 3000 已释放"
fi

echo ""
echo "=========================================="
echo "✅ Monitor Platform 已停止"
echo "✅ 端口 3000 和 3001 已释放"
echo "=========================================="
echo ""
echo "📖 查看日志："
echo "   后端：cat logs/server.log"
echo "   前端：cat logs/frontend.log"
echo ""
echo "🚀 重新启动："
echo "   ./start.sh"
echo ""
