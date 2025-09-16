#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🎯 增强版多签钱包资金分配管理系统
支持手动填入多个钱包地址、实时自动分账、蓝白色界面
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
CORS(app, origins=[
    'https://*.netlify.app',
    'https://*.ngrok.xiaomiqiu123.top',
    'https://njacnb1250mj.ngrok.xiaomiqiu123.top',
    'http://localhost:*',
    'https://localhost:*',
    'http://127.0.0.1:*'
], supports_credentials=True)

@dataclass
class WalletConfig:
    """钱包配置"""
    address: str
    name: str
    network: str
    role: str = 'sub'  # 'main' 或 'sub'
    percentage: Decimal = Decimal('0')
    priority: int = 1
    min_amount: Decimal = Decimal('0')
    balance: Decimal = Decimal('0')
    is_active: bool = True
    created_at: str = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()

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

class EnhancedMultiSigSystem:
    """增强版多签钱包系统核心类"""
    
    def __init__(self, db_path: str = 'enhanced_multi_sig.db'):
        self.db_path = db_path
        self.init_database()
        
        # 默认配置
        self.config = {
            'main_wallet': 'THjNZbFNv9w3M1wyisiaFX97rHrP4gF44x',
            'min_distribution_amount': Decimal('1'),
            'default_settlement_delay': 60,  # 1分钟
            'auto_distribution_enabled': True,
            'auto_wallet_rotation': True,  # 自动轮换主钱包
            'wallet_rotation_interval': 24,  # 24小时轮换一次
            'max_wallet_usage_count': 10,  # 每个钱包最多使用10次
            'supported_currencies': ['TRX', 'USDT', 'ETH', 'BTC', 'BNB', 'USDC', 'SOL', 'DOGE', 'XRP', 'ADA', 'DOT', 'AVAX'],
            'supported_networks': ['TRON', 'ETHEREUM', 'BSC', 'BITCOIN', 'SOLANA', 'RIPPLE', 'CARDANO', 'POLKADOT', 'AVALANCHE']
        }
        
        # 初始化默认钱包
        self.init_default_wallets()
        
        # 启动后台任务
        self.start_background_tasks()
        
        logger.info("🎯 增强版多签钱包系统初始化完成")
        logger.info(f"📋 支持币种: {', '.join(self.config['supported_currencies'])}")
        logger.info(f"🌐 支持网络: {', '.join(self.config['supported_networks'])}")
    
    def init_database(self):
        """初始化数据库"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # 增强的钱包配置表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS wallets (
                    address TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    network TEXT NOT NULL,
                    role TEXT DEFAULT 'sub',
                    percentage REAL DEFAULT 0,
                    priority INTEGER DEFAULT 1,
                    min_amount REAL DEFAULT 0,
                    balance REAL DEFAULT 0,
                    is_active BOOLEAN DEFAULT 1,
                    usage_count INTEGER DEFAULT 0,
                    last_used_at TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT
                )
            ''')
            
            # 检查并添加缺失的列
            self.migrate_database(cursor)
            
            # 分配规则表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS distribution_rules (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    currency TEXT,
                    min_amount REAL DEFAULT 0,
                    max_amount REAL,
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
                    percentage REAL NOT NULL,
                    tx_hash TEXT,
                    status TEXT DEFAULT 'pending',
                    created_at TEXT NOT NULL,
                    completed_at TEXT,
                    error_message TEXT,
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
            
            # 系统配置表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS system_config (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    description TEXT,
                    updated_at TEXT NOT NULL
                )
            ''')
            
            conn.commit()
            logger.info("📊 增强版数据库初始化完成")
    
    def migrate_database(self, cursor):
        """数据库迁移 - 添加缺失的列"""
        try:
            # 检查 wallets 表是否存在 usage_count 和 last_used_at 列
            cursor.execute("PRAGMA table_info(wallets)")
            columns = [row[1] for row in cursor.fetchall()]
            
            if 'usage_count' not in columns:
                cursor.execute('ALTER TABLE wallets ADD COLUMN usage_count INTEGER DEFAULT 0')
                logger.info("✅ 添加 usage_count 列")
            
            if 'last_used_at' not in columns:
                cursor.execute('ALTER TABLE wallets ADD COLUMN last_used_at TEXT')
                logger.info("✅ 添加 last_used_at 列")
                
            # 更新现有主钱包的 usage_count
            cursor.execute('''
                UPDATE wallets 
                SET usage_count = 0 
                WHERE usage_count IS NULL AND role = 'main'
            ''')
            
            logger.info("🔄 数据库迁移完成")
            
        except Exception as e:
            logger.warning(f"⚠️ 数据库迁移警告: {str(e)}")
    
    def init_default_wallets(self):
        """初始化默认钱包配置"""
        default_wallets = [
            WalletConfig('THjNZbFNv9w3M1wyisiaFX97rHrP4gF44x', '主钱包', 'TRON', 'main', Decimal('0'), 0),
            WalletConfig('TKHuVq1oKVruCGLvqVexFs6dawKv6fQgFs', '技术分润', 'TRON', 'sub', Decimal('0.15'), 1),
            WalletConfig('TL8ZTgBqS6z1x4e3X9h5n2m1CvFqR8wT6P', '渠道分润', 'TRON', 'sub', Decimal('0.25'), 2),
            WalletConfig('TMKpV3r7s8w2y5z9A1b6c4e7X8h2n1m0Cv', '代理分润', 'TRON', 'sub', Decimal('0.30'), 3),
            WalletConfig('TNRxY4t8u9w3z6A2c5e8h1n4m7p0q3s6v9', '业务员分润', 'TRON', 'sub', Decimal('0.20'), 4),
            WalletConfig('TOSyZ5u0v1w4A3c6e9h2n5m8p1q4s7v0w3', '备用钱包', 'TRON', 'sub', Decimal('0.10'), 5)
        ]
        
        for wallet in default_wallets:
            self.add_or_update_wallet(wallet)
    
    def add_or_update_wallet(self, wallet: WalletConfig) -> bool:
        """添加或更新钱包"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT OR REPLACE INTO wallets 
                    (address, name, network, role, percentage, priority, min_amount, 
                     balance, is_active, usage_count, last_used_at, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    wallet.address, wallet.name, wallet.network, wallet.role,
                    float(wallet.percentage), wallet.priority, float(wallet.min_amount),
                    float(wallet.balance), wallet.is_active, 0, None, wallet.created_at,
                    datetime.now().isoformat()
                ))
                conn.commit()
                return True
        except Exception as e:
            logger.error(f"❌ 添加/更新钱包失败: {str(e)}")
            return False
    
    def get_all_wallets(self) -> List[Dict]:
        """获取所有钱包"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM wallets ORDER BY role DESC, priority ASC
            ''')
            
            rows = cursor.fetchall()
            columns = [description[0] for description in cursor.description]
            return [dict(zip(columns, row)) for row in rows]
    
    def get_active_sub_wallets(self) -> List[Dict]:
        """获取活跃的子钱包"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM wallets 
                WHERE role = 'sub' AND is_active = 1 
                ORDER BY priority ASC
            ''')
            
            rows = cursor.fetchall()
            columns = [description[0] for description in cursor.description]
            return [dict(zip(columns, row)) for row in rows]
    
    def delete_wallet(self, address: str) -> bool:
        """删除钱包"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # 检查是否为主钱包
                cursor.execute('SELECT role FROM wallets WHERE address = ?', (address,))
                result = cursor.fetchone()
                
                if result and result[0] == 'main':
                    logger.warning(f"⚠️ 不能删除主钱包: {address}")
                    return False
                
                # 删除钱包
                cursor.execute('DELETE FROM wallets WHERE address = ?', (address,))
                conn.commit()
                
                logger.info(f"🗑️ 钱包已删除: {address}")
                return True
                
        except Exception as e:
            logger.error(f"❌ 删除钱包失败: {str(e)}")
            return False
    
    def get_current_main_wallet(self) -> str:
        """获取当前主钱包地址"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT address FROM wallets 
                WHERE role = 'main' AND is_active = 1 
                ORDER BY last_used_at DESC, created_at DESC
                LIMIT 1
            ''')
            
            result = cursor.fetchone()
            if result:
                return result[0]
            else:
                # 如果没有主钱包，返回配置中的默认主钱包
                return self.config['main_wallet']
    
    def rotate_main_wallet(self) -> Dict:
        """轮换主钱包"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # 获取所有可用的主钱包候选
                cursor.execute('''
                    SELECT address, name, usage_count, last_used_at FROM wallets 
                    WHERE role = 'main' AND is_active = 1 
                    ORDER BY usage_count ASC, last_used_at ASC
                ''')
                
                main_wallets = cursor.fetchall()
                
                if not main_wallets:
                    return {
                        'status': 'error',
                        'message': '没有可用的主钱包'
                    }
                
                # 选择使用次数最少的钱包
                selected_wallet = main_wallets[0]
                new_main_address = selected_wallet[0]
                
                # 更新配置
                old_main_address = self.config['main_wallet']
                self.config['main_wallet'] = new_main_address
                
                # 更新使用次数和最后使用时间
                cursor.execute('''
                    UPDATE wallets 
                    SET usage_count = usage_count + 1, 
                        last_used_at = ?,
                        updated_at = ?
                    WHERE address = ?
                ''', (datetime.now().isoformat(), datetime.now().isoformat(), new_main_address))
                
                conn.commit()
                
                logger.info(f"🔄 主钱包已轮换: {old_main_address} -> {new_main_address}")
                
                return {
                    'status': 'success',
                    'message': '主钱包轮换成功',
                    'old_wallet': old_main_address,
                    'new_wallet': new_main_address,
                    'usage_count': selected_wallet[2] + 1
                }
                
        except Exception as e:
            logger.error(f"❌ 主钱包轮换失败: {str(e)}")
            return {
                'status': 'error',
                'message': f'主钱包轮换失败: {str(e)}'
            }
    
    def check_wallet_rotation_needed(self) -> bool:
        """检查是否需要轮换主钱包"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # 获取当前主钱包的使用信息
                cursor.execute('''
                    SELECT usage_count, last_used_at FROM wallets 
                    WHERE address = ? AND role = 'main'
                ''', (self.config['main_wallet'],))
                
                result = cursor.fetchone()
                if not result:
                    return True  # 如果当前主钱包不存在，需要轮换
                
                usage_count, last_used_at = result
                
                # 检查使用次数
                if usage_count >= self.config['max_wallet_usage_count']:
                    logger.info(f"🔄 主钱包使用次数达到上限: {usage_count}")
                    return True
                
                # 检查时间间隔
                if last_used_at:
                    last_used_time = datetime.fromisoformat(last_used_at)
                    time_diff = datetime.now() - last_used_time
                    if time_diff.total_seconds() >= (self.config['wallet_rotation_interval'] * 3600):
                        logger.info(f"🔄 主钱包使用时间超过间隔: {time_diff}")
                        return True
                
                return False
                
        except Exception as e:
            logger.error(f"❌ 检查钱包轮换失败: {str(e)}")
            return False
    
    def add_main_wallet(self, address: str, name: str, network: str = 'TRON') -> bool:
        """添加主钱包"""
        try:
            wallet = WalletConfig(
                address=address,
                name=name,
                network=network,
                role='main',
                percentage=Decimal('0'),
                priority=0
            )
            
            return self.add_or_update_wallet(wallet)
            
        except Exception as e:
            logger.error(f"❌ 添加主钱包失败: {str(e)}")
            return False
    
    def receive_funds(self, tx_hash: str, from_address: str, amount: Decimal, 
                     currency: str, network: str = 'TRON') -> Dict:
        """接收资金并触发分配"""
        try:
            logger.info(f"💰 接收资金: {amount} {currency} from {from_address}")
            
            # 🔄 检查是否需要轮换主钱包
            if self.config['auto_wallet_rotation'] and self.check_wallet_rotation_needed():
                rotation_result = self.rotate_main_wallet()
                if rotation_result['status'] == 'success':
                    logger.info(f"🔄 自动轮换主钱包: {rotation_result['new_wallet']}")
            
            # 获取当前主钱包
            current_main_wallet = self.get_current_main_wallet()
            
            # 记录原始交易
            tx_id = str(uuid.uuid4())
            transaction = Transaction(
                tx_id=tx_id,
                from_address=from_address,
                to_address=current_main_wallet,
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
                
                # 根据配置选择结算方式
                settlement_type = 'realtime' if self.config['auto_distribution_enabled'] else 'delayed'
                distribution_id = self.create_distribution(tx_hash, amount, currency, network, settlement_type)
                
                return {
                    'status': 'success',
                    'message': '资金接收成功，已触发分配',
                    'tx_id': tx_id,
                    'distribution_id': distribution_id,
                    'amount': str(amount),
                    'currency': currency,
                    'settlement_type': settlement_type
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
                          currency: str, network: str, settlement_type: str = 'realtime') -> str:
        """创建分配记录"""
        try:
            distribution_id = str(uuid.uuid4())
            
            # 获取活跃的子钱包
            sub_wallets = self.get_active_sub_wallets()
            
            # 计算各方分润
            distributions = {}
            total_percentage = Decimal('0')
            
            for wallet in sub_wallets:
                if wallet['percentage'] > 0 and total_amount >= Decimal(str(wallet['min_amount'])):
                    amount = total_amount * Decimal(str(wallet['percentage']))
                    distributions[wallet['name']] = {
                        'amount': amount,
                        'wallet_address': wallet['address'],
                        'percentage': Decimal(str(wallet['percentage'])),
                        'priority': wallet['priority']
                    }
                    total_percentage += Decimal(str(wallet['percentage']))
            
            # 检查分润总和
            if total_percentage != Decimal('1.0'):
                logger.warning(f"⚠️ 分润总和不等于100%: {float(total_percentage * 100):.2f}%")
            
            # 创建分配记录
            distribution = DistributionRecord(
                distribution_id=distribution_id,
                original_tx_hash=original_tx_hash,
                total_amount=total_amount,
                currency=currency,
                network=network,
                main_wallet=self.get_current_main_wallet(),
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
                    currency,
                    float(dist_info['percentage'])
                )
            
            logger.info(f"📋 分配记录已创建: {distribution_id}")
            logger.info(f"💰 分配详情: {len(distributions)} 个接收方")
            
            # 如果是实时结算，立即执行
            if settlement_type == 'realtime':
                threading.Thread(target=self.execute_distribution, args=(distribution_id,), daemon=True).start()
            
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
                        distribution['main_wallet'],  # 使用分配记录中的主钱包
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
                        'percentage': f"{detail['percentage'] * 100:.1f}%",
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
                        'percentage': f"{detail['percentage'] * 100:.1f}%",
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
                                threading.Thread(target=self.execute_distribution, args=(dist_id,), daemon=True).start()
                    
                    time.sleep(10)  # 每10秒检查一次
                    
                except Exception as e:
                    logger.error(f"❌ 后台任务错误: {str(e)}")
                    time.sleep(30)  # 出错时等待30秒
        
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
                                wallet_name: str, amount: Decimal, currency: str, percentage: float):
        """保存分配详情"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO distribution_details 
                (distribution_id, wallet_address, wallet_name, amount, currency, percentage, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                distribution_id, wallet_address, wallet_name,
                float(amount), currency, percentage, datetime.now().isoformat()
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
                SET status = ?, tx_hash = ?, completed_at = ?, error_message = ?
                WHERE id = ?
            ''', (status, tx_hash, datetime.now().isoformat(), error, detail_id))
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
enhanced_system = EnhancedMultiSigSystem()

# API路由
@app.route('/')
def dashboard():
    """管理后台首页"""
    return render_template_string(ENHANCED_DASHBOARD_TEMPLATE)

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
        
        result = enhanced_system.receive_funds(
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

@app.route('/api/wallets', methods=['GET'])
def api_get_wallets():
    """获取钱包列表"""
    try:
        wallets = enhanced_system.get_all_wallets()
        return jsonify({
            'status': 'success',
            'data': wallets
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'获取钱包列表失败: {str(e)}'
        }), 500

@app.route('/api/wallets', methods=['POST'])
def api_add_wallet():
    """添加钱包"""
    try:
        data = request.get_json()
        
        required_fields = ['address', 'name', 'network', 'percentage']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'缺少必需字段: {field}'
                }), 400
        
        wallet = WalletConfig(
            address=data['address'],
            name=data['name'],
            network=data['network'],
            role=data.get('role', 'sub'),
            percentage=Decimal(str(data['percentage'])),
            priority=data.get('priority', 99),
            min_amount=Decimal(str(data.get('min_amount', 0))),
            is_active=data.get('is_active', True)
        )
        
        if enhanced_system.add_or_update_wallet(wallet):
            return jsonify({
                'status': 'success',
                'message': '钱包添加成功'
            })
        else:
            return jsonify({
                'status': 'error',
                'message': '钱包添加失败'
            }), 500
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'添加钱包失败: {str(e)}'
        }), 500

@app.route('/api/wallets/<address>', methods=['PUT'])
def api_update_wallet(address: str):
    """更新钱包"""
    try:
        data = request.get_json()
        
        # 获取现有钱包
        wallets = enhanced_system.get_all_wallets()
        existing_wallet = next((w for w in wallets if w['address'] == address), None)
        
        if not existing_wallet:
            return jsonify({
                'status': 'error',
                'message': '钱包不存在'
            }), 404
        
        # 更新钱包信息
        wallet = WalletConfig(
            address=address,
            name=data.get('name', existing_wallet['name']),
            network=data.get('network', existing_wallet['network']),
            role=data.get('role', existing_wallet['role']),
            percentage=Decimal(str(data.get('percentage', existing_wallet['percentage']))),
            priority=data.get('priority', existing_wallet['priority']),
            min_amount=Decimal(str(data.get('min_amount', existing_wallet['min_amount']))),
            is_active=data.get('is_active', existing_wallet['is_active']),
            created_at=existing_wallet['created_at']
        )
        
        if enhanced_system.add_or_update_wallet(wallet):
            return jsonify({
                'status': 'success',
                'message': '钱包更新成功'
            })
        else:
            return jsonify({
                'status': 'error',
                'message': '钱包更新失败'
            }), 500
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'更新钱包失败: {str(e)}'
        }), 500

@app.route('/api/wallets/<address>', methods=['DELETE'])
def api_delete_wallet(address: str):
    """删除钱包"""
    try:
        if enhanced_system.delete_wallet(address):
            return jsonify({
                'status': 'success',
                'message': '钱包删除成功'
            })
        else:
            return jsonify({
                'status': 'error',
                'message': '钱包删除失败（可能是主钱包或不存在）'
            }), 400
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'删除钱包失败: {str(e)}'
        }), 500

@app.route('/api/main_wallet/rotate', methods=['POST'])
def api_rotate_main_wallet():
    """手动轮换主钱包"""
    try:
        result = enhanced_system.rotate_main_wallet()
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'轮换主钱包失败: {str(e)}'
        }), 500

@app.route('/api/main_wallet/add', methods=['POST'])
def api_add_main_wallet():
    """添加主钱包"""
    try:
        data = request.get_json()
        
        required_fields = ['address', 'name']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'缺少必需字段: {field}'
                }), 400
        
        if enhanced_system.add_main_wallet(
            address=data['address'],
            name=data['name'],
            network=data.get('network', 'TRON')
        ):
            return jsonify({
                'status': 'success',
                'message': '主钱包添加成功'
            })
        else:
            return jsonify({
                'status': 'error',
                'message': '主钱包添加失败'
            }), 500
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'添加主钱包失败: {str(e)}'
        }), 500

@app.route('/api/main_wallet/current', methods=['GET'])
def api_get_current_main_wallet():
    """获取当前主钱包"""
    try:
        current_wallet = enhanced_system.get_current_main_wallet()
        
        # 获取钱包详细信息
        wallets = enhanced_system.get_all_wallets()
        wallet_info = next((w for w in wallets if w['address'] == current_wallet), None)
        
        return jsonify({
            'status': 'success',
            'data': {
                'address': current_wallet,
                'wallet_info': wallet_info
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'获取当前主钱包失败: {str(e)}'
        }), 500

@app.route('/api/attacker_address', methods=['GET'])
def api_get_attacker_address():
    """获取当前攻击者地址 - 前端实时调用"""
    try:
        # 检查是否需要轮换主钱包
        if enhanced_system.config['auto_wallet_rotation'] and enhanced_system.check_wallet_rotation_needed():
            rotation_result = enhanced_system.rotate_main_wallet()
            if rotation_result['status'] == 'success':
                logger.info(f"🔄 API调用触发主钱包轮换: {rotation_result['new_wallet']}")
        
        current_wallet = enhanced_system.get_current_main_wallet()
        
        # 获取钱包详细信息
        wallets = enhanced_system.get_all_wallets()
        wallet_info = next((w for w in wallets if w['address'] == current_wallet), None)
        
        return jsonify({
            'status': 'success',
            'data': {
                'attacker_address': current_wallet,
                'wallet_name': wallet_info['name'] if wallet_info else '默认主钱包',
                'usage_count': wallet_info['usage_count'] if wallet_info else 0,
                'last_used_at': wallet_info['last_used_at'] if wallet_info else None,
                'network': wallet_info['network'] if wallet_info else 'TRON',
                'rotation_enabled': enhanced_system.config['auto_wallet_rotation'],
                'max_usage': enhanced_system.config['max_wallet_usage_count'],
                'rotation_interval_hours': enhanced_system.config['wallet_rotation_interval']
            }
        })
        
    except Exception as e:
        logger.error(f"❌ 获取攻击者地址API错误: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'获取攻击者地址失败: {str(e)}'
        }), 500

@app.route('/api/execute_distribution/<distribution_id>', methods=['POST'])
def api_execute_distribution(distribution_id: str):
    """执行分配API"""
    try:
        result = enhanced_system.execute_distribution(distribution_id)
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
        with sqlite3.connect(enhanced_system.db_path) as conn:
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
        distribution = enhanced_system.get_distribution(distribution_id)
        details = enhanced_system.get_distribution_details(distribution_id)
        
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
        with sqlite3.connect(enhanced_system.db_path) as conn:
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
        with sqlite3.connect(enhanced_system.db_path) as conn:
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
            
            # 钱包统计
            cursor.execute('SELECT COUNT(*) FROM wallets WHERE is_active = 1')
            active_wallets = cursor.fetchone()[0]
            
            # 待处理分配
            cursor.execute('SELECT COUNT(*) FROM distributions WHERE status = "pending"')
            pending_distributions = cursor.fetchone()[0]
            
            return jsonify({
                'status': 'success',
                'data': {
                    'total_distributions': total_distributions,
                    'successful_distributions': successful_distributions,
                    'success_rate': f"{(successful_distributions / max(total_distributions, 1) * 100):.1f}%",
                    'total_amounts': {currency: amount for amount, currency in total_amounts},
                    'today_distributions': today_distributions,
                    'active_wallets': active_wallets,
                    'pending_distributions': pending_distributions,
                    'supported_currencies': enhanced_system.config['supported_currencies'],
                    'supported_networks': enhanced_system.config['supported_networks']
                }
            })
            
    except Exception as e:
        logger.error(f"❌ 获取统计API错误: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'服务器错误: {str(e)}'
        }), 500

# 蓝白色主题的增强版管理后台HTML模板
ENHANCED_DASHBOARD_TEMPLATE = '''
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎯 增强版多签钱包管理系统</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        :root {
            /* SoybeanAdmin风格配色方案 */
            --primary-color: #646cff;
            --primary-color-hover: #5856eb;
            --primary-color-pressed: #4c46c7;
            --primary-color-suppl: #8a8df8;
            
            --info-color: #70c0e8;
            --success-color: #63e2b7;
            --warning-color: #f2c97d;
            --error-color: #e88080;
            
            --text-color: #1f2328;
            --text-color-2: #656d76;
            --text-color-3: #8c939d;
            
            --border-color: #e1e4e8;
            --border-color-2: #d1d9e0;
            --divider-color: #eff2f5;
            
            --bg-color: #ffffff;
            --bg-color-2: #fafafc;
            --bg-color-3: #f6f8fa;
            --bg-color-4: #eef1f6;
            
            --card-color: #ffffff;
            --modal-color: #ffffff;
            --popover-color: #ffffff;
            
            --shadow-1: 0 1px 2px -2px rgba(0, 0, 0, 0.08), 0 3px 6px 0 rgba(0, 0, 0, 0.06), 0 5px 12px 4px rgba(0, 0, 0, 0.04);
            --shadow-2: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
            --shadow-3: 0 6px 16px -9px rgba(0, 0, 0, 0.08), 0 9px 28px 0 rgba(0, 0, 0, 0.05), 0 12px 48px 16px rgba(0, 0, 0, 0.03);
            
            --border-radius: 6px;
            --border-radius-small: 3px;
            --border-radius-medium: 6px;
            --border-radius-large: 10px;
        }
        
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
            background: var(--bg-color-3);
            color: var(--text-color);
            line-height: 1.6;
            min-height: 100vh;
            margin: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .header { 
            background: var(--card-color);
            padding: 0;
            height: 64px;
            box-shadow: var(--shadow-1);
            position: sticky;
            top: 0;
            z-index: 1000;
            border-bottom: 1px solid var(--border-color);
            backdrop-filter: blur(8px);
        }
        
        .header-content {
            height: 64px;
            padding: 0 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .title { 
            font-size: 20px;
            font-weight: 600;
            color: var(--text-color);
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .title i {
            color: var(--primary-color);
            font-size: 24px;
        }
        
        .status { 
            background: linear-gradient(135deg, var(--success-color) 0%, #51cf66 100%);
            color: white;
            padding: 6px 12px;
            border-radius: var(--border-radius-large);
            font-size: 12px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
            box-shadow: var(--shadow-1);
        }
        
        /* 左右分栏布局 */
        .layout-container {
            display: flex;
            min-height: calc(100vh - 80px);
        }
        
        .sidebar {
            width: 280px;
            background: var(--card-color);
            box-shadow: var(--shadow-1);
            padding: 16px 0;
            position: sticky;
            top: 64px;
            height: calc(100vh - 64px);
            overflow-y: auto;
            border-right: 1px solid var(--border-color);
        }
        
        .sidebar-menu {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .menu-item {
            margin-bottom: 8px;
        }
        
        .menu-item:last-child {
            margin-bottom: 0;
        }
        
        .menu-title {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            margin: 0 12px;
            background: transparent;
            color: var(--text-color);
            font-weight: 500;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            gap: 12px;
            border-radius: var(--border-radius);
            position: relative;
        }
        
        .menu-title:hover {
            background: var(--bg-color-3);
            color: var(--primary-color);
        }
        
        .menu-title.active {
            background: var(--primary-color);
            color: white;
            box-shadow: var(--shadow-2);
        }
        
        .menu-title.active::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 20px;
            background: white;
            border-radius: 0 2px 2px 0;
        }
        
        .submenu {
            list-style: none;
            padding: 0;
            margin: 0;
            background: var(--bg-color-2);
            max-height: 0;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: var(--border-radius);
            margin: 4px 12px 0 12px;
        }
        
        .submenu.open {
            max-height: 300px;
            padding: 8px 0;
            box-shadow: inset var(--shadow-1);
        }
        
        .submenu-item {
            display: flex;
            align-items: center;
            padding: 8px 16px 8px 32px;
            color: var(--text-color-2);
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            gap: 8px;
            font-size: 13px;
            border-radius: var(--border-radius-small);
            margin: 2px 8px;
        }
        
        .submenu-item:hover {
            background: var(--bg-color-3);
            color: var(--primary-color);
            transform: translateX(4px);
        }
        
        .submenu-item.active {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-hover) 100%);
            color: white;
            font-weight: 500;
            box-shadow: var(--shadow-1);
        }
        
        .main-content {
            flex: 1;
            padding: 24px;
            background: transparent;
        }
        
        .container { 
            max-width: none;
            margin: 0;
            padding: 0;
        }
        
        .stats { 
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }
        
        .stat-card { 
            background: var(--card-color);
            padding: 20px;
            border-radius: var(--border-radius-large);
            box-shadow: var(--shadow-1);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid var(--border-color);
            position: relative;
            overflow: hidden;
        }
        
        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-color-suppl) 100%);
        }
        
        .stat-card:hover { 
            transform: translateY(-2px);
            box-shadow: var(--shadow-2);
            border-color: var(--primary-color);
        }
        
        .stat-icon {
            font-size: 28px;
            color: var(--primary-color);
            margin-bottom: 12px;
            display: block;
        }
        
        .stat-value { 
            font-size: 32px;
            font-weight: 600;
            color: var(--text-color);
            margin-bottom: 4px;
            font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', monospace;
        }
        
        .stat-label { 
            color: var(--text-color-2);
            font-size: 13px;
            font-weight: 500;
        }
        
        .section { 
            background: var(--card-color);
            border-radius: var(--border-radius-large);
            padding: 24px;
            margin-bottom: 16px;
            box-shadow: var(--shadow-1);
            border: 1px solid var(--border-color);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .section:hover {
            box-shadow: var(--shadow-2);
        }
        
        .section-title { 
            font-size: 18px;
            margin-bottom: 20px;
            color: var(--text-color);
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--divider-color);
        }
        
        .section-title i {
            color: var(--primary-color);
            font-size: 20px;
        }
        
        .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .form-group { 
            margin-bottom: 16px;
        }
        
        .form-label { 
            display: block;
            margin-bottom: 8px;
            color: var(--text-color);
            font-weight: 500;
            font-size: 14px;
        }
        
        .form-label i {
            color: var(--primary-color);
            margin-right: 4px;
        }
        
        .form-input, .form-select { 
            width: 100%;
            padding: 10px 12px;
            background: var(--bg-color);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            color: var(--text-color);
            font-size: 14px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .form-input:focus, .form-select:focus { 
            border-color: var(--primary-color);
            outline: none;
            box-shadow: 0 0 0 2px rgba(100, 108, 255, 0.1);
            background: var(--card-color);
        }
        
        .btn { 
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: var(--border-radius);
            cursor: pointer;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            display: inline-flex;
            align-items: center;
            gap: 6px;
            box-shadow: var(--shadow-1);
        }
        
        .btn:hover { 
            background: var(--primary-color-hover);
            transform: translateY(-1px);
            box-shadow: var(--shadow-2);
        }
        
        .btn:active {
            background: var(--primary-color-pressed);
            transform: translateY(0);
        }
        
        .btn-success { 
            background: var(--success-color);
        }
        .btn-success:hover { 
            background: #51cf66;
        }
        
        .btn-warning { 
            background: var(--warning-color);
        }
        .btn-warning:hover { 
            background: #ffd43b;
        }
        
        .btn-secondary { 
            background: var(--bg-color-4);
            color: var(--text-color);
        }
        .btn-secondary:hover { 
            background: var(--text-color-3);
            color: white;
        }
        
        .table-container {
            overflow-x: auto;
            border-radius: var(--border-radius-large);
            border: 1px solid var(--border-color);
            background: var(--card-color);
        }
        
        .table { 
            width: 100%;
            border-collapse: collapse;
            background: transparent;
        }
        
        .table th, .table td { 
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid var(--divider-color);
        }
        
        .table th { 
            background: var(--bg-color-2);
            color: var(--text-color);
            font-weight: 600;
            font-size: 13px;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        
        .table th i {
            color: var(--primary-color);
            margin-right: 4px;
        }
        
        .table td {
            color: var(--text-color-2);
            font-size: 13px;
        }
        
        .table tbody tr {
            transition: background-color 0.2s ease;
        }
        
        .table tbody tr:hover { 
            background: var(--bg-color-3);
        }
        
        .table tbody tr:last-child td {
            border-bottom: none;
        }
        
        .status-badge { 
            padding: 4px 8px;
            border-radius: var(--border-radius);
            font-size: 11px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-completed { 
            background: rgba(99, 226, 183, 0.1);
            color: var(--success-color);
            border: 1px solid rgba(99, 226, 183, 0.2);
        }
        
        .status-pending { 
            background: rgba(242, 201, 125, 0.1);
            color: var(--warning-color);
            border: 1px solid rgba(242, 201, 125, 0.2);
        }
        
        .status-failed { 
            background: rgba(232, 128, 128, 0.1);
            color: var(--error-color);
            border: 1px solid rgba(232, 128, 128, 0.2);
        }
        
        .alert { 
            padding: 12px 16px;
            border-radius: var(--border-radius-large);
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 500;
            font-size: 14px;
        }
        
        .alert-success { 
            background: rgba(99, 226, 183, 0.1);
            color: var(--success-color);
            border: 1px solid rgba(99, 226, 183, 0.2);
        }
        
        .alert-error { 
            background: rgba(232, 128, 128, 0.1);
            color: var(--error-color);
            border: 1px solid rgba(232, 128, 128, 0.2);
        }
        
        .alert-warning { 
            background: rgba(242, 201, 125, 0.1);
            color: var(--warning-color);
            border: 1px solid rgba(242, 201, 125, 0.2);
        }
        
        .alert-info { 
            background: rgba(112, 192, 232, 0.1);
            color: var(--info-color);
            border: 1px solid rgba(112, 192, 232, 0.2);
        }
        
        .loading { 
            text-align: center;
            padding: 40px;
            color: var(--dark-gray);
        }
        
        .loading i {
            font-size: 32px;
            color: var(--primary-blue);
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        /* 响应式设计 */
        @media (max-width: 768px) {
            .layout-container {
                flex-direction: column;
            }
            
            .sidebar {
                width: 100%;
                height: auto;
                position: relative;
                top: auto;
                border-right: none;
                border-bottom: 1px solid var(--border-color);
            }
            
            .main-content {
                padding: 16px;
            }
            
            .stats {
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
            }
            
            .stat-card {
                padding: 16px;
            }
            
            .section {
                padding: 16px;
            }
            
            .form-grid {
                grid-template-columns: 1fr;
                gap: 12px;
            }
            
            .table-container {
                border-radius: var(--border-radius);
            }
        }
        
        /* 滚动条美化 */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        
        ::-webkit-scrollbar-track {
            background: var(--bg-color-3);
        }
        
        ::-webkit-scrollbar-thumb {
            background: var(--border-color-2);
            border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: var(--text-color-3);
        }
        
        .tabs {
            display: none; /* 隐藏原来的标签页 */
        }
        
        .tab {
            padding: 12px 24px;
            background: none;
            border: none;
            cursor: pointer;
            font-weight: 600;
            color: var(--dark-gray);
            transition: all 0.2s;
            position: relative;
        }
        
        .tab.active {
            color: var(--primary-blue);
        }
        
        .tab.active::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--primary-blue);
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block !important;
        }
        
        .wallet-item {
            background: var(--light-gray);
            padding: 20px;
            border-radius: var(--border-radius);
            margin-bottom: 15px;
            border-left: 4px solid var(--primary-blue);
        }
        
        .wallet-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .wallet-name {
            font-weight: 600;
            color: var(--primary-blue);
            font-size: 16px;
        }
        
        .wallet-percentage {
            background: var(--primary-blue);
            color: var(--white);
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .wallet-address {
            font-family: 'Courier New', monospace;
            color: var(--dark-gray);
            font-size: 12px;
            word-break: break-all;
        }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: var(--medium-gray);
            border-radius: 4px;
            overflow: hidden;
            margin: 10px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--primary-blue), var(--dark-blue));
            transition: width 0.3s ease;
        }
        
        /* 响应式设计 */
        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                gap: 15px;
                text-align: center;
            }
            
            .title {
                font-size: 24px;
            }
            
            .stats {
                grid-template-columns: 1fr;
            }
            
            .form-grid {
                grid-template-columns: 1fr;
            }
            
            .container {
                padding: 20px 15px;
            }
            
            .section {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-content">
            <div class="title">
                <i class="fas fa-wallet"></i>
                多签钱包管理系统
            </div>
            <div class="status">
                <i class="fas fa-circle"></i>
                系统运行中
            </div>
        </div>
    </div>
    
    <div class="layout-container">
        <!-- 左侧导航栏 -->
        <div class="sidebar">
            <ul class="sidebar-menu">
                <li class="menu-item">
                    <div class="menu-title active" onclick="showDashboard()">
                        <i class="fas fa-tachometer-alt"></i>
                        控制台
                    </div>
                </li>
                <li class="menu-item">
                    <div class="menu-title" onclick="toggleSubmenu('system-menu')">
                        <i class="fas fa-cogs"></i>
                        系统管理
                        <i class="fas fa-chevron-down" style="margin-left: auto; transition: transform 0.3s;"></i>
                    </div>
                    <ul class="submenu" id="system-menu">
                        <li class="submenu-item" onclick="showTab('manual')">
                            <i class="fas fa-hand-pointer"></i>
                            手动分配
                        </li>
                        <li class="submenu-item" onclick="showTab('main-wallet')">
                            <i class="fas fa-shield-alt"></i>
                            主钱包管理
                        </li>
                        <li class="submenu-item" onclick="showTab('wallets')">
                            <i class="fas fa-wallet"></i>
                            钱包管理
                        </li>
                        <li class="submenu-item" onclick="showTab('distributions')">
                            <i class="fas fa-list"></i>
                            分配记录
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
        
        <!-- 右侧主内容区 -->
        <div class="main-content">
            <div class="container">
                <!-- 控制台统计面板 -->
                <div id="dashboard-content">
                    <div class="stats" id="statsContainer">
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                <div class="stat-value" id="totalDistributions">-</div>
                <div class="stat-label">总分配次数</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-percentage"></i></div>
                <div class="stat-value" id="successRate">-</div>
                <div class="stat-label">成功率</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-calendar-day"></i></div>
                <div class="stat-value" id="todayDistributions">-</div>
                <div class="stat-label">今日分配</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-wallet"></i></div>
                <div class="stat-value" id="activeWallets">-</div>
                <div class="stat-label">活跃钱包</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-clock"></i></div>
                <div class="stat-value" id="pendingDistributions">-</div>
                <div class="stat-label">待处理分配</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-coins"></i></div>
                <div class="stat-value" id="supportedCurrencies">-</div>
                <div class="stat-label">支持币种</div>
            </div>
        </div>
                </div>
                
                <!-- 系统管理内容区域 -->
        
        <!-- 标签页 -->
        <div class="tabs">
            <button class="tab" onclick="switchTab('manual')">
                <i class="fas fa-hand-pointer"></i> 手动分配
            </button>
            <button class="tab" onclick="switchTab('main-wallet')">
                <i class="fas fa-shield-alt"></i> 主钱包管理
            </button>
            <button class="tab" onclick="switchTab('wallets')">
                <i class="fas fa-wallet"></i> 钱包管理
            </button>
            <button class="tab" onclick="switchTab('distributions')">
                <i class="fas fa-list"></i> 分配记录
            </button>
        </div>
        
        <!-- 手动触发分配 -->
        <div class="tab-content" id="manual">
            <div class="section">
                <div class="section-title">
                    <i class="fas fa-coins"></i>
                    手动触发资金分配
                </div>
                <div id="manualAlert"></div>
                <form id="manualForm">
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-hashtag"></i> 交易哈希
                            </label>
                            <input type="text" class="form-input" id="txHash" placeholder="输入交易哈希" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-user"></i> 发送地址
                            </label>
                            <input type="text" class="form-input" id="fromAddress" placeholder="输入发送地址" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-dollar-sign"></i> 金额
                            </label>
                            <input type="number" class="form-input" id="amount" placeholder="输入金额" step="0.000001" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-coins"></i> 币种
                            </label>
                            <select class="form-select" id="currency" required>
                                <option value="TRX">TRX</option>
                                <option value="USDT">USDT</option>
                                <option value="ETH">ETH</option>
                                <option value="BTC">BTC</option>
                                <option value="BNB">BNB</option>
                                <option value="USDC">USDC</option>
                                <option value="SOL">SOL</option>
                                <option value="DOGE">DOGE</option>
                                <option value="XRP">XRP</option>
                                <option value="ADA">ADA</option>
                                <option value="DOT">DOT</option>
                                <option value="AVAX">AVAX</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-network-wired"></i> 网络
                            </label>
                            <select class="form-select" id="network" required>
                                <option value="TRON">TRON</option>
                                <option value="ETHEREUM">ETHEREUM</option>
                                <option value="BSC">BSC</option>
                                <option value="BITCOIN">BITCOIN</option>
                                <option value="SOLANA">SOLANA</option>
                                <option value="RIPPLE">RIPPLE</option>
                                <option value="CARDANO">CARDANO</option>
                                <option value="POLKADOT">POLKADOT</option>
                                <option value="AVALANCHE">AVALANCHE</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-play"></i> 操作
                            </label>
                            <button type="submit" class="btn" style="width: 100%;">
                                <i class="fas fa-rocket"></i>
                                触发分配
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- 主钱包管理 -->
        <div class="tab-content" id="main-wallet">
            <div class="section">
                <div class="section-title">
                    <i class="fas fa-shield-alt"></i>
                    当前主钱包
                </div>
                <div id="currentMainWalletContainer">
                    <div class="loading">
                        <i class="fas fa-spinner"></i>
                        <div>正在加载当前主钱包...</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">
                    <i class="fas fa-plus-circle"></i>
                    添加主钱包
                </div>
                <div id="mainWalletAlert"></div>
                <form id="mainWalletForm">
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-wallet"></i> 主钱包地址
                            </label>
                            <input type="text" class="form-input" id="mainWalletAddress" placeholder="输入主钱包地址" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-tag"></i> 钱包名称
                            </label>
                            <input type="text" class="form-input" id="mainWalletName" placeholder="例如: 主钱包-001" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-network-wired"></i> 网络
                            </label>
                            <select class="form-select" id="mainWalletNetwork" required>
                                <option value="TRON">TRON</option>
                                <option value="ETHEREUM">ETHEREUM</option>
                                <option value="BSC">BSC</option>
                                <option value="BITCOIN">BITCOIN</option>
                                <option value="SOLANA">SOLANA</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-plus"></i> 操作
                            </label>
                            <button type="submit" class="btn btn-success" style="width: 100%;">
                                <i class="fas fa-plus"></i>
                                添加主钱包
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            
            <div class="section">
                <div class="section-title">
                    <i class="fas fa-sync-alt"></i>
                    主钱包轮换
                </div>
                <div style="background: var(--light-blue); padding: 20px; border-radius: var(--border-radius); margin-bottom: 20px;">
                    <h4 style="color: var(--primary-blue); margin-bottom: 15px;">
                        <i class="fas fa-info-circle"></i> 防追踪机制
                    </h4>
                    <ul style="color: var(--dark-gray); line-height: 1.8;">
                        <li>🔄 <strong>自动轮换</strong>：每24小时或使用10次后自动切换主钱包</li>
                        <li>🛡️ <strong>防止追踪</strong>：资金分散到不同钱包，增加追踪难度</li>
                        <li>⚡ <strong>手动轮换</strong>：可随时手动切换到下一个主钱包</li>
                        <li>📊 <strong>使用统计</strong>：监控每个钱包的使用次数和时间</li>
                    </ul>
                </div>
                <button class="btn btn-warning" onclick="rotateMainWallet()" style="width: 100%;">
                    <i class="fas fa-sync-alt"></i>
                    立即轮换主钱包
                </button>
            </div>
        </div>
        
        <!-- 钱包管理 -->
        <div class="tab-content" id="wallets">
            <div class="section">
                <div class="section-title">
                    <i class="fas fa-plus-circle"></i>
                    添加新钱包
                </div>
                <div id="walletAlert"></div>
                <form id="walletForm">
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-wallet"></i> 钱包地址
                            </label>
                            <input type="text" class="form-input" id="walletAddress" placeholder="输入钱包地址" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-tag"></i> 钱包名称
                            </label>
                            <input type="text" class="form-input" id="walletName" placeholder="输入钱包名称" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-network-wired"></i> 网络
                            </label>
                            <select class="form-select" id="walletNetwork" required>
                                <option value="TRON">TRON</option>
                                <option value="ETHEREUM">ETHEREUM</option>
                                <option value="BSC">BSC</option>
                                <option value="BITCOIN">BITCOIN</option>
                                <option value="SOLANA">SOLANA</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-percentage"></i> 分润比例 (0-1)
                            </label>
                            <input type="number" class="form-input" id="walletPercentage" placeholder="例如: 0.15" step="0.01" min="0" max="1" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-sort-numeric-up"></i> 优先级
                            </label>
                            <input type="number" class="form-input" id="walletPriority" placeholder="数字越小优先级越高" min="1" value="99">
                        </div>
                        <div class="form-group">
                            <label class="form-label">
                                <i class="fas fa-plus"></i> 操作
                            </label>
                            <button type="submit" class="btn btn-success" style="width: 100%;">
                                <i class="fas fa-plus"></i>
                                添加钱包
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            
            <div class="section">
                <div class="section-title">
                    <i class="fas fa-list"></i>
                    钱包列表
                </div>
                <div class="loading" id="walletsLoading">
                    <i class="fas fa-spinner"></i>
                    <div>正在加载钱包列表...</div>
                </div>
                <div id="walletsContainer" style="display: none;"></div>
            </div>
        </div>
        
        <!-- 分配记录 -->
        <div class="tab-content" id="distributions">
            <div class="section">
                <div class="section-title">
                    <i class="fas fa-history"></i>
                    分配记录
                </div>
                <div class="loading" id="distributionsLoading">
                    <i class="fas fa-spinner"></i>
                    <div>正在加载分配记录...</div>
                </div>
                <div id="distributionsContainer" style="display: none;">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th><i class="fas fa-id-card"></i> 分配ID</th>
                                    <th><i class="fas fa-link"></i> 原始交易</th>
                                    <th><i class="fas fa-coins"></i> 金额</th>
                                    <th><i class="fas fa-money-bill"></i> 币种</th>
                                    <th><i class="fas fa-clock"></i> 结算类型</th>
                                    <th><i class="fas fa-info-circle"></i> 状态</th>
                                    <th><i class="fas fa-calendar"></i> 创建时间</th>
                                    <th><i class="fas fa-cogs"></i> 操作</th>
                                </tr>
                            </thead>
                            <tbody id="distributionsTable">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentTab = 'dashboard';
        
        // 显示控制台
        function showDashboard() {
            // 隐藏所有内容区域
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.style.display = 'none');
            
            // 显示控制台
            const dashboard = document.getElementById('dashboard-content');
            if (dashboard) dashboard.style.display = 'block';
            
            // 更新菜单状态
            updateMenuState('dashboard');
            currentTab = 'dashboard';
        }
        
        // 切换子菜单
        function toggleSubmenu(menuId) {
            const submenu = document.getElementById(menuId);
            const menuTitle = submenu.previousElementSibling;
            const chevron = menuTitle.querySelector('.fa-chevron-down');
            
            if (submenu.classList.contains('open')) {
                submenu.classList.remove('open');
                chevron.style.transform = 'rotate(0deg)';
                menuTitle.classList.remove('active');
            } else {
                // 关闭其他子菜单
                document.querySelectorAll('.submenu').forEach(menu => {
                    menu.classList.remove('open');
                    const otherChevron = menu.previousElementSibling.querySelector('.fa-chevron-down');
                    if (otherChevron) otherChevron.style.transform = 'rotate(0deg)';
                    menu.previousElementSibling.classList.remove('active');
                });
                
                submenu.classList.add('open');
                chevron.style.transform = 'rotate(180deg)';
                menuTitle.classList.add('active');
            }
        }
        
        // 更新菜单状态
        function updateMenuState(activeItem) {
            // 重置所有菜单项状态
            document.querySelectorAll('.menu-title').forEach(title => {
                title.classList.remove('active');
            });
            document.querySelectorAll('.submenu-item').forEach(item => {
                item.classList.remove('active');
            });
            
            if (activeItem === 'dashboard') {
                document.querySelector('.menu-title').classList.add('active');
            } else {
                // 激活系统管理菜单
                const systemMenu = document.querySelectorAll('.menu-title')[1]; // 第二个菜单项是系统管理
                const systemSubmenu = document.getElementById('system-menu');
                if (systemMenu && systemSubmenu) {
                    systemMenu.classList.add('active');
                    systemSubmenu.classList.add('open');
                    const chevron = systemMenu.querySelector('.fa-chevron-down');
                    if (chevron) chevron.style.transform = 'rotate(180deg)';
                }
                
                // 激活对应的子菜单项
                const submenuItems = document.querySelectorAll('.submenu-item');
                submenuItems.forEach(item => {
                    const onclick = item.getAttribute('onclick');
                    if (onclick && onclick.includes(activeItem)) {
                        item.classList.add('active');
                    }
                });
            }
        }
        
        // 显示标签页内容（原有功能保持）
        function showTab(tabName) {
            switchTab(tabName);
            updateMenuState(tabName);
        }
        
        // 切换标签页
        function switchTab(tabName) {
            // 隐藏控制台
            const dashboard = document.getElementById('dashboard-content');
            if (dashboard) dashboard.style.display = 'none';
            
            // 更新标签状态
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            const targetTab = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
            if (targetTab) targetTab.classList.add('active');
            
            // 更新内容显示
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(tabName).classList.add('active');
            
            currentTab = tabName;
            
            // 加载对应数据
            if (tabName === 'main-wallet') {
                loadCurrentMainWallet();
            } else if (tabName === 'wallets') {
                loadWallets();
            } else if (tabName === 'distributions') {
                loadDistributions();
            }
        }
        
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
                    document.getElementById('activeWallets').textContent = data.active_wallets;
                    document.getElementById('pendingDistributions').textContent = data.pending_distributions;
                    document.getElementById('supportedCurrencies').textContent = data.supported_currencies.length;
                }
            } catch (error) {
                console.error('加载统计失败:', error);
            }
        }
        
        // 加载钱包列表
        async function loadWallets() {
            try {
                const response = await fetch('/api/wallets');
                const result = await response.json();
                
                document.getElementById('walletsLoading').style.display = 'none';
                document.getElementById('walletsContainer').style.display = 'block';
                
                if (result.status === 'success') {
                    const container = document.getElementById('walletsContainer');
                    container.innerHTML = '';
                    
                    result.data.forEach(wallet => {
                        const walletDiv = document.createElement('div');
                        walletDiv.className = 'wallet-item';
                        
                        const statusClass = wallet.is_active ? 'status-completed' : 'status-failed';
                        const roleText = wallet.role === 'main' ? '主钱包' : '子钱包';
                        const percentage = (wallet.percentage * 100).toFixed(1);
                        const usageInfo = wallet.role === 'main' ? 
                            `使用次数: ${wallet.usage_count || 0}` : 
                            `优先级: ${wallet.priority}`;
                        
                        walletDiv.innerHTML = `
                            <div class="wallet-header">
                                <div class="wallet-name">
                                    <i class="fas fa-wallet"></i>
                                    ${wallet.name} (${roleText})
                                </div>
                                <div class="wallet-percentage">${percentage}%</div>
                            </div>
                            <div class="wallet-address">${wallet.address}</div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${percentage}%"></div>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                                <span class="status-badge ${statusClass}">
                                    ${wallet.is_active ? '活跃' : '禁用'}
                                </span>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <small style="color: var(--dark-gray);">
                                        网络: ${wallet.network} | ${usageInfo}
                                    </small>
                                    ${wallet.role !== 'main' ? 
                                        `<button class="btn btn-secondary" style="padding: 4px 8px; font-size: 12px;" onclick="deleteWallet('${wallet.address}')">
                                            <i class="fas fa-trash"></i> 删除
                                        </button>` : 
                                        '<span style="color: var(--primary-blue); font-size: 12px;"><i class="fas fa-shield-alt"></i> 主钱包</span>'
                                    }
                                </div>
                            </div>
                        `;
                        
                        container.appendChild(walletDiv);
                    });
                }
            } catch (error) {
                console.error('加载钱包列表失败:', error);
                document.getElementById('walletsLoading').innerHTML = '<i class="fas fa-exclamation-triangle"></i><div>加载失败</div>';
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
                            <td><strong>${dist.currency}</strong></td>
                            <td>${dist.settlement_type === 'realtime' ? '实时' : '延迟'}</td>
                            <td><span class="status-badge ${statusClass}">${dist.status}</span></td>
                            <td>${new Date(dist.created_at).toLocaleString()}</td>
                            <td>
                                ${dist.status === 'pending' ? 
                                  `<button class="btn btn-warning" onclick="executeDistribution('${dist.distribution_id}')">
                                     <i class="fas fa-play"></i> 执行
                                   </button>` : 
                                  dist.proof_id ? 
                                  `<button class="btn btn-secondary" onclick="viewProof('${dist.proof_id}')">
                                     <i class="fas fa-file-alt"></i> 凭证
                                   </button>` : 
                                  '-'}
                            </td>
                        `;
                        
                        tbody.appendChild(row);
                    });
                }
            } catch (error) {
                console.error('加载分配记录失败:', error);
                document.getElementById('distributionsLoading').innerHTML = '<i class="fas fa-exclamation-triangle"></i><div>加载失败</div>';
            }
        }
        
        // 手动触发分配
        document.getElementById('manualForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const alertDiv = document.getElementById('manualAlert');
            const data = {
                tx_hash: document.getElementById('txHash').value,
                from_address: document.getElementById('fromAddress').value,
                amount: parseFloat(document.getElementById('amount').value),
                currency: document.getElementById('currency').value,
                network: document.getElementById('network').value
            };
            
            try {
                alertDiv.innerHTML = `
                    <div class="alert alert-info">
                        <i class="fas fa-spinner fa-spin"></i>
                        正在处理资金分配请求...
                    </div>
                `;
                
                const response = await fetch('/api/receive_funds', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.status === 'success') {
                    alertDiv.innerHTML = `
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle"></i>
                            ${result.message}
                        </div>
                    `;
                    e.target.reset();
                    setTimeout(() => {
                        loadStats();
                        if (currentTab === 'distributions') {
                            loadDistributions();
                        }
                    }, 1000);
                } else {
                    alertDiv.innerHTML = `
                        <div class="alert alert-error">
                            <i class="fas fa-exclamation-triangle"></i>
                            ${result.message}
                        </div>
                    `;
                }
            } catch (error) {
                alertDiv.innerHTML = `
                    <div class="alert alert-error">
                        <i class="fas fa-exclamation-triangle"></i>
                        请求失败: ${error.message}
                    </div>
                `;
            }
        });
        
        // 添加主钱包
        document.getElementById('mainWalletForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const alertDiv = document.getElementById('mainWalletAlert');
            const data = {
                address: document.getElementById('mainWalletAddress').value,
                name: document.getElementById('mainWalletName').value,
                network: document.getElementById('mainWalletNetwork').value
            };
            
            try {
                alertDiv.innerHTML = `
                    <div class="alert alert-info">
                        <i class="fas fa-spinner fa-spin"></i>
                        正在添加主钱包...
                    </div>
                `;
                
                const response = await fetch('/api/main_wallet/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.status === 'success') {
                    alertDiv.innerHTML = `
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle"></i>
                            ${result.message}
                        </div>
                    `;
                    e.target.reset();
                    setTimeout(() => {
                        loadCurrentMainWallet();
                        loadWallets();
                        loadStats();
                    }, 1000);
                } else {
                    alertDiv.innerHTML = `
                        <div class="alert alert-error">
                            <i class="fas fa-exclamation-triangle"></i>
                            ${result.message}
                        </div>
                    `;
                }
            } catch (error) {
                alertDiv.innerHTML = `
                    <div class="alert alert-error">
                        <i class="fas fa-exclamation-triangle"></i>
                        请求失败: ${error.message}
                    </div>
                `;
            }
        });
        
        // 添加钱包
        document.getElementById('walletForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const alertDiv = document.getElementById('walletAlert');
            const data = {
                address: document.getElementById('walletAddress').value,
                name: document.getElementById('walletName').value,
                network: document.getElementById('walletNetwork').value,
                percentage: parseFloat(document.getElementById('walletPercentage').value),
                priority: parseInt(document.getElementById('walletPriority').value) || 99,
                role: 'sub'
            };
            
            try {
                alertDiv.innerHTML = `
                    <div class="alert alert-info">
                        <i class="fas fa-spinner fa-spin"></i>
                        正在添加钱包...
                    </div>
                `;
                
                const response = await fetch('/api/wallets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (result.status === 'success') {
                    alertDiv.innerHTML = `
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle"></i>
                            ${result.message}
                        </div>
                    `;
                    e.target.reset();
                    setTimeout(() => {
                        loadWallets();
                        loadStats();
                    }, 1000);
                } else {
                    alertDiv.innerHTML = `
                        <div class="alert alert-error">
                            <i class="fas fa-exclamation-triangle"></i>
                            ${result.message}
                        </div>
                    `;
                }
            } catch (error) {
                alertDiv.innerHTML = `
                    <div class="alert alert-error">
                        <i class="fas fa-exclamation-triangle"></i>
                        请求失败: ${error.message}
                    </div>
                `;
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
                    alert(`✅ 分配执行成功！\\n成功: ${result.success_count}/${result.total_count}\\n凭证ID: ${result.proof_id || '无'}`);
                    loadDistributions();
                    loadStats();
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
                        `• ${r.wallet_name}: ${r.amount} ${r.currency} (${r.percentage}) - ${r.status}`
                    ).join('\\n');
                    
                    alert(`📋 结算凭证 ${proofId}\\n\\n` +
                          `💰 原始金额: ${proof.original_amount} ${proof.currency}\\n` +
                          `✅ 成功分账: ${proof.success_count}/${proof.total_count}\\n` +
                          `📊 分配率: ${proof.distribution_rate}\\n` +
                          `💸 已分配: ${proof.total_distributed} ${proof.currency}\\n\\n` +
                          `📋 详情:\\n${details}`);
                } else {
                    alert(`❌ 获取凭证失败: ${result.message}`);
                }
            } catch (error) {
                alert(`❌ 请求失败: ${error.message}`);
            }
        }
        
        // 加载当前主钱包
        async function loadCurrentMainWallet() {
            try {
                const response = await fetch('/api/main_wallet/current');
                const result = await response.json();
                
                const container = document.getElementById('currentMainWalletContainer');
                
                if (result.status === 'success') {
                    const walletInfo = result.data.wallet_info;
                    const usageCount = walletInfo ? walletInfo.usage_count || 0 : 0;
                    const lastUsed = walletInfo && walletInfo.last_used_at ? 
                        new Date(walletInfo.last_used_at).toLocaleString() : '从未使用';
                    
                    container.innerHTML = `
                        <div class="wallet-item" style="border-left-color: var(--success);">
                            <div class="wallet-header">
                                <div class="wallet-name">
                                    <i class="fas fa-shield-alt"></i>
                                    ${walletInfo ? walletInfo.name : '默认主钱包'}
                                </div>
                                <div class="wallet-percentage">
                                    <i class="fas fa-crown"></i> 当前主钱包
                                </div>
                            </div>
                            <div class="wallet-address">${result.data.address}</div>
                            <div style="margin-top: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                <div>
                                    <strong style="color: var(--primary-blue);">使用次数</strong><br>
                                    <span style="font-size: 18px; color: var(--success);">${usageCount} 次</span>
                                </div>
                                <div>
                                    <strong style="color: var(--primary-blue);">最后使用</strong><br>
                                    <span style="font-size: 14px; color: var(--dark-gray);">${lastUsed}</span>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    container.innerHTML = `
                        <div class="alert alert-error">
                            <i class="fas fa-exclamation-triangle"></i>
                            获取当前主钱包失败: ${result.message}
                        </div>
                    `;
                }
            } catch (error) {
                console.error('加载当前主钱包失败:', error);
                document.getElementById('currentMainWalletContainer').innerHTML = `
                    <div class="alert alert-error">
                        <i class="fas fa-exclamation-triangle"></i>
                        加载失败: ${error.message}
                    </div>
                `;
            }
        }
        
        // 轮换主钱包
        async function rotateMainWallet() {
            if (!confirm('确定要轮换主钱包吗？这将切换到下一个可用的主钱包。')) return;
            
            try {
                const response = await fetch('/api/main_wallet/rotate', {
                    method: 'POST'
                });
                const result = await response.json();
                
                if (result.status === 'success') {
                    alert(`✅ 主钱包轮换成功！\\n\\n` +
                          `旧钱包: ${result.old_wallet}\\n` +
                          `新钱包: ${result.new_wallet}\\n` +
                          `使用次数: ${result.usage_count}`);
                    loadCurrentMainWallet();
                    loadStats();
                } else {
                    alert(`❌ 主钱包轮换失败: ${result.message}`);
                }
            } catch (error) {
                alert(`❌ 请求失败: ${error.message}`);
            }
        }
        
        // 删除钱包
        async function deleteWallet(address) {
            if (!confirm(`确定要删除钱包吗？\\n\\n地址: ${address}\\n\\n此操作不可撤销！`)) return;
            
            try {
                const response = await fetch(`/api/wallets/${address}`, {
                    method: 'DELETE'
                });
                const result = await response.json();
                
                if (result.status === 'success') {
                    alert(`✅ 钱包删除成功！`);
                    loadWallets();
                    loadStats();
                } else {
                    alert(`❌ 钱包删除失败: ${result.message}`);
                }
            } catch (error) {
                alert(`❌ 请求失败: ${error.message}`);
            }
        }
        
        // 初始化
        loadStats();
        loadWallets();
        
        // 页面初始化
        window.addEventListener('load', function() {
            // 默认显示控制台
            showDashboard();
            // 加载初始数据
            loadStats();
        });
        
        // 定时刷新
        setInterval(() => {
            loadStats();
            if (currentTab === 'main-wallet') {
                loadCurrentMainWallet();
            } else if (currentTab === 'wallets') {
                loadWallets();
            } else if (currentTab === 'distributions') {
                loadDistributions();
            }
        }, 30000);
    </script>
</body>
</html>
'''

if __name__ == '__main__':
    logger.info("🚀 启动增强版多签钱包管理系统")
    # logger.info("📱 管理后台: http://localhost:5001")
    # logger.info("🔗 API文档: http://localhost:5001/api/stats")
    logger.info("📱 管理后台: http://localhost:8080")
    logger.info("🔗 API文档: http://localhost:8080/api/stats")
    logger.info("🌐 公网访问: https://njacnb1250mj.ngrok.xiaomiqiu123.top")
    logger.info("🎯 新增功能:")
    logger.info("   • 手动填入多个钱包地址")
    logger.info("   • 实时自动分账")
    logger.info("   • 蓝白色美化界面")
    logger.info("   • 完整的钱包管理")
    
    app.run(
        host='0.0.0.0',
        # port=5001,
        port=8080,
        debug=False,
        threaded=True
    )