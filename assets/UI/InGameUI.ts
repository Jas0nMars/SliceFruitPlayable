import Knife from "../Main/Knife"
import Game from "../Main/Game"

const {ccclass, property} = cc._decorator;

@ccclass
export default class InGameUI extends cc.Component {
    //进度条ui
    @property(cc.Node)
    progress_ui:cc.Node = null;

    @property(cc.Node)
    center_knife_node:cc.Node = null;

    @property(cc.Node)
    left_knife_node:cc.Node = null;

    @property(cc.Node)
    right_knife_node:cc.Node = null;

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

    //影分身
    @property(cc.Node)
    knife_3:cc.Node = null;
     //武器按钮
     @property(cc.Node)
     wuqi_btn:cc.Node = null;

     //影分身次数
     @property(cc.Label)
     knife_3_count_label:cc.Label = null;

     @property(cc.Node)
     get_txt:cc.Node = null;

    //转盘开始按钮
    @property(cc.Node)
    start_btn:cc.Node = null;

    //转盘下次开始ui
    @property(cc.Node)
    next_start_ui:cc.Node = null;
    @property(cc.Node)
    panel_bg:cc.Node = null;


    @property(cc.Node)
    rotate_panel_ui:cc.Node = null;
    //转盘奖励控件
    @property(cc.Node)
    wuqi_reward_ui:cc.Node = null;
    @property(cc.Sprite)
    knife_icon:cc.Sprite = null;
    @property(cc.Node)
    gold_reward_ui:cc.Node = null;
    @property(cc.Label)
    gold_num:cc.Label = null;

    //转盘上奖励的武器
    @property(cc.Sprite)
    zhuanpan_knife:cc.Sprite = null;
    //点击屏幕提示信息
    @property(cc.Node)
    tip_msg:cc.Node = null;
    @property(cc.Node)
    pet_ske:cc.Node = null;

    center_knife_node_com:Knife = null;
    left_knife_com:Knife = null;
    right_knife_com:Knife = null;
    is_finished:boolean = true;
    game:Game = null;
    //影分身次数,默认为0
    knife_3_count = 0;
    //是否是影分身
    is_knife_3 = false;
    //是否在游戏中
    public is_gaming = true;
    //每次发射飞刀连切水果的数量
    combo_kill_num:number = 0;
    //是否是转盘抽奖的监听
    is_zhuanpan_touch:boolean = false;
    //是否射中转盘的武器
    is_shoot_wuqi:boolean = false;
    //转盘上特殊武器的id
    zhuanpan_wuqi_id:number = 0;
    //是否显示影分身次数奖励ui
    is_show_knife3_ui:boolean = false;
    //宠物龙骨动画
    dragonDisplay:dragonBones.ArmatureDisplay = null;
    //正在使用的宠物id
    pet_id:number = 0;

    init(game:Game){
        this.game = game;
        this.init_pet();
        let first_login = this.game.dataMgr.get_first_login();
        if(first_login==0){
            this.tip_msg.active = true;
        }
        this.center_knife_node_com = this.center_knife_node.getComponent("Knife");
        this.center_knife_node_com.init(game);
        this.left_knife_com = this.left_knife_node.getComponent("Knife");
        this.left_knife_com.init(game);
        this.right_knife_com = this.right_knife_node.getComponent("Knife");
        this.right_knife_com.init(game);
        let self = this;
        this.node.on(cc.Node.EventType.TOUCH_START,function(event){
            if(this.is_zhuanpan_touch){
                this.is_zhuanpan_touch = false;
                this.center_knife_node.getComponent(cc.Animation).play("knife_zhuanpan");
                return;
            }
            if(this.is_finished== false || self.is_gaming == false){
                return;
            }
            if(first_login == 0){
                this.game.dataMgr.set_first_login(1);
                this.tip_msg.active = false;
            }
            this.center_knife_node_com.shoot_knife(function(){
                this.is_finished = true;
                if(this.is_knife_3){
                    this.knife_3_count--;
                    if(this.knife_3_count > 0){
                        this.knife_3_count_label.string = "剩余"+this.knife_3_count;
                    }else{
                        if(this.is_show_knife3_ui){
                            this.is_show_knife3_ui = false;
                            this.game.tryKnifeUI.show_knife3_ui(false);
                        }else{
                            this.game.toastUI.show_toast("飞刀影分身已用完！");
                        }
                    }
                }
                this.update_knife_3_state();
            }.bind(this));
            
            if(this.is_knife_3){
                this.left_knife_com.shoot_knife(function(){
                    if(this.knife_3_count <=0){
                        this.left_knife_node.active = false;
                    }
                }.bind(this));
                this.right_knife_com.shoot_knife(function(){
                    if(this.knife_3_count <=0){
                        this.right_knife_node.active = false; 
                    }
                }.bind(this));
            }
            this.is_finished = false;
        }.bind(this),this.node);
    }

    //初始化宠物
    init_pet(){
        this.dragonDisplay = this.pet_ske.getComponent(dragonBones.ArmatureDisplay);
        this.dragonDisplay.addEventListener(dragonBones.EventObject.COMPLETE, this.animationEventHandler, this);
        /*
        this.dragonDisplay = this.pet_ske.getComponent(dragonBones.ArmatureDisplay);
        this.pet_id = this.game.dataMgr.get_cur_pet_id();
        let self = this;
        var image = 'https://yun.wysgy81.cn/wx_game_fruit/v1.0.6/res/pets/pet'+this.pet_id+'_tex.png';
        var ske = 'https://yun.wysgy81.cn/wx_game_fruit/v1.0.6/res/pets/pet'+this.pet_id+'_ske.json';
        var atlas = 'https://yun.wysgy81.cn/wx_game_fruit/v1.0.6/res/pets/pet'+this.pet_id+'_tex.json';
        cc.loader.load(image, (error, texture) => {
            cc.loader.load({ url: atlas, type: 'txt' }, (error, atlasJson) => {
                cc.loader.load({ url: ske, type: 'txt' }, (error, dragonBonesJson) => {
                    var atlas = new dragonBones.DragonBonesAtlasAsset();
                    atlas.atlasJson = atlasJson;
                    atlas.texture = texture;

                    var asset = new dragonBones.DragonBonesAsset();
                    asset.dragonBonesJson = dragonBonesJson;

                    self.dragonDisplay.dragonAtlasAsset = atlas;
                    self.dragonDisplay.dragonAsset = asset;

                    self.dragonDisplay.armatureName = "armatureName";
                    self.dragonDisplay.playAnimation("Idle_1",0);
                    self.dragonDisplay.addEventListener(dragonBones.EventObject.COMPLETE,  self.animationEventHandler, self);

                });
            });
        }); 
        */
       
    }

    

    //宠物动画监听
    animationEventHandler(event){
        if (event.type == dragonBones.EventObject.COMPLETE ) {
            if(this.dragonDisplay.animationName=="Block_Match_1"||this.dragonDisplay.animationName=="Success_1"||this.dragonDisplay.animationName=="Spring_Idle_1"){
                //点击动画播放完毕
                this.dragonDisplay.playAnimation("Idle_1",0);
                //console.log("宠物点击动画播放完毕，播放闲置动画！");
            }
            if(this.dragonDisplay.animationName=="Skill_1"){
                this.dragonDisplay.playAnimation("Idle_1",0);
            }
        } 
    }

    //点击宠物,播放点击动画
    play_touch_pet_anim(){
        this.dragonDisplay.playAnimation("Block_Match_1",1);
    }

    //播放胜利宠物动画
    play_pet_win_anim(){
        this.dragonDisplay.playAnimation("Success_1",1);
    }

    //播放一刀切宠物动画
    play_pet_combo_anim(){
        this.dragonDisplay.playAnimation("Skill_1",1);
    }

    //播放失败宠物动画
    play_pet_fail_anim(){
        this.dragonDisplay.playAnimation("Spring_Idle_1",3);
    }

    //切换宠物皮肤
    change_pet_skin(armatureDisplay:dragonBones.ArmatureDisplay){
        this.dragonDisplay.dragonAtlasAsset = armatureDisplay.dragonAtlasAsset;
        this.dragonDisplay.dragonAsset = armatureDisplay.dragonAsset;
        this.dragonDisplay.armatureName = "armatureName";
        this.dragonDisplay.playAnimation("Idle_1",0);
        this.dragonDisplay.addEventListener(dragonBones.EventObject.COMPLETE,this.animationEventHandler, this);

    }


    change_all_knife_icon(icon:cc.SpriteFrame){
        this.left_knife_com.change_knife_icon(icon);
        this.center_knife_node_com.change_knife_icon(icon);
        this.right_knife_com.change_knife_icon(icon);
    }

    //显示游戏ui
    show_game_ui(){
        this.game.bannerAd.showGameBannerAd();
        this.node.active = true;
        //当分享关闭时隐藏武器和影分身按钮
        if(this.game.isOpenShare==false){
            this.knife_3.active = false;
            this.wuqi_btn.active = false;
        }
    }

    hide_game_ui(){
        this.game.bannerAd.hideGameBannerAd();
        this.node.active = false;
    }

    restart_btn_click(){
        cc.director.loadScene("game_scene");
    }

    update_level_txt(index:number){
        this.progress_sprite.fillStart = 0;
        this.level_label.string = index.toString();
    }

    update_level_progress(progress:number){
        this.progress_sprite.fillStart = progress;
    }

    //影分身按钮点击事件
    knife_3_btn_click(){
        this.game.soundMgr.play_btn_click_audio();
        if(this.knife_3_count > 0){
            return;
        }
        //测试影分身------------------
        //this.add_5_knife_3();

        this.game.tryKnifeUI.show_knife3_ui(true);

        /*
        this.game.share_type = 1;
        this.game.share_time = new Date().getTime();
        let share_func = function(){
            //显示影分身并次数+5次
            this.add_5_knife_3();
        }.bind(this);
        this.game.share_succ_func = share_func;
        this.game.wxUtil.share();
        */
    }

    //显示影分身并次数+5次
    add_5_knife_3(){
        this.game.toastUI.show_toast("获得5次飞刀影分身！");
        this.knife_3_count += 5;
        //显示影分身
        this.show_knife_3();
    }

    show_knife_3(){
        this.is_knife_3 = true;
        this.left_knife_node.x = -40;
        this.left_knife_node.rotation = -30;
        this.left_knife_node.active = true;
        this.right_knife_node.rotation = 30;
        this.right_knife_node.x = 40;
        this.right_knife_node.active = true;
        this.center_knife_node.getComponent(cc.Animation).play("knife_idle");
        this.left_knife_node.getComponent(cc.Animation).play("knife_idle");
        this.right_knife_node.getComponent(cc.Animation).play("knife_idle");
        //并更新影分身的数量
        this.get_txt.active = false;
        this.knife_3_count_label.node.active = true;
        this.knife_3_count_label.string = "剩余"+this.knife_3_count;
    }

    update_knife_3_state(){
        if(this.knife_3_count <=0){
            this.is_knife_3 = false;
            this.knife_3_count_label.node.active = false;
            this.get_txt.active = true;
        }
    }

    //显示转盘抽奖ui
    show_zhuanpan_ui(){
        this.game.bannerAd.showGameBannerAd();
        this.rotate_panel_ui.active = true;
        this.left_knife_node.active = false;
        this.right_knife_node.active = false;
        this.center_knife_node.active = false;
        this.start_btn.active = true;
        this.next_start_ui.active = false;
        this.rotate_panel_ui.getChildByName("panel_bg").rotation = 0;
        //随机一个特殊武器
        this.zhuanpan_wuqi_id = 48 + Math.floor(Math.random()*16);
        this.zhuanpan_knife.spriteFrame = this.game.wuqiUI.wuqi_icons[this.zhuanpan_wuqi_id];
    }

    //隐藏转盘抽奖ui
    hide_zhuanpan_ui(){
        this.rotate_panel_ui.active = false;
        this.center_knife_node.getComponent(cc.Animation).play("knife_idle");
    }

    //转盘开始抽奖按钮点击
    zhuanpan_start_click(){
        this.game.soundMgr.play_btn_click_audio();
        this.is_zhuanpan_touch = true;
        this.is_shoot_wuqi = false;
        this.start_btn.active = false;
        this.center_knife_node.active = true;
        this.center_knife_node.getComponent(cc.Animation).play("knife_idle");
        this.rotate_panel_ui.getChildByName("panel_bg").getComponent(cc.Animation).play();
    }

    //点击再转一次转盘
    zhuanpan_restart_click(){
        this.game.soundMgr.play_btn_click_audio();
        this.game.share_type = 1;
        this.game.share_time = new Date().getTime();
        let share_func = function(){
            //再转一次转盘
            this.restart_zhuanpan();
        }.bind(this);
        this.game.share_succ_func = share_func;
        this.game.wxUtil.share();
    }

    //再转一次转盘
    restart_zhuanpan(){
        this.is_zhuanpan_touch = true;
        this.next_start_ui.active = false;
        if(this.is_shoot_wuqi){
            //随机一个特殊武器
            let r_num = 48 + Math.floor(Math.random()*16);
            if(r_num == this.zhuanpan_wuqi_id){
                this.zhuanpan_wuqi_id = 48 + Math.floor(Math.random()*16);
            }else{
                this.zhuanpan_wuqi_id = r_num;
            }
            this.zhuanpan_knife.spriteFrame = this.game.wuqiUI.wuqi_icons[this.zhuanpan_wuqi_id];
        }
        this.zhuanpan_start_click();
    }

    //停止转盘并给出转盘奖励
    stop_zhuanpan(){
        this.is_zhuanpan_touch = false;
        this.panel_bg.getComponent(cc.Animation).stop();
        this.zhuanpan_reward();
        //震动1次
        if(typeof(wx) != 'undefined') {
            wx.vibrateShort();
        }
    }

    //获得转盘的奖励
    zhuanpan_reward(){
        this.next_start_ui.active = true;
        //给奖励
        let rotation = this.panel_bg.rotation;
        if(rotation >= 360){
            rotation %= 360;
        }
        //声明奖励变量
        let reward_gold = 0;
        if(rotation>=0 && rotation < 60){//1.20金币
            reward_gold = 20
        }else if(rotation>=60 && rotation < 105){//2.100金币
            reward_gold = 100
        }else if(rotation>=105 && rotation < 150){//3.10金币
            reward_gold = 10
        }else if(rotation>=150 && rotation <= 170){//4.飞刀
            this.is_shoot_wuqi = true;
            reward_gold = -1
        }else if(rotation>170 && rotation < 238){//5.20金币
            reward_gold = 20
        }else if(rotation>=238 && rotation < 282){//6.50金币
            reward_gold = 50
        }else if(rotation>=282 && rotation < 328){//7.10金币
            reward_gold = 10
        }else if(rotation>=328 && rotation <= 360){//8.80金币
            reward_gold = 80
        }
        if(reward_gold > 0){
            this.wuqi_reward_ui.active = false;
            this.gold_reward_ui.active = true;
            this.gold_num.string = "+"+reward_gold;
            this.game.baseBgUI.plus_total_gold(reward_gold);
            this.game.toastUI.show_toast("您获得了"+reward_gold+"金币!");
        }else{
            let is_own = this.game.wuqiUI.check_knife_enabel(this.zhuanpan_wuqi_id);
            this.wuqi_reward_ui.active = true;
            this.gold_reward_ui.active = false;
            this.knife_icon.spriteFrame = this.zhuanpan_knife.spriteFrame;
            if(is_own){
                this.game.toastUI.show_toast("该武器已获得!");
            }else{
                this.game.toastUI.show_toast("恭喜解锁新武器哦!");
                //设置武器未永久解锁武器
                this.game.wuqiUI.get_always_knife(this.zhuanpan_wuqi_id);
            }
        }
    }

    home_btn_click(){
        this.game.soundMgr.play_btn_click_audio();
        this.hide_zhuanpan_ui();
        this.hide_game_ui();
        this.game.inGameUI.is_gaming = true;
        this.game.homeUI.show_home_ui();
    }   

    next_btn_click(){
        this.game.soundMgr.play_btn_click_audio();
        this.hide_zhuanpan_ui();
        this.game.inGameUI.is_gaming = true;
        this.game.levelMgr.start_level();
    }

    
    set_is_game(value:boolean){
        this.is_gaming = value;
    }

    wuqi_btn_clikc(){
        this.game.soundMgr.play_btn_click_audio();
        this.node.x = 3000;
        this.game.wuqiUI.show_wuqi_ui(2);
    }

}
