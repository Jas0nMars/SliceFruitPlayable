import { _decorator, Component, Node, SpriteFrame, find, Prefab, EventHandler, Button } from "cc";
import FruitPoolMgr from "./FruitPoolMgr";
import InGameUI from "../UI/InGameUI";
import LevelMgr from "../Level/LevelMgr";
import { TrialCompletePopup } from "../UI/TrialCompletePopup";
import { CashSystem } from "./CashSystem";
import { I18nManager } from "./I18nManager";
import { SDKManager } from "../sdk/SDKManager";
import SoundManager from "./SoundManager";

const { ccclass, property } = _decorator;

@ccclass
export default class Game extends Component {

    @property(Node)
    game_ui: Node = null;

    @property([SpriteFrame])
    fruit_imgs: Array<SpriteFrame> = [];

    @property([SpriteFrame])
    half_fruit_imgs: Array<SpriteFrame> = []; // 半果精灵图（与 fruit_imgs 一一对应，可选）

    @property(Node)
    trial_popup_ui: Node = null; // 试玩完成弹窗

    @property(Node)
    cash_label: Node = null; // 竖屏现金标签节点（cash_fly 飞向此节点）

    @property(Node)
    cash_label_landscape: Node = null; // 横屏现金标签节点

    @property({ type: Prefab, tooltip: '现金飞行预制体' })
    cash_fly_prefab: Prefab = null;

    @property({ type: Node })
    cash_info_portrait: Node = null;  // 竖屏现金信息面板

    @property({ type: Node })
    cash_info_landscape: Node = null;  // 横屏现金信息面板

    @property({ type: Node })
    btn_wd_portrait: Node = null;     // 竖屏下载按钮

    @property({ type: Node })
    btn_wd_landscape: Node = null;    // 横屏下载按钮

    fruitPoolMgr: FruitPoolMgr = null;
    inGameUI: InGameUI = null;
    levelMgr: LevelMgr = null;
    trialPopup: TrialCompletePopup = null;
    cashSystem: CashSystem = null;
    soundMgr: SoundManager = null;

    kill_fruit_num: number = 0;
    is_level_ended: boolean = false; // 关卡是否已结束（防止重复触发）
    is_landscape: boolean = false;   // 当前是否横屏

    onLoad() {
        this.fruitPoolMgr = this.node.getComponent(FruitPoolMgr);
        this.inGameUI = this.game_ui.getComponent(InGameUI);
        this.levelMgr = this.node.getComponent(LevelMgr);
        if (this.trial_popup_ui) {
            this.trialPopup = this.trial_popup_ui.getComponent(TrialCompletePopup);
            if (this.trialPopup) {
                this.trialPopup.game = this;
            }
        }

        // 初始化多语言系统
        I18nManager.init('pt-BR');

        // 初始化 SDK
        this._initSDKManager();

        // 初始化音效管理器
        this.soundMgr = this.node.getComponent(SoundManager);
        if (!this.soundMgr) {
            this.soundMgr = this.node.addComponent(SoundManager);
        }

        // 代码绑定 cash_info 按钮点击事件（场景中 target 为空，需代码补偿）
        this._bind_btn_wd(this.btn_wd_portrait);
        this._bind_btn_wd(this.btn_wd_landscape);

        // 初始化现金系统
        let canvas = find('Canvas');
        this.cashSystem = new CashSystem(
            canvas,
            this.cash_label,
            this.cash_label_landscape,
            { initialAmount: 0 }
        );

        // 设置现金飞行预制体
        if (this.cash_fly_prefab) {
            this.cashSystem.setCashFlyPrefab(this.cash_fly_prefab);
        }

        // 所有现金飞行完成后弹出结算弹窗
        this.cashSystem.setOnCompleteCallback(() => {
            if (this.trial_popup_ui) {
                this.trial_popup_ui.active = true;
            }
        });
    }

    update(dt: number) {
        if (this.cashSystem) {
            this.cashSystem.update(dt);
        }

        // 飞刀累计 3 次消除但尚未通关，强制通关
        if (!this.is_level_ended && this.inGameUI && this.inGameUI.center_knife_node_com) {
            if (this.inGameUI.center_knife_node_com.throw_elimination_count >= 3) {
                this.is_level_ended = true;
                this.levelMgr.end_level();
            }
        }
    }

    start() {
        this.levelMgr.init(this);
        this.fruitPoolMgr.init(this);
        this.inGameUI.init(this);

        // 资源加载完成，通知 SDK 游戏已就绪
        SDKManager.instance?.gameReady();
    }

    /** 横竖屏切换时由 ScreenLayoutManager 调用（参考 yanglegeyang MainAction.set_orientation） */
    set_orientation(is_landscape: boolean) {
        this.is_landscape = is_landscape;
        // 切换 cash_info 横竖屏子节点
        if (this.cash_info_portrait) this.cash_info_portrait.active = !is_landscape;
        if (this.cash_info_landscape) this.cash_info_landscape.active = is_landscape;
        // 切换 lb_cash_num 横竖屏标签
        if (this.cashSystem) {
            this.cashSystem.setOrientation(is_landscape);
        }
        // 切换 btn_wd 横竖屏节点
        if (this.btn_wd_portrait) this.btn_wd_portrait.active = !is_landscape;
        if (this.btn_wd_landscape) this.btn_wd_landscape.active = is_landscape;
    }

    /** 获取当前方向下活跃的现金标签节点 */
    get_active_cash_label(): Node | null {
        if (!this.cashSystem) return null;
        return this.is_landscape ? this.cash_label_landscape : this.cash_label;
    }

    /**
     * 初始化 SDK 管理器（在 Canvas 节点上查找或创建 SDKManager 组件）
     */
    private _initSDKManager() {
        let canvas = find('Canvas');
        let sdkNode = canvas.getChildByName('sdk_manager');
        if (!sdkNode) {
            sdkNode = new Node('sdk_manager');
            sdkNode.setParent(canvas);
        }
        let sdkComp = sdkNode.getComponent(SDKManager);
        if (!sdkComp) {
            sdkComp = sdkNode.addComponent(SDKManager);
        }
        // 注册 SDK 恢复回调
        sdkComp.onResume(() => {
            // SDK 恢复可见后可用于重新启动游戏逻辑
        });
        console.log('[Game] SDKManager initialized');
    }
    /** 为按钮绑定 click_btn_wd 事件 */
    private _bind_btn_wd(btn: Node) {
        if (!btn) return;
        let button = btn.getComponent(Button);
        if (!button) return;
        let handler = new EventHandler();
        handler.target = this.node;
        handler.component = 'Game';
        handler.handler = 'click_btn_wd';
        button.clickEvents.push(handler);
    }

    /**
     * BtnWd 点击事件：触发下载
     */
    click_btn_wd() {
        SDKManager.instance?.triggerDownload();
    }
}
