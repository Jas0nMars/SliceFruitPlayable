import Game from "./Game"
import Fruit from "./Fruit";
import FruitData from "./FruitData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Knife extends cc.Component {
    //飞刀的类型: 0左边飞刀  1中间飞刀 2右边飞刀
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

    //切换武器
    change_knife_icon(knife_icon:cc.SpriteFrame){
        this.node.getComponent(cc.Sprite).spriteFrame = knife_icon;
    }

    //发射飞到
    shoot_knife(finish_func){
        this.node.rotation = 0;
        let x =  0;
        if(this.knife_type == 0){//左边飞刀
            x  = -100
        }else if(this.knife_type == 1){//中间飞刀
           
            //播放飞刀声音
            this.game.soundMgr.play_shoot_audio();
            x  = 0
        }else if(this.knife_type == 2){//右边飞刀
           x  = 100
        }
        this.node.x = x;
        this.play_rotate_anim();
        //飞到移动
        let move = cc.moveTo(0.6,cc.v2(x * 2,this.height-300));
        let end_func = function(){
            if(this.knife_type == 1){
                this.update_try_knife_count();
                //计算获取的金币
                if(this.game.inGameUI.combo_kill_num > 0){//切中水果
                    let cur_gold = 0;
                    if(this.game.inGameUI.combo_kill_num <= 7 ){
                        cur_gold = FruitData.kill_combo_gold[this.game.inGameUI.combo_kill_num-1];
                    }else{
                        cur_gold = (this.game.inGameUI.combo_kill_num - 7)*10 + 20;
                    }
                    this.game.baseBgUI.plus_cur_level_gold(cur_gold);
                    this.game.levelMgr.level_get_gold += cur_gold;
                    //判断是否一刀切
                    if(this.game.inGameUI.combo_kill_num==this.game.levelMgr.cur_wave_total){
                        //一刀切
                        this.game.levelMgr.is_one_kill = true;
                        this.game.inGameUI.play_pet_combo_anim();
                        this.game.inGameUI.one_kill.getComponent(cc.Animation).play();
                    }
                }else{//未切中水果，游戏失败
                    this.game.inGameUI.play_pet_fail_anim();
                    this.game.soundMgr.play_fail_audio();
                    this.game.inGameUI.is_gaming = false;
                    if(this.game.isOpenShare){
                        this.game.bannerAd.hideGameBannerAd();
                        this.game.rebirthUI.show_rebirth_ui();
                    }else{
                        this.game.levelMgr.reset_level_state();
                        this.game.inGameUI.hide_game_ui();
                        this.game.baseBgUI.show_home_gold_ui();
                        //跳转到游戏结束界面
                        this.game.gameoverUI.show_gameover_ui();
                    }
                }
                //重置连切数量
                this.game.inGameUI.combo_kill_num = 0;
            }
            //飞到移动到最顶部后，复原归位
            this.node.y = this.knife_y;
            this.play_idle_anim();
            if(finish_func){
                finish_func();
            }
        }.bind(this);
        this.node.runAction(cc.sequence([move,cc.callFunc(end_func)]));
    }

    //判断试用武器次数是否使用完
    update_try_knife_count(){
        if(this.game.wuqiUI.is_try_knife){
            this.game.wuqiUI.try_knife_count--;
            if(this.game.wuqiUI.try_knife_count==0){
                this.game.toastUI.show_toast("体验武器次数已用完！");
                this.game.wuqiUI.is_try_knife = false;
                this.game.dataMgr.set_try_knife_count(0);
                this.game.wuqiUI.pre_cell_com.hide_try_knife_icon();
                this.game.wuqiUI.load_cur_select_own_knife();
            }else{
                this.game.dataMgr.set_try_knife_count(this.game.wuqiUI.try_knife_count);
            }
        }
    }

    //播放飞到旋转动画
    play_rotate_anim(){
        this.knife_anim.play("knife_rotate");
    }

    //播放飞到上下浮动动画
    play_idle_anim(){
        if(this.knife_type == 0){
            this.node.x = -40;
            this.node.y = -390;
            this.node.rotation = -30;
        }else if(this.knife_type ==1){
            this.node.x = 0;
            this.node.y = -380;
            this.node.rotation = 0;
        }else if(this.knife_type == 2){
            this.node.x = 40;
            this.node.y = -390;
            this.node.rotation = 30;
        }       
        this.knife_anim.play("knife_idle");
    }

    onCollisionEnter(other:cc.Collider, self:cc.Collider){
        //播放水果被切的声音
        this.game.soundMgr.play_kill_fruit_audio();
        let fruit_node = other.node;
        let fruit_com = fruit_node.getComponent("Fruit");
        if(fruit_com.is_killed){
            return;
        }
        fruit_com.is_killed = true;
        let fruit_type = fruit_com.fruit_type - 1;
        //坐标系转换
        //1.将fruit_node的坐标转换到世界坐标
        let fruit_w_pos = fruit_node.parent.convertToWorldSpaceAR(fruit_node.getPosition());
        //2.将世界坐标转换到map坐标系
        let fruit_h_pos = this.game.inGameUI.half_ui.convertToNodeSpaceAR(fruit_w_pos);
        fruit_node.active = false;
        //this.game.fruitPoolMgr.returnFruit(fruit_node.parent);
        //左边半个水果
        let left_fruit = this.game.fruitPoolMgr.requestLeftFruit();
        left_fruit.getComponent(cc.Sprite).spriteFrame = this.game.fruit_half_imgs[fruit_type];
        this.game.inGameUI.half_ui.addChild(left_fruit);
        left_fruit.x = fruit_h_pos.x-17;
        left_fruit.y = fruit_h_pos.y;
        left_fruit.getComponent("HalfFruitAnim").show_half_fruit_move(this.game.kill_fruit_num);
        //右边半个水果
        let right_fruit = this.game.fruitPoolMgr.requestRightFruit();
        right_fruit.getComponent(cc.Sprite).spriteFrame = this.game.fruit_half_imgs[fruit_type];
        this.game.inGameUI.half_ui.addChild(right_fruit);
        right_fruit.x = fruit_h_pos.x+17;
        right_fruit.y = fruit_h_pos.y;
        right_fruit.getComponent("HalfFruitAnim").show_half_fruit_move(this.game.kill_fruit_num);
        //果汁特效
        let guozhi_node = this.game.fruitPoolMgr.requestGuozhiEffect();
        this.game.inGameUI.guozhi_ui.addChild(guozhi_node);
        guozhi_node.x = fruit_h_pos.x;
        guozhi_node.y = fruit_h_pos.y;
        //水果特效
        let fruit_effect = null;
        //果汁颜色:0 红色，1 绿色，2 黄色, 3 白色
        if(fruit_com.color_type==0){//红色
            fruit_effect = this.game.fruitPoolMgr.requestRedFruitEffect();
            guozhi_node.getComponent(cc.ParticleSystem).spriteFrame = this.game.fruitPoolMgr.guozhi_icons[0];
            guozhi_node.getComponent(cc.ParticleSystem).resetSystem();
        }else if(fruit_com.color_type==1){//绿色
            fruit_effect = this.game.fruitPoolMgr.requestGreenFruitEffect();
            guozhi_node.getComponent(cc.ParticleSystem).spriteFrame = this.game.fruitPoolMgr.guozhi_icons[1];
            guozhi_node.getComponent(cc.ParticleSystem).resetSystem();
        }else if(fruit_com.color_type==2){//黄色
            fruit_effect = this.game.fruitPoolMgr.requestYellowFruitEffect();
            guozhi_node.getComponent(cc.ParticleSystem).spriteFrame = this.game.fruitPoolMgr.guozhi_icons[2];
            guozhi_node.getComponent(cc.ParticleSystem).resetSystem();
        }else{
            fruit_effect = this.game.fruitPoolMgr.requestWhiteFruitEffect();
            guozhi_node.getComponent(cc.ParticleSystem).spriteFrame = this.game.fruitPoolMgr.guozhi_icons[3];
            guozhi_node.getComponent(cc.ParticleSystem).resetSystem();
        }
        this.game.inGameUI.fruit_effect_ui.addChild(fruit_effect);
        fruit_effect.x = fruit_h_pos.x;
        fruit_effect.y = fruit_h_pos.y;
        fruit_effect.getComponent("FruitEffect").play_fruit_effect();
        
        this.scheduleOnce(function(){
            this.game.fruitPoolMgr.returnGuozhiEffect(guozhi_node);
        }.bind(this),1.1);
        this.game.levelMgr.update_kill_fruit();
        //果盘里增加水果切片
        this.game.sliceMgr.add_slice(fruit_type);
        this.game.kill_fruit_num++;
        this.game.inGameUI.combo_kill_num++;
        //更新切的水果进度
        this.game.levelMgr.update_level_progress();
        //震动1次
        if(typeof(wx) != 'undefined') {
            wx.vibrateShort();
        }
    }


    //飞到射转盘完成
    shoot_zhuanpan_finished(){
        this.game.inGameUI.stop_zhuanpan();
    }

    
}
