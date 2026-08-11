import { _decorator, Component, Prefab, SpriteFrame, instantiate, Node } from "cc";
import Game from "./Game";
import FruitEffect from "./FruitEffect";

const { ccclass, property } = _decorator;

@ccclass
export default class FruitPoolMgr extends Component {

    @property(SpriteFrame)
    guozhi_icon: SpriteFrame = null;

    @property(Prefab)
    fruit_prefab: Prefab = null;

    @property(Prefab)
    fruit_effect_white_prefab: Prefab = null;

    @property(Prefab)
    guozhi_prefab: Prefab = null;

    game: Game = null;

    fruit_pool: Array<Node> = [];
    fruit_effect_white_pool: Array<Node> = [];
    guozhi_pool: Array<Node> = [];

    init(game: Game) {
        this.game = game;
        this.init_fruit();
        this.init_fruit_effect();
        this.init_guozhi_effect();
    }

    init_fruit() {
        for (let i = 0; i < 10; i++) {
            let fruit_node = instantiate(this.fruit_prefab);
            this.fruit_pool.push(fruit_node);
        }
    }

    requestFruit(): Node {
        if (this.fruit_pool.length > 0) {
            let index = this.fruit_pool.length - 1;
            let node = this.fruit_pool[index];
            node.getChildByName("fruit").active = true;
            this.fruit_pool.splice(index, 1);
            return node;
        } else {
            return instantiate(this.fruit_prefab);
        }
    }

    returnFruit(fruit: Node) {
        this.fruit_pool.push(fruit);
    }

    init_fruit_effect() {
        for (let i = 0; i < 10; i++) {
            let fruit_effect = instantiate(this.fruit_effect_white_prefab);
            fruit_effect.getComponent(FruitEffect).init(this.game);
            this.fruit_effect_white_pool.push(fruit_effect);
        }
    }

    requestWhiteFruitEffect(): Node {
        if (this.fruit_effect_white_pool.length > 0) {
            let index = this.fruit_effect_white_pool.length - 1;
            let node = this.fruit_effect_white_pool[index];
            this.fruit_effect_white_pool.splice(index, 1);
            return node;
        } else {
            let node = instantiate(this.fruit_effect_white_prefab);
            node.getComponent(FruitEffect).init(this.game);
            return node;
        }
    }

    returnWhiteFruitEffect(fruit_effect: Node) {
        fruit_effect.parent = null;
        this.fruit_effect_white_pool.push(fruit_effect);
    }

    init_guozhi_effect() {
        for (let i = 0; i < 10; i++) {
            let guozhi_effect = instantiate(this.guozhi_prefab);
            this.guozhi_pool.push(guozhi_effect);
        }
    }

    requestGuozhiEffect(): Node {
        if (this.guozhi_pool.length > 0) {
            let index = this.guozhi_pool.length - 1;
            let node = this.guozhi_pool[index];
            this.guozhi_pool.splice(index, 1);
            return node;
        } else {
            return instantiate(this.guozhi_prefab);
        }
    }

    returnGuozhiEffect(guozhi_effect: Node) {
        guozhi_effect.parent = null;
        this.guozhi_pool.push(guozhi_effect);
    }
}
