import Game from "../Main/Game"

const {ccclass, property} = cc._decorator;

@ccclass
export default class PushServer extends cc.Component {

    game:Game = null;

    onLoad(){
        window.SocketManager.addHanlder(SocketManager.LOGIN,this.LoginSucc,this);//登录回调
        window.SocketManager.addHanlder(SocketManager.SHARE,this.onShare,this);//发送分享回调
        window.SocketManager.addHanlder(SocketManager.NOTIFY_SHARE,this.onNotifyShare,this);//推送别人点连接进去
    }

    init (game:Game) {//监听服务fun_name
        this.game = game;
    }

    LoginSucc(data){
        if(data.result===0){//登录成功
            let res=wx.getLaunchOptionsSync();
            //console.log('进口参数2');
            //console.log(res);
            //console.log("share_user_id="+res.query.user_id+",pet_id="+res.query.pet_id);
            if(res.query.user_id||window.Global.share_user_id){//判断只要有user_id说明是链接进来
                this.sendShare(res.query.user_id||window.Global.share_user_id,res.query.pet_id||window.Global.pet_id);
            }
            wx.onShow(function(res){
               // console.log('onShow进口参数3');
                //console.log(res);
                //console.log("share_user_id="+res.query.user_id+",pet_id="+res.query.pet_id);
                window.SocketManager.connect('xyxwb.xmxk513.com/wx');//安卓断线需要在onshow处理
                window.Global.share_user_id=res.query.user_id;
                window.Global.pet_id=res.query.pet_id;
                if(window.Global.share_user_id){
                    SocketManager.sendData(SocketManager.SHARE,{
                        id:window.Global.user_id,
                        sid:window.Global.share_user_id,
                        pet_id:window.Global.pet_id,//宠物id
                    })
                }
            })
        }
        //this.showHint('登录成功');
        //console.log('登录成功');
    }

    onShare(){
        //console.log('发送分享成功');
        window.Global.share_user_id=0;//分享成功重置
        window.Global.pet_id=0;
        //this.showHint('发送分享成功');
    }

    sendShare(sid,pet_id){
        SocketManager.sendData(SocketManager.SHARE,{
            id:window.Global.user_id,
            sid:sid,
            pet_id:pet_id//宠物id
        })
    }

    //推送别人点连接进去
    onNotifyShare(data){
        //this.showHint('用户点了你的链接userID'+data.invited);
        //console.log('用户点了你的链接userID'+data.invited);//todo 有人点了你的链接了
        //console.log(data);
        let petData = this.game.petUI.petDataList[data.pet_id-1];
        petData.is_invite = 1;
        petData.is_lock = 1;
        petData.friend_icon = data.userInfo[0].avatar_url;
        petData.friend_name = data.userInfo[0].nick_name;
        this.game.toastUI.show_toast("您成功的解锁了宠物:"+this.game.petUI.pet_names[data.pet_id-1]);
        //保存宠物的信息
        this.game.petUI.save_pet_datas();
        //更新宠物的状态
        this.game.petUI.update_pet_ui(data.pet_id);
    }
}
