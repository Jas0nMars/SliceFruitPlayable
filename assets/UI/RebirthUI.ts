import Game from "../Main/Game"

const {ccclass, property} = cc._decorator;

@ccclass
export default class RebirthUI extends cc.Component {

    @property(cc.Label)
    countdown_label:cc.Label = null;
    @property(cc.Sprite)
    icon_sprite:cc.Sprite = null;
    //视频广告图标
    @property(cc.SpriteFrame)
    video_icon:cc.SpriteFrame = null;
    //分享图标
    @property(cc.SpriteFrame)
    share_icon:cc.SpriteFrame = null;

    is_rebirth:boolean = false;
    countdown:number = 10;
    game:Game = null;
    //是否是视频复活
    is_video:boolean = false;

    init(game:Game){
        this.game = game;
    }

    //显示复活界面
    show_rebirth_ui(){
        this.game.bannerAd.showRebirthBannerAd();
        this.node.active = true;
        if(this.game.is_videoAd_succ){
            this.video_rebirth_ui();
        }else{
            this.share_rebirth_ui();
        }

    }

    //看视频复活
    video_rebirth_ui(){
        this.unscheduleAllCallbacks();
        this.icon_sprite.spriteFrame = this.video_icon;
        this.is_video = true;
        this.countdown = 5;
        this.countdown_label.string = this.countdown.toString();
        this.schedule(this.start_countdown.bind(this),1);
    }


    //分享复活
    share_rebirth_ui(){
        this.unscheduleAllCallbacks();
        this.icon_sprite.spriteFrame = this.share_icon;
        this.is_video = false;
        this.countdown = 5;
        this.countdown_label.string = this.countdown.toString();
        this.schedule(this.start_countdown.bind(this),1);
    }


    //开始倒计时
    start_countdown(){
        if(this.countdown <= 0){
            if(this.is_video){
                this.share_rebirth_ui();
            }else{
                this.game.levelMgr.reset_level_state();
                this.hide_rebirth_ui();
                this.game.inGameUI.hide_game_ui();
                //跳转到游戏结束界面
                this.game.gameoverUI.show_gameover_ui();
            }
            return;
        }
        this.game.soundMgr.play_clock_audio();
        this.countdown--;
        this.countdown_label.string = this.countdown.toString();
    }

    hide_rebirth_ui(){
        this.game.bannerAd.hideRebirthBannerAd();
        this.unscheduleAllCallbacks();
        this.node.active = false;
    }

    //分享复活
    relife_btn_click(){
        //重新倒计时
        this.unscheduleAllCallbacks();
        this.game.soundMgr.play_btn_click_audio();
        if(this.is_video){
            var succ_func = function(){
                this.game.bannerAd.showGameBannerAd();
                this.hide_rebirth_ui();
                this.game.inGameUI.is_gaming = true;
            }.bind(this);
            var fail_func = function(){
                this.video_rebirth_ui();
            }.bind(this)
            this.game.videoAd.play_rebirth_video_ad(succ_func,fail_func);
        }else{
            this.game.share_type = 2;
            this.game.share_time = new Date().getTime();
            let share_func = function(){
                this.game.bannerAd.showGameBannerAd();
                this.hide_rebirth_ui();
                this.game.inGameUI.is_gaming = true;
            }.bind(this);
            let fail_func = function(){
                //重新倒计时
                this.unscheduleAllCallbacks();
                this.show_rebirth_ui();
            }.bind(this);
            this.game.share_succ_func = share_func;
            this.game.share_fail_func = fail_func;
            this.game.wxUtil.share();
        }
    }

    //跳过
    jump_click(){
        if(this.is_video){
            this.share_rebirth_ui();
        }else{
            this.game.soundMgr.play_btn_click_audio();
            this.game.levelMgr.reset_level_state();
            this.hide_rebirth_ui();
            this.game.inGameUI.hide_game_ui();
            this.game.baseBgUI.show_home_gold_ui();
            //跳转到游戏结束界面
            this.game.gameoverUI.show_gameover_ui();
        }
    }

}
