#!/bin/bash

echo "🚀 启动飞行器大战游戏..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    echo "📥 下载地址：https://nodejs.org/"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

# 检查package.json是否存在
if [ ! -f "package.json" ]; then
    echo "❌ package.json 文件不存在"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖包..."
npm install

# 检查安装是否成功
if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"

# 启动服务器
echo "🌐 启动游戏服务器..."
echo "📱 游戏将在 http://localhost:3000 运行"
echo "🎮 按 Ctrl+C 停止服务器"
echo ""

npm start
