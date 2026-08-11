import Game from "./Game"
import FruitEffect from "./FruitEffect"

const {ccclass, property} = cc._decorator;

@ccclass
export default class FruitPoolMgr extends cc.Component {

    @property(cc.SpriteFrame)
    guozhi_icon:cc.SpriteFrame = null;

    @property(cc.Prefab)
    fruit_prefab:cc.Prefab = null;

    @property(cc.Prefab)
    fruit_effect_white_prefab:cc.Prefab = null;

    @property(cc.Prefab)
    guozhi_prefab:cc.Prefab = null;

    game:Game = null;

    fruit_pool:Array<cc.Node> = [];
    fruit_effect_white_pool:Array<cc.Node> = [];
    guozhi_pool:Array<cc.Node> = [];

    init(game:Game){
        this.game = game;
        this.init_fruit();
        this.init_fruit_effect();
        this.init_guozhi_effect();
    }

    //初始化水果对象
    init_fruit(){
        for(let i=0;i<10;i++){
            let fruit_node = cc.instantiate(this.fruit_prefab);
            this.fruit_pool.push(fruit_node);
        }
    }

    requestFruit(){
        if(this.fruit_pool.length > 0){
            let index = this.fruit_pool.length - 1;
            let node = this.fruit_pool[index];
            node.getChildByName("fruit").active = true;
            node.getChildByName("fruit").getComponent("Fruit").is_scale = false;
            this.fruit_pool.splice(index,1);
            return node;
        }else{
            let node = cc.instantiate(this.fruit_prefab);
            return node;
        }
    }

    returnFruit(fruit:cc.Node){
        this.fruit_pool.push(fruit);
    }

    //初始化白色果汁爆裂特效
    init_fruit_effect(){
        for(let i=0;i<10;i++){
            let fruit_effect = cc.instantiate(this.fruit_effect_white_prefab);
            fruit_effect.getComponent("FruitEffect").init(this.game);
            this.fruit_effect_white_pool.push(fruit_effect);
        }
    }

    requestWhiteFruitEffect(){
        if(this.fruit_effect_white_pool.length > 0){
            let index = this.fruit_effect_white_pool.length - 1;
            let node = this.fruit_effect_white_pool[index];
            this.fruit_effect_white_pool.splice(index,1);
            return node;
        }else{
            let node = cc.instantiate(this.fruit_effect_white_prefab);
            node.getComponent("FruitEffect").init(this.game);
            return node;
        }
    }

    returnWhiteFruitEffect(fruit_effect:cc.Node){
        fruit_effect.parent = null;
        this.fruit_effect_white_pool.push(fruit_effect);
    }

    //初始化果汁粒子特效
    init_guozhi_effect(){
        for(let i=0;i<10;i++){
            let guozhi_effect = cc.instantiate(this.guozhi_prefab);
            this.guozhi_pool.push(guozhi_effect);
        }
    }

    requestGuozhiEffect(){
        if(this.guozhi_pool.length > 0){
            let index = this.guozhi_pool.length - 1;
            let node = this.guozhi_pool[index];
            this.guozhi_pool.splice(index,1);
            return node;
        }else{
            let node = cc.instantiate(this.guozhi_prefab);
            return node;
        }
    }

    returnGuozhiEffect(guozhi_effect:cc.Node){
        guozhi_effect.parent = null;
        this.guozhi_pool.push(guozhi_effect);
    }
}
