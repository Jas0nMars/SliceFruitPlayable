import Game from "../Main/Game"

const {ccclass, property} = cc._decorator;

@ccclass
export default class RankUI extends cc.Component {
    //按钮背景切换
    @property(cc.Sprite)
    friend_rank_btn:cc.Sprite = null;
    @property(cc.Sprite)
    wuqi_rank_btn:cc.Sprite = null;
   
    @property(cc.SpriteFrame)
    slected_btn_bg:cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    normal_btn_bg:cc.SpriteFrame = null;

    //标题文字切换
    @property(cc.Sprite)
    title_sp:cc.Sprite = null;
    @property(cc.SpriteFrame)
    wuqi_sf:cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    friend_sf:cc.SpriteFrame = null;
   

    //按钮文字切换
    @property(cc.Sprite)
    friend_txt_sp:cc.Sprite = null;
    @property(cc.Sprite)
    wuqi_txt_sp:cc.Sprite = null;
   
    @property(cc.SpriteFrame)
    normal_friend_sf:cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    selected_friend_sf:cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    normal_wuqi_sf:cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    selected_wuqi_sf:cc.SpriteFrame = null;
   
  


    game:Game = null;
    is_gameover_ui:boolean = false;
    init(game){
        this.game = game;
    }

    show_rank_ui(is_gameover_ui:boolean){
        this.is_gameover_ui = is_gameover_ui;
        this.node.active = true;
        this.show_score_rank_ui();
    }

    show_score_rank_ui(){
        this.friend_rank_btn.spriteFrame = this.slected_btn_bg;
        this.friend_txt_sp.spriteFrame = this.selected_friend_sf;
        this.wuqi_rank_btn.spriteFrame = this.normal_btn_bg;
        this.wuqi_txt_sp.spriteFrame = this.normal_wuqi_sf;
        this.title_sp.spriteFrame = this.friend_sf;
        
        this.game.wxRank_com.loadScoreRank();
    }

    show_knife_count_rank(){
        this.friend_rank_btn.spriteFrame = this.normal_btn_bg;
        this.friend_txt_sp.spriteFrame = this.normal_friend_sf;
        this.wuqi_rank_btn.spriteFrame = this.slected_btn_bg;
        this.wuqi_txt_sp.spriteFrame = this.selected_wuqi_sf;
       
        this.title_sp.spriteFrame = this.wuqi_sf;
        this.game.wxRank_com.loadKnifeCountRank();
    }


    hide_rank_ui(){
        //this.game.soundMgr.play_touch_block_music();
        this.node.active = false;
        if(this.is_gameover_ui){
            this.game.wxRank_com.loadHorRank(0);
            this.game.gameoverUI.show_ui();
        }else{
            this.game.wxRank_com.close();
            this.game.homeUI.show_feedback_btn();
            this.game.homeUI.show_home_ui();
        }
    }

    //下一页
    next_page(){
        //this.game.soundMgr.play_touch_block_music();
        this.game.wxRank_com.onPageDown();
    }
    //上一页
    pre_page(){
        //this.game.soundMgr.play_touch_block_music();
        this.game.wxRank_com.onPageUp();
    }
    
}
