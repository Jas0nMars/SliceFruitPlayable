import { _decorator, Component, Node, EventTouch } from "cc";
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

    center_knife_node_com: Knife = null;
    is_finished: boolean = true;
    game: Game = null;
    public is_gaming = true;
    combo_kill_num: number = 0;

    init(game: Game) {
        this.game = game;
        this.center_knife_node_com = this.center_knife_node.getComponent(Knife);
        this.center_knife_node_com.init(game);

        this.node.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            if (this.is_finished == false || this.is_gaming == false) {
                return;
            }
            this.center_knife_node_com.shoot_knife(() => {
                this.is_finished = true;
            });
            this.is_finished = false;
        }, this);
    }
}
