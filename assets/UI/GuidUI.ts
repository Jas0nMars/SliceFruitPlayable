
const {ccclass, property} = cc._decorator;

@ccclass
export default class GuidUI extends cc.Component {
    @property(cc.Sprite)
    guid_img:cc.Sprite = null;
    //添加到我的小程序
    @property(cc.SpriteFrame)
    add_program:cc.SpriteFrame = null;
    //添加到桌面
    @property(cc.SpriteFrame)
    add_desk:cc.SpriteFrame = null;

  show_guid_ui(){
      this.node.active = true;
      if(typeof(wx)=='undefined'){
          return;
      }
      let self = this;
      wx.getSystemInfo({
        success: function (d) {
            //判断用户手机是IOS还是Android
            if (d.platform == 'android') {
                self.guid_img.spriteFrame = self.add_desk;
            }
            if (d.platform == 'ios') {//如果用户的设备是IOS
                self.guid_img.spriteFrame = self.add_program;
            }
        },
        fail: function (res) {
            self.guid_img.spriteFrame = this.add_desk;
        }
    });
  }

  hide_guid_ui(){
      this.node.active = false;
  }
}
