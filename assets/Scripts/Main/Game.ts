import { _decorator, Component, Node, SpriteFrame } from "cc";
import FruitPoolMgr from "./FruitPoolMgr";
import InGameUI from "../UI/InGameUI";
import LevelMgr from "../Level/LevelMgr";
import { TrialCompletePopup } from "../UI/TrialCompletePopup";

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

    fruitPoolMgr: FruitPoolMgr = null;
    inGameUI: InGameUI = null;
    levelMgr: LevelMgr = null;
    trialPopup: TrialCompletePopup = null;

    kill_fruit_num: number = 0;

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
    }

    start() {
        this.levelMgr.init(this);
        this.fruitPoolMgr.init(this);
        this.inGameUI.init(this);
    }
}
