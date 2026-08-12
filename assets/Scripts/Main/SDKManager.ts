import { _decorator, Component, game } from 'cc';
const { ccclass } = _decorator;

// 声明 MRAID 全局对象类型（Unity Ads 运行时注入）
declare const mraid: {
    getState: () => string;
    addEventListener: (event: string, callback: (...args: any[]) => void) => void;
    removeEventListener: (event: string, callback: (...args: any[]) => void) => void;
    isViewable: () => boolean;
} | undefined;

const DOWNLOAD_URL = 'https://play.google.com/store/apps/details?id=com.starlightgame.magicoceantilecrush';

/**
 * SDK管理器
 * 用于管理游戏与SDK的交互
 */
@ccclass('SDKManager')
export class SDKManager extends Component {
    private static _instance: SDKManager = null!;
    private _isInitialized: boolean = false;
    private _isGamePaused: boolean = false;

    /**
     * 获取SDK管理器单例
     */
    public static get instance(): SDKManager {
        return this._instance;
    }

    onLoad() {
        if (SDKManager._instance === null) {
            SDKManager._instance = this;
        } else {
            this.node.destroy();
            return;
        }
    }

    /**
     * 初始化SDK
     * 走 MRAID 生命周期：等待 ready → 检查 viewable → 调用 gameReady
     */
    public initSDK(): void {
        if (this._isInitialized) {
            console.log('SDK already initialized');
            return;
        }

        this.start_mraid();
    }

    // ==================== MRAID 生命周期（Unity Ads） ====================

    /**
     * 等待 MRAID SDK 就绪
     */
    private start_mraid(): void {
        if (typeof mraid !== 'undefined') {
            console.log('[SDKManager] MRAID 存在，等待 SDK 就绪');
            if (mraid.getState() === 'loading') {
                mraid.addEventListener('ready', this.on_mraid_ready.bind(this));
            } else {
                this.on_mraid_ready();
            }
        } else {
            // 非 MRAID 环境，直接初始化
            console.log('[SDKManager] 非 MRAID 环境，直接初始化');
            this.call_game_ready();
        }
    }

    /**
     * MRAID SDK 就绪回调
     */
    private on_mraid_ready(): void {
        console.log('[SDKManager] MRAID SDK 已就绪');
        this._isInitialized = true;

        // 监听可视状态变化
        mraid.addEventListener('viewableChange', this.on_viewable_change.bind(this));

        // 如果当前已可见，立即启动广告
        if (mraid.isViewable()) {
            this.show_ad_internal();
        }
    }

    /**
     * 可视状态变化处理
     */
    private on_viewable_change(viewable: boolean): void {
        console.log('[SDKManager] viewableChange:', viewable);
        if (viewable) {
            if (this._isGamePaused) {
                this.resume_game();
            }
        } else {
            this.pause_game();
        }
    }

    /**
     * 启动广告
     */
    private show_ad_internal(): void {
        console.log('[SDKManager] 广告可见，启动游戏');
        this.call_game_ready();
    }

    /**
     * 调用 window.gameReady() 通知 SDK 游戏就绪
     */
    private call_game_ready(): void {
        try {
            if ((window as any).gameReady) {
                (window as any).gameReady();
                console.log('[SDKManager] gameReady 调用成功');
            } else {
                console.warn('[SDKManager] window.gameReady 方法未找到');
            }
        } catch (error) {
            console.error('[SDKManager] 调用 gameReady 失败:', error);
        }
    }

    // ==================== 游戏暂停/恢复 ====================

    private pause_game(): void {
        if (!this._isGamePaused) {
            this._isGamePaused = true;
            game.pause();
            console.log('[SDKManager] 游戏已暂停');
        }
    }

    private resume_game(): void {
        if (this._isGamePaused) {
            this._isGamePaused = false;
            game.resume();
            console.log('[SDKManager] 游戏已恢复');
        }
    }

    // ==================== 游戏生命周期 ====================

    public gameStart(): void {
        console.log('gameStart');
    }

    public gameClose(): void {
        console.log('gameClose');
    }

    public gameEnd(): void {
        try {
            if ((window as any).gameEnd) {
                (window as any).gameEnd();
                console.log('[SDKManager] gameEnd 调用成功');
            } else {
                console.warn('[SDKManager] window.gameEnd 方法未找到');
            }
        } catch (error) {
            console.error('[SDKManager] 调用 gameEnd 失败:', error);
        }
    }

    // ==================== 广告 ====================

    public showAd(adType: string): void {
        try {
            if ((window as any).showAd) {
                (window as any).showAd(adType);
                console.log(`[SDKManager] Ad of type ${adType} shown`);
            } else {
                console.warn('[SDKManager] window.showAd 方法未找到');
            }
        } catch (error) {
            console.error('[SDKManager] 显示广告失败:', error);
        }
    }

    public hideAd(adType: string): void {
        try {
            if ((window as any).hideAd) {
                (window as any).hideAd(adType);
                console.log(`Ad of type ${adType} hidden`);
            } else {
                console.warn('[SDKManager] window.hideAd 方法未找到');
            }
        } catch (error) {
            console.error('[SDKManager] 隐藏广告失败:', error);
        }
    }

    /**
     * 触发下载
     * 调用 window.install(url) 跳转 Google Play
     */
    public triggerDownload(): void {
        try {
            if ((window as any).install) {
                (window as any).install(DOWNLOAD_URL);
                console.log('[SDKManager] Download triggered');
            } else {
                console.warn('[SDKManager] window.install 方法未找到');
            }
        } catch (error) {
            console.error('[SDKManager] 触发下载失败:', error);
        }
    }

    public getSDKVersion(): string {
        try {
            if ((window as any).getSDKVersion) {
                return (window as any).getSDKVersion();
            } else {
                console.warn('[SDKManager] window.getSDKVersion 方法未找到');
                return 'unknown';
            }
        } catch (error) {
            console.error('[SDKManager] 获取SDK版本失败:', error);
            return 'unknown';
        }
    }

    onDestroy() {
        if (SDKManager._instance === this) {
            SDKManager._instance = null!;
        }
    }
}
