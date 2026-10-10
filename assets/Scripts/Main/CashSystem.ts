/**
 * 现金系统 - 可复用的加钱逻辑模块
 * 
 * 功能：
 * 1. 管理现金数量（实际值 + 显示值滚动动画）
 * 2. 水果消除时触发现金飞行动画
 * 3. 支持横竖屏双标签显示
 * 4. 支持多语言货币符号
 * 5. 提供完成回调机制
 */
import { Node, Label, Vec3, UITransform, tween, Prefab } from 'cc';
import { I18nManager } from './I18nManager';
import { CashFlyComp } from '../UI/CashFlyComp';

export interface CashSystemConfig {
    initialAmount?: number;
    minReward?: number;
    maxReward?: number;
    currencySymbol?: string;
    enableThousandsSeparator?: boolean;
    scrollSpeed?: number;
}

interface LanguageRewardConfig {
    min: number;
    max: number;
}

const LANGUAGE_REWARD_MAP: Record<string, LanguageRewardConfig> = {
    'id':    { min: 30000,  max: 50000  },
    'pt-BR': { min: 500,  max: 800  },
    'en':    { min: 100,   max: 200   },
};

const DEFAULT_REWARD: LanguageRewardConfig = { min: 10, max: 20 };

export class CashSystem {
    private _canvasNode: Node | null = null;
    private _lbCashPortrait: Node | null = null;
    private _lbCashLandscape: Node | null = null;
    private _cashFlyPrefab: Prefab | null = null;
    
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
    
    private init(): void {
        this._cashAmount = this._config.initialAmount || 0;
        this._cashDisplay = this._cashAmount;
        this._cashFlyingCount = 0;
        this._pendingComplete = false;
        this.updateLabel();
    }
    
    update(dt: number): void {
        if (Math.abs(this._cashDisplay - this._cashAmount) > 0.5) {
            this._cashDisplay += (this._cashAmount - this._cashDisplay) * this._config.scrollSpeed! * dt;
            this.updateLabel();
        } else if (this._cashDisplay !== this._cashAmount) {
            this._cashDisplay = this._cashAmount;
            this.updateLabel();
        }
        
        if (this._pendingComplete && this._cashFlyingCount === 0 && Math.abs(this._cashDisplay - this._cashAmount) < 0.5) {
            this._pendingComplete = false;
            if (this._onCompleteCallback) {
                this._onCompleteCallback();
            }
        }
    }
    
    /**
     * 水果消除时触发现金飞行
     * @param positions 消除位置的世界坐标数组
     */
    onBlocksEliminated(positions: Vec3[]): void {
        if (!this._canvasNode || positions.length === 0) return;
        
        const uiTransform = this._canvasNode.getComponent(UITransform);
        if (!uiTransform) return;
        
        const activeCashLabel = this.getActiveCashLabel();
        if (!activeCashLabel) return;
        
        const targetLocal = uiTransform.convertToNodeSpaceAR(activeCashLabel.getWorldPosition());
        
        const totalReward = this.getRandomReward();
        const rewardPerFly = Math.floor(totalReward / positions.length);
        
        for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            const reward = (i === positions.length - 1) 
                ? (totalReward - rewardPerFly * i) 
                : rewardPerFly;
            
            this._cashFlyingCount++;
            CashFlyComp.playFlyAnimation(
                pos,
                activeCashLabel,
                reward,
                this._canvasNode,
                (actualReward: number) => {
                    this._cashAmount += actualReward;
                    this._cashFlyingCount--;
                },
                this._cashFlyPrefab
            );
        }
    }
    
    markPendingComplete(): void {
        this._pendingComplete = true;
    }
    
    setOnCompleteCallback(callback: () => void): void {
        this._onCompleteCallback = callback;
    }

    setCashFlyPrefab(prefab: Prefab | null): void {
        this._cashFlyPrefab = prefab;
    }
    
    getCashAmount(): number {
        return this._cashAmount;
    }

    getCashDisplay(): number {
        return Math.floor(this._cashDisplay);
    }
    
    setCashAmount(amount: number): void {
        this._cashAmount = amount;
        this._cashDisplay = amount;
        this.updateLabel();
    }
    
    addCash(amount: number): void {
        this._cashAmount += amount;
    }
    
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
    
    reset(): void {
        this.init();
    }
    
    destroy(): void {
        this._onCompleteCallback = null;
        this._canvasNode = null;
        this._lbCashPortrait = null;
        this._lbCashLandscape = null;
    }
    
    private getActiveCashLabel(): Node | null {
        return this._isLandscape ? this._lbCashLandscape : this._lbCashPortrait;
    }
    
    private updateLabel(): void {
        const symbol = this.getCurrencySymbol();
        const formattedAmount = this.formatNumber(Math.floor(this._cashDisplay));
        const displayText = symbol + formattedAmount;
        
        if (this._lbCashPortrait) {
            const label = this._lbCashPortrait.getComponent(Label);
            if (label) label.string = displayText;
        }
        if (this._lbCashLandscape) {
            const label = this._lbCashLandscape.getComponent(Label);
            if (label) label.string = displayText;
        }
    }
    
    private getCurrencySymbol(): string {
        const lang = I18nManager.current_language;
        if (lang === 'id') return 'Rp';
        if (lang === 'pt-BR') return 'R$';
        return this._config.currencySymbol || '$';
    }
    
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
    
    private getRandomReward(): number {
        const min = this._config.minReward || 10;
        const max = this._config.maxReward || 20;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
