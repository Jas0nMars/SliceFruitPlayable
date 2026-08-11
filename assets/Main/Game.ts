
import Knife from "./Knife"
import FruitPoolMgr from "./FruitPoolMgr"
import InGameUI from "../UI/InGameUI"
import LevelMgr from "../Level/LevelMgr"
import SliceMgr from "./SliceMgr"
import RewardUI from "../UI/RewardUI"
import RebirthUI from "../UI/RebirthUI"
import HomeUI from "../UI/HomeUI"
import RankUI from "../UI/RankUI"
import wxRankList from "../Other/wxRankList"
import DataMgr from "../Other/DataMgr"
import GameOverUI from "../UI/GameOverUI"
import WXUtil from "../Other/WXUtil"
import SoundMgr from "../Other/SoundMgr"
import WuqiUI from "../UI/WuqiUI"
import ToastUI from "../UI/ToastUI"
import BaseBgUI from "../UI/BaseBgUI"
import TryKnifeUI from "../UI/TryKnifeUI"
import RewardGoldUI from "../UI/RewardGoldUI"
import GuidUI from "../UI/GuidUI"
import BannerAd from "../Ad/BannerAd"
import VideoAd from "../Ad/VideoAd"

const {ccclass, property} = cc._decorator;

@ccclass
export default class Game extends cc.Component {

    @property(cc.Node)
    game_ui:cc.Node = null;

    @property(cc.Node)
    guid_ui:cc.Node = null;

    @property(cc.Node)
    home_ui:cc.Node = null;

    @property([cc.SpriteFrame])
    fruit_imgs:Array<cc.SpriteFrame> = [];

    @property([cc.SpriteFrame])
    fruit_half_imgs:Array<cc.SpriteFrame> = [];

    @property(cc.Node)
    fruit_slices:cc.Node = null;

    @property(cc.Node)
    wuqi_ui:cc.Node = null;
    @property(cc.Node)
    reward_ui:cc.Node = null;
    @property(cc.Node)
    rebirth_ui:cc.Node = null;
    @property(cc.Node)
    rank_ui:cc.Node = null;
    @property(cc.Node)
    rankRender_ui:cc.Node = null;
    @property(cc.Node)
    gameover_ui:cc.Node = null;
    @property(cc.Node)
    toast_ui:cc.Node = null;
    @property(cc.Node)
    base_bg_ui:cc.Node = null;
    @property(cc.Node)
    try_knife_ui:cc.Node = null;
    @property(cc.Node)
    rewardGold_ui:cc.Node = null;
    @property(cc.Node)
    pet_ui:cc.Node = null;


    knife:Knife = null;

    fruitPoolMgr:FruitPoolMgr = null;
    inGameUI:InGameUI = null;
    levelMgr:LevelMgr = null;
    sliceMgr:SliceMgr = null;
    rewardUI:RewardUI = null;
    homeUI:HomeUI = null;
    rankUI:RankUI = null;
    wxRank_com:wxRankList = null;
    dataMgr:DataMgr = null;
    gameoverUI:GameOverUI = null;
    wxUtil:WXUtil = null;
    soundMgr:SoundMgr = null;
    wuqiUI:WuqiUI = null;
    toastUI:ToastUI = null;
    baseBgUI:BaseBgUI = null;
    tryKnifeUI:TryKnifeUI = null;
    rewardGoldUI:RewardGoldUI = null;
    guidUI:GuidUI = null;
    bannerAd:BannerAd = null;
    videoAd:VideoAd = null;

    public rebirthUI:RebirthUI = null;

    kill_fruit_num:number = 0;
    //是否是第一次登陆
    is_first_login:number = 0;
    version:string = "1.1.8";
    public isOpenShare:boolean = true;
    //分享后执行函数-----------
    share_type:number = -1;
    share_succ_func = null;
    share_fail_func = null;
    share_time:number = 0;
    //是否有视频，默认为false
    is_videoAd_succ:boolean = false;
    //---end分享--------------
    //是否登录
    is_login:boolean = false;
    //屏幕尺寸
    screenW:number = 0;
    screenH:number = 0;
    //是否是iphoneX手机
    is_iphoneX:boolean = false;
    onLoad(){
        this.screenW = Math.floor(cc.view.getVisibleSize().width);
        this.screenH = Math.floor(cc.view.getVisibleSize().height);
        this.dataMgr = this.node.getComponent("DataMgr");
        this.fruitPoolMgr = this.node.getComponent("FruitPoolMgr");
        this.inGameUI = this.game_ui.getComponent("InGameUI");
        this.levelMgr = this.node.getComponent("LevelMgr");
        this.sliceMgr = this.fruit_slices.getComponent("SliceMgr");
        this.rewardUI = this.reward_ui.getComponent("RewardUI");
        this.rebirthUI = this.rebirth_ui.getComponent("RebirthUI");
        this.homeUI = this.home_ui.getComponent("HomeUI");
        this.rankUI = this.rank_ui.getComponent("RankUI");
        this.wxRank_com = this.rankRender_ui.getComponent("wxRankList");
        this.gameoverUI = this.gameover_ui.getComponent("GameOverUI");
        this.wxUtil = this.node.getComponent("WXUtil");
        this.soundMgr = this.node.getComponent("SoundMgr");
        this.wuqiUI = this.wuqi_ui.getComponent("WuqiUI");
        this.toastUI = this.toast_ui.getComponent("ToastUI");
        this.baseBgUI = this.base_bg_ui.getComponent("BaseBgUI");
        this.tryKnifeUI = this.try_knife_ui.getComponent("TryKnifeUI");
        this.rewardGoldUI = this.rewardGold_ui.getComponent("RewardGoldUI");
        this.guidUI = this.guid_ui.getComponent("GuidUI");
        this.bannerAd = this.node.getComponent("BannerAd");
        this.videoAd = this.node.getComponent("VideoAd");
    }

    start(){
        this.is_open_share();//是否打开分享开关
        this.share_back();
        this.bannerAd.init(this);
        this.levelMgr.init(this);
        this.fruitPoolMgr.init(this);
        this.inGameUI.init(this);
        this.sliceMgr.init(this);
        this.rewardUI.init(this);
        this.rebirthUI.init(this);
        this.homeUI.init(this);
        this.rankUI.init(this);
        this.gameoverUI.init(this);
        this.wuqiUI.init(this);
        this.baseBgUI.init(this);
        this.tryKnifeUI.init(this);
        this.rewardGoldUI.init(this);
        this.videoAd.init(this);
    }

    share_back(){
        if(typeof(wx) == 'undefined' || wx == null){
            return;
        }
        wx.onShow(function(res){
            if(this.share_type>0 && this.share_time > 0){
                let dt_time = new Date().getTime() - this.share_time;
                if(dt_time > 1500){
                    if(this.share_succ_func){
                        this.share_succ_func();
                    }
                }else{
                    this.toastUI.show_toast("分享失败,请分享到不同的群!");
                    if(this.share_fail_func&&this.share_type ==2){
                        this.share_fail_func();
                    }
                }
                this.share_type = -1;
                this.share_time = 0;
            }
        }.bind(this));
    }

    is_open_share(){
        if(typeof(wx) == 'undefined' || wx == null) {
            return;
        }
        wx.request({
            url:"https://xyx.xmxk513.com/games_fruit/index.php/api/Common/getConfig",
            data:{
            },
            header:{
                'Content-Type':'application/x-www-form-urlencoded'
            },
            method:"POST",
            success:res=>{
                var json = JSON.parse(JSON.stringify(res));
                if(json.data.msg.version == this.version){//关闭分享功能
                    this.isOpenShare = false;
                }else{//开启分享功能
                    this.isOpenShare = true;
                }
            },
            fail:res=>{
                this.isOpenShare = true;
            }
        });
    }

    
}
