import Game from "../Main/Game"
const {ccclass, property} = cc._decorator;

@ccclass
export default class GameOverUI extends cc.Component {

    @property(cc.Node)
    share_btn:cc.Node = null;
    @property(cc.Node)
    wuqi_btn:cc.Node = null;
   

    game:Game = null;

    init(game:Game){
        this.game = game;
    }

    show_gameover_ui(){
        this.game.bannerAd.showResultBannerAd();
        this.node.active = true;
        //显示横向排行榜
        let is_refresh = 1;
        this.game.wxRank_com.loadHorRank(is_refresh);
        if(this.game.isOpenShare==false){
            this.share_btn.active = false;
            this.wuqi_btn.active = false;
        }
    }
    

    hide_gameover_ui(){
        this.game.bannerAd.hideResultBannerAd();
        this.game.wxRank_com.close();
        this.node.active = false;
    }

    show_ui(){
        this.node.active = true;
    }

    hide_ui(){
        this.node.active = false;
    }

    home_btn_click(){
        this.game.soundMgr.play_btn_click_audio();
        this.game.inGameUI.hide_game_ui();
        this.hide_gameover_ui();
        this.game.homeUI.show_home_ui();
    }   

    restart_btn_click(){
        this.game.soundMgr.play_btn_click_audio();
        this.hide_gameover_ui();
        this.game.inGameUI.show_game_ui();
        this.game.levelMgr.restart_cur_level();
    }

    share_btn_click(){
        this.game.soundMgr.play_btn_click_audio();
        this.game.share_type = 1;
        this.game.share_time = new Date().getTime();
        let share_func = function(){
            //显示奖励100金币的ui
            this.game.rewardGoldUI.show_rewardGold_ui(100);
        }.bind(this);
        this.game.share_succ_func = share_func;
        this.game.wxUtil.share();
        
    }

    wuqi_btn_clikc(){
        this.game.soundMgr.play_btn_click_audio();
        this.hide_gameover_ui();
        this.game.wuqiUI.show_wuqi_ui(1);
    }

   
    rank_btn_click(){
        this.game.soundMgr.play_btn_click_audio();
        this.hide_ui();
        this.game.rankUI.show_rank_ui(true);
    }

    //跳转到钓鱼
    jump_2_fish(){
        this.game.soundMgr.play_btn_click_audio();
        wx.navigateToMiniProgram({
            appId:"wx1eacdab0918ba72c",
            path:"",
            extraData:{},
            success:(res)=>{

            },
            fail:(res)=>{

            },
            complete:(res)=>{

            },
        });
    }

    //跳转到俄罗斯方块
    jump_2_block(){
        this.game.soundMgr.play_btn_click_audio();
        wx.navigateToMiniProgram({
            appId:"wx1148b45d0f4b72eb",
            path:"",
            extraData:{},
            success:(res)=>{

            },
            fail:(res)=>{

            },
            complete:(res)=>{

            },
        });
    }

    //跳转到全球消消乐
    jump_2_star(){
        this.game.soundMgr.play_btn_click_audio();
        wx.navigateToMiniProgram({
            appId:"wx2be2c6461389ee0b",
            path:"",
            extraData:{},
            success:(res)=>{

            },
            fail:(res)=>{

            },
            complete:(res)=>{

            },
        });
    }

    //跳转到我要保卫地球
    jump_2_plane(){
        this.game.soundMgr.play_btn_click_audio();
        wx.navigateToMiniProgram({
            appId:"wx9328cbfe04753870",
            path:"",
            extraData:{},
            success:(res)=>{

            },
            fail:(res)=>{

            },
            complete:(res)=>{

            },
        });
    }
}
