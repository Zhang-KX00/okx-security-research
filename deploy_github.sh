#!/bin/bash

echo "🚀 部署到GitHub Pages"

# 检查是否已初始化Git
if [ ! -d ".git" ]; then
    echo "📋 初始化Git仓库..."
    git init
    git branch -M main
fi

# 添加文件
echo "📄 添加文件到Git..."
git add .
git commit -m "🎯 部署OKX安全研究平台 - $(date '+%Y-%m-%d %H:%M:%S')"

echo ""
echo "🔧 请按以下步骤完成部署："
echo ""
echo "1️⃣ 在GitHub创建新仓库:"
echo "   - 访问: https://github.com/new"
echo "   - 仓库名: okx-security-research"
echo "   - 设为Private（推荐）或Public"
echo ""
echo "2️⃣ 添加远程仓库并推送:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/okx-security-research.git"
echo "   git push -u origin main"
echo ""
echo "3️⃣ 启用GitHub Pages:"
echo "   - 进入仓库Settings > Pages"
echo "   - Source选择: GitHub Actions"
echo "   - 等待部署完成"
echo ""
echo "4️⃣ 访问地址:"
echo "   https://YOUR_USERNAME.github.io/okx-security-research/"
echo ""
echo "🎯 部署完成后，团队成员可以通过公网链接访问！"
