import Game from "../Main/Game"


const {ccclass, property} = cc._decorator;

@ccclass
export default class TryKnifeUI extends cc.Component {

    @property(cc.Node)
    new_wuqi_ui:cc.Node = null;
    @property(cc.Node)
    knife3_ui:cc.Node = null;
    @property(cc.Sprite)
    knife_icon:cc.Sprite = null;
    @property(cc.Sprite)
    reward_knife:cc.Sprite = null;
    @property(cc.Node)
    reward_wuqi_ui:cc.Node = null;

    @property(cc.Sprite)
    kinfe3_title_sprite:cc.Sprite = null;
    @property(cc.SpriteFrame)
    try_end_txt:cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    free_get_txt:cc.SpriteFrame = null;

    @property(cc.Sprite)
    icon_sprite:cc.Sprite = null;
    @property(cc.Sprite)
    new_wuqi_icon:cc.Sprite = null;
    //视频和分享图标
    @property(cc.SpriteFrame)
    share_icon:cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    video_icon:cc.SpriteFrame = null;

    game:Game = null;
    knife_id:number = 0;

    init(game:Game){
        this.game = game;
    }

    //显示新武器体验10次ui
    show_new_wuqi_ui(){
        this.node.active = true;
        this.new_wuqi_ui.active = true;
        this.knife3_ui.active = false;
        this.knife_id = this.get_disable_knife_id();
        this.knife_icon.spriteFrame = this.game.wuqiUI.wuqi_icons[this.knife_id];
        /*
        if(this.game.is_videoAd_succ){
            this.new_wuqi_icon.spriteFrame = this.video_icon;
        }else{
            this.new_wuqi_icon.spriteFrame = this.share_icon;
        }*/
    }

    //点击关闭按钮
    close_new_wuqi(){
        //获取10次体验机会
        this.game.wuqiUI.get_try_knife_10(this.knife_id)
        this.hide_try_knife_ui();
    }

     //点击关闭按钮
    close_knife3_ui(){
        this.hide_try_knife_ui();
    }


    //获取5次影分身次数
    get_knife3_count(){
        /*if(this.game.is_videoAd_succ){
            //看视频获取影分身
            let succ_func = function(){
                this.game.toastUI.show_toast("您获得了5次飞刀影分身！");
                //获取5次影分身
                this.game.inGameUI.knife_3_count += 5;
                this.game.inGameUI.show_knife_3();
                this.hide_try_knife_ui();
            }.bind(this);
            let fail_func = function(){
                this.icon_sprite.spriteFrame = this.share_icon;
                this.game.is_videoAd_succ = false;
            }.bind(this);
            this.game.videoAd.play_knife3_video_ad(succ_func,fail_func);
        }else{*/

            //分享获取影分身5次
            this.game.soundMgr.play_btn_click_audio();
            this.game.share_type = 1;
            this.game.share_time = new Date().getTime();
            let share_func = function(){
                this.game.toastUI.show_toast("您获得了5次飞刀影分身！");
                //获取5次影分身
                this.game.inGameUI.knife_3_count += 5;
                this.game.inGameUI.show_knife_3();
                this.hide_try_knife_ui();
            }.bind(this);
            this.game.share_succ_func = share_func;
            this.game.wxUtil.share();
        //}
    }

    //分享或看视频获取永久武器
    get_always_knife(){
        /*if(this.game.is_videoAd_succ){//视频
            let succ_func = function(){
                this.new_wuqi_ui.active = false;
                //获取永久武器
                this.game.wuqiUI.get_always_knife(this.knife_id);
                this.show_knife_reward_ui();
            }.bind(this);
            let fail_func = function(){
                this.new_wuqi_icon.spriteFrame = this.share_icon;
                this.game.is_videoAd_succ = false;
            }.bind(this);
            this.game.videoAd.play_aways_knife_video_ad(succ_func,fail_func);
        }else{*/
            
            //分享
            this.game.soundMgr.play_btn_click_audio();
            this.game.share_type = 1;
            this.game.share_time = new Date().getTime();
            let share_func = function(){
                this.new_wuqi_ui.active = false;
                //获取永久武器
                this.game.wuqiUI.get_always_knife(this.knife_id);
                this.show_knife_reward_ui();
            }.bind(this);
            this.game.share_succ_func = share_func;
            this.game.wxUtil.share();
        //}
       
    }

    show_knife3_ui(is_click:boolean){
        this.node.active = true;
        this.new_wuqi_ui.active = false;
        this.knife3_ui.active = true;
        if(is_click){
            this.kinfe3_title_sprite.spriteFrame = this.free_get_txt;
        }else{
            this.kinfe3_title_sprite.spriteFrame = this.try_end_txt;
        }
        this.icon_sprite.spriteFrame = this.share_icon;
    }

    //隐藏武器使用ui
    hide_try_knife_ui(){
        this.node.active = false;
    }


    //从未获取的武器里随机获取一把武器
    get_disable_knife_id(){
       for(let i=0;i<=3;i++){
           let disable_arr = this.game.wuqiUI.get_disable_wuqi_arr(i);
           if(disable_arr.length != 0){
               let r_num = Math.floor(Math.random()*disable_arr.length);
               return disable_arr[r_num];
           }
       }
       let id = Math.floor(Math.random()*64);
       return id;
    }

    //显示奖励永久武器ui
    show_knife_reward_ui(){
        this.reward_wuqi_ui.active = true;
        this.reward_knife.spriteFrame = this.game.wuqiUI.wuqi_icons[this.knife_id];
    }

    //点击获取武器确定按钮
    get_knife_btn_click(){
        this.game.soundMgr.play_btn_click_audio();
        this.reward_wuqi_ui.active = false;
        this.hide_try_knife_ui();
    }

}
