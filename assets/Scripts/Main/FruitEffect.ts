import { _decorator, Component } from "cc";
// 需要在项目设置中启用 DragonBones 模块
import { dragonBones, ArmatureDisplay } from "dragonBones";
import Game from "./Game";

const { ccclass, property } = _decorator;

@ccclass
export default class FruitEffect extends Component {

    @property
    color_type: number = 0;

    game: Game = null;
    dragonDisplay: ArmatureDisplay = null;

    init(game: Game) {
        this.game = game;
        this.dragonDisplay = this.node.getComponent(ArmatureDisplay);
        this.dragonDisplay.addEventListener(dragonBones.EventObject.COMPLETE, this.animationEventHandler, this);
    }

    play_fruit_effect() {
        this.node.active = true;
        this.dragonDisplay.playAnimation("newAnimation", 1);
    }

    animationEventHandler(event: any) {
        if (event.type === dragonBones.EventObject.COMPLETE) {
            this.game.fruitPoolMgr.returnWhiteFruitEffect(this.node);
        }
    }
}
