import Knife from "../Main/Knife"
import Game from "../Main/Game"

const {ccclass, property} = cc._decorator;

@ccclass
export default class InGameUI extends cc.Component {
    //进度条UI
    @property(cc.Node)
    progress_ui:cc.Node = null;

    @property(cc.Node)
    center_knife_node:cc.Node = null;

    @property(cc.Node)
    half_ui:cc.Node = null;

    @property(cc.Node)
    guozhi_ui:cc.Node = null;

    @property(cc.Node)
    fruit_effect_ui:cc.Node = null;

    //当前关卡
    @property(cc.Label)
    level_label:cc.Label = null;

    //进度条
    @property(cc.Sprite)
    progress_sprite:cc.Sprite = null;

    //一刀切
    @property(cc.Node)
    one_kill:cc.Node = null;

    //点击屏幕提示信息
    @property(cc.Node)
    tip_msg:cc.Node = null;

    center_knife_node_com:Knife = null;
    is_finished:boolean = true;
    game:Game = null;
    //是否在游戏中
    public is_gaming = true;
    //每次发射飞刀连切水果的数量
    combo_kill_num:number = 0;

    init(game:Game){
        this.game = game;
        let first_login = 1;//试玩广告默认已引导
        if(this.tip_msg){
            this.tip_msg.active = false;
        }
        this.center_knife_node_com = this.center_knife_node.getComponent("Knife");
        this.center_knife_node_com.init(game);

        this.node.on(cc.Node.EventType.TOUCH_START,function(event){
            if(this.is_finished== false || this.is_gaming == false){
                return;
            }
            this.center_knife_node_com.shoot_knife(function(){
                this.is_finished = true;
            }.bind(this));
            this.is_finished = false;
        }.bind(this),this.node);
    }

    //显示游戏ui
    show_game_ui(){
        this.node.active = true;
    }

    hide_game_ui(){
        this.node.active = false;
    }

    update_level_txt(index:number){
        this.progress_sprite.fillStart = 0;
        this.level_label.string = index.toString();
    }

    update_level_progress(progress:number){
        this.progress_sprite.fillStart = progress;
    }

    set_is_game(value:boolean){
        this.is_gaming = value;
    }
}
