import { _decorator, Component, Node, SpriteFrame } from "cc";
import FruitPoolMgr from "./FruitPoolMgr";
import InGameUI from "../UI/InGameUI";
import LevelMgr from "../Level/LevelMgr";

const { ccclass, property } = _decorator;

@ccclass
export default class Game extends Component {

    @property(Node)
    game_ui: Node = null;

    @property([SpriteFrame])
    fruit_imgs: Array<SpriteFrame> = [];

    fruitPoolMgr: FruitPoolMgr = null;
    inGameUI: InGameUI = null;
    levelMgr: LevelMgr = null;

    kill_fruit_num: number = 0;

    onLoad() {
        this.fruitPoolMgr = this.node.getComponent(FruitPoolMgr);
        this.inGameUI = this.game_ui.getComponent(InGameUI);
        this.levelMgr = this.node.getComponent(LevelMgr);
    }

    start() {
        this.levelMgr.init(this);
        this.fruitPoolMgr.init(this);
        this.inGameUI.init(this);
    }
}
