import WuqiUI from "../UI/WuqiUI"

const {ccclass, property} = cc._decorator;

@ccclass
export default class WuqiCell extends cc.Component {
    mask:cc.Node = null;
    sel_border:cc.Node = null;
    knife_icon:cc.Sprite = null;
    is_enabled:boolean = false;//武器是否可用
    is_cur_wuqi:boolean = false;//是否是当前使用的武器
    is_try_knife:boolean = false;//是否是试用武器
    wuqiUI:WuqiUI = null;
    id:number = 0;
    try_icon:cc.Node = null;

   
   init(wuqiUI:WuqiUI){
        this.node.addComponent(cc.Button);
        this.mask = this.node.getChildByName("mask");
        this.try_icon = this.node.getChildByName("try_icon");
        this.sel_border = this.node.getChildByName("sel_border");
        this.knife_icon = this.node.getChildByName("knife").getComponent(cc.Sprite);
        this.wuqiUI =  wuqiUI;
        this.node.on('click',function(event){
            if(this.is_cur_wuqi==false && this.is_enabled){
                this.set_cur_knife();
            }else{
                wuqiUI.game.toastUI.show_toast("该武器未解锁！");
            }
        }.bind(this),this);
        
   }

   //把这把武器设置为当前使用的武器
   set_cur_knife(){
        if(this.wuqiUI.pre_cell_com){
            this.wuqiUI.pre_cell_com.hide_sel_border();
        }
        //使用武器结束--------
        if(this.is_try_knife ==  false && this.wuqiUI.pre_cell_com.is_try_knife){
            this.wuqiUI.game.toastUI.show_toast("体验武器次数已用完！");
            this.wuqiUI.is_try_knife = false;
            this.wuqiUI.try_knife_count = 0;
            this.wuqiUI.game.dataMgr.set_try_knife_id(-1);
            this.wuqiUI.game.dataMgr.set_try_knife_count(0);
            this.wuqiUI.pre_cell_com.hide_try_knife_icon();
        }
        this.show_sel_border();
        this.wuqiUI.game.dataMgr.set_cur_knife_id(this.id);
   }

  

   update_state(enabled:boolean){
       this.is_enabled = enabled;
       if(this.is_enabled){
           this.mask.active = false;
       }else{
           this.mask.active = true;
       }
   }

   set_icon(icon:cc.SpriteFrame){
        this.knife_icon.spriteFrame = icon;
   }

   play_scale_anim(){
       let scale1 = cc.scaleTo(0.024,1.2);
       let scale2 = cc.scaleTo(0.024,1);
       let seq = cc.sequence([scale1,scale2]);
       this.node.runAction(seq);
   }

   //显示当前武器的黄色边框
   show_sel_border(){
        this.wuqiUI.change_cur_knife(this.knife_icon.spriteFrame);
        this.wuqiUI.pre_cell_com = this;
        this.is_cur_wuqi = true;
        this.sel_border.active = true;
   }

   //隐藏当前武器的黄色边框
   hide_sel_border(){
       this.is_cur_wuqi = false;
       this.sel_border.active = false;
   }

   show_try_knife_icon(){
        this.is_try_knife = true;
        this.try_icon.active = true;
   }

   hide_try_knife_icon(){
        this.is_try_knife = false;
        this.try_icon.active = false;
        this.update_state(false);
        this.hide_sel_border();
   }
  
}
