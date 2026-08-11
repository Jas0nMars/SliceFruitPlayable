import { _decorator, Component, Node, tween, UIOpacity, Vec3 } from "cc";
import Game from "../Main/Game";

declare const wx: any;

const { ccclass, property } = _decorator;

@ccclass
export default class TrialCompletePopup extends Component {

    @property(Node)
    mask_bg: Node = null;

    @property(Node)
    board: Node = null;

    @property(Node)
    btn_replay: Node = null;

    @property(Node)
    btn_cta: Node = null;

    @property(Node)
    title_label: Node = null;

    @property(Node)
    sub_label: Node = null;

    game: Game = null;

    show() {
        this.node.active = true;
        //遮罩淡入
        if (this.mask_bg) {
            let opacity = this.mask_bg.getComponent(UIOpacity);
            if (!opacity) opacity = this.mask_bg.addComponent(UIOpacity);
            opacity.opacity = 0;
            tween(opacity).to(0.2, { opacity: 200 }).start();
        }
        //弹窗缩放弹出
        if (this.board) {
            this.board.setScale(new Vec3(0, 0, 1));
            tween(this.board).delay(0.1).to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: "backOut" }).start();
        }
    }

    hide() {
        if (this.board) {
            tween(this.board).to(0.2, { scale: new Vec3(0, 0, 0) }).call(() => {
                this.node.active = false;
            }).start();
        } else {
            this.node.active = false;
        }
    }

    on_replay_click() {
        if (this.game) {
            this.game.kill_fruit_num = 0;
            this.game.levelMgr.restart_cur_level();
        }
        this.hide();
    }

    on_cta_click() {
        if (typeof wx !== 'undefined' && wx.navigateToMiniProgram) {
            wx.navigateToMiniProgram({
                appId: '',
                path: ''
            });
        }
    }
}
