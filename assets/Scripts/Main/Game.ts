
import Knife from "./Knife"
import FruitPoolMgr from "./FruitPoolMgr"
import InGameUI from "../UI/InGameUI"
import LevelMgr from "../Level/LevelMgr"
import SliceMgr from "./SliceMgr"
import ToastUI from "../UI/ToastUI"
import TrialCompletePopup from "../UI/TrialCompletePopup"

const {ccclass, property} = cc._decorator;

@ccclass
export default class Game extends cc.Component {

    @property(cc.Node)
    game_ui:cc.Node = null;

    @property(cc.Node)
    toast_ui:cc.Node = null;

    @property(cc.Node)
    trial_popup_ui:cc.Node = null;

    @property([cc.SpriteFrame])
    fruit_imgs:Array<cc.SpriteFrame> = [];

    @property([cc.SpriteFrame])
    fruit_half_imgs:Array<cc.SpriteFrame> = [];

    @property(cc.Node)
    fruit_slices:cc.Node = null;

    knife:Knife = null;
    fruitPoolMgr:FruitPoolMgr = null;
    inGameUI:InGameUI = null;
    levelMgr:LevelMgr = null;
    sliceMgr:SliceMgr = null;
    toastUI:ToastUI = null;
    trialPopup:TrialCompletePopup = null;

    kill_fruit_num:number = 0;

    onLoad(){
        this.fruitPoolMgr = this.node.getComponent("FruitPoolMgr");
        this.inGameUI = this.game_ui.getComponent("InGameUI");
        this.levelMgr = this.node.getComponent("LevelMgr");
        this.sliceMgr = this.fruit_slices.getComponent("SliceMgr");
        this.toastUI = this.toast_ui.getComponent("ToastUI");
        this.trialPopup = this.trial_popup_ui.getComponent("TrialCompletePopup");
    }

    start(){
        this.levelMgr.init(this);
        this.fruitPoolMgr.init(this);
        this.inGameUI.init(this);
        this.sliceMgr.init(this);
    }

    // 显示试玩完成弹窗
    show_trial_complete(){
        if(this.trialPopup){
            this.trialPopup.show();
        }
    }

    // 再玩一次
    replay_game(){
        if(this.trialPopup){
            this.trialPopup.hide();
        }
        this.kill_fruit_num = 0;
        this.levelMgr.restart_cur_level();
    }
}
