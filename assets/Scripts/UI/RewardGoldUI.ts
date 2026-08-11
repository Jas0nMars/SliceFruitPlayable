
import Game from "../Main/Game"

const {ccclass, property} = cc._decorator;

@ccclass
export default class RewardGoldUI extends cc.Component {

    
    game:Game = null;
    //奖励的金币数量
    gold_num:number = 0;

    init(game:Game){
        this.game = game;
    }

    show_rewardGold_ui(gold_num:number){
        this.gold_num = gold_num;
        this.node.active = true;
    }
  
    sure_btn_click(){
        this.game.soundMgr.play_btn_click_audio();
        this.game.baseBgUI.plus_total_gold(this.gold_num);
        this.node.active = false;
    }
}
