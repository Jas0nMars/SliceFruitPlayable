const dataMgr = require("DataMgr");
var SocketManager=require('SocketManager');
cc.Class({
    extends: cc.Component,

    properties: {
        
        start_node:{
            type:cc.Node,
            default:null,
        },
    },

    onLoad(){
        this.game = this.node.getComponent("Game");
    },

    start () {
        this.createAuthorizeBtn(this.start_node);
    },

    //创建开始游戏授权按钮
    //显示微信授权按钮
    createAuthorizeBtn(btnNode) {
        if(typeof(wx) == 'undefined') {
            return;
        }
        let self = this;
        wx.onShow(function(res){
            console.log('onShow进口参数');
            console.log(res);
            Global.share_user_id=res.query.user_id;
        });
        let btnSize = cc.size(btnNode.width+10,btnNode.height+10);
        let frameSize = cc.view.getFrameSize();
        let winSize = cc.director.getWinSize();
        //适配不同机型来创建微信授权按钮
        let left = (winSize.width*0.5+btnNode.x-btnSize.width*0.5)/winSize.width*frameSize.width;
        let top = (winSize.height*0.5-btnNode.y-btnSize.height*0.5)/winSize.height*frameSize.height;
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
                backgroundColor: '#ff0000',//红#ff0000
                color: '#ffffff',
                textAlign: 'center',
                fontSize: 16,
                borderRadius: 0
            }
        })
        this.btnAuthorize.show();
        this.btnAuthorize.onTap((info) => {
            if (info.userInfo) {
                //wx.showToast({title:"授权成功"});
                wx.login({
                    success: function(login) {
                        wx.request({
                            url:"https://xmxk2.wxopez.com/games_tgdyj/index.php/api/user/getUserInfo",
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
                                Global.user_id = res.data.msg.user_id;
                                Global.nick_name = res.data.msg.nick_name;
                                Global.avatar_url = res.data.msg.avatar_url;
                                SocketManager.connect('wyxwb.xmxk513.com/wx');//获取userid成功后链接socket
                                console.log('发送登录');
                                window.game.start_login_click();
                                self.btnAuthorize.destroy();
                            },
                            fail:res=>{
                                //console.log("用户授权-----请求服务端获取用户信息失败:"+res);
                            }
                        });
                    },
                    fail: function (res) {
                    }
                });
                
            }
        });            
    },

});
