import { game } from 'cc';
import { SDKChannelBase } from './SDKChannelBase';

/**
 * MRAID 类型声明（Unity Ads 与 Applovin 均使用 MRAID 标准接口）
 */
interface MraidSDK {
    getState(): string;
    addEventListener(event: string, callback: (...args: any[]) => void): void;
    removeEventListener(event: string, callback: (...args: any[]) => void): void;
    isViewable(): boolean;
    open(url: string): void;
}

declare const mraid: MraidSDK | undefined;

/**
 * Unity 渠道实现
 *
 * Unity Ads User Acquisition 使用 MRAID 标准接口
 *
 * Bootstrap 流程（与 Applovin 相同）：
 * 1. 检查 mraid.getState()，若 'loading' 则监听 'ready' 事件
 * 2. ready 后注册 'viewableChange' 监听
 * 3. 根据 isViewable() 自动暂停/恢复游戏
 *
 * 下载（与 Applovin 不同 — 需要传 URL）：
 * - mraid.open(url)，商店链接在编辑器中配置
 *
 * 暂停/恢复：
 * - viewableChange 事件驱动，viewable=false 暂停，viewable=true 恢复
 */
export class SDKChannelUnity extends SDKChannelBase {

    readonly channelName = 'Unity';

    /** 商店链接（编辑器中配置，mraid.open 使用） */
    storeUrl: string = '';

    private _isInitialized: boolean = false;
    private _isViewable: boolean = true;
    private _initialViewableSet: boolean = false;
    private _viewableChangeHandler: ((viewable: boolean) => void) | null = null;
    private _readyHandler: (() => void) | null = null;

    // ==================== 生命周期 ====================

    init(): void {
        if (this._isInitialized) {
            console.log('[SDK:Unity] already initialized');
            return;
        }

        if (typeof mraid === 'undefined') {
            console.warn('[SDK:Unity] mraid not defined, not in MRAID environment');
            return;
        }

        const onReady = () => {
            this._readyHandler = null;

            console.log('[SDK:Unity] MRAID SDK ready');
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
            console.log('[SDK:Unity] MRAID loading, waiting for ready...');
            this._readyHandler = onReady;
            mraid.addEventListener('ready', this._readyHandler);
        } else {
            onReady();
        }
    }

    gameStart(): void {
        console.log('[SDK:Unity] gameStart');
    }

    gameEnd(): void {
        console.log('[SDK:Unity] gameEnd (no-op, managed by SDK)');
    }

    // ==================== 广告 ====================

    showAd(_adType: string): void {
        console.log('[SDK:Unity] showAd (no-op, managed by SDK)');
    }

    hideAd(_adType: string): void {
        console.log('[SDK:Unity] hideAd (no-op, managed by SDK)');
    }

    // ==================== 下载 ====================

    triggerDownload(): void {
        if (typeof mraid === 'undefined') {
            console.warn('[SDK:Unity] mraid not defined, cannot trigger download');
            return;
        }

        if (!this._isInitialized) {
            console.warn('[SDK:Unity] MRAID not ready yet, cannot trigger download');
            return;
        }

        if (this.storeUrl) {
            console.log('[SDK:Unity] mraid.open:', this.storeUrl);
            mraid.open(this.storeUrl);
        } else {
            console.warn('[SDK:Unity] store URL not configured');
        }
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
        if (!this._initialViewableSet) {
            this._initialViewableSet = true;
            this._isViewable = viewable;
            if (viewable) {
                console.log('[SDK:Unity] ad viewable (initial), resuming game');
                this._resumeGame();
            } else {
                console.log('[SDK:Unity] ad not viewable (initial), pausing game');
                this._pauseGame();
            }
            return;
        }
        if (this._isViewable === viewable) return;
        this._isViewable = viewable;

        if (viewable) {
            console.log('[SDK:Unity] ad viewable, resuming game');
            this._resumeGame();
        } else {
            console.log('[SDK:Unity] ad not viewable, pausing game');
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
