#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎯 多签钱包资金分配管理系统
支持多币种、多方分润、实时/延迟结算
"""

import os
import json
import time
import uuid
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import sqlite3
import threading
from decimal import Decimal, getcontext

# 设置精度
getcontext().prec = 28

# 日志配置
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('multi_sig_system.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Flask应用初始化
app = Flask(__name__)
CORS(app)

@dataclass
class WalletConfig:
    """钱包配置"""
    address: str
    name: str
    network: str
    balance: Decimal = Decimal('0')
    is_active: bool = True
    created_at: str = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()

@dataclass
class ProfitRule:
    """分润规则"""
    name: str
    percentage: Decimal
    wallet_address: str
    priority: int = 1
    min_amount: Decimal = Decimal('0')
    is_active: bool = True

@dataclass
class Transaction:
    """交易记录"""
    tx_id: str
    from_address: str
    to_address: str
    amount: Decimal
    currency: str
    network: str
    tx_hash: str
    status: str = 'pending'
    created_at: str = None
    completed_at: str = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()

@dataclass
class DistributionRecord:
    """分配记录"""
    distribution_id: str
    original_tx_hash: str
    total_amount: Decimal
    currency: str
    network: str
    main_wallet: str
    distributions: Dict[str, Decimal]
    settlement_type: str  # 'realtime' or 'delayed'
    settlement_delay: int = 0
    status: str = 'pending'
    created_at: str = None
    completed_at: str = None
    proof_id: str = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()
        if self.distribution_id is None:
            self.distribution_id = str(uuid.uuid4())

class MultiSigSystem:
    """多签钱包系统核心类"""
    
    def __init__(self, db_path: str = 'multi_sig.db'):
        self.db_path = db_path
        self.init_database()
        
        # 默认配置
        self.config = {
            'main_wallet': 'THjNZbFNv9w3M1wyisiaFX97rHrP4gF44x',
            'sub_wallets': [
                WalletConfig('TKHuVq1oKVruCGLvqVexFs6dawKv6fQgFs', '技术分润', 'TRON'),
                WalletConfig('TL8ZTgBqS6z1x4e3X9h5n2m1CvFqR8wT6P', '渠道分润', 'TRON'),
                WalletConfig('TMKpV3r7s8w2y5z9A1b6c4e7X8h2n1m0Cv', '代理分润', 'TRON'),
                WalletConfig('TNRxY4t8u9w3z6A2c5e8h1n4m7p0q3s6v9', '业务员分润', 'TRON'),
                WalletConfig('TOSyZ5u0v1w4A3c6e9h2n5m8p1q4s7v0w3', '备用钱包', 'TRON')
            ],
            'profit_rules': [
                ProfitRule('技术', Decimal('0.15'), 'TKHuVq1oKVruCGLvqVexFs6dawKv6fQgFs', 1),
                ProfitRule('渠道', Decimal('0.25'), 'TL8ZTgBqS6z1x4e3X9h5n2m1CvFqR8wT6P', 2),
                ProfitRule('代理', Decimal('0.30'), 'TMKpV3r7s8w2y5z9A1b6c4e7X8h2n1m0Cv', 3),
                ProfitRule('业务员', Decimal('0.20'), 'TNRxY4t8u9w3z6A2c5e8h1n4m7p0q3s6v9', 4),
                ProfitRule('备用', Decimal('0.10'), 'TOSyZ5u0v1w4A3c6e9h2n5m8p1q4s7v0w3', 5)
            ],
            'min_distribution_amount': Decimal('10'),
            'default_settlement_delay': 300,  # 5分钟
            'supported_currencies': ['TRX', 'USDT', 'ETH', 'BTC', 'BNB', 'USDC'],
            'supported_networks': ['TRON', 'ETHEREUM', 'BSC', 'BITCOIN']
        }
        
        # 启动后台任务
        self.start_background_tasks()
        
        logger.info("🎯 多签钱包系统初始化完成")
        logger.info(f"📋 支持币种: {', '.join(self.config['supported_currencies'])}")
        logger.info(f"🌐 支持网络: {', '.join(self.config['supported_networks'])}")
    
    def init_database(self):
        """初始化数据库"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # 钱包配置表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS wallets (
                    address TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    network TEXT NOT NULL,
                    balance REAL DEFAULT 0,
                    is_active BOOLEAN DEFAULT 1,
                    created_at TEXT NOT NULL
                )
            ''')
            
            # 分润规则表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS profit_rules (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    percentage REAL NOT NULL,
                    wallet_address TEXT NOT NULL,
                    priority INTEGER DEFAULT 1,
                    min_amount REAL DEFAULT 0,
                    is_active BOOLEAN DEFAULT 1,
                    created_at TEXT NOT NULL
                )
            ''')
            
            # 交易记录表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS transactions (
                    tx_id TEXT PRIMARY KEY,
                    from_address TEXT NOT NULL,
                    to_address TEXT NOT NULL,
                    amount REAL NOT NULL,
                    currency TEXT NOT NULL,
                    network TEXT NOT NULL,
                    tx_hash TEXT NOT NULL,
                    status TEXT DEFAULT 'pending',
                    created_at TEXT NOT NULL,
                    completed_at TEXT
                )
            ''')
            
            # 分配记录表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS distributions (
                    distribution_id TEXT PRIMARY KEY,
                    original_tx_hash TEXT NOT NULL,
                    total_amount REAL NOT NULL,
                    currency TEXT NOT NULL,
                    network TEXT NOT NULL,
                    main_wallet TEXT NOT NULL,
                    distributions TEXT NOT NULL,  -- JSON
                    settlement_type TEXT NOT NULL,
                    settlement_delay INTEGER DEFAULT 0,
                    status TEXT DEFAULT 'pending',
                    created_at TEXT NOT NULL,
                    completed_at TEXT,
                    proof_id TEXT
                )
            ''')
            
            # 分配详情表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS distribution_details (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    distribution_id TEXT NOT NULL,
                    wallet_address TEXT NOT NULL,
                    wallet_name TEXT NOT NULL,
                    amount REAL NOT NULL,
                    currency TEXT NOT NULL,
                    tx_hash TEXT,
                    status TEXT DEFAULT 'pending',
                    created_at TEXT NOT NULL,
                    completed_at TEXT,
                    FOREIGN KEY (distribution_id) REFERENCES distributions (distribution_id)
                )
            ''')
            
            # 结算凭证表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS settlement_proofs (
                    proof_id TEXT PRIMARY KEY,
                    distribution_id TEXT NOT NULL,
                    original_amount REAL NOT NULL,
                    currency TEXT NOT NULL,
                    success_count INTEGER NOT NULL,
                    total_count INTEGER NOT NULL,
                    total_distributed REAL NOT NULL,
                    proof_data TEXT NOT NULL,  -- JSON
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (distribution_id) REFERENCES distributions (distribution_id)
                )
            ''')
            
            conn.commit()
            logger.info("📊 数据库初始化完成")
    
    def receive_funds(self, tx_hash: str, from_address: str, amount: Decimal, 
                     currency: str, network: str = 'TRON') -> Dict:
        """接收资金并触发分配"""
        try:
            logger.info(f"💰 接收资金: {amount} {currency} from {from_address}")
            
            # 记录原始交易
            tx_id = str(uuid.uuid4())
            transaction = Transaction(
                tx_id=tx_id,
                from_address=from_address,
                to_address=self.config['main_wallet'],
                amount=amount,
                currency=currency,
                network=network,
                tx_hash=tx_hash,
                status='received'
            )
            
            self.save_transaction(transaction)
            
            # 检查是否需要分配
            if amount >= self.config['min_distribution_amount']:
                logger.info(f"🎯 金额达到分配阈值，开始分配流程")
                distribution_id = self.create_distribution(tx_hash, amount, currency, network)
                
                return {
                    'status': 'success',
                    'message': '资金接收成功，已触发分配',
                    'tx_id': tx_id,
                    'distribution_id': distribution_id,
                    'amount': str(amount),
                    'currency': currency
                }
            else:
                logger.info(f"⚠️ 金额低于分配阈值 {self.config['min_distribution_amount']}，暂存主钱包")
                return {
                    'status': 'success',
                    'message': '资金接收成功，暂存主钱包',
                    'tx_id': tx_id,
                    'amount': str(amount),
                    'currency': currency
                }
                
        except Exception as e:
            logger.error(f"❌ 接收资金失败: {str(e)}")
            return {
                'status': 'error',
                'message': f'接收资金失败: {str(e)}'
            }
    
    def create_distribution(self, original_tx_hash: str, total_amount: Decimal, 
                          currency: str, network: str, settlement_type: str = 'delayed') -> str:
        """创建分配记录"""
        try:
            distribution_id = str(uuid.uuid4())
            
            # 计算各方分润
            distributions = {}
            for rule in self.config['profit_rules']:
                if rule.is_active and total_amount >= rule.min_amount:
                    amount = total_amount * rule.percentage
                    distributions[rule.name] = {
                        'amount': amount,
                        'wallet_address': rule.wallet_address,
                        'percentage': rule.percentage
                    }
            
            # 创建分配记录
            distribution = DistributionRecord(
                distribution_id=distribution_id,
                original_tx_hash=original_tx_hash,
                total_amount=total_amount,
                currency=currency,
                network=network,
                main_wallet=self.config['main_wallet'],
                distributions=distributions,
                settlement_type=settlement_type,
                settlement_delay=self.config['default_settlement_delay'] if settlement_type == 'delayed' else 0
            )
            
            self.save_distribution(distribution)
            
            # 保存分配详情
            for name, dist_info in distributions.items():
                self.save_distribution_detail(
                    distribution_id, 
                    dist_info['wallet_address'], 
                    name, 
                    dist_info['amount'], 
                    currency
                )
            
            logger.info(f"📋 分配记录已创建: {distribution_id}")
            logger.info(f"💰 分配详情: {len(distributions)} 个接收方")
            
            # 如果是实时结算，立即执行
            if settlement_type == 'realtime':
                self.execute_distribution(distribution_id)
            
            return distribution_id
            
        except Exception as e:
            logger.error(f"❌ 创建分配记录失败: {str(e)}")
            raise
    
    def execute_distribution(self, distribution_id: str) -> Dict:
        """执行分配"""
        try:
            logger.info(f"🎯 开始执行分配: {distribution_id}")
            
            # 获取分配记录
            distribution = self.get_distribution(distribution_id)
            if not distribution:
                raise ValueError(f"分配记录不存在: {distribution_id}")
            
            if distribution['status'] != 'pending':
                return {
                    'status': 'error',
                    'message': f'分配状态不正确: {distribution["status"]}'
                }
            
            # 获取分配详情
            details = self.get_distribution_details(distribution_id)
            results = []
            success_count = 0
            
            for detail in details:
                try:
                    # 🎯 这里应该调用真实的区块链转账API
                    # 现在使用模拟转账
                    tx_hash = self.simulate_transfer(
                        self.config['main_wallet'],
                        detail['wallet_address'],
                        detail['amount'],
                        distribution['currency'],
                        distribution['network']
                    )
                    
                    # 更新详情状态
                    self.update_distribution_detail_status(
                        detail['id'], 'completed', tx_hash
                    )
                    
                    results.append({
                        'wallet_name': detail['wallet_name'],
                        'wallet_address': detail['wallet_address'],
                        'amount': detail['amount'],
                        'currency': distribution['currency'],
                        'tx_hash': tx_hash,
                        'status': 'success'
                    })
                    
                    success_count += 1
                    logger.info(f"✅ {detail['wallet_name']} 分账成功: {detail['amount']} {distribution['currency']}")
                    
                except Exception as e:
                    logger.error(f"❌ {detail['wallet_name']} 分账失败: {str(e)}")
                    
                    self.update_distribution_detail_status(
                        detail['id'], 'failed', None, str(e)
                    )
                    
                    results.append({
                        'wallet_name': detail['wallet_name'],
                        'wallet_address': detail['wallet_address'],
                        'amount': detail['amount'],
                        'currency': distribution['currency'],
                        'error': str(e),
                        'status': 'failed'
                    })
            
            # 更新分配记录状态
            status = 'completed' if success_count == len(details) else 'partial'
            self.update_distribution_status(distribution_id, status)
            
            # 生成结算凭证
            proof_id = self.generate_settlement_proof(distribution_id, results)
            
            logger.info(f"🏆 分配执行完成: {distribution_id}")
            logger.info(f"📊 成功: {success_count}/{len(details)}")
            
            return {
                'status': 'success',
                'distribution_id': distribution_id,
                'success_count': success_count,
                'total_count': len(details),
                'results': results,
                'proof_id': proof_id
            }
            
        except Exception as e:
            logger.error(f"❌ 执行分配失败: {str(e)}")
            return {
                'status': 'error',
                'message': f'执行分配失败: {str(e)}'
            }
    
    def simulate_transfer(self, from_wallet: str, to_wallet: str, amount: Decimal, 
                         currency: str, network: str) -> str:
        """模拟转账（实际部署时需要替换为真实API）"""
        # 生成模拟交易哈希
        tx_data = f"{from_wallet}{to_wallet}{amount}{currency}{network}{time.time()}"
        tx_hash = hashlib.sha256(tx_data.encode()).hexdigest()
        
        # 模拟网络延迟
        time.sleep(0.1)
        
        logger.info(f"💸 模拟转账: {amount} {currency} -> {to_wallet[:8]}...{to_wallet[-6:]}")
        logger.info(f"📋 模拟交易哈希: {tx_hash}")
        
        return tx_hash
    
    def generate_settlement_proof(self, distribution_id: str, results: List[Dict]) -> str:
        """生成结算凭证"""
        try:
            proof_id = str(uuid.uuid4())[:16]
            distribution = self.get_distribution(distribution_id)
            
            success_results = [r for r in results if r['status'] == 'success']
            total_distributed = sum(Decimal(str(r['amount'])) for r in success_results)
            
            proof_data = {
                'proof_id': proof_id,
                'distribution_id': distribution_id,
                'timestamp': datetime.now().isoformat(),
                'original_amount': str(distribution['total_amount']),
                'currency': distribution['currency'],
                'network': distribution['network'],
                'main_wallet': distribution['main_wallet'],
                'success_count': len(success_results),
                'total_count': len(results),
                'total_distributed': str(total_distributed),
                'distribution_rate': f"{(len(success_results) / len(results) * 100):.1f}%",
                'results': results
            }
            
            # 保存凭证
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO settlement_proofs 
                    (proof_id, distribution_id, original_amount, currency, 
                     success_count, total_count, total_distributed, proof_data, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    proof_id, distribution_id, float(distribution['total_amount']),
                    distribution['currency'], len(success_results), len(results),
                    float(total_distributed), json.dumps(proof_data), datetime.now().isoformat()
                ))
                conn.commit()
            
            # 更新分配记录的凭证ID
            self.update_distribution_proof(distribution_id, proof_id)
            
            logger.info(f"📋 结算凭证已生成: {proof_id}")
            
            return proof_id
            
        except Exception as e:
            logger.error(f"❌ 生成结算凭证失败: {str(e)}")
            return None
    
    def start_background_tasks(self):
        """启动后台任务"""
        def check_delayed_settlements():
            """检查延迟结算任务"""
            while True:
                try:
                    with sqlite3.connect(self.db_path) as conn:
                        cursor = conn.cursor()
                        
                        # 查找需要执行的延迟结算
                        cursor.execute('''
                            SELECT distribution_id, created_at, settlement_delay 
                            FROM distributions 
                            WHERE status = 'pending' 
                            AND settlement_type = 'delayed'
                        ''')
                        
                        pending_distributions = cursor.fetchall()
                        
                        for dist_id, created_at, delay in pending_distributions:
                            created_time = datetime.fromisoformat(created_at)
                            if datetime.now() >= created_time + timedelta(seconds=delay):
                                logger.info(f"⏰ 执行延迟结算: {dist_id}")
                                self.execute_distribution(dist_id)
                    
                    time.sleep(30)  # 每30秒检查一次
                    
                except Exception as e:
                    logger.error(f"❌ 后台任务错误: {str(e)}")
                    time.sleep(60)  # 出错时等待1分钟
        
        # 启动后台线程
        background_thread = threading.Thread(target=check_delayed_settlements, daemon=True)
        background_thread.start()
        logger.info("🔄 后台任务已启动")
    
    # 数据库操作方法
    def save_transaction(self, transaction: Transaction):
        """保存交易记录"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO transactions 
                (tx_id, from_address, to_address, amount, currency, network, 
                 tx_hash, status, created_at, completed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                transaction.tx_id, transaction.from_address, transaction.to_address,
                float(transaction.amount), transaction.currency, transaction.network,
                transaction.tx_hash, transaction.status, transaction.created_at,
                transaction.completed_at
            ))
            conn.commit()
    
    def save_distribution(self, distribution: DistributionRecord):
        """保存分配记录"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO distributions 
                (distribution_id, original_tx_hash, total_amount, currency, network,
                 main_wallet, distributions, settlement_type, settlement_delay,
                 status, created_at, completed_at, proof_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                distribution.distribution_id, distribution.original_tx_hash,
                float(distribution.total_amount), distribution.currency, distribution.network,
                distribution.main_wallet, json.dumps(distribution.distributions, default=str),
                distribution.settlement_type, distribution.settlement_delay,
                distribution.status, distribution.created_at, distribution.completed_at,
                distribution.proof_id
            ))
            conn.commit()
    
    def save_distribution_detail(self, distribution_id: str, wallet_address: str,
                                wallet_name: str, amount: Decimal, currency: str):
        """保存分配详情"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO distribution_details 
                (distribution_id, wallet_address, wallet_name, amount, currency, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                distribution_id, wallet_address, wallet_name,
                float(amount), currency, datetime.now().isoformat()
            ))
            conn.commit()
    
    def get_distribution(self, distribution_id: str) -> Optional[Dict]:
        """获取分配记录"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM distributions WHERE distribution_id = ?
            ''', (distribution_id,))
            
            row = cursor.fetchone()
            if row:
                columns = [description[0] for description in cursor.description]
                return dict(zip(columns, row))
            return None
    
    def get_distribution_details(self, distribution_id: str) -> List[Dict]:
        """获取分配详情"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM distribution_details WHERE distribution_id = ?
            ''', (distribution_id,))
            
            rows = cursor.fetchall()
            columns = [description[0] for description in cursor.description]
            return [dict(zip(columns, row)) for row in rows]
    
    def update_distribution_status(self, distribution_id: str, status: str):
        """更新分配状态"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE distributions 
                SET status = ?, completed_at = ?
                WHERE distribution_id = ?
            ''', (status, datetime.now().isoformat(), distribution_id))
            conn.commit()
    
    def update_distribution_detail_status(self, detail_id: int, status: str, 
                                        tx_hash: Optional[str] = None, 
                                        error: Optional[str] = None):
        """更新分配详情状态"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE distribution_details 
                SET status = ?, tx_hash = ?, completed_at = ?
                WHERE id = ?
            ''', (status, tx_hash, datetime.now().isoformat(), detail_id))
            conn.commit()
    
    def update_distribution_proof(self, distribution_id: str, proof_id: str):
        """更新分配凭证ID"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE distributions 
                SET proof_id = ?
                WHERE distribution_id = ?
            ''', (proof_id, distribution_id))
            conn.commit()

# 全局系统实例
multi_sig_system = MultiSigSystem()

# API路由
@app.route('/')
def dashboard():
    """管理后台首页"""
    return render_template_string(DASHBOARD_TEMPLATE)

@app.route('/api/receive_funds', methods=['POST'])
def api_receive_funds():
    """接收资金API"""
    try:
        data = request.get_json()
        
        required_fields = ['tx_hash', 'from_address', 'amount', 'currency']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'缺少必需字段: {field}'
                }), 400
        
        result = multi_sig_system.receive_funds(
            tx_hash=data['tx_hash'],
            from_address=data['from_address'],
            amount=Decimal(str(data['amount'])),
            currency=data['currency'],
            network=data.get('network', 'TRON')
        )
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"❌ 接收资金API错误: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'服务器错误: {str(e)}'
        }), 500

@app.route('/api/execute_distribution/<distribution_id>', methods=['POST'])
def api_execute_distribution(distribution_id: str):
    """执行分配API"""
    try:
        result = multi_sig_system.execute_distribution(distribution_id)
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"❌ 执行分配API错误: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'服务器错误: {str(e)}'
        }), 500

@app.route('/api/distributions', methods=['GET'])
def api_get_distributions():
    """获取分配记录列表"""
    try:
        with sqlite3.connect(multi_sig_system.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT distribution_id, original_tx_hash, total_amount, currency,
                       settlement_type, status, created_at, completed_at, proof_id
                FROM distributions 
                ORDER BY created_at DESC
                LIMIT 50
            ''')
            
            rows = cursor.fetchall()
            columns = [description[0] for description in cursor.description]
            distributions = [dict(zip(columns, row)) for row in rows]
            
            return jsonify({
                'status': 'success',
                'data': distributions
            })
            
    except Exception as e:
        logger.error(f"❌ 获取分配记录API错误: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'服务器错误: {str(e)}'
        }), 500

@app.route('/api/distribution/<distribution_id>', methods=['GET'])
def api_get_distribution_details(distribution_id: str):
    """获取分配详情"""
    try:
        distribution = multi_sig_system.get_distribution(distribution_id)
        details = multi_sig_system.get_distribution_details(distribution_id)
        
        return jsonify({
            'status': 'success',
            'data': {
                'distribution': distribution,
                'details': details
            }
        })
        
    except Exception as e:
        logger.error(f"❌ 获取分配详情API错误: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'服务器错误: {str(e)}'
        }), 500

@app.route('/api/proof/<proof_id>', methods=['GET'])
def api_get_settlement_proof(proof_id: str):
    """获取结算凭证"""
    try:
        with sqlite3.connect(multi_sig_system.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM settlement_proofs WHERE proof_id = ?
            ''', (proof_id,))
            
            row = cursor.fetchone()
            if row:
                columns = [description[0] for description in cursor.description]
                proof = dict(zip(columns, row))
                proof['proof_data'] = json.loads(proof['proof_data'])
                
                return jsonify({
                    'status': 'success',
                    'data': proof
                })
            else:
                return jsonify({
                    'status': 'error',
                    'message': '凭证不存在'
                }), 404
                
    except Exception as e:
        logger.error(f"❌ 获取结算凭证API错误: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'服务器错误: {str(e)}'
        }), 500

@app.route('/api/stats', methods=['GET'])
def api_get_stats():
    """获取系统统计"""
    try:
        with sqlite3.connect(multi_sig_system.db_path) as conn:
            cursor = conn.cursor()
            
            # 总分配次数
            cursor.execute('SELECT COUNT(*) FROM distributions')
            total_distributions = cursor.fetchone()[0]
            
            # 成功分配次数
            cursor.execute('SELECT COUNT(*) FROM distributions WHERE status = "completed"')
            successful_distributions = cursor.fetchone()[0]
            
            # 总分配金额
            cursor.execute('SELECT SUM(total_amount), currency FROM distributions GROUP BY currency')
            total_amounts = cursor.fetchall()
            
            # 今日分配
            today = datetime.now().date().isoformat()
            cursor.execute('SELECT COUNT(*) FROM distributions WHERE DATE(created_at) = ?', (today,))
            today_distributions = cursor.fetchone()[0]
            
            return jsonify({
                'status': 'success',
                'data': {
                    'total_distributions': total_distributions,
                    'successful_distributions': successful_distributions,
                    'success_rate': f"{(successful_distributions / max(total_distributions, 1) * 100):.1f}%",
                    'total_amounts': {currency: amount for amount, currency in total_amounts},
                    'today_distributions': today_distributions,
                    'supported_currencies': multi_sig_system.config['supported_currencies'],
                    'supported_networks': multi_sig_system.config['supported_networks']
                }
            })
            
    except Exception as e:
        logger.error(f"❌ 获取统计API错误: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'服务器错误: {str(e)}'
        }), 500

# 管理后台HTML模板
DASHBOARD_TEMPLATE = '''
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎯 多签钱包管理系统</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0a0a0a; color: #fff; line-height: 1.6;
        }
        .header { 
            background: #1a1a1a; padding: 20px; border-bottom: 2px solid #333;
            display: flex; justify-content: space-between; align-items: center;
        }
        .title { font-size: 24px; font-weight: 600; }
        .status { background: #7ed321; color: #000; padding: 8px 16px; border-radius: 20px; font-size: 12px; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { 
            background: #1a1a1a; padding: 20px; border-radius: 12px; border: 1px solid #333;
            text-align: center; transition: transform 0.2s;
        }
        .stat-card:hover { transform: translateY(-2px); }
        .stat-value { font-size: 32px; font-weight: 600; color: #7ed321; margin-bottom: 8px; }
        .stat-label { color: #666; font-size: 14px; }
        .section { background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #333; }
        .section-title { font-size: 18px; margin-bottom: 20px; color: #7ed321; }
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #333; }
        .table th { background: #333; color: #7ed321; font-weight: 600; }
        .table tr:hover { background: #222; }
        .status-badge { 
            padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;
            background: #333; color: #fff;
        }
        .status-completed { background: #7ed321; color: #000; }
        .status-pending { background: #ff9500; color: #fff; }
        .status-failed { background: #f5455c; color: #fff; }
        .btn { 
            background: #7ed321; color: #000; border: none; padding: 8px 16px; 
            border-radius: 6px; cursor: pointer; font-weight: 600;
        }
        .btn:hover { background: #6bc219; }
        .btn-secondary { background: #333; color: #fff; }
        .btn-secondary:hover { background: #444; }
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; margin-bottom: 8px; color: #7ed321; font-weight: 600; }
        .form-input { 
            width: 100%; padding: 12px; background: #000; border: 1px solid #333; 
            border-radius: 6px; color: #fff; font-size: 14px;
        }
        .form-input:focus { border-color: #7ed321; outline: none; }
        .alert { 
            padding: 12px 16px; border-radius: 6px; margin-bottom: 16px;
            background: #333; border-left: 4px solid #7ed321;
        }
        .alert-error { border-left-color: #f5455c; }
        .loading { text-align: center; padding: 40px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">🎯 多签钱包管理系统</div>
        <div class="status">系统运行中</div>
    </div>
    
    <div class="container">
        <!-- 统计面板 -->
        <div class="stats" id="statsContainer">
            <div class="stat-card">
                <div class="stat-value" id="totalDistributions">-</div>
                <div class="stat-label">总分配次数</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="successRate">-</div>
                <div class="stat-label">成功率</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="todayDistributions">-</div>
                <div class="stat-label">今日分配</div>
            </div>
            <div class="stat-card">
                <div class="stat-value" id="supportedCurrencies">-</div>
                <div class="stat-label">支持币种</div>
            </div>
        </div>
        
        <!-- 手动触发分配 -->
        <div class="section">
            <div class="section-title">💰 手动触发资金分配</div>
            <div id="manualAlert"></div>
            <form id="manualForm">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label class="form-label">交易哈希</label>
                        <input type="text" class="form-input" id="txHash" placeholder="输入交易哈希" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">发送地址</label>
                        <input type="text" class="form-input" id="fromAddress" placeholder="输入发送地址" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">金额</label>
                        <input type="number" class="form-input" id="amount" placeholder="输入金额" step="0.000001" required>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
                    <div class="form-group">
                        <label class="form-label">币种</label>
                        <select class="form-input" id="currency" required>
                            <option value="TRX">TRX</option>
                            <option value="USDT">USDT</option>
                            <option value="ETH">ETH</option>
                            <option value="BTC">BTC</option>
                            <option value="BNB">BNB</option>
                            <option value="USDC">USDC</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">网络</label>
                        <select class="form-input" id="network" required>
                            <option value="TRON">TRON</option>
                            <option value="ETHEREUM">ETHEREUM</option>
                            <option value="BSC">BSC</option>
                            <option value="BITCOIN">BITCOIN</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">操作</label>
                        <button type="submit" class="btn" style="width: 100%; margin-top: 0;">触发分配</button>
                    </div>
                </div>
            </form>
        </div>
        
        <!-- 分配记录 -->
        <div class="section">
            <div class="section-title">📋 分配记录</div>
            <div class="loading" id="distributionsLoading">正在加载分配记录...</div>
            <div id="distributionsContainer" style="display: none;">
                <table class="table">
                    <thead>
                        <tr>
                            <th>分配ID</th>
                            <th>原始交易</th>
                            <th>金额</th>
                            <th>币种</th>
                            <th>结算类型</th>
                            <th>状态</th>
                            <th>创建时间</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody id="distributionsTable">
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <script>
        // 加载统计数据
        async function loadStats() {
            try {
                const response = await fetch('/api/stats');
                const result = await response.json();
                
                if (result.status === 'success') {
                    const data = result.data;
                    document.getElementById('totalDistributions').textContent = data.total_distributions;
                    document.getElementById('successRate').textContent = data.success_rate;
                    document.getElementById('todayDistributions').textContent = data.today_distributions;
                    document.getElementById('supportedCurrencies').textContent = data.supported_currencies.length;
                }
            } catch (error) {
                console.error('加载统计失败:', error);
            }
        }
        
        // 加载分配记录
        async function loadDistributions() {
            try {
                const response = await fetch('/api/distributions');
                const result = await response.json();
                
                document.getElementById('distributionsLoading').style.display = 'none';
                document.getElementById('distributionsContainer').style.display = 'block';
                
                if (result.status === 'success') {
                    const tbody = document.getElementById('distributionsTable');
                    tbody.innerHTML = '';
                    
                    result.data.forEach(dist => {
                        const row = document.createElement('tr');
                        
                        const statusClass = dist.status === 'completed' ? 'status-completed' : 
                                          dist.status === 'pending' ? 'status-pending' : 'status-failed';
                        
                        row.innerHTML = `
                            <td>${dist.distribution_id.substring(0, 8)}...</td>
                            <td>${dist.original_tx_hash.substring(0, 12)}...</td>
                            <td>${parseFloat(dist.total_amount).toFixed(6)}</td>
                            <td>${dist.currency}</td>
                            <td>${dist.settlement_type === 'realtime' ? '实时' : '延迟'}</td>
                            <td><span class="status-badge ${statusClass}">${dist.status}</span></td>
                            <td>${new Date(dist.created_at).toLocaleString()}</td>
                            <td>
                                ${dist.status === 'pending' ? 
                                  `<button class="btn btn-secondary" onclick="executeDistribution('${dist.distribution_id}')">执行</button>` : 
                                  dist.proof_id ? 
                                  `<button class="btn btn-secondary" onclick="viewProof('${dist.proof_id}')">凭证</button>` : 
                                  '-'}
                            </td>
                        `;
                        
                        tbody.appendChild(row);
                    });
                }
            } catch (error) {
                console.error('加载分配记录失败:', error);
                document.getElementById('distributionsLoading').textContent = '加载失败';
            }
        }
        
        // 手动触发分配
        document.getElementById('manualForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const alertDiv = document.getElementById('manualAlert');
            const formData = new FormData(e.target);
            const data = {
                tx_hash: document.getElementById('txHash').value,
                from_address: document.getElementById('fromAddress').value,
                amount: parseFloat(document.getElementById('amount').value),
                currency: document.getElementById('currency').value,
                network: document.getElementById('network').value
            };
            
            try {
                alertDiv.innerHTML = '<div class="alert">正在处理...</div>';
                
                const response = await fetch('/api/receive_funds', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.status === 'success') {
                    alertDiv.innerHTML = `<div class="alert">✅ ${result.message}</div>`;
                    e.target.reset();
                    setTimeout(() => {
                        loadStats();
                        loadDistributions();
                    }, 1000);
                } else {
                    alertDiv.innerHTML = `<div class="alert alert-error">❌ ${result.message}</div>`;
                }
            } catch (error) {
                alertDiv.innerHTML = `<div class="alert alert-error">❌ 请求失败: ${error.message}</div>`;
            }
        });
        
        // 执行分配
        async function executeDistribution(distributionId) {
            if (!confirm('确定要执行此分配吗？')) return;
            
            try {
                const response = await fetch(`/api/execute_distribution/${distributionId}`, {
                    method: 'POST'
                });
                const result = await response.json();
                
                if (result.status === 'success') {
                    alert(`✅ 分配执行成功！成功: ${result.success_count}/${result.total_count}`);
                    loadDistributions();
                } else {
                    alert(`❌ 分配执行失败: ${result.message}`);
                }
            } catch (error) {
                alert(`❌ 请求失败: ${error.message}`);
            }
        }
        
        // 查看凭证
        async function viewProof(proofId) {
            try {
                const response = await fetch(`/api/proof/${proofId}`);
                const result = await response.json();
                
                if (result.status === 'success') {
                    const proof = result.data.proof_data;
                    const details = proof.results.map(r => 
                        `${r.wallet_name}: ${r.amount} ${r.currency} (${r.status})`
                    ).join('\\n');
                    
                    alert(`📋 结算凭证 ${proofId}\\n\\n` +
                          `原始金额: ${proof.original_amount} ${proof.currency}\\n` +
                          `成功分账: ${proof.success_count}/${proof.total_count}\\n` +
                          `分配率: ${proof.distribution_rate}\\n\\n` +
                          `详情:\\n${details}`);
                } else {
                    alert(`❌ 获取凭证失败: ${result.message}`);
                }
            } catch (error) {
                alert(`❌ 请求失败: ${error.message}`);
            }
        }
        
        // 初始化
        loadStats();
        loadDistributions();
        
        // 定时刷新
        setInterval(() => {
            loadStats();
            loadDistributions();
        }, 30000);
    </script>
</body>
</html>
'''

if __name__ == '__main__':
    logger.info("🚀 启动多签钱包管理系统")
    logger.info("📱 管理后台: http://localhost:5001")
    logger.info("🔗 API文档: http://localhost:5001/api/stats")
    
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=False,
        threaded=True
    )