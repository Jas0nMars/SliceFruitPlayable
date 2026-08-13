import { game } from 'cc';
import { SDKChannelBase } from './SDKChannelBase';

/**
 * Applovin MRAID 类型声明
 */
interface MraidSDK {
    getState(): string;
    addEventListener(event: string, callback: (...args: any[]) => void): void;
    removeEventListener(event: string, callback: (...args: any[]) => void): void;
    isViewable(): boolean;
    open(): void;
}

declare const mraid: MraidSDK | undefined;

/**
 * Applovin 渠道实现
 *
 * 交互方式：通过 MRAID 标准接口与 Applovin SDK 通信
 *
 * Bootstrap 流程：
 * 1. 检查 mraid.getState()，若 'loading' 则监听 'ready' 事件
 * 2. ready 后注册 'viewableChange' 监听
 * 3. 根据 isViewable() 自动暂停/恢复游戏
 *
 * 下载：
 * - mraid.open()（点击链接在 Applovin 后台配置，无需传 URL）
 *
 * 暂停/恢复：
 * - viewableChange 事件驱动，viewable=false 暂停，viewable=true 恢复
 */
export class SDKChannelApplovin extends SDKChannelBase {

    readonly channelName = 'Applovin';

    private _isInitialized: boolean = false;
    private _isViewable: boolean = true;
    private _initialViewableSet: boolean = false; // 标记首次 viewableChange 是否已处理
    private _viewableChangeHandler: ((viewable: boolean) => void) | null = null;
    private _readyHandler: (() => void) | null = null;

    // ==================== 生命周期 ====================

    init(): void {
        if (this._isInitialized) {
            console.log('[SDK:Applovin] already initialized');
            return;
        }

        if (typeof mraid === 'undefined') {
            console.warn('[SDK:Applovin] mraid not defined, not in Applovin environment');
            return;
        }

        const onReady = () => {
            // ready 后移除 ready 监听（避免 destroy 时残留）
            this._readyHandler = null;

            console.log('[SDK:Applovin] MRAID SDK ready');
            this._isInitialized = true;

            // 注册 viewableChange 监听
            this._viewableChangeHandler = (viewable: boolean) => {
                this._onViewableChange(viewable);
            };
            mraid.addEventListener('viewableChange', this._viewableChangeHandler);

            // 首次检查可见性
            if (mraid.isViewable()) {
                this._onViewableChange(true);
            } else {
                this._onViewableChange(false);
            }
        };

        if (mraid.getState() === 'loading') {
            console.log('[SDK:Applovin] MRAID loading, waiting for ready...');
            this._readyHandler = onReady;
            mraid.addEventListener('ready', this._readyHandler);
        } else {
            onReady();
        }
    }

    gameStart(): void {
        console.log('[SDK:Applovin] gameStart');
    }

    gameEnd(): void {
        // Applovin 渠道不调用 gameEnd，由 SDK 自行管理
        console.log('[SDK:Applovin] gameEnd (no-op)');
    }

    // ==================== 广告 ====================

    showAd(_adType: string): void {
        // Applovin 渠道广告由 SDK 自行管理，不需要手动调用
        console.log('[SDK:Applovin] showAd (no-op, managed by SDK)');
    }

    hideAd(_adType: string): void {
        // Applovin 渠道广告由 SDK 自行管理，不需要手动调用
        console.log('[SDK:Applovin] hideAd (no-op, managed by SDK)');
    }

    // ==================== 下载 ====================

    triggerDownload(): void {
        if (typeof mraid === 'undefined') {
            console.warn('[SDK:Applovin] mraid not defined, cannot trigger download');
            return;
        }

        if (!this._isInitialized) {
            console.warn('[SDK:Applovin] MRAID not ready yet, cannot trigger download');
            return;
        }

        console.log('[SDK:Applovin] mraid.open()');
        mraid.open();
    }

    // ==================== 清理 ====================

    destroy(): void {
        if (typeof mraid !== 'undefined') {
            if (this._readyHandler) {
                mraid.removeEventListener('ready', this._readyHandler);
                this._readyHandler = null;
            }
            if (this._viewableChangeHandler) {
                mraid.removeEventListener('viewableChange', this._viewableChangeHandler);
                this._viewableChangeHandler = null;
            }
        }
        super.destroy();
    }

    // ==================== 内部方法 ====================

    /**
     * MRAID viewableChange 处理
     * viewable=false → 暂停游戏；viewable=true → 恢复游戏
     */
    private _onViewableChange(viewable: boolean): void {
        // 首次调用必须处理（不受去重影响）
        if (!this._initialViewableSet) {
            this._initialViewableSet = true;
            this._isViewable = viewable;
            if (viewable) {
                console.log('[SDK:Applovin] ad viewable (initial), resuming game');
                this._resumeGame();
            } else {
                console.log('[SDK:Applovin] ad not viewable (initial), pausing game');
                this._pauseGame();
            }
            return;
        }
        if (this._isViewable === viewable) return;
        this._isViewable = viewable;

        if (viewable) {
            console.log('[SDK:Applovin] ad viewable, resuming game');
            this._resumeGame();
        } else {
            console.log('[SDK:Applovin] ad not viewable, pausing game');
            this._pauseGame();
        }
    }

    private _pauseGame(): void {
        game.pause();
        this.notifyPause();
    }

    private _resumeGame(): void {
        game.resume();
        this.notifyResume();
    }

}
