/**
 * 试玩完成弹窗组件 - 通用可复用版本
 * 
 * 功能：
 * 1. 完整的入场动画序列（遮罩淡入 → 弹窗弹出 → 图标显示 → 呼吸动画 → 现金展示）
 * 2. 喷现金粒子效果
 * 3. 光晕旋转动画
 * 4. 胜利图标交叉呼吸缩放
 * 5. 音效播放
 * 6. 支持多语言集成
 * 
 * 使用示例：
 * ```typescript
 * // 在场景中绑定所有必需节点后
 * this.trialPopup.show(() => {
 *     console.log('弹窗显示完成');
 * });
 * 
 * // 关闭弹窗
 * this.trialPopup.hide();
 * ```
 */
import { _decorator, Component, Node, SpriteFrame, tween, UIOpacity, UITransform, Vec3, AudioSource, AudioClip, Label, Sprite } from 'cc';
import { I18nManager } from '../system/I18nManager';
const { ccclass, property } = _decorator;

@ccclass('TrialCompletePopup')
export class TrialCompletePopup extends Component {

    // ==================== UI 节点引用 ====================

    @property({ type: Node, tooltip: '遮罩背景节点（可选）' })
    maskNode: Node | null = null;

    @property({ type: Node, tooltip: '弹窗底板节点（可选，如果没有则跳过动画）' })
    boardNode: Node | null = null;

    @property({ type: Node, tooltip: '胜利图标1' })
    winIcon1: Node | null = null;

    @property({ type: Node, tooltip: '胜利图标2' })
    winIcon2: Node | null = null;

    @property({ type: Node, tooltip: '现金展示区节点' })
    cashBoardNode: Node | null = null;

    @property({ type: Node, tooltip: '现金按钮节点' })
    cashBtnNode: Node | null = null;

    @property({ type: Node, tooltip: '现金数量标签' })
    lbCashNum: Node | null = null;

    @property({ type: Node, tooltip: '光晕效果节点' })
    imgGlow: Node | null = null;

    @property({ type: Node, tooltip: '喷射起点节点' })
    sprayOrigin: Node | null = null;

    // ==================== 资源引用 ====================

    @property({ type: [SpriteFrame], tooltip: '现金图片帧数组（用于喷钱效果）' })
    cashFrames: SpriteFrame[] = [];

    @property({ type: AudioClip, tooltip: '奖励音效' })
    rewardClip: AudioClip | null = null;

    // ==================== 配置参数 ====================

    @property({ tooltip: '喷钱间隔（秒）' })
    sprayInterval: number = 0.25;

    @property({ tooltip: '每次喷钱数量范围（最小）' })
    sprayCountMin: number = 5;

    @property({ tooltip: '每次喷钱数量范围（最大）' })
    sprayCountMax: number = 7;

    @property({ tooltip: '呼吸动画缩放倍数' })
    breathingScale: number = 1.15;

    @property({ tooltip: '呼吸动画周期（秒）' })
    breathingDuration: number = 0.6;

    // ==================== 私有变量 ====================

    private _breathingTween1: any = null;
    private _breathingTween2: any = null;
    private _audioSource: AudioSource | null = null;
    private _onShowComplete: (() => void) | null = null;
    private _sprayScheduled: boolean = false;

    // ==================== 生命周期 ====================

    onDisable() {
        this._stopSpray();
        this._stopBreathing();
    }

    onDestroy() {
        this._stopSpray();
        this._stopBreathing();
    }

    // ==================== 公共接口 ====================

    /**
     * 显示弹窗
     * @param cashAmount 现金数量（可选，如果不传则从 lbCashNum 当前值读取）
     * @param onComplete 显示完成回调
     */
    show(cashAmount?: number, onComplete?: () => void): void {
        console.log('[TrialCompletePopup] show() called');
        
        // 首先激活节点
        if (!this.node.active) {
            console.log('[TrialCompletePopup] Activating popup node');
            this.node.active = true;
        }
        
        this._onShowComplete = onComplete;

        // 同步现金数值
        if (cashAmount !== undefined && this.lbCashNum) {
            const label = this.lbCashNum.getComponent(Label);
            if (label) {
                const symbol = this._getCurrencySymbol();
                label.string = symbol + this._formatNumber(cashAmount);
            }
        }

        // 播放奖励音效
        this._playRewardSound();

        // 播放入场动画序列
        this._playEntranceAnimation();
    }

    /**
     * 隐藏弹窗
     */
    hide(): void {
        this._stopSpray();
        this._stopBreathing();

        // 停止光晕旋转
        if (this.imgGlow) {
            tween(this.imgGlow).stop();
        }

        // 隐藏所有节点
        this._setNodeHidden(this.maskNode);
        this._setNodeHidden(this.boardNode);
        this._setNodeHidden(this.winIcon1);
        this._setNodeHidden(this.winIcon2);
        this._setNodeHidden(this.cashBoardNode);
        this._setNodeHidden(this.cashBtnNode);

        if (this.imgGlow) {
            let opacity = this.imgGlow.getComponent(UIOpacity);
            if (!opacity) opacity = this.imgGlow.addComponent(UIOpacity);
            opacity.opacity = 0;
        }

        this.node.active = false;
    }

    /**
     * 点击"再玩一次"按钮
     */
    clickReplay(): void {
        console.log('[TrialCompletePopup] 点击再玩一次');
        // TODO: 触发下载或重启游戏
        // SDKManager.instance?.triggerDownload();
    }

    /**
     * 点击"关闭"按钮 / CTA 下载按钮
     */
    clickClose(): void {
        console.log('[TrialCompletePopup] 点击关闭/CTA');
        // TODO: 触发下载或关闭弹窗
        // SDKManager.instance?.triggerDownload();
        this.hide();
    }

    // ==================== 内部方法 ====================

    /** 播放奖励音效 */
    private _playRewardSound(): void {
        if (!this.rewardClip) return;

        if (!this._audioSource) {
            this._audioSource = this.node.getComponent(AudioSource);
            if (!this._audioSource) {
                this._audioSource = this.node.addComponent(AudioSource);
            }
        }

        this._audioSource.playOneShot(this.rewardClip);
    }

    /** 启动光晕旋转动画 */
    private _startGlowRotate(): void {
        if (!this.imgGlow) return;

        this.imgGlow.angle = 0;
        tween(this.imgGlow)
            .by(6, { angle: -360 })
            .union()
            .repeatForever()
            .start();
    }

    // ==================== 入场动画序列 ====================

    /** 播放完整的入场动画序列 */
    private _playEntranceAnimation(): void {
        // 先隐藏所有节点，设置初始状态
        this._setNodeHidden(this.maskNode);
        this._setNodeHidden(this.boardNode);
        this._setNodeHidden(this.winIcon1);
        this._setNodeHidden(this.winIcon2);
        this._setNodeHidden(this.cashBoardNode);
        this._setNodeHidden(this.cashBtnNode);

        // img_glow 初始隐藏（保持原缩放，只隐藏透明度）
        if (this.imgGlow) {
            let opacity = this.imgGlow.getComponent(UIOpacity);
            if (!opacity) opacity = this.imgGlow.addComponent(UIOpacity);
            opacity.opacity = 0;
        }

        // 停止之前的呼吸动画
        this._stopBreathing();

        // 序列：mask → board → win_1 → win_2 → (呼吸) → cash_board → cash_btn → 喷钱
        let delay = 0;

        // 1. mask 淡入
        delay += this._fadeIn(this.maskNode, delay, 0.15);

        // 2. board 缩放弹出
        delay += this._popIn(this.boardNode, delay, 0.2);

        // 2.5 flow(img_glow) 渐显
        delay += this._fadeIn(this.imgGlow, delay, 0.2);

        // 2.6 flow 渐显完成后开始旋转
        this.scheduleOnce(() => {
            this._startGlowRotate();
        }, delay);

        // 3. win_1 弹出
        delay += this._popIn(this.winIcon1, delay, 0.15);

        // 4. win_2 弹出
        delay += this._popIn(this.winIcon2, delay, 0.15);

        // 5. win_1 和 win_2 开始交叉呼吸缩放
        this.scheduleOnce(() => {
            this._startBreathing();
        }, delay);

        // 6. cash_board 弹出（稍等呼吸动画开始）
        delay += 0.15;
        delay += this._popIn(this.cashBoardNode, delay, 0.15);

        // 7. cash_btn 弹出
        delay += this._popIn(this.cashBtnNode, delay, 0.12);

        // 8. 开始喷钱
        this.scheduleOnce(() => {
            this._playCashSpray();
            this.schedule(this._playCashSpray, this.sprayInterval);
            this._sprayScheduled = true;
        }, delay);

        // 9. 所有动画播放完毕后调用回调
        this.scheduleOnce(() => {
            if (this._onShowComplete) {
                this._onShowComplete();
            }
        }, delay + 2);
    }

    /** 设置节点为隐藏状态（scale=0, opacity=0） */
    private _setNodeHidden(node: Node | null): void {
        if (!node) return;
        node.setScale(0, 0, 1);
        let opacity = node.getComponent(UIOpacity);
        if (!opacity) opacity = node.addComponent(UIOpacity);
        opacity.opacity = 0;
    }

    /**
     * 淡入动画
     * @returns 动画持续时间
     */
    private _fadeIn(node: Node | null, delay: number, duration: number): number {
        if (!node) return duration;

        let opacity = node.getComponent(UIOpacity);
        if (!opacity) opacity = node.addComponent(UIOpacity);
        opacity.opacity = 0;

        tween(opacity)
            .delay(delay)
            .to(duration, { opacity: 255 })
            .start();

        // 淡入时保持 scale=1
        node.setScale(1, 1, 1);
        return duration;
    }

    /**
     * 弹出动画（scale 0→1，带回弹效果）
     * @returns 动画持续时间
     */
    private _popIn(node: Node | null, delay: number, duration: number): number {
        if (!node) return duration;

        node.setScale(0, 0, 1);

        tween(node)
            .delay(delay)
            .to(duration, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .start();

        // 弹出时 opacity 设为 255
        let opacity = node.getComponent(UIOpacity);
        if (!opacity) opacity = node.addComponent(UIOpacity);
        opacity.opacity = 255;

        return duration;
    }

    // ==================== 呼吸缩放动画 ====================

    /** 启动 win_1 和 win_2 的交叉呼吸缩放 */
    private _startBreathing(): void {
        if (!this.winIcon1 || !this.winIcon2) return;

        const scale = this.breathingScale;
        const duration = this.breathingDuration;

        // win_1: 1.0 → scale → 1.0（循环）
        this._breathingTween1 = tween(this.winIcon1)
            .to(duration, { scale: new Vec3(scale, scale, 1) }, { easing: 'sineInOut' })
            .to(duration, { scale: new Vec3(1.0, 1.0, 1) }, { easing: 'sineInOut' })
            .union()
            .repeatForever()
            .start();

        // win_2: 与 win_1 反相（先缩小再放大）
        this.winIcon2.setScale(scale, scale, 1);
        this._breathingTween2 = tween(this.winIcon2)
            .to(duration, { scale: new Vec3(1.0, 1.0, 1) }, { easing: 'sineInOut' })
            .to(duration, { scale: new Vec3(scale, scale, 1) }, { easing: 'sineInOut' })
            .union()
            .repeatForever()
            .start();
    }

    /** 停止呼吸动画 */
    private _stopBreathing(): void {
        if (this._breathingTween1) {
            this._breathingTween1.stop();
            this._breathingTween1 = null;
        }
        if (this._breathingTween2) {
            this._breathingTween2.stop();
            this._breathingTween2 = null;
        }

        // 恢复默认缩放
        if (this.winIcon1) this.winIcon1.setScale(1, 1, 1);
        if (this.winIcon2) this.winIcon2.setScale(1, 1, 1);
    }

    // ==================== 喷现金动画 ====================

    /** 喷现金效果：从 spray_origin 位置喷出多张钞票 */
    private _playCashSpray(): void {
        if (this.cashFrames.length === 0) {
            console.warn('[TrialCompletePopup] No cash frames assigned!');
            return;
        }

        // 钞票生成在 spray_origin 下（继承其层级），否则生成在 this.node 下
        let parentNode = this.sprayOrigin || this.node;
        let parentUI = parentNode.getComponent(UITransform);
        if (!parentUI) return;

        // 喷射起点在父节点局部坐标的原点
        let origin = new Vec3(0, 0, 0);

        // 下落到屏幕底部 + 100像素
        let screenBottomWorld = new Vec3(0, -880, 0);
        let grandparentUI = parentNode.parent?.getComponent(UITransform);
        if (grandparentUI) {
            screenBottomWorld = grandparentUI.convertToWorldSpaceAR(new Vec3(0, -780, 0));
        }
        let finalY = parentUI.convertToNodeSpaceAR(screenBottomWorld).y;

        let count = this.sprayCountMin + Math.floor(Math.random() * (this.sprayCountMax - this.sprayCountMin + 1));

        for (let i = 0; i < count; i++) {
            let cash = new Node("cash_spray");
            cash.setParent(parentNode);
            cash.setPosition(origin);

            let sp = cash.addComponent(Sprite);
            sp.spriteFrame = this.cashFrames[Math.floor(Math.random() * this.cashFrames.length)];

            let uiOpacity = cash.addComponent(UIOpacity);
            uiOpacity.opacity = 255;

            // 随机大小
            let s = 0.6 + Math.random() * 0.8;
            cash.setScale(s, s, 1);

            // 随机旋转
            cash.angle = Math.random() * 360;

            // 随机方向：向上喷射，小角度扇形散开
            let angle = 90 + (Math.random() - 0.5) * 70;
            let speed = 500 + Math.random() * 300;
            let rad = angle * Math.PI / 180;
            let vx = Math.cos(rad) * speed;
            let vy = Math.sin(rad) * speed;

            // 两阶段动画：先上升减速，再下落加速
            let gravity = 1200;
            let tUp = vy / gravity;
            let peakY = origin.y + vy * tUp - 0.5 * gravity * tUp * tUp;
            let totalDuration = 1.2 + Math.random() * 0.6;
            let tDown = totalDuration - tUp;
            let finalX = origin.x + vx * totalDuration;
            let rotDelta = (Math.random() - 0.5) * 360;
            let totalRot = cash.angle + rotDelta;
            let upRatio = tUp / totalDuration;

            let sqrt23 = Math.sqrt(2 / 3);
            let tDown1 = tDown * sqrt23;
            let tDown2 = tDown * (1 - sqrt23);
            let midY = peakY + (finalY - peakY) * (2 / 3);
            let midX = (origin.x + vx * tUp) + (finalX - (origin.x + vx * tUp)) * (2 / 3);
            let midRot = (cash.angle + totalRot * upRatio) + (totalRot - (cash.angle + totalRot * upRatio)) * (2 / 3);

            tween(cash)
                .to(tUp, {
                    position: new Vec3(origin.x + vx * tUp, peakY, 0),
                    angle: cash.angle + totalRot * upRatio
                }, {
                    easing: 'quadOut',
                    onUpdate: (target, ratio) => {
                        uiOpacity.opacity = 255;
                    }
                })
                .to(tDown1, {
                    position: new Vec3(midX, midY, 0),
                    angle: midRot
                }, {
                    easing: 'quadIn',
                    onUpdate: (target, ratio) => {
                        uiOpacity.opacity = 255;
                    }
                })
                .to(tDown2, {
                    position: new Vec3(finalX, finalY, 0),
                    angle: totalRot
                }, {
                    easing: 'linear',
                    onUpdate: (target, ratio) => {
                        uiOpacity.opacity = Math.floor(255 * (1 - ratio));
                    }
                })
                .call(() => { cash.removeFromParent(); })
                .start();
        }
    }

    /** 停止喷钱 */
    private _stopSpray(): void {
        if (this._sprayScheduled) {
            this.unschedule(this._playCashSpray);
            this._sprayScheduled = false;
        }
    }

    // ==================== 工具方法 ====================

    /** 根据当前语言获取货币符号 */
    private _getCurrencySymbol(): string {
        const lang = I18nManager.current_language;
        if (lang === 'id') return 'Rp';
        if (lang === 'pt-BR') return 'R$';
        return '$';
    }

    /** 格式化数字（不使用分隔符） */
    private _formatNumber(num: number): string {
        return Math.floor(num).toString();
    }
}
