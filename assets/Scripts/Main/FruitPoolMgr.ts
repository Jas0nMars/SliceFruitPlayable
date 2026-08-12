import { _decorator, Component, Prefab, instantiate, Node, ParticleSystem2D, resources, ImageAsset, SpriteFrame, Texture2D } from "cc";
import Game from "./Game";
import FruitEffect from "./FruitEffect";

const { ccclass, property } = _decorator;

@ccclass
export default class FruitPoolMgr extends Component {

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
            node.active = true;
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
        // 加载黄色粒子贴图并替换 plist 内嵌贴图
        resources.load("Textures/Effects/yellow-001", ImageAsset, (err, imageAsset) => {
            if (err) {
                console.error("[FruitPoolMgr] 加载黄色粒子贴图失败:", err);
                return;
            }
            let tex = new Texture2D();
            tex.image = imageAsset;
            let sf = new SpriteFrame();
            sf.texture = tex;
            // 应用到所有已缓存的果汁粒子节点
            for (let i = 0; i < this.guozhi_pool.length; i++) {
                let ps = this.guozhi_pool[i].getComponent(ParticleSystem2D);
                if (ps) {
                    ps.spriteFrame = sf;
                }
            }
        });
    }

    requestGuozhiEffect(): Node {
        let node: Node = null;
        if (this.guozhi_pool.length > 0) {
            let index = this.guozhi_pool.length - 1;
            node = this.guozhi_pool[index];
            this.guozhi_pool.splice(index, 1);
        } else {
            node = instantiate(this.guozhi_prefab);
        }
        node.active = true;
        // 重启粒子系统（对象池复用时粒子已播完，需要手动重置）
        let ps: any = node.getComponent(ParticleSystem2D);
        if (ps) {
            ps.resetSystem();
        }
        return node;
    }

    returnGuozhiEffect(guozhi_effect: Node) {
        guozhi_effect.parent = null;
        guozhi_effect.active = false;
        this.guozhi_pool.push(guozhi_effect);
    }
}
