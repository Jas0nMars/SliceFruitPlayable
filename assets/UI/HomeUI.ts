import Game from "../Main/Game"
const {ccclass, property} = cc._decorator;

@ccclass
export default class HomeUI extends cc.Component {

    @property(cc.Node)
    start_ui:cc.Node = null;
    @property(cc.Node)
    start_btn:cc.Node = null;
    @property(cc.Node)
    progress_ui:cc.Node = null;
    @property(cc.Sprite)
    progress_bar:cc.Sprite = null;
    @property(cc.Label)
    progress_txt:cc.Label = null;


    @property(cc.Node)
    feedback_node:cc.Node = null;
    @property(cc.Node)
    wuqi_btn:cc.Node = null;
    @property(cc.Node)
    sound_btn:cc.Node = null;
    @property(cc.Node)
    rank_btn:cc.Node = null;

    @property(cc.Sprite)
    knife_icon:cc.Sprite = null;

    game:Game = null;
    feedbackBtn = null;
    btnAuthorize = null;

    /*
    start(){
        this.check_author();
    }*/

    init (game:Game) {
        this.game = game;
        this.progress_txt.string = "0%";
        this.show_feedback_btn();
        this.play_loading_anim();
    }

    play_loading_anim(){
        
        this.schedule(function(){
            if(this.progress_bar.fillStart < 1){
                this.progress_bar.fillStart += 0.02;
                this.progress_txt.string = Math.floor(this.progress_bar.fillStart*100) + "%";
            }else{
                this.progress_txt.string = "100%";
                this.unscheduleAllCallbacks();
                this.progress_ui.active = false;
                this.show_start_ui();
            }
        }.bind(this),0.02,50);
    }

    show_start_ui(){
        this.game.bannerAd.showHomeBannerAd();
        this.start_ui.active = true;
        //当分享关闭时隐藏武器商店
        if(this.game.isOpenShare==false){
            this.wuqi_btn.active = false;
            this.sound_btn.x = 150;
            this.rank_btn.x = -150;
        }
    }

    //显示首页
    show_home_ui(){
        this.node.active = true;
        this.show_feedback_btn();
        this.game.bannerAd.showHomeBannerAd();
    }

    //隐藏首页
    hide_home_ui(){
        this.game.bannerAd.hideHomeBannerAd();
        this.hide_feedback_btn();
        this.node.active = false;
    }

    //显示添加我的小游戏指引Ui
    show_guid_ui(){
        this.game.guidUI.show_guid_ui();
    }

    //投诉建议
    create_feedbackBtn(btnNode:cc.Node){
        if(typeof(wx) == 'undefined'){
            return;
        }
        if (wx.createFeedbackButton) {
            let btnSize = cc.size(btnNode.width,btnNode.height);
            let frameSize = cc.view.getFrameSize();
            let winSize = cc.director.getWinSize();
            //console.log(winSize);
            //坐标系转换
            //1.将fruit_node的坐标转换到世界坐标
            //let w_pos = btnNode.parent.convertToWorldSpaceAR(btnNode.getPosition());
            let w_pos = cc.v2(50,690);
            //console.log(w_pos);
            //适配不同机型来创建微信授权按钮
            let left = (w_pos.x-btnSize.width*0.5)/winSize.width*frameSize.width;
            let top = (winSize.height-w_pos.y-btnSize.height*0.5)/winSize.height*frameSize.height;
            let width = btnSize.width/winSize.width*frameSize.width;
            let height = (btnSize.height)/winSize.height*frameSize.height;
            let self = this;
            this.feedbackBtn = wx.createFeedbackButton({
                type: 'text',
                text: '',
                style: {
                    left: left,
                    top: top,
                    width: width,
                    height: height,
                    lineHeight: 0,
                    backgroundColor: '',//红#ff0000
                    color: '#ffffff',
                    textAlign: 'center',
                    fontSize: 16,
                    borderRadius: 0
                }
            });
            this.feedbackBtn.onTap(() => {
                this.game.soundMgr.play_btn_click_audio();
            });
        }else {
            // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
            wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
            })
        }
    }

    show_feedback_btn(){
        if(this.feedbackBtn == null){
            this.create_feedbackBtn(this.feedback_node);
        }
        this.feedbackBtn.show();
    }

    hide_feedback_btn(){
        if(this.feedbackBtn){
            this.feedbackBtn.hide();
        }
    }

    rank_btn_click(){//排行榜点击
        this.game.soundMgr.play_btn_click_audio();
        this.game.rankUI.show_rank_ui(false);
        this.hide_authorBtn();
        this.hide_feedback_btn();
    }

    share_btn_click(){//分享按钮点击
        //this.game.soundMgr.play_touch_block_music();
        //this.game.wxUtil.share_test();
    }

    //开始按钮点击事件
    start_btn_click(){
        this.game.soundMgr.play_btn_click_audio();
        this.hide_home_ui();
        this.game.inGameUI.is_gaming = true;
        this.game.inGameUI.show_game_ui();
        this.game.levelMgr.start_level();
    }


    //武器按钮点击
    wuqi_btn_click(){
        this.game.soundMgr.play_btn_click_audio();
        this.hide_home_ui();
        this.game.wuqiUI.show_wuqi_ui(0);
        this.hide_authorBtn();
        this.hide_feedback_btn();
    }

    //隐藏授权按钮
    hide_authorBtn(){
        if(this.btnAuthorize){
            this.btnAuthorize.hide();
        }
    }

    //显示授权按钮
    show_authorBtn(){
        if(this.btnAuthorize){
            this.btnAuthorize.show();
        }
    }
    


    change_knife_icon(icon:cc.SpriteFrame){
        this.knife_icon.spriteFrame = icon;
    }

    //检查用户是否授权
    check_author(){
        let self = this;
        wx.login({
            success: function(res) {
                let code = res.code;
                wx.getSetting({
                    success(res){
                        if(res.authSetting['scope.userInfo']){
                            //console.log("已经授权！！！");
                            wx.getUserInfo({
                                success(res){
                                    wx.request({
                                        url:"https://xyx.xmxk513.com/games_fruit/index.php/api/user/getUserInfo",
                                        data:{
                                            code:code,
                                            user:JSON.stringify(res.userInfo)
                                        },
                                        header:{
                                            'Content-Type':'application/x-www-form-urlencoded'
                                        },
                                        method:"POST",
                                        success:res=>{
                                            var json = JSON.stringify(res)
                                            //console.log("用户授权-----请求服务端获取用户信息成功:"+json);
                                            //设置到user对象中
                                            window.Global.user_id = res.data.msg.user_id;
                                            //console.log("user_id="+window.Global.user_id);
                                            window.Global.nick_name = res.data.msg.nick_name;
                                            window.Global.avatar_url = res.data.msg.avatar_url;
                                            window.SocketManager.connect('xyxwb.xmxk513.com/wx');//获取userid成功后链接socket
                                            //console.log('发送登录');
                                        },
                                        fail:res=>{
                                            //console.log("用户授权-----请求服务端获取用户信息失败:"+res);
                                        }
                                    });
                                }
                            })
                        }else{
                            //console.log("未授权----弹出授权窗口！")
                            self.createAuthorizeBtn(self.start_btn);
                        }

                    },
                    fail(res){

                    }
                })
            },
            fail: function (res) {
            }
        });
    }

    //创建开始游戏授权按钮
    //显示微信授权按钮
    createAuthorizeBtn(btnNode) {
        if(typeof(wx) == 'undefined') {
            return;
        }
        let self = this;
        let btnSize = cc.size(btnNode.width+10,btnNode.height+10);
        let frameSize = cc.view.getFrameSize();
        let winSize = cc.director.getWinSize();
        let w_pos = cc.v2(360,451);
        //适配不同机型来创建微信授权按钮
        let left = (w_pos.x-btnSize.width*0.5)/winSize.width*frameSize.width;
        let top = (winSize.height-w_pos.y-btnSize.height*0.5)/winSize.height*frameSize.height;
        let width = btnSize.width/winSize.width*frameSize.width;
        let height = (btnSize.height)/winSize.height*frameSize.height;
        
        this.btnAuthorize = wx.createUserInfoButton({
            type: 'text',
            text: '',
            style: {
                left: left,
                top: top,
                width: width,
                height: height,
                lineHeight: 0,
                backgroundColor: '',//红#ff0000
                color: '#ffffff',
                textAlign: 'center',
                fontSize: 16,
                borderRadius: 0
            }
        })
        this.btnAuthorize.show();
        this.btnAuthorize.onTap((info) => {
            //console.log("点击了用户授权按钮！！")
            if (info.userInfo) {
                //wx.showToast({title:"授权成功"});
                wx.login({
                    success: function(login) {
                        //console.log("code="+login.code+",user="+JSON.stringify(info.userInfo))
                        wx.request({
                            url:"https://xyx.xmxk513.com/games_fruit/index.php/api/user/getUserInfo",
                            data:{
                                code:login.code,
                                user:JSON.stringify(info.userInfo)
                            },
                            header:{
                                'Content-Type':'application/x-www-form-urlencoded'
                            },
                            method:"POST",
                            success:res=>{
                                var json = JSON.stringify(res)
                                //console.log("用户授权-----请求服务端获取用户信息成功:"+json);
                                //设置到user对象中
                                window.Global.user_id = res.data.msg.user_id;
                                //console.log("user_id="+window.Global.user_id);
                                window.Global.nick_name = res.data.msg.nick_name;
                                window.Global.avatar_url = res.data.msg.avatar_url;
                                window.SocketManager.connect('xyxwb.xmxk513.com/wx');//获取userid成功后链接socket
                                //console.log('发送登录');
                            },
                            fail:res=>{
                                //console.log("用户授权-----请求服务端获取用户信息失败:"+res);
                            }
                        });
                        self.btnAuthorize.destroy();
                    },
                    fail: function (res) {
                    }
                });
                
            }
        });            
    }
}
