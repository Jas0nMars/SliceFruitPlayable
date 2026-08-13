import { SDKChannelBase } from './SDKChannelBase';

/**
 * MIntegral 渠道 window 接口声明
 */
declare global {
    interface Window {
        gameReady?: () => void;
        gameEnd?: () => void;
        install?: () => void;
        /** MIntegral 主动调用的回调（由 exposeGlobalCallbacks 注册） */
        gameStart?: () => void;
        gameClose?: () => void;
    }
}

/**
 * MIntegral 渠道实现
 *
 * 我们调用 MIntegral（通知 SDK 状态变化）：
 * - window.gameReady && window.gameReady()   → 资源加载完成后调用
 * - window.gameEnd && window.gameEnd()       → 出结束画面时调用
 * - window.install && window.install()       → 点击下载时调用
 *
 * MIntegral 主动调用我们（由 SDK 暴露到 window）：
 * - window.gameStart()  → MIntegral 在试玩开始时主动执行
 * - window.gameClose()  → MIntegral 在试玩结束时主动执行
 */
export class SDKChannelMIntegral extends SDKChannelBase {

    readonly channelName = 'MIntegral';

    // ==================== 初始化 ====================

    init(): void {
        this._exposeGlobalCallbacks();
    }

    /**
     * 将 gameStart / gameClose 回调暴露到 window
     * MIntegral 会在特定时机主动执行这些方法
     */
    private _exposeGlobalCallbacks(): void {
        // MIntegral 在试玩开始时主动执行
        window.gameStart = () => {
            console.log('[SDK:MIntegral] window.gameStart called by MIntegral');
            // 开发者可在此处理：开始倒计时、开始背景音乐等
        };

        // MIntegral 在试玩结束时主动执行
        window.gameClose = () => {
            console.log('[SDK:MIntegral] window.gameClose called by MIntegral');
            // 开发者可在此处理：关闭背景音乐等
        };

        console.log('[SDK:MIntegral] global callbacks exposed');
    }

    // ==================== 我们调用 MIntegral ====================

    /**
     * 通知 MIntegral：资源加载完成，游戏已就绪
     * 在 loadStage() 完成后调用
     */
    gameReady(): void {
        window.gameReady && window.gameReady();
        console.log('[SDK:MIntegral] window.gameReady() called');
    }

    /**
     * 通知 MIntegral：试玩素材结束（出结束画面时）
     * 在 showTrialCompletePopup() 时调用
     */
    gameEnd(): void {
        window.gameEnd && window.gameEnd();
        console.log('[SDK:MIntegral] window.gameEnd() called');
    }

    /**
     * 触发下载
     */
    triggerDownload(): void {
        window.install && window.install();
        console.log('[SDK:MIntegral] window.install() called');
    }

    // ==================== 不需要的方法 ====================

    /** Applovin 专用，MIntegral 不使用 */
    gameStart(): void {}

    /** MIntegral 文档未要求广告控制 */
    showAd(_adType: string): void {}
    hideAd(_adType: string): void {}
}
