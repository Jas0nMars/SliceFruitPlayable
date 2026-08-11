import Game from "../Main/Game"

const {ccclass, property} = cc._decorator;

@ccclass
export default class RewardUI extends cc.Component {

    @property([cc.Node])
    furit_pan_arr:Array<cc.Node> = [];

    @property(cc.Label)
    gold_label:cc.Label = null;

    @property(cc.Node)
    win_light:cc.Node = null;
    @property(cc.Node)
    next_btn:cc.Node = null;
    @property(cc.Node)
    reward_btn:cc.Node = null;
  


    game:Game = null;
    //成功通关的次数
    level_win_count = 0;
    init(game){
        this.game = game;
        this.level_win_count = this.game.dataMgr.get_day_level_win_count();
    }

    show_reward_ui(){
        this.game.bannerAd.showSuccBannerAd();
        this.game.inGameUI.is_gaming = false;
        this.gold_label.string = "+"+this.game.baseBgUI.cur_level_gold.toString();
        this.game.inGameUI.knife_3.active = false;
        this.game.inGameUI.wuqi_btn.active = false;
        this.game.baseBgUI.plus_cur_gold_2_total_gold();
        this.game.baseBgUI.show_home_gold_ui();
        this.node.active = true;
        this.win_light.getComponent(cc.Animation).play();
        
        //上传最高关卡到排行榜
        this.uploadMaxLevel(this.game.levelMgr.cur_level_idx);
        //最高关卡保存到本地
        this.game.dataMgr.set_max_level(this.game.levelMgr.cur_level_idx);
        //======测试专用===============
        //武器使用10次
        //this.game.tryKnifeUI.show_new_wuqi_ui();
        //======end test==============

        if(this.game.levelMgr.cur_level_idx%4==0 && this.game.isOpenShare){
            this.next_btn.active = false;
            this.reward_btn.active = true;
        }else{
            this.next_btn.active = true;
            this.reward_btn.active = false;
        }
        this.update_guopan_ui();

        //当分享按钮关闭时，不弹出体验武器和飞刀影分身
        if(this.game.isOpenShare == false){
            return;
        }
        if(this.level_win_count<6){
            //玩家每日登陆
            this.level_win_count++;
            //console.log("level_win_count="+this.level_win_count);
            this.game.dataMgr.set_day_level_win_count(this.level_win_count);
            if(this.level_win_count == 1 || this.level_win_count == 4){
                //显示体验武器ui
                this.game.tryKnifeUI.show_new_wuqi_ui();
            }else if(this.level_win_count == 2 || this.level_win_count == 6){
                //显示影分身ui
                this.game.inGameUI.is_show_knife3_ui = true;
                this.game.inGameUI.add_5_knife_3();
            }
        }else{
            //然后成功通关关卡尾数为5的关卡，出现影分身
            //成功通关关卡尾数为0的关卡，出现武器体验
            if(this.game.levelMgr.cur_level_idx%5==0){
                if(this.game.levelMgr.cur_level_idx%2==0){//偶数,体验武器
                    //显示体验武器ui
                    this.game.tryKnifeUI.show_new_wuqi_ui();
                }else{//奇数，影分身
                    //显示影分身ui
                    this.game.inGameUI.is_show_knife3_ui = true;
                    this.game.inGameUI.add_5_knife_3();
                }
            }
        }
        
        
    }

    update_guopan_ui(){
        let index = (this.game.levelMgr.cur_level_idx-1) % 4;
        for(let i=0;i<this.furit_pan_arr.length;i++){
            let guopan_icon = this.furit_pan_arr[i];
            if(i<=index){   
                guopan_icon.active = true;
            }else{
                guopan_icon.active = false;
            }
        }
    }

    hide_reward_ui(){
        this.game.bannerAd.hideSuccBannerAd();
        this.node.active = false;
        this.win_light.getComponent(cc.Animation).stop();
    }

    next_btn_click(){
        this.game.soundMgr.play_btn_click_audio();
        this.game.inGameUI.is_gaming = true;
        this.hide_reward_ui();
        this.game.levelMgr.start_level();
       
    }

    reward_btn_click(){
        this.hide_reward_ui();
        this.game.inGameUI.show_zhuanpan_ui();
    }

    home_btn_click(){
        this.game.soundMgr.play_btn_click_audio();
        this.game.inGameUI.hide_game_ui();
        this.hide_reward_ui();
        this.game.homeUI.show_home_ui();
    }

    

    // 上传最高关卡数
    uploadMaxLevel(level) {
        if(!window["wx"]) return;
        level = level.toString()
        window["wx"].setUserCloudStorage({
            KVDataList: [
                { key:"scoreKey", value: level},
            ],
            success: (res) => {
                //console.log("上传分数成功！")
            },
            fail: (res) => {
            }
        })
    }

}
