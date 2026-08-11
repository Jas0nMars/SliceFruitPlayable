import Game from "../Main/Game"
import WuqiCell from "./WuqiCell"


const {ccclass, property} = cc._decorator;

@ccclass
export default class WuqiUI extends cc.Component {

    @property(cc.Node)
    pageView:cc.Node = null;
    @property(cc.Node)
    content:cc.Node = null;
    @property(cc.Sprite)
    cur_knife:cc.Sprite = null;
    @property(cc.Node)
    bottom_ui:cc.Node = null;
    @property(cc.Node)
    free_get_btn:cc.Node = null;
    @property(cc.Node)
    tip_msg:cc.Node = null;
    @property(cc.Label)
    price_label:cc.Label = null;
    //今日剩余次数
    @property(cc.Label)
    times_label:cc.Label = null;
    //全部获得图片
    @property(cc.SpriteFrame)
    get_all_txt:cc.SpriteFrame = null;
    //转盘获得图片
    @property(cc.SpriteFrame)
    get_zhuanpan_txt:cc.SpriteFrame = null;

    @property([cc.SpriteFrame])
    wuqi_icons:Array<cc.SpriteFrame> = [];

    //视频和分享图标
    @property(cc.Sprite)
    icon_sprite:cc.Sprite = null;
    @property(cc.SpriteFrame)
    share_icon:cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    video_icon:cc.SpriteFrame = null;
    

    enable_knifes:Array<string> = [];
    game:Game = null;
    pageIndex:number = 0;//当前的武器页码
    sel_knife_id = 0;
    pre_cell_com:WuqiCell = null;//上一次使用的武器
    enter_view_index = 0;//从哪个页面进入武器库
    //当前页面未拥有的武器列表
    disable_wuqi_arr:Array<number> = null;
    //抽奖获取武器的价格
    get_knife_price:number = 0;
    //判断是否正在获取武器
    is_random_knife = false;
    //记录试用武器次数
    try_knife_count = 0;
    //记录是否是试用武器
    is_try_knife = false;
    //今日可分享次数
    share_count = 0;

    init(game:Game){
        this.game = game;
        this.sel_knife_id = this.game.dataMgr.get_cur_knife_id();
        this.pageView.on("page-turning",this.pageViewClick,this);
        let enable_knifes_str:string = this.game.dataMgr.get_enable_knifes();
        //console.log("str="+enable_knifes_str);
        this.enable_knifes = JSON.parse(enable_knifes_str);
        //console.log("type="+typeof(this.enable_knifes)+",this.enable_knifes="+this.enable_knifes);
        this.load_all_knifes();
        //console.log("已解锁武器列表:"+this.enable_knifes);
        this.load_cur_select();
        this.update_bottom_ui();
        this.init_date();
    }

    //初始化date日期
    init_date(){
        //获取当前的日期
        let date = new Date().toLocaleDateString();
        let last_date = this.game.dataMgr.get_cur_date();
        if(last_date && date == last_date){//已经保存了上次登录的日期且同一天登录
            this.share_count = this.game.dataMgr.get_share_count();
            this.times_label.string = "(今日剩余"+this.share_count.toString()+"次)";
            return;
        } 
        if(!last_date){
            this.uploadMaxknifeCount(this.enable_knifes.length);
            this.game.rewardUI.uploadMaxLevel(1);
        }   
        //第一次登录或者次日登录
        this.game.dataMgr.set_day_level_win_count(0);
        this.game.dataMgr.set_cur_date(date);
        this.share_count = 5;
        this.game.dataMgr.set_share_count(this.share_count);
        this.times_label.string = "(今日剩余"+this.share_count.toString()+"次)";
    }

    //0.首页进入  1.结束进入 2.游戏界面进入
    show_wuqi_ui(viewIndex:number){
        this.enter_view_index = viewIndex;
        if(viewIndex == 0 || viewIndex == 1){
            this.game.bannerAd.showWuqiBannerAd();
        }
        this.node.active = true;
        this.game.baseBgUI.show_home_gold_ui();
        if(this.game.is_videoAd_succ){
            this.icon_sprite.spriteFrame = this.video_icon;
        }else{
            this.icon_sprite.spriteFrame = this.share_icon;
        }
    }

    hide_wuqi_ui(){
        this.game.soundMgr.play_btn_click_audio();
        this.node.active = false;
        if(this.enter_view_index == 0){//首页
            this.game.bannerAd.hideWuqiBannerAd();
            this.game.homeUI.show_home_ui();
            this.game.homeUI.show_feedback_btn();
            this.game.homeUI.show_authorBtn();
        }else if(this.enter_view_index == 1){//结束界面
            this.game.bannerAd.hideWuqiBannerAd();
            this.game.gameoverUI.show_gameover_ui();
        }else if(this.enter_view_index == 2){//游戏界面
            this.game.inGameUI.node.x = 0;
            this.game.baseBgUI.show_level_gold_ui();
        }else if(this.enter_view_index == 3){//游戏奖励界面
            this.game.rewardUI.node.x = 0;
            this.game.baseBgUI.show_level_gold_ui();
        }
    }

    load_cur_select(){
        this.try_knife_count = this.game.dataMgr.get_try_knife_count();
        //console.log("try_knife_count="+this.try_knife_count)
        if(this.try_knife_count > 0){
            this.is_try_knife = true;
            let try_knife_id = this.game.dataMgr.get_try_knife_id();
            //console.log("try_knife_id="+try_knife_id)
            let pageIdx = Math.floor(try_knife_id / 16);
            let index = try_knife_id % 16;
            let cell = this.content.children[pageIdx].children[index];
            let cell_com = cell.getComponent("WuqiCell");
            cell_com.update_state(true);
            cell_com.show_sel_border();
            cell_com.show_try_knife_icon();
            this.pre_cell_com = cell_com;
        }else{
            let pageIdx = Math.floor(this.sel_knife_id / 16);
            let index = this.sel_knife_id % 16;
            let cell = this.content.children[pageIdx].children[index];
            let cell_com = cell.getComponent("WuqiCell");
            cell_com.show_sel_border();
            this.pre_cell_com = cell_com;
        }
    }

    //加载之前使用的永久武器
    load_cur_select_own_knife(){
        this.sel_knife_id = this.game.dataMgr.get_cur_knife_id();
        let pageIdx = Math.floor(this.sel_knife_id / 16);
        let index = this.sel_knife_id % 16;
        let cell = this.content.children[pageIdx].children[index];
        let cell_com = cell.getComponent("WuqiCell");
        cell_com.show_sel_border();
        this.pre_cell_com = cell_com;
    }

    load_all_knifes(){
        for(let i=0;i<this.content.children.length;i++){
            let page = this.content.children[i];
            let base_idx = i * 16;
            for(let k=0;k<page.children.length;k++){
                let cell = page.children[k];
                let cell_com:WuqiCell = cell.getComponent("WuqiCell");
                cell_com.init(this);
                let index = base_idx + k;
                cell_com.set_icon(this.wuqi_icons[index]);
                cell_com.id = index;
                //let enabel = this.check_knife_enabel(index);
                //cell_com.update_state(enabel);
            }
        }

        //更新武器的状态
        for(let i=0;i<this.enable_knifes.length;i++){
            let id = parseInt(this.enable_knifes[i]);
            let pageIndex = Math.floor(id / 16);
            let page = this.content.children[pageIndex];
            let knife_id = id % 16;
            let wuqiCell = page.children[knife_id].getComponent("WuqiCell");
            wuqiCell.update_state(true);
        }

    }

    pageViewClick(event:cc.Event){
        this.pageIndex = this.pageView.getComponent(cc.PageView).getCurrentPageIndex();
        this.update_bottom_ui();
    }

    check_knife_enabel(index:number){
        for(let i=0;i<this.enable_knifes.length;i++){
            let enable_knife_id = parseInt(this.enable_knifes[i]);
            //console.log("enable_knife_id="+enable_knife_id)
            if(index == enable_knife_id){
                return true;
            }
        }
        return false;
    }

    //切换当前使用的武器
    change_cur_knife(knife_sp:cc.SpriteFrame){
        this.cur_knife.spriteFrame = knife_sp;
        this.game.inGameUI.change_all_knife_icon(knife_sp);
        this.game.homeUI.change_knife_icon(knife_sp);
    }

    //购买武器按钮点击事件
    buy_knife_random(){
        this.game.soundMgr.play_btn_click_audio();
        if(this.game.baseBgUI.total_gold > this.get_knife_price){
            //购买武器，扣除金币
            this.game.baseBgUI.minus_total_gold(this.get_knife_price);
            //随机获取的武器
            this.random_get_knife();
        }else{
            this.game.toastUI.show_toast("金币不足！");
        }
    }

    //分享后免费获得武器
    share_get_knife(){
        this.game.soundMgr.play_btn_click_audio();
        if(this.share_count > 0){
            if(this.game.is_videoAd_succ){//视频
                let succ_func = function(){
                    //随机获得武器
                    this.random_get_knife();
                    this.share_count--
                    this.times_label.string = "(今日剩余"+this.share_count.toString()+"次)";
                    this.game.dataMgr.set_share_count(this.share_count);
                }.bind(this);
                let fail_func = function(){
                    this.icon_sprite.spriteFrame = this.share_icon;
                    this.game.is_videoAd_succ = false;
                }.bind(this);
                this.game.videoAd.play_wuqi_video_ad(succ_func,fail_func);
            }else{//分享
                this.game.share_type = 1;
                this.game.share_time = new Date().getTime();
                let share_func = function(){
                    //随机获得武器
                    this.random_get_knife();
                    this.share_count--
                    this.times_label.string = "(今日剩余"+this.share_count.toString()+"次)";
                    this.game.dataMgr.set_share_count(this.share_count);
                }.bind(this);
                this.game.share_succ_func = share_func;
                this.game.wxUtil.share();
            }
       }else{
           this.game.toastUI.show_toast("免费次数已用完！");
       }
    }

    //随机获得武器
    random_get_knife(){
        if(this.is_random_knife){
            return;
        }
        this.is_random_knife = true;
        this.get_disable_wuqi_arr(this.pageIndex);
        let page = this.content.children[this.pageIndex];
        let sel_id = this.disable_wuqi_arr[Math.floor(Math.random()*this.disable_wuqi_arr.length)];
        //console.log("选中的未拥有的武器:"+sel_id);
        let sel_index = sel_id + 16;
        if(sel_id >= 16){
            sel_index = sel_id%16 + 16;
        }
        let index = 0;
        this.schedule(function(){
            let wuqiCell = page.children[index%16].getComponent("WuqiCell");
            wuqiCell.play_scale_anim();
            if(index==sel_index){
                wuqiCell.update_state(true);
                this.enable_knifes.push(sel_id.toString());
                this.game.dataMgr.set_enable_knifes(this.enable_knifes);
                this.uploadMaxknifeCount(this.enable_knifes.length);
                if(this.disable_wuqi_arr.length == 1){
                    this.update_bottom_ui();
                }
                this.is_random_knife = false;
            }
            index++;
            //震动1次
            if(typeof(wx) != 'undefined') {
                wx.vibrateShort();
            }
        }.bind(this),0.072,sel_index,0);
    }

    //获取永久武器
    get_always_knife(id:number){
        let pageIndex = Math.floor(id / 16);
        let page = this.content.children[pageIndex];
        let knife_id = id % 16;
        let wuqiCell = page.children[knife_id].getComponent("WuqiCell");
        wuqiCell.update_state(true);
        this.enable_knifes.push(id.toString());
        this.game.dataMgr.set_enable_knifes(this.enable_knifes);
        this.uploadMaxknifeCount(this.enable_knifes.length);
        if(this.pre_cell_com){
            this.pre_cell_com.hide_sel_border();
            //使用武器结束--------
            if(this.pre_cell_com.is_try_knife){
                //this.game.toastUI.show_toast("体验武器次数已用完！");
                this.is_try_knife = false;
                this.try_knife_count = 0;
                this.game.dataMgr.set_try_knife_id(-1);
                this.game.dataMgr.set_try_knife_count(0);
                this.pre_cell_com.hide_try_knife_icon();
            }
        }
        wuqiCell.show_sel_border();
        this.game.dataMgr.set_cur_knife_id(id);
        this.get_disable_wuqi_arr(pageIndex);
        if(this.disable_wuqi_arr.length <= 1){
            this.update_bottom_ui();
        }
    }
    //获取10次体验武器
    get_try_knife_10(id:number){
        let pageIndex = Math.floor(id / 16);
        let page = this.content.children[pageIndex];
        let knife_id = id % 16;
        let wuqiCell = page.children[knife_id].getComponent("WuqiCell");
        wuqiCell.update_state(true);
        wuqiCell.show_try_knife_icon();
        //this.enable_knifes.push(knife_id);
        //this.game.dataMgr.set_enable_knifes(this.enable_knifes);
        if(this.pre_cell_com){
            this.pre_cell_com.hide_sel_border();
            this.cancle_try_knife();
        }
        this.game.dataMgr.set_try_knife_id(id);
        wuqiCell.show_sel_border();
        this.is_try_knife = true;
        this.try_knife_count = 10;
        this.game.dataMgr.set_try_knife_count(this.try_knife_count);
    }

    //取消体验状态
    cancle_try_knife(){
        if(this.pre_cell_com.is_try_knife){
            this.pre_cell_com.update_state(false);
            this.pre_cell_com.hide_try_knife_icon();
            this.pre_cell_com.hide_sel_border();
        }
    }

    //获取未获取武器的列表
    get_disable_wuqi_arr(pageIndex:number){
        let page = this.content.children[pageIndex];
        this.disable_wuqi_arr = [];
        for(let k=0;k<page.children.length;k++){
            let cell = page.children[k];
            let cell_com:WuqiCell = cell.getComponent("WuqiCell");
            if(cell_com.is_enabled==false){
                this.disable_wuqi_arr.push(cell_com.id);
            }
        }
        return this.disable_wuqi_arr;
    }

    //更新底部的ui
    update_bottom_ui(){
        if(this.pageIndex==0){
            this.get_knife_price = 1500;
        }else if(this.pageIndex == 1){
            this.get_knife_price = 3000;
        }else if(this.pageIndex == 2){
            this.get_knife_price = 6000;
        }else if(this.pageIndex == 3){
            this.bottom_ui.active = false;
            this.tip_msg.getComponent(cc.Sprite).spriteFrame = this.get_zhuanpan_txt;
            this.tip_msg.active = true;
            return;
        }else if(this.pageIndex == 4){
            this.get_knife_price = 8000;
        }
        let all_enable = this.check_page_all_enable();
        if(all_enable){
            this.bottom_ui.active = false;
            this.tip_msg.getComponent(cc.Sprite).spriteFrame = this.get_all_txt;
            this.tip_msg.active = true;
            return;
        }
        this.price_label.string = this.get_knife_price.toString();
        this.bottom_ui.active = true;
        this.tip_msg.active = false;
    }

    //判断当前页的武器是否已经全部拥有
    check_page_all_enable(){
        let page = this.content.children[this.pageIndex];
        for(let knife of page.children){
            if(knife.getComponent("WuqiCell").is_enabled ==  false){
                return false;
            }
        }
        return true;
    }

    //解锁指定id的武器
    unlock_knife_by_id(id:number){
        let pageIndex = Math.floor(id / 16);
        let page = this.content.children[pageIndex];
        let knife_id = id % 16;
        let wuqiCell = page.children[knife_id].getComponent("WuqiCell");
        wuqiCell.update_state(true);
    }

    //下一页点击事件
    next_page_click(){
        if(this.pageIndex < this.content.children.length-1){
            this.pageIndex++;
            this.pageView.getComponent(cc.PageView).setCurrentPageIndex(this.pageIndex);
        }else{
            this.game.toastUI.show_toast("已经是最后一页！");
        }
    }

    //上一页点击事件
    pre_page_click(){
        if(this.pageIndex > 0){
            this.pageIndex--;
            this.pageView.getComponent(cc.PageView).setCurrentPageIndex(this.pageIndex);
        }else{
            this.game.toastUI.show_toast("已经是第一页！");
        }
    }

    // 上传武器数量
    uploadMaxknifeCount(count) {
        if(!window["wx"]) return;
        count = count.toString()
        window["wx"].setUserCloudStorage({
            KVDataList: [
                { key:"knifeCountKey", value: count},
            ],
            success: (res) => {
                //console.log("上传武器数量成功！")
            },
            fail: (res) => {
            }
        })
    }
   
}
