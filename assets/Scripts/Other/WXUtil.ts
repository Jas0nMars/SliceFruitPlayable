
const {ccclass, property} = cc._decorator;


@ccclass
export default class WXUtil extends cc.Component {
   
    share_count:number = 0;
    imgs_names:Array<string> = ["share_img.png","share_img2.png","share_img3.png"];

    start () {
        if(typeof(wx)!= 'undefined'){
            this.onCheckForUpdate();//自动检查版本更新
            this.share_menu();//右上角菜单添加分享选项
        }
    }

    //检查版本更新
    onCheckForUpdate(){
        if(typeof(wx) == 'undefined' || wx == null) {
            return;
        }
        if (typeof wx.getUpdateManager === 'function') {
            const updateManager = wx.getUpdateManager()
            updateManager.onCheckForUpdate(function (res) {
                // 请求完新版本信息的回调
            })
            updateManager.onUpdateReady(function () {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate()
            })
            updateManager.onUpdateFailed(function () {
                // 新的版本下载失败
                wx.showModal({
                    title: '更新提示',
                    content: '新版本下载失败',
                    showCancel:false
                })
            })
          }
    }


    share(){
        wx.showShareMenu({
            withShareTicket: false
        });
        let index = this.share_count % 3;
        var path = cc.url.raw("resources/"+this.imgs_names[index]);
        let title = "大家快来切水果，刺激又好玩"
        if(index==1){
            title = "究竟是什么游戏，让他们根本停不下来！";
        }else if(index==2){
            title = "点击开始，带你畅玩炫酷飞刀水果大战！";
        }
        if (cc.loader.md5Pipe) {
            path = cc.loader.md5Pipe.transformURL(path);
        }
        //主动拉起分享接口
        wx.shareAppMessage({ 
            title: title,
            imageUrl:path,
        })
        this.share_count++;
   }

   share_menu(){
        wx.showShareMenu({
            withShareTicket: false
        });
        let index = this.share_count % 3;
        var path = cc.url.raw("resources/"+this.imgs_names[index]);
        let title = "大家快来切水果，刺激又好玩"
        if(index==1){
            title = "究竟是什么游戏，让他们根本停不下来！";
        }else if(index==2){
            title = "点击开始，带你畅玩炫酷飞刀水果大战！";
        }
        if (cc.loader.md5Pipe) {
            path = cc.loader.md5Pipe.transformURL(path);
        } 
        //主动拉起分享接口
        wx.onShareAppMessage(function () {
             return {
                title: title,
                imageUrl:path,
            }
        });
        this.share_count++;
    }

}
