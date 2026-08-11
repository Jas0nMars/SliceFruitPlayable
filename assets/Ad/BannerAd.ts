import Game from "../Main/Game"

const {ccclass, property} = cc._decorator;

@ccclass
export default class BannerAd extends cc.Component {

    
    //1.首页banner广告
    homeBannerAd = null;
    //2.成功结算banner广告
    succBannerAd = null;
    //3.武器banner广告
    wuqiBannerAd = null;
    //4.结束banner广告
    resultBannerAd = null;
    //5.复活banner广告
    rebirthBannerAd = null;
    //6.游戏banner广告
    gameBannerAd = null;

    game:Game = null;

    //屏幕宽高
    w:number = 0;
    h:number = 0;

    init(game:Game){
        this.game = game;
        if(typeof(wx) != 'undefined') {
            var phone = wx.getSystemInfoSync();
            this.w = phone.screenWidth;
            this.h = phone.screenHeight;
        }
    }

    //1.首页banner广告--------------------------
    createHomeBannerAd() {
        if(typeof(wx) != 'undefined') {
            if(this.homeBannerAd){
                this.homeBannerAd.destroy()
            }
            this.homeBannerAd = wx.createBannerAd({
                adUnitId: 'adunit-d9005e90039bb3f6',
                style: {
                    width:this.w-100,//宽度大于屏幕时，默认和屏幕一样宽
                    //height:40,
                    top: 0,
                    left: 0
                }
            });
            this.homeBannerAd.onResize(function() {
                this.homeBannerAd.style.left = this.w/2 - this.homeBannerAd.style.realWidth / 2 + 0.1;
                if(this.game.is_iphoneX){
                    this.homeBannerAd.style.top = this.h - this.homeBannerAd.style.realHeight -10;
                }else{
                    this.homeBannerAd.style.top = this.h - this.homeBannerAd.style.realHeight + 0.1;
                }
            }.bind(this))
            this.homeBannerAd.onError(err => {
            })
            this.homeBannerAd.show();
        } 
    }

    showHomeBannerAd(){
        if(typeof(wx)=='undefined'){
            return;
        }
        if(this.homeBannerAd!=null){
            this.homeBannerAd.show();
        }else{
            this.createHomeBannerAd();
        }
    }

    hideHomeBannerAd() {
        if(typeof(wx)=='undefined'){
            return;
        }
        if(this.homeBannerAd!=null){
            this.homeBannerAd.hide();
        }
    }

    //2.成功结算banner广告--------------------------
    createSuccBannerAd() {
        if(typeof(wx) != 'undefined') {
            if(this.succBannerAd){
                this.succBannerAd.destroy()
            }
            this.succBannerAd = wx.createBannerAd({
                adUnitId: 'adunit-f6cd15d31edc4a48',
                style: {
                    width:this.w-100,//宽度大于屏幕时，默认和屏幕一样宽
                    //height:40,
                    top: 0,
                    left: 0
                }
            });
            this.succBannerAd.onResize(function() {
                this.succBannerAd.style.left = this.w/2 - this.succBannerAd.style.realWidth / 2 + 0.1;
                if(this.game.is_iphoneX){
                    this.succBannerAd.style.top = this.h - this.succBannerAd.style.realHeight -10;
                }else{
                    this.succBannerAd.style.top = this.h - this.succBannerAd.style.realHeight + 0.1;
                }
            }.bind(this))
            this.succBannerAd.onError(err => {
            })
            this.succBannerAd.show();
        } 
    }

    showSuccBannerAd(){
        if(typeof(wx)=='undefined'){
            return;
        }
        if(this.succBannerAd!=null){
            this.succBannerAd.show();
        }else{
            this.createSuccBannerAd();
        }
    }

    hideSuccBannerAd() {
        if(typeof(wx)=='undefined'){
            return;
        }
        if(this.succBannerAd!=null){
            this.succBannerAd.hide();
        }
    }

    //3.武器banner广告--------------------------
    createWuqiBannerAd() {
        if(typeof(wx) != 'undefined') {
            if(this.wuqiBannerAd){
                this.wuqiBannerAd.destroy()
            }
            this.wuqiBannerAd = wx.createBannerAd({
                adUnitId: 'adunit-062fd5200d9d0fa8',
                style: {
                    width:this.w-100,//宽度大于屏幕时，默认和屏幕一样宽
                    //height:40,
                    top: 0,
                    left: 0
                }
            });
            this.wuqiBannerAd.onResize(function() {
                this.wuqiBannerAd.style.left = this.w/2 - this.wuqiBannerAd.style.realWidth / 2 + 0.1;
                if(this.game.is_iphoneX){
                    this.wuqiBannerAd.style.top = this.h - this.wuqiBannerAd.style.realHeight -10;
                }else{
                    this.wuqiBannerAd.style.top = this.h - this.wuqiBannerAd.style.realHeight + 0.1;
                }
            }.bind(this))
            this.wuqiBannerAd.onError(err => {
            })
            this.wuqiBannerAd.show();
        } 
    }

    showWuqiBannerAd(){
        if(typeof(wx)=='undefined'){
            return;
        }
        if(this.wuqiBannerAd!=null){
            this.wuqiBannerAd.show();
        }else{
            this.createWuqiBannerAd();
        }
    }

    hideWuqiBannerAd() {
        if(typeof(wx)=='undefined'){
            return;
        }
        if(this.wuqiBannerAd!=null){
            this.wuqiBannerAd.hide();
        }
    }

    //4.结束banner广告--------------------------
    createResultBannerAd() {
        if(typeof(wx) != 'undefined') {
            if(this.resultBannerAd){
                this.resultBannerAd.destroy()
            }
            this.resultBannerAd = wx.createBannerAd({
                adUnitId: 'adunit-9d5d2ec65c7362f4',
                style: {
                    width:this.w-100,//宽度大于屏幕时，默认和屏幕一样宽
                    //height:40,
                    top: 0,
                    left: 0
                }
            });
            this.resultBannerAd.onResize(function() {
                this.resultBannerAd.style.left = this.w/2 - this.resultBannerAd.style.realWidth / 2 + 0.1;
                if(this.game.is_iphoneX){
                    this.resultBannerAd.style.top = this.h - this.resultBannerAd.style.realHeight -10;
                }else{
                    this.resultBannerAd.style.top = this.h - this.resultBannerAd.style.realHeight + 0.1;
                }
            }.bind(this))
            this.resultBannerAd.onError(err => {
            })
            this.resultBannerAd.show();
        } 
    }

    showResultBannerAd(){
        if(typeof(wx)=='undefined'){
            return;
        }
        if(this.resultBannerAd!=null){
            this.resultBannerAd.show();
        }else{
            this.createResultBannerAd();
        }
    }

    hideResultBannerAd() {
        if(typeof(wx)=='undefined'){
            return;
        }
        if(this.resultBannerAd!=null){
            this.resultBannerAd.hide();
        }
    }


    //5.复活banner广告--------------------------
    createRebirthBannerAd() {
        if(typeof(wx) != 'undefined') {
            if(this.rebirthBannerAd){
                this.rebirthBannerAd.destroy()
            }
            this.rebirthBannerAd = wx.createBannerAd({
                adUnitId: 'adunit-781d979491a1e6fe',
                style: {
                    width:this.w-100,//宽度大于屏幕时，默认和屏幕一样宽
                    //height:40,
                    top: 0,
                    left: 0
                }
            });
            this.rebirthBannerAd.onResize(function() {
                this.rebirthBannerAd.style.left = this.w/2 - this.rebirthBannerAd.style.realWidth / 2 + 0.1;
                if(this.game.is_iphoneX){
                    this.rebirthBannerAd.style.top = this.h - this.rebirthBannerAd.style.realHeight -10;
                }else{
                    this.rebirthBannerAd.style.top = this.h - this.rebirthBannerAd.style.realHeight + 0.1;
                }
            }.bind(this))
            this.rebirthBannerAd.onError(err => {
            })
            this.rebirthBannerAd.show();
        } 
    }

    showRebirthBannerAd(){
        if(typeof(wx)=='undefined'){
            return;
        }
        if(this.rebirthBannerAd!=null){
            this.rebirthBannerAd.show();
        }else{
            this.createRebirthBannerAd();
        }
    }

    hideRebirthBannerAd() {
        if(typeof(wx)=='undefined'){
            return;
        }
        if(this.rebirthBannerAd!=null){
            this.rebirthBannerAd.hide();
        }
    }


    //6.游戏banner广告--------------------------
    createGameBannerAd() {
        if(typeof(wx) != 'undefined') {
            if(this.gameBannerAd){
                this.gameBannerAd.destroy()
            }
            this.gameBannerAd = wx.createBannerAd({
                adUnitId: 'adunit-bb1eb58ffc3764c4',
                style: {
                    width:this.w-100,//宽度大于屏幕时，默认和屏幕一样宽
                    //height:40,
                    top: 0,
                    left: 0
                }
            });
            this.gameBannerAd.onResize(function() {
                this.gameBannerAd.style.left = this.w/2 - this.gameBannerAd.style.realWidth / 2 + 0.1;
                if(this.game.is_iphoneX){
                    this.gameBannerAd.style.top = this.h - this.gameBannerAd.style.realHeight -10;
                }else{
                    this.gameBannerAd.style.top = this.h - this.gameBannerAd.style.realHeight + 0.1;
                }
            }.bind(this))
            this.gameBannerAd.onError(err => {
            })
            this.gameBannerAd.show();
        } 
    }

    showGameBannerAd(){
        if(typeof(wx)=='undefined'){
            return;
        }
        if(this.gameBannerAd!=null){
            this.gameBannerAd.show();
        }else{
            this.createGameBannerAd();
        }
    }

    hideGameBannerAd() {
        if(typeof(wx)=='undefined'){
            return;
        }
        if(this.gameBannerAd!=null){
            this.gameBannerAd.hide();
        }
    }

    //---------------------end--------------------------
}
