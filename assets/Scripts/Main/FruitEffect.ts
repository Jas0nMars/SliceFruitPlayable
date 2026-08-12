import { _decorator, Component, Node } from "cc";
import Game from "./Game";
const { ccclass, property } = _decorator;

@ccclass
export default class FruitEffect extends Component {

    @property
    color_type: number = 0;

    game: Game = null;

    init(game: Game) {
        this.game = game;
    }

    play_fruit_effect() {
        this.node.active = true;

        // 显式重播 DragonBones 动画（对象池复用时动画已播完，需要手动重启）
        let armature: any = this.node.getComponent('dragonBones.ArmatureDisplay');
        if (armature) {
            armature.playAnimation('newAnimation', 1);
        }

        // 定时器回收
        this.unschedule(this._returnToPool);
        this.scheduleOnce(this._returnToPool, 1.0);
    }

    private _returnToPool = () => {
        if (this.game) {
            this.game.fruitPoolMgr.returnWhiteFruitEffect(this.node);
        }
    }
}
