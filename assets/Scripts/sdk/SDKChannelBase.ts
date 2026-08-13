/**
 * SDK 渠道抽象基类
 * 定义所有渠道必须实现的接口
 * 每个渠道子类完全独立，逻辑不混淆
 */
export abstract class SDKChannelBase {

    /** 渠道名称（用于日志） */
    abstract readonly channelName: string;

    // ==================== 生命周期 ====================

    /** 初始化 SDK（游戏启动时调用一次） */
    abstract init(): void;

    /** 游戏开始 */
    abstract gameStart(): void;

    /** 游戏结束 */
    abstract gameEnd(): void;

    /** 资源加载完成，通知 SDK 游戏已就绪（默认 no-op，MIntegral 重写） */
    gameReady(): void {}

    // ==================== 广告 ====================

    /** 显示广告 */
    abstract showAd(adType: string): void;

    /** 隐藏广告 */
    abstract hideAd(adType: string): void;

    // ==================== 下载 ====================

    /** 触发下载（CTA 按钮点击） */
    abstract triggerDownload(): void;

    // ==================== 暂停/恢复 ====================

    /** 注册暂停回调 */
    onPause(callback: () => void): void {
        this._onPauseCallbacks.push(callback);
    }

    /** 注册恢复回调 */
    onResume(callback: () => void): void {
        this._onResumeCallbacks.push(callback);
    }

    /** 销毁清理 */
    destroy(): void {
        this._onPauseCallbacks.length = 0;
        this._onResumeCallbacks.length = 0;
    }

    // ==================== 内部 ====================

    protected _onPauseCallbacks: (() => void)[] = [];
    protected _onResumeCallbacks: (() => void)[] = [];

    /** 通知所有暂停回调 */
    protected notifyPause(): void {
        this._onPauseCallbacks.forEach(cb => cb());
    }

    /** 通知所有恢复回调 */
    protected notifyResume(): void {
        this._onResumeCallbacks.forEach(cb => cb());
    }
}
