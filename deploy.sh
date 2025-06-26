#!/bin/bash

echo "🚀 飞行器游戏部署助手"
echo "=========================="

# 检查git状态
if [ ! -d ".git" ]; then
    echo "初始化Git仓库..."
    git init
    git add .
    git commit -m "Initial commit: Space Fighter Game"
fi

echo ""
echo "📋 选择部署平台："
echo "1. GitHub Pages (免费, 仅前端)"
echo "2. Vercel (免费, 全功能)"
echo "3. Railway (免费额度, 全功能)"
echo "4. Netlify (免费, 前端+函数)"
echo ""

read -p "请选择部署平台 (1-4): " choice

case $choice in
    1)
        echo "🌐 准备GitHub Pages部署..."
        echo "请按以下步骤操作："
        echo "1. 将代码推送到GitHub仓库"
        echo "2. 在仓库设置中启用GitHub Pages"
        echo "3. 选择GitHub Actions作为部署源"
        echo "4. 代码推送后将自动部署"
        ;;
    2)
        echo "⚡ 准备Vercel部署..."
        echo "请按以下步骤操作："
        echo "1. 访问 https://vercel.com"
        echo "2. 使用GitHub账户登录"
        echo "3. 点击'New Project'"
        echo "4. 选择您的GitHub仓库"
        echo "5. 确认配置并部署"
        echo ""
        echo "✅ Vercel配置文件已生成: vercel.json"
        ;;
    3)
        echo "🚂 准备Railway部署..."
        echo "请按以下步骤操作："
        echo "1. 访问 https://railway.app"
        echo "2. 使用GitHub账户登录"
        echo "3. 点击'New Project'"
        echo "4. 选择'Deploy from GitHub repo'"
        echo "5. 选择您的仓库并部署"
        echo ""
        echo "✅ Railway配置文件已生成: Procfile"
        ;;
    4)
        echo "🌐 准备Netlify部署..."
        echo "请按以下步骤操作："
        echo "1. 访问 https://netlify.com"
        echo "2. 使用GitHub账户登录"
        echo "3. 点击'New site from Git'"
        echo "4. 选择您的GitHub仓库"
        echo "5. 配置构建设置并部署"
        echo ""
        echo "✅ Netlify配置文件已生成: netlify.toml"
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "📦 项目文件已准备完成！"
echo "🔗 记得将您的项目推送到GitHub："
echo "   git add ."
echo "   git commit -m 'Prepare for deployment'"
echo "   git push origin main"
echo ""
echo "🎮 部署完成后，您的游戏将在线可用！"
