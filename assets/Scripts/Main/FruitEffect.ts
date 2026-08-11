import { _decorator, Component, Node } from "cc";
import Game from "./Game";

const { ccclass, property } = _decorator;

// TODO: 启用 DragonBones 后恢复完整实现
// import { dragonBones, ArmatureDisplay } from "dragonBones";

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
        // 临时：播放后延迟回收
        this.scheduleOnce(() => {
            if (this.game) {
                this.game.fruitPoolMgr.returnWhiteFruitEffect(this.node);
            }
        }, 1.0);
    }
}
