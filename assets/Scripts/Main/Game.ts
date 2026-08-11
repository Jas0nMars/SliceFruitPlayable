
import Knife from "./Knife"
import FruitPoolMgr from "./FruitPoolMgr"
import InGameUI from "../UI/InGameUI"
import LevelMgr from "../Level/LevelMgr"
import ToastUI from "../UI/ToastUI"

const {ccclass, property} = cc._decorator;

@ccclass
export default class Game extends cc.Component {

    @property(cc.Node)
    game_ui:cc.Node = null;

    @property(cc.Node)
    toast_ui:cc.Node = null;

    @property([cc.SpriteFrame])
    fruit_imgs:Array<cc.SpriteFrame> = [];

    knife:Knife = null;
    fruitPoolMgr:FruitPoolMgr = null;
    inGameUI:InGameUI = null;
    levelMgr:LevelMgr = null;
    toastUI:ToastUI = null;

    kill_fruit_num:number = 0;

    onLoad(){
        this.fruitPoolMgr = this.node.getComponent("FruitPoolMgr");
        this.inGameUI = this.game_ui.getComponent("InGameUI");
        this.levelMgr = this.node.getComponent("LevelMgr");
        this.toastUI = this.toast_ui.getComponent("ToastUI");
    }

    start(){
        this.levelMgr.init(this);
        this.fruitPoolMgr.init(this);
        this.inGameUI.init(this);
    }

}
