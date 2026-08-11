import { _decorator, Component, Node, tween, Vec3, view, Collider2D, UITransform } from "cc";
import Game from "./Game";
import Fruit from "./Fruit";
import FruitEffect from "./FruitEffect";

const { ccclass, property } = _decorator;

@ccclass
export default class Knife extends Component {

    @property
    knife_type: number = 1;

    game: Game = null;
    height: number = 0;
    knife_y: number = 0;
    private _idleTween: any = null;
    private _rotateTween: any = null;

    onLoad() {
        this.height = view.getVisibleSize().height;
        this.knife_y = this.node.position.y;
    }

    init(game: Game) {
        this.game = game;
    }

    //发射飞刀
    shoot_knife(finish_func: Function) {
        this.node.setRotationFromEuler(0, 0, 0);
        this.node.setPosition(0, this.knife_y, 0);

        //停止待机浮动
        if (this._idleTween) { this._idleTween.stop(); this._idleTween = null; }

        //旋转动画
        this._rotateTween = tween(this.node)
            .by(0.6, { eulerAngles: new Vec3(0, 0, -2160) })
            .start();

        //向上移动
        tween(this.node)
            .to(0.6, { position: new Vec3(0, this.height - 300, 0) })
            .call(() => {
                if (this._rotateTween) { this._rotateTween.stop(); this._rotateTween = null; }

                if (this.game.inGameUI.combo_kill_num > 0) {
                    //切中水果，正常结束
                } else {
                    //未切中水果
                    this.game.inGameUI.is_gaming = false;
                    this.scheduleOnce(() => {
                        this.game.levelMgr.reset_level_state();
                        this.game.levelMgr.cur_wave_idx = 0;
                        this.game.levelMgr.start_wave();
                    }, 1.5);
                }
                this.game.inGameUI.combo_kill_num = 0;

                this.node.setPosition(0, this.knife_y, 0);
                this.node.setRotationFromEuler(0, 0, 0);
                this.play_idle_anim();
                if (finish_func) finish_func();
            })
            .start();
    }

    play_idle_anim() {
        //待机浮动动画
        this._idleTween = tween(this.node)
            .to(0.5, { position: new Vec3(0, this.knife_y + 30, 0) }, { easing: "sineInOut" })
            .to(0.5, { position: new Vec3(0, this.knife_y - 30, 0) }, { easing: "sineInOut" })
            .union()
            .repeatForever()
            .start();
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        let fruit_node = otherCollider.node;
        let fruit_com = fruit_node.getComponent(Fruit);
        if (!fruit_com || fruit_com.is_killed) return;

        fruit_com.is_killed = true;

        //坐标系转换
        let fruit_w_pos = fruit_node.parent.getWorldPosition();
        let fruit_h_pos = this.game.inGameUI.fruit_effect_ui.getComponent(UITransform).convertToNodeSpaceAR(fruit_w_pos);

        fruit_node.active = false;

        //果汁粒子特效
        let guozhi_node = this.game.fruitPoolMgr.requestGuozhiEffect();
        this.game.inGameUI.guozhi_ui.addChild(guozhi_node);
        guozhi_node.setPosition(fruit_h_pos.x, fruit_h_pos.y, 0);

        //水果爆裂特效
        let fruit_effect = this.game.fruitPoolMgr.requestWhiteFruitEffect();
        this.game.inGameUI.fruit_effect_ui.addChild(fruit_effect);
        fruit_effect.setPosition(fruit_h_pos.x, fruit_h_pos.y, 0);
        fruit_effect.getComponent(FruitEffect).play_fruit_effect();

        this.scheduleOnce(() => {
            this.game.fruitPoolMgr.returnGuozhiEffect(guozhi_node);
        }, 1.1);

        this.game.levelMgr.update_kill_fruit();
        this.game.kill_fruit_num++;
        this.game.inGameUI.combo_kill_num++;
    }
}
