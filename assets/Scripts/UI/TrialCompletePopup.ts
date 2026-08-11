import Game from "../Main/Game"

const {ccclass, property} = cc._decorator;

/**
 * 试玩完成弹窗 - 试玩广告版
 * 
 * 功能：
 * 1. 弹窗缩放进入动画
 * 2. "再玩一次"按钮 → 重新开始
 * 3. "下载完整版"按钮（CTA）→ 跳转下载
 */
@ccclass
export default class TrialCompletePopup extends cc.Component {

    @property(cc.Node)
    mask_bg:cc.Node = null;       // 遮罩背景

    @property(cc.Node)
    board:cc.Node = null;         // 弹窗底板

    @property(cc.Node)
    btn_replay:cc.Node = null;    // 再玩一次按钮

    @property(cc.Node)
    btn_cta:cc.Node = null;       // 下载完整版按钮（CTA）

    @property(cc.Node)
    title_label:cc.Node = null;   // 标题文本

    @property(cc.Node)
    sub_label:cc.Node = null;     // 副标题文本

    game:Game = null;

    onLoad(){
        // 初始隐藏
        this.node.active = false;

        // 绑定按钮事件
        if(this.btn_replay){
            this.btn_replay.on(cc.Node.EventType.TOUCH_END, this.on_replay_click, this);
        }
        if(this.btn_cta){
            this.btn_cta.on(cc.Node.EventType.TOUCH_END, this.on_cta_click, this);
        }
    }

    /**
     * 显示弹窗
     */
    show(){
        this.node.active = true;

        // 遮罩初始透明
        if(this.mask_bg){
            this.mask_bg.opacity = 0;
            cc.tween(this.mask_bg).to(0.2, {opacity: 200}).start();
        }

        // 弹窗缩放弹出
        if(this.board){
            this.board.setScale(0, 0, 1);
            cc.tween(this.board)
                .delay(0.1)
                .to(0.3, {scale: 1}, {easing: 'backOut'})
                .start();
        }
    }

    /**
     * 隐藏弹窗
     */
    hide(){
        // 弹窗缩小消失
        if(this.board){
            cc.tween(this.board)
                .to(0.2, {scale: 0}, {easing: 'backIn'})
                .call(() => {
                    this.node.active = false;
                })
                .start();
        }else{
            this.node.active = false;
        }
    }

    /**
     * 再玩一次
     */
    on_replay_click(){
        if(this.game){
            this.game.replay_game();
        }
    }

    /**
     * 下载完整版（CTA）
     */
    on_cta_click(){
        // 微信小游戏环境：跳转到完整版小程序
        if(typeof(wx) != 'undefined' && wx != null){
            wx.navigateToMiniProgram({
                appId: '', // 替换为完整版小程序 appId
                path: '',  // 替换为跳转路径
            });
        }else{
            // 非微信环境：打印日志或跳转链接
            console.log('[TrialCompletePopup] CTA clicked - download full version');
        }
    }
}
