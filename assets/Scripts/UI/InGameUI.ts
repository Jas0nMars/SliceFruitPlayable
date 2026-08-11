import Knife from "../Main/Knife"
import Game from "../Main/Game"

const {ccclass, property} = cc._decorator;

@ccclass
export default class InGameUI extends cc.Component {

    @property(cc.Node)
    center_knife_node:cc.Node = null;

    @property(cc.Node)
    guozhi_ui:cc.Node = null;

    @property(cc.Node)
    fruit_effect_ui:cc.Node = null;

    center_knife_node_com:Knife = null;
    is_finished:boolean = true;
    game:Game = null;
    public is_gaming = true;
    combo_kill_num:number = 0;

    init(game:Game){
        this.game = game;
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
}
