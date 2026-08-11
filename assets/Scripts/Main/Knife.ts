import Game from "./Game"
import Fruit from "./Fruit";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Knife extends cc.Component {
    @property(cc.Integer)
    knife_type:number = 1;

    game:Game = null;
    height:number = 0;
    width:number = 0;
    knife_anim:cc.Animation = null;
    knife_y:number = 0;

    onLoad(){
        this.height = cc.view.getVisibleSize().height;
        this.width = cc.view.getVisibleSize().width;
        this.knife_anim = this.node.getComponent(cc.Animation);
        this.knife_y = this.node.y;
    }

    init(game:Game){
        this.game = game;
    }

    //发射飞刀
    shoot_knife(finish_func){
        this.node.rotation = 0;
        let x = 0;
        this.node.x = x;
        this.play_rotate_anim();
        let move = cc.moveTo(0.6,cc.v2(x,this.height-300));
        let end_func = function(){
            if(this.knife_type == 1){
                if(this.game.inGameUI.combo_kill_num > 0){//切中水果
                }else{//未切中水果
                    this.game.inGameUI.is_gaming = false;
                    this.game.toastUI.show_toast("未切中水果!");
                    this.scheduleOnce(function(){
                        this.game.levelMgr.reset_level_state();
                        this.game.levelMgr.cur_wave_idx = 0;
                        this.game.levelMgr.start_wave();
                    }.bind(this), 1.5);
                }
                this.game.inGameUI.combo_kill_num = 0;
            }
            this.node.y = this.knife_y;
            this.play_idle_anim();
            if(finish_func){
                finish_func();
            }
        }.bind(this);
        this.node.runAction(cc.sequence([move,cc.callFunc(end_func)]));
    }

    play_rotate_anim(){
        this.knife_anim.play("knife_rotate");
    }

    play_idle_anim(){
        this.node.x = 0;
        this.node.y = -380;
        this.node.rotation = 0;
        this.knife_anim.play("knife_idle");
    }

    onCollisionEnter(other:cc.Collider, self:cc.Collider){
        let fruit_node = other.node;
        let fruit_com = fruit_node.getComponent("Fruit");
        if(fruit_com.is_killed){
            return;
        }
        fruit_com.is_killed = true;
        //坐标系转换
        let fruit_w_pos = fruit_node.parent.convertToWorldSpaceAR(fruit_node.getPosition());
        let fruit_h_pos = this.game.inGameUI.fruit_effect_ui.convertToNodeSpaceAR(fruit_w_pos);
        fruit_node.active = false;

        //果汁粒子特效
        let guozhi_node = this.game.fruitPoolMgr.requestGuozhiEffect();
        this.game.inGameUI.guozhi_ui.addChild(guozhi_node);
        guozhi_node.x = fruit_h_pos.x;
        guozhi_node.y = fruit_h_pos.y;
        guozhi_node.getComponent(cc.ParticleSystem).spriteFrame = this.game.fruitPoolMgr.guozhi_icon;
        guozhi_node.getComponent(cc.ParticleSystem).resetSystem();

        //水果爆裂特效（直接显示 FruitEffect）
        let fruit_effect = this.game.fruitPoolMgr.requestWhiteFruitEffect();
        this.game.inGameUI.fruit_effect_ui.addChild(fruit_effect);
        fruit_effect.x = fruit_h_pos.x;
        fruit_effect.y = fruit_h_pos.y;
        fruit_effect.getComponent("FruitEffect").play_fruit_effect();

        this.scheduleOnce(function(){
            this.game.fruitPoolMgr.returnGuozhiEffect(guozhi_node);
        }.bind(this),1.1);

        this.game.levelMgr.update_kill_fruit();
        this.game.kill_fruit_num++;
        this.game.inGameUI.combo_kill_num++;
    }
}
