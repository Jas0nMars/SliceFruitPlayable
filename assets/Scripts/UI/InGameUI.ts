import { _decorator, Component, Node, EventTouch, tween } from "cc";
import Knife from "../Main/Knife";
import Game from "../Main/Game";

const { ccclass, property } = _decorator;

@ccclass
export default class InGameUI extends Component {

    @property(Node)
    center_knife_node: Node = null;

    @property(Node)
    guozhi_ui: Node = null;

    @property(Node)
    fruit_effect_ui: Node = null;

    @property(Node)
    guide_root: Node = null; // 引导节点（进入游戏后显示，点击屏幕消失）

    @property(Node)
    guide_hand: Node = null; // 引导手节点（左右晃动，点击后飞向飞刀）

    center_knife_node_com: Knife = null;
    is_finished: boolean = true;
    game: Game = null;
    public is_gaming = true;
    combo_kill_num: number = 0;
    private _is_showing_guide: boolean = false;
    private _guide_swing_tween: any = null;

    init(game: Game) {
        this.game = game;
        this.center_knife_node_com = this.center_knife_node.getComponent(Knife);
        this.center_knife_node_com.init(game);

        // 显示引导 + 手晃动动画
        if (this.guide_root) {
            this._is_showing_guide = true;
            this.guide_root.active = true;
            this._start_guide_swing();
        }

        this.node.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            // 引导显示中：手飞向飞刀 + 引导消失 + 同时发射飞刀
            if (this._is_showing_guide) {
                this._is_showing_guide = false;
                this._play_guide_fly_and_shoot();
                return;
            }
            if (this.is_finished == false || this.is_gaming == false) {
                return;
            }
            this.center_knife_node_com.shoot_knife(() => {
                this.is_finished = true;
            });
            this.is_finished = false;
        }, this);
    }

    /** 引导手左右晃动动画 */
    private _start_guide_swing() {
        if (!this.guide_hand) return;
        this.guide_hand.angle = 0;
        this._guide_swing_tween = tween(this.guide_hand)
            .to(0.5, { angle: -20 })
            .to(0.5, { angle: 10 })
            .union()
            .repeatForever()
            .start();
    }

    /** 引导手飞向飞刀位置 + 隐藏引导 + 发射飞刀 */
    private _play_guide_fly_and_shoot() {
        // 停止晃动
        if (this._guide_swing_tween) {
            this._guide_swing_tween.stop();
            this._guide_swing_tween = null;
        }

        // 立即隐藏引导
        if (this.guide_root) {
            this.guide_root.active = false;
        }

        // 同时发射飞刀
        if (this.is_finished && this.is_gaming) {
            this.center_knife_node_com.shoot_knife(() => {
                this.is_finished = true;
            });
            this.is_finished = false;
        }
    }
}
