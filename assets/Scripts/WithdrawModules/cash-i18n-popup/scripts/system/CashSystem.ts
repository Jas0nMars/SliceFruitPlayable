/**
 * 现金系统 - 可复用的加钱逻辑模块
 * 
 * 功能：
 * 1. 管理现金数量（实际值 + 显示值滚动动画）
 * 2. 方块消除时触发现金飞行动画
 * 3. 支持横竖屏双标签显示
 * 4. 支持多语言货币符号
 * 5. 提供完成回调机制
 * 
 * 使用示例：
 * ```typescript
 * // 初始化
 * this.cashSystem = new CashSystem(this.canvasNode, lbCashPortrait, lbCashLandscape);
 * 
 * // 方块消除时触发
 * this.cashSystem.onBlocksEliminated(positions);
 * 
 * // 每帧更新（在 update 中调用）
 * this.cashSystem.update(dt);
 * 
 * // 设置完成回调
 * this.cashSystem.setOnCompleteCallback(() => {
 *     console.log('所有现金已到达，可以弹出完成弹窗');
 * });
 * ```
 */
import { Node, Label, Vec3, UITransform, tween } from 'cc';
import { I18nManager } from './I18nManager';
import { CashFlyComp } from '../ui/CashFlyComp';

export interface CashSystemConfig {
    /** 初始现金数量 */
    initialAmount?: number;
    /** 最小随机奖励（不传则根据语言自动设置） */
    minReward?: number;
    /** 最大随机奖励（不传则根据语言自动设置） */
    maxReward?: number;
    /** 货币符号 */
    currencySymbol?: string;
    /** 是否启用千位分隔符 */
    enableThousandsSeparator?: boolean;
    /** 滚动速度系数 */
    scrollSpeed?: number;
}

/** 各语言奖励范围配置 */
interface LanguageRewardConfig {
    min: number;
    max: number;
}

/** 语言 → 奖励范围映射表 */
const LANGUAGE_REWARD_MAP: Record<string, LanguageRewardConfig> = {
    'id':    { min: 30000,  max: 50000  },
    'pt-BR': { min: 500,  max: 800  },
    'en':    { min: 10,   max: 20   },
};

/** 默认奖励范围 */
const DEFAULT_REWARD: LanguageRewardConfig = { min: 10, max: 20 };

export class CashSystem {
    private _canvasNode: Node | null = null;
    private _lbCashPortrait: Node | null = null;
    private _lbCashLandscape: Node | null = null;
    
    private _cashAmount: number = 0;
    private _cashDisplay: number = 0;
    private _cashFlyingCount: number = 0;
    private _pendingComplete: boolean = false;
    private _isLandscape: boolean = false;
    
    private _config: CashSystemConfig;
    private _onCompleteCallback: (() => void) | null = null;
    
    constructor(
        canvasNode: Node,
        lbCashPortrait: Node | null,
        lbCashLandscape: Node | null,
        config?: CashSystemConfig
    ) {
        this._canvasNode = canvasNode;
        this._lbCashPortrait = lbCashPortrait;
        this._lbCashLandscape = lbCashLandscape;
        
        // 根据语言自动设置奖励范围（如果未手动指定）
        const lang = I18nManager.current_language;
        const langReward = LANGUAGE_REWARD_MAP[lang] || DEFAULT_REWARD;

        this._config = {
            initialAmount: config?.initialAmount ?? 0,
            minReward: config?.minReward ?? langReward.min,
            maxReward: config?.maxReward ?? langReward.max,
            currencySymbol: config?.currencySymbol ?? '$',
            enableThousandsSeparator: config?.enableThousandsSeparator ?? false,
            scrollSpeed: config?.scrollSpeed ?? 5,
        };
        
        this.init();
    }
    
    /**
     * 初始化现金系统
     */
    private init(): void {
        this._cashAmount = this._config.initialAmount || 0;
        this._cashDisplay = this._cashAmount;
        this._cashFlyingCount = 0;
        this._pendingComplete = false;
        this.updateLabel();
    }
    
    /**
     * 每帧更新（需在场景的 update 中调用）
     */
    update(dt: number): void {
        // 现金滚动动画
        if (Math.abs(this._cashDisplay - this._cashAmount) > 0.5) {
            this._cashDisplay += (this._cashAmount - this._cashDisplay) * this._config.scrollSpeed! * dt;
            this.updateLabel();
        } else if (this._cashDisplay !== this._cashAmount) {
            this._cashDisplay = this._cashAmount;
            this.updateLabel();
        }
        
        // 检查是否可以触发完成回调
        if (this._pendingComplete && this._cashFlyingCount === 0 && Math.abs(this._cashDisplay - this._cashAmount) < 0.5) {
            this._pendingComplete = false;
            if (this._onCompleteCallback) {
                this._onCompleteCallback();
            }
        }
    }
    
    /**
     * 方块消除时触发
     * @param positions 消除方块的世界坐标数组
     */
    onBlocksEliminated(positions: Vec3[]): void {
        console.log('[CashSystem] onBlocksEliminated called, positions count:', positions.length);
        
        if (!this._canvasNode) {
            console.warn('[CashSystem] Canvas node is null!');
            return;
        }
        
        if (positions.length === 0) {
            console.warn('[CashSystem] No positions provided!');
            return;
        }
        
        const uiTransform = this._canvasNode.getComponent(UITransform);
        if (!uiTransform) {
            console.warn('[CashSystem] Canvas UITransform not found!');
            return;
        }
        
        const activeCashLabel = this.getActiveCashLabel();
        if (!activeCashLabel) {
            console.warn('[CashSystem] No active cash label found!');
            return;
        }
        
        console.log('[CashSystem] Active cash label:', activeCashLabel.name);
        
        const targetLocal = uiTransform.convertToNodeSpaceAR(activeCashLabel.getWorldPosition());
        
        // 计算总奖励和每个飞行的奖励
        const totalReward = this.getRandomReward();
        const rewardPerFly = Math.floor(totalReward / positions.length);
        
        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            
            // 最后一张钞票补上取整差额
            const reward = (i === positions.length - 1) 
                ? (totalReward - rewardPerFly * i) 
                : rewardPerFly;
            
            console.log(`[CashSystem] Playing fly animation #${i + 1}, pos: (${pos.x.toFixed(0)}, ${pos.y.toFixed(0)}), reward: ${reward}`);
            
            // 播放飞行动画
            this._cashFlyingCount++;
            CashFlyComp.playFlyAnimation(
                pos,
                activeCashLabel,
                reward,
                this._canvasNode,
                (actualReward: number) => {
                    this._cashAmount += actualReward;
                    this._cashFlyingCount--;
                    console.log(`[CashSystem] Fly animation #${i + 1} completed. Remaining: ${this._cashFlyingCount}`);
                }
            );
        }
    }
    
    /**
     * 标记等待完成（通常在关卡结束时调用）
     */
    markPendingComplete(): void {
        this._pendingComplete = true;
    }
    
    /**
     * 设置完成回调
     */
    setOnCompleteCallback(callback: () => void): void {
        this._onCompleteCallback = callback;
    }
    
    /**
     * 获取当前现金数量（实际累计值）
     */
    getCashAmount(): number {
        return this._cashAmount;
    }

    /**
     * 获取当前显示的现金数量（滚动动画值，与界面标签一致）
     */
    getCashDisplay(): number {
        return Math.floor(this._cashDisplay);
    }
    
    /**
     * 设置现金数量（直接设置，不带动画）
     */
    setCashAmount(amount: number): void {
        this._cashAmount = amount;
        this._cashDisplay = amount;
        this.updateLabel();
    }
    
    /**
     * 增加现金数量
     */
    addCash(amount: number): void {
        this._cashAmount += amount;
    }
    
    /**
     * 切换横竖屏显示
     */
    setOrientation(isLandscape: boolean): void {
        this._isLandscape = isLandscape;
        
        if (this._lbCashPortrait) {
            this._lbCashPortrait.active = !isLandscape;
        }
        if (this._lbCashLandscape) {
            this._lbCashLandscape.active = isLandscape;
        }
        
        this.updateLabel();
    }
    
    /**
     * 重置现金系统
     */
    reset(): void {
        this.init();
    }
    
    /**
     * 销毁系统（移除事件监听等）
     */
    destroy(): void {
        this._onCompleteCallback = null;
        this._canvasNode = null;
        this._lbCashPortrait = null;
        this._lbCashLandscape = null;
    }
    
    // ---- 私有方法 ----
    
    /**
     * 获取当前活跃的现金标签节点
     */
    private getActiveCashLabel(): Node | null {
        return this._isLandscape ? this._lbCashLandscape : this._lbCashPortrait;
    }
    
    /**
     * 更新标签显示
     */
    private updateLabel(): void {
        const symbol = this.getCurrencySymbol();
        const formattedAmount = this.formatNumber(Math.floor(this._cashDisplay));
        const displayText = symbol + formattedAmount;
        
        // 同时更新横竖屏两个标签
        if (this._lbCashPortrait) {
            const label = this._lbCashPortrait.getComponent(Label);
            if (label) label.string = displayText;
        }
        if (this._lbCashLandscape) {
            const label = this._lbCashLandscape.getComponent(Label);
            if (label) label.string = displayText;
        }
    }
    
    /**
     * 根据当前语言获取货币符号
     */
    private getCurrencySymbol(): string {
        const lang = I18nManager.current_language;
        if (lang === 'id') return 'Rp';
        if (lang === 'pt-BR') return 'R$';
        return this._config.currencySymbol || '$';
    }
    
    /**
     * 格式化数字（添加千位分隔符）
     */
    private formatNumber(num: number): string {
        if (!this._config.enableThousandsSeparator) {
            return num.toString();
        }
        
        const str = num.toString();
        let result = '';
        let count = 0;
        
        for (let i = str.length - 1; i >= 0; i--) {
            if (count > 0 && count % 3 === 0) {
                result = ',' + result;
            }
            result = str[i] + result;
            count++;
        }
        
        return result;
    }
    
    /**
     * 获取随机奖励金额
     */
    private getRandomReward(): number {
        const min = this._config.minReward || 10;
        const max = this._config.maxReward || 20;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
