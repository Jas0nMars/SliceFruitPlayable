import { _decorator, Component, Enum } from 'cc';
import { SDKChannelBase } from './SDKChannelBase';
import { SDKChannelUnity } from './SDKChannelUnity';
import { SDKChannelApplovin } from './SDKChannelApplovin';
import { SDKChannelMIntegral } from './SDKChannelMIntegral';

const { ccclass, property } = _decorator;

// ==================== 渠道枚举 ====================

/**
 * SDK 渠道类型
 * 在编辑器中通过下拉菜单选择
 */
export enum SDKChannel {
    Unity = 0,
    Applovin = 1,
    MIntegral = 2,
}

// ==================== SDKManager ====================

/**
 * SDK管理器（入口门面）
 *
 * 职责：
 * 1. 通过 channel 枚举选择渠道
 * 2. 创建对应的渠道处理器（SDKChannelBase 子类）
 * 3. 将所有调用委托给渠道处理器
 *
 * 各渠道逻辑完全隔离，互不干扰：
 * - SDKChannelUnity     → Unity WebView / JS Bridge
 * - SDKChannelApplovin  → MRAID 标准接口
 * - SDKChannelMIntegral → MIntegral SDK
 */
@ccclass('SDKManager')
export class SDKManager extends Component {

    private static _instance: SDKManager = null!;

    // ---- 编辑器属性 ----

    @property({
        type: Enum(SDKChannel),
        tooltip: '选择 SDK 渠道类型',
    })
    channel: SDKChannel = SDKChannel.Unity;

    @property({
        tooltip: '商店链接（Unity 渠道 mraid.open 使用）',
    })
    storeUrl: string = '';

    // ---- 内部 ----

    private _handler: SDKChannelBase | null = null;

    // ==================== 单例 ====================

    public static get instance(): SDKManager {
        return this._instance;
    }

    // ==================== 生命周期 ====================

    onLoad() {
        if (SDKManager._instance === null) {
            SDKManager._instance = this;
        } else {
            this.node.destroy();
            return;
        }

        this._createHandler();
    }

    onDestroy() {
        if (this._handler) {
            this._handler.destroy();
            this._handler = null;
        }
        if (SDKManager._instance === this) {
            SDKManager._instance = null!;
        }
    }

    // ==================== 内部方法 ====================

    private _createHandler(): void {
        switch (this.channel) {
            case SDKChannel.Unity: {
                const unity = new SDKChannelUnity();
                unity.storeUrl = this.storeUrl;
                this._handler = unity;
                break;
            }
            case SDKChannel.Applovin:
                this._handler = new SDKChannelApplovin();
                break;
            case SDKChannel.MIntegral:
                this._handler = new SDKChannelMIntegral();
                break;
            default:
                console.error(`[SDKManager] unknown channel: ${this.channel}`);
                return;
        }

        console.log(`[SDKManager] channel: ${this._handler.channelName}`);
        this._handler.init();
    }

    /** 获取当前渠道处理器（高级用法，一般不需要直接访问） */
    public getHandler(): SDKChannelBase | null {
        return this._handler;
    }

    /** 获取当前渠道名称 */
    public getChannelName(): string {
        return this._handler?.channelName ?? 'None';
    }

    // ==================== 委托方法 ====================

    /** 初始化 SDK（已在 onLoad 中自动调用，一般不需要手动调用） */
    public initSDK(): void {
        this._handler?.init();
    }

    /** 通知 SDK 游戏开始 */
    public gameStart(): void {
        this._handler?.gameStart();
    }

    /** 通知 SDK 游戏结束（出结束画面时调用） */
    public gameEnd(): void {
        this._handler?.gameEnd();
    }

    /** 通知 SDK 资源加载完成（loadStage 完成后调用） */
    public gameReady(): void {
        this._handler?.gameReady();
    }

    /** 显示广告 */
    public showAd(adType: string): void {
        this._handler?.showAd(adType);
    }

    /** 隐藏广告 */
    public hideAd(adType: string): void {
        this._handler?.hideAd(adType);
    }

    /** 触发下载 */
    public triggerDownload(): void {
        this._handler?.triggerDownload();
    }

    /** 注册暂停回调 */
    public onPause(callback: () => void): void {
        this._handler?.onPause(callback);
    }

    /** 注册恢复回调 */
    public onResume(callback: () => void): void {
        this._handler?.onResume(callback);
    }

    /** 获取 SDK 版本 */
    public getSDKVersion(): string {
        // SDK 版本由各渠道自行处理
        try {
            if ((window as any).getSDKVersion) {
                return (window as any).getSDKVersion();
            }
            return 'unknown';
        } catch (e) {
            return 'unknown';
        }
    }
}
