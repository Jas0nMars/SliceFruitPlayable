import Game from "../Main/Game"

const {ccclass, property} = cc._decorator;

@ccclass
export default class TrialCompletePopup extends cc.Component {

    @property(cc.Node)
    mask_bg:cc.Node = null;

    @property(cc.Node)
    board:cc.Node = null;

    @property(cc.Node)
    btn_replay:cc.Node = null;

    @property(cc.Node)
    btn_cta:cc.Node = null;

    @property(cc.Node)
    title_label:cc.Node = null;

    @property(cc.Node)
    sub_label:cc.Node = null;

    game:Game = null;

    show(){
        this.node.active = true;
        //遮罩淡入
        if(this.mask_bg){
            this.mask_bg.opacity = 0;
            cc.tween(this.mask_bg).to(0.2, {opacity: 200}).start();
        }
        //弹窗缩放弹出
        if(this.board){
            this.board.setScale(0,0,1);
            cc.tween(this.board).delay(0.1).to(0.3,{scale:1},{easing:'backOut'}).start();
        }
    }

    hide(){
        if(this.board){
            cc.tween(this.board).to(0.2,{scale:0}).call(()=>{
                this.node.active = false;
            }).start();
        }else{
            this.node.active = false;
        }
    }

    on_replay_click(){
        if(this.game){
            this.game.kill_fruit_num = 0;
            this.game.levelMgr.restart_cur_level();
        }
        this.hide();
    }

    on_cta_click(){
        // CTA按钮：跳转到完整版小程序
        if(typeof wx !== 'undefined' && wx.navigateToMiniProgram){
            wx.navigateToMiniProgram({
                appId: '',// 替换为实际 appId
                path: ''
            });
        }
    }
}
