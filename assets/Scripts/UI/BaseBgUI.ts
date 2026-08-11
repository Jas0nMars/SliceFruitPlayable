import Game from "../Main/Game"


const {ccclass, property} = cc._decorator;

@ccclass
export default class BaseBgUI extends cc.Component {
    
    //当前关卡
    @property(cc.Label)
    gold_label:cc.Label = null;
    @property(cc.Node)
    cur_level_gold_txt:cc.Node = null;
    @property(cc.Node)
    gold_icon:cc.Node = null;
    @property(cc.Node)
    gold_ui:cc.Node = null;

    game:Game = null;
    total_gold:number = 0;
    cur_level_gold:number = 0;
    
    init(game:Game){
        this.game = game;
        this.total_gold = this.game.dataMgr.get_total_gold();
        this.gold_label.string = this.total_gold.toString();
        this.adapt_iphoneX_ui();
    }

    adapt_iphoneX_ui(){
        if(typeof(wx) == 'undefined'){
            return;
        }
        let self = this;
        wx.getSystemInfo({
            success: function (res) {
                //console.log("手机型号:"+res.model)
                let screen_ratio = self.game.screenH / self.game.screenW;
                //判断用户手机是iPhone X
                if (res.model.indexOf('iPhone X') != -1|| screen_ratio > 2) {
                    //console.log("用户手机是iPhone X")
                    self.game.is_iphoneX = true;
                    self.node.getChildByName("beijing_ske").getComponent(cc.Widget).top = 65;
                    self.node.getChildByName("gold_ui").getComponent(cc.Widget).top = 113;
                    self.node.getChildByName("hua").getComponent(cc.Widget).top = 240;
                    self.game.inGameUI.progress_ui.getComponent(cc.Widget).top = 74;
                }else{
                    self.game.is_iphoneX = false;
                }
            },
            fail:function(res){

            }
        });
    }
    plus_total_gold(num:number){
        this.total_gold += num;
        this.gold_label.string = this.total_gold.toString();
        this.game.dataMgr.set_total_gold(this.total_gold);
    }

    minus_total_gold(num:number){
        this.total_gold -= num;
        this.gold_label.string = this.total_gold.toString();
        this.game.dataMgr.set_total_gold(this.total_gold);
    }

    plus_cur_level_gold(num){
        this.cur_level_gold += num;
        this.gold_label.string = this.cur_level_gold.toString();
    }

    plus_cur_gold_2_total_gold(){
        this.plus_total_gold(this.cur_level_gold);
    }

    show_level_gold_ui(){
        this.gold_ui.active = true;
        //this.cur_level_gold = 0;
        this.gold_label.string = this.cur_level_gold.toString();
        this.cur_level_gold_txt.active = true;
        this.gold_label.node.x = -226;
        this.gold_icon.x = -248;
    }

    show_home_gold_ui(){
        this.gold_ui.active = true;
        //this.plus_total_gold(this.cur_level_gold);
        this.cur_level_gold_txt.active = false;
        this.gold_label.node.x = -260;
        this.gold_icon.x = -284;
        this.gold_label.string = this.total_gold.toString();
    }

    
}
