
import Game from "../Main/Game"

const {ccclass, property} = cc._decorator;

@ccclass
export default class VideoAd extends cc.Component {

    public game:Game = null;
    rebirthVideoAd = null;
    wuqiVideoAd = null;
    awaysKnifeVideoAd = null;
    knife3VideoAd = null;

    init(game){
        this.game = game;
        if(typeof(wx)=='undefined'){
            return;
        }
        //1.复活视频
        this.rebirthVideoAd = wx.createRewardedVideoAd({
            adUnitId: 'adunit-d9f03809ad66a8a7'
        });

        this.rebirthVideoAd.onLoad(() => {
            this.game.is_videoAd_succ = true;
            //console.log("拉取视频成功！")
        });

        this.rebirthVideoAd.onError(err => {
            this.game.is_videoAd_succ = false;
            //console.log("拉取视频失败！")
        });

        //2.武器视频
        this.wuqiVideoAd = wx.createRewardedVideoAd({
            adUnitId: 'adunit-4e57cd2fe76b1cb1'
        });

        //3.永久武器视频
        this.awaysKnifeVideoAd = wx.createRewardedVideoAd({
            adUnitId: 'adunit-cea772177cb4e37c'
        });

        //4.影分身视频
        this.knife3VideoAd = wx.createRewardedVideoAd({
            adUnitId: 'adunit-88841234ece119bd'
        });
    }

    //2.武器视频
    play_wuqi_video_ad(succ,fail){
        
        this.wuqiVideoAd.show()
        .catch(err => {
            //没有视频，跳转到分享
            if(fail){
                fail();
            }
        });

       this.wuqiVideoAd.onClose(res => {
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res.isEnded || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                if(succ){
                    succ();
                }
            }
            else {
                // 播放中途退出，不下发游戏奖励
            }
            this.wuqiVideoAd.offClose();
        })
    }


    //3.永久武器视频
    play_aways_knife_video_ad(succ,fail){
        
        this.awaysKnifeVideoAd.show()
        .catch(err => {
            //没有视频，跳转到分享
            if(fail){
                fail();
            }
        })

        this.awaysKnifeVideoAd.onClose(res => {
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res.isEnded || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                if(succ){
                    succ();
                }
            }
            else {
                // 播放中途退出，不下发游戏奖励
            }
            this.awaysKnifeVideoAd.offClose();
        })
    }

    //1.复活视频
    play_rebirth_video_ad(succ,fail){
        let self = this;
        this.rebirthVideoAd.show()
        .catch(err => {
            //没有视频，跳转到分享
            self.game.toastUI.show_toast("今日视频已看完，请分享！");
            self.game.rebirthUI.share_rebirth_ui();
        })
        
        this.rebirthVideoAd.onClose(res => {
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res.isEnded || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                if(succ){
                    succ();
                }
            }
            else {
                // 播放中途退出，不下发游戏奖励
                if(fail){
                    fail();
                }
            }
            this.rebirthVideoAd.offClose();
        });
    }

    //4.影分身视频
    play_knife3_video_ad(succ,fail){
        this.knife3VideoAd.show()
        .catch(err => {
            //没有视频，跳转到分享
            if(fail){
                fail();
            }
        })

        this.knife3VideoAd.onClose(res => {
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res.isEnded || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                if(succ){
                    succ();
                }
            }
            else {
                // 播放中途退出，不下发游戏奖励
            }
            this.knife3VideoAd.offClose();
        })
    }
}
