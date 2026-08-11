/**
 * 模块集成示例 — 展示如何将 cash-i18n-popup 模块集成到游戏场景
 * 
 * 使用方法：
 * 1. 将模块包中的文件复制到目标项目 assets/ 下（见 README.md）
 * 2. 参考本文件在你的游戏场景脚本中集成
 */

import { _decorator, Component, Node, Vec3 } from 'cc';
import { CashSystem } from '../system/CashSystem';
import { I18nManager } from '../system/I18nManager';
import { TrialCompletePopup } from '../ui/TrialCompletePopup';

const { ccclass, property } = _decorator;

@ccclass('GameScene')
export class GameScene extends Component {

    // ===== 模块属性绑定 =====

    @property(Node)
    canvasNode: Node | null = null;

    @property(Node)
    lbCashNumPortrait: Node | null = null;

    @property(Node)
    lbCashNumLandscape: Node | null = null;

    @property(Node)
    trialCompletePopupNode: Node | null = null;

    // ===== 模块实例 =====

    private _cashSystem: CashSystem | null = null;
    private _trialPopup: TrialCompletePopup | null = null;

    start(): void {
        // ========== 第 1 步：初始化多语言系统 ==========
        I18nManager.init('id'); // 默认语言：'en' | 'id' | 'pt-BR'

        // ========== 第 2 步：初始化现金系统 ==========
        this._cashSystem = new CashSystem(
            this.canvasNode!,
            this.lbCashNumPortrait,
            this.lbCashNumLandscape,
            {
                initialAmount: 0,
                // minReward / maxReward 不传，CashSystem 根据语言自动设置
                // 如需自定义：
                // minReward: 100,
                // maxReward: 500,
            }
        );

        // ========== 第 3 步：设置完成回调 ==========
        this._cashSystem.setOnCompleteCallback(() => {
            this._showTrialCompletePopup();
        });

        // ========== 第 4 步：初始化结算弹窗 ==========
        if (this.trialCompletePopupNode) {
            this._trialPopup = this.trialCompletePopupNode.getComponent(TrialCompletePopup);
        }
    }

    update(dt: number): void {
        // ========== 第 5 步：每帧更新现金系统 ==========
        if (this._cashSystem) {
            this._cashSystem.update(dt);
        }
    }

    // ===== 游戏逻辑中调用 =====

    /**
     * 方块消除时触发现金飞行
     */
    onBlocksEliminated(positions: Vec3[]): void {
        if (this._cashSystem && positions.length > 0) {
            this._cashSystem.onBlocksEliminated(positions);
        }
    }

    /**
     * 关卡结束时标记等待完成
     */
    onLevelComplete(): void {
        if (this._cashSystem) {
            this._cashSystem.markPendingComplete();
        }
    }

    /**
     * 显示结算弹窗
     */
    private _showTrialCompletePopup(): void {
        if (!this._trialPopup) return;

        const cashAmount = this._cashSystem
            ? this._cashSystem.getCashDisplay()
            : 0;

        this._trialPopup.show(cashAmount, () => {
            console.log('弹窗显示完成，可以执行后续逻辑');
        });
    }
}
