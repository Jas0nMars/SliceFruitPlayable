import { _decorator, Component, tween, Vec3, Collider2D, IPhysics2DContact } from "cc";

const { ccclass, property } = _decorator;

@ccclass
export default class Fruit extends Component {

    @property
    fruit_type: number = 0;

    color_type: number = 0; // 果汁颜色:0 红色，1 绿色，2 黄色，3 白色
    public is_killed: boolean = false;

    private _rotateTween: any = null;

    start() {
        this.self_random_rotate();
        // 显式注册碰撞事件
        let collider = this.node.getComponent(Collider2D);
        if (collider) {
            collider.on('begin-contact', this.onBeginContact, this);
        }
    }

    //水果自身旋转
    self_random_rotate() {
        let rotate_time = Math.round(Math.random() * 30) / 10 + 0.6;
        let angle = Math.floor(Math.random() * 120) + 60;
        let delay_time = Math.round(Math.random() * 10) / 10;

        //延迟后开始持续旋转
        this.scheduleOnce(() => {
            //CC3.x 中正值=逆时针，取负实现顺时针
            this._rotateTween = tween(this.node)
                .by((rotate_time + 0.5) / 0.8, { eulerAngles: new Vec3(0, 0, -angle) })
                .union()
                .repeatForever()
                .start();
        }, delay_time);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        this.unscheduleAllCallbacks();
        if (this._rotateTween) {
            this._rotateTween.stop();
            this._rotateTween = null;
        }
    }
}
