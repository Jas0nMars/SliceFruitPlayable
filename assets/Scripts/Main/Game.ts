import { _decorator, Component, Node, SpriteFrame, find, Prefab } from "cc";
import FruitPoolMgr from "./FruitPoolMgr";
import InGameUI from "../UI/InGameUI";
import LevelMgr from "../Level/LevelMgr";
import { TrialCompletePopup } from "../UI/TrialCompletePopup";
import { CashSystem } from "./CashSystem";
import { I18nManager } from "./I18nManager";

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
    cash_label: Node = null; // 现金标签节点（cash_fly 飞向此节点）

    @property({ type: Prefab, tooltip: '现金飞行预制体' })
    cash_fly_prefab: Prefab = null;

    fruitPoolMgr: FruitPoolMgr = null;
    inGameUI: InGameUI = null;
    levelMgr: LevelMgr = null;
    trialPopup: TrialCompletePopup = null;
    cashSystem: CashSystem = null;

    kill_fruit_num: number = 0;
    is_level_ended: boolean = false; // 关卡是否已结束（防止重复触发）

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

        // 初始化现金系统
        let canvas = find('Canvas');
        this.cashSystem = new CashSystem(
            canvas,
            this.cash_label,
            null,
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
    }
}
