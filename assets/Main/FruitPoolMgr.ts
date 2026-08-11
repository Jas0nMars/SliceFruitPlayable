import Game from "./Game"
import FruitEffect from "./FruitEffect"

const {ccclass, property} = cc._decorator;

@ccclass
export default class FruitPoolMgr extends cc.Component {

    @property([cc.SpriteFrame])
    guozhi_icons:Array<cc.SpriteFrame> = [];
   
    @property(cc.Prefab)
    fruit_prefab:cc.Prefab = null;

    @property(cc.Prefab)
    left_half_fruit_prefab:cc.Prefab = null;

    @property(cc.Prefab)
    right_half_fruit_prefab:cc.Prefab = null;

    @property(cc.Prefab)
    fruit_effect_red_prefab:cc.Prefab = null;
    @property(cc.Prefab)
    fruit_effect_green_prefab:cc.Prefab = null;
    @property(cc.Prefab)
    fruit_effect_yellow_prefab:cc.Prefab = null;
    @property(cc.Prefab)
    fruit_effect_white_prefab:cc.Prefab = null;

    @property(cc.Prefab)
    guozhi_prefab:cc.Prefab = null;
    

    game:Game = null;

    fruit_pool:Array<cc.Node> = [];
    left_half_fruit_pool:Array<cc.Node> = [];
    right_half_fruit_pool:Array<cc.Node> = [];
    fruit_effect_red_pool:Array<cc.Node> = [];
    fruit_effect_green_pool:Array<cc.Node> = [];
    fruit_effect_yellow_pool:Array<cc.Node> = [];
    fruit_effect_white_pool:Array<cc.Node> = [];
    guozhi_pool:Array<cc.Node> = [];
    

    init(game:Game){
        this.game = game;
        //初始化水果对象
        this.init_fruit();
        //初始化左边半个水果对象
        this.init_left_half_fruit();
        //初始化右边半个水果对象
        this.init_right_half_fruit();
        //初始化水果特效
        this.init_fruit_effect();
    }

    //初始化水果对象
    init_fruit(){
        for(let i=0;i<20;i++){
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

    //初始化左边半个水果对象
    init_left_half_fruit(){
        for(let i=0;i<10;i++){
            let left_fruit_node = cc.instantiate(this.left_half_fruit_prefab);
            this.left_half_fruit_pool.push(left_fruit_node);
        }
    }

    //初始化果汁特效
    init_fruit_effect(){
        for(let i=0;i<10;i++){
            let fruit_effect = cc.instantiate(this.fruit_effect_red_prefab);
            fruit_effect.getComponent("FruitEffect").init(this.game);
            this.fruit_effect_red_pool.push(fruit_effect);
        }
        for(let i=0;i<10;i++){
            let fruit_effect = cc.instantiate(this.fruit_effect_green_prefab);
            fruit_effect.getComponent("FruitEffect").init(this.game);
            this.fruit_effect_green_pool.push(fruit_effect);
        }
        for(let i=0;i<10;i++){
            let fruit_effect = cc.instantiate(this.fruit_effect_yellow_prefab);
            fruit_effect.getComponent("FruitEffect").init(this.game);
            this.fruit_effect_yellow_pool.push(fruit_effect);
        }
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

    requestRedFruitEffect(){
        if(this.fruit_effect_red_pool.length > 0){
            let index = this.fruit_effect_red_pool.length - 1;
            let node = this.fruit_effect_red_pool[index];
            this.fruit_effect_red_pool.splice(index,1);
            return node;
        }else{
            let node = cc.instantiate(this.fruit_effect_red_prefab);
            node.getComponent("FruitEffect").init(this.game);
            return node;
        }
    }

    returnRedFruitEffect(fruit_effect:cc.Node){
        fruit_effect.parent = null;
        this.fruit_effect_red_pool.push(fruit_effect);
    }

    requestGreenFruitEffect(){
        if(this.fruit_effect_green_pool.length > 0){
            let index = this.fruit_effect_green_pool.length - 1;
            let node = this.fruit_effect_green_pool[index];
            this.fruit_effect_green_pool.splice(index,1);
            return node;
        }else{
            let node = cc.instantiate(this.fruit_effect_green_prefab);
            node.getComponent("FruitEffect").init(this.game);
            return node;
        }
    }

    returnGreenFruitEffect(fruit_effect:cc.Node){
        fruit_effect.parent = null;
        this.fruit_effect_green_pool.push(fruit_effect);
    }


    requestYellowFruitEffect(){
        if(this.fruit_effect_yellow_pool.length > 0){
            let index = this.fruit_effect_yellow_pool.length - 1;
            let node = this.fruit_effect_yellow_pool[index];
            this.fruit_effect_yellow_pool.splice(index,1);
            return node;
        }else{
            let node = cc.instantiate(this.fruit_effect_yellow_prefab);
            node.getComponent("FruitEffect").init(this.game);
            return node;
        }
    }

    returnWhiteFruitEffect(fruit_effect:cc.Node){
        fruit_effect.parent = null;
        this.fruit_effect_white_pool.push(fruit_effect);
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

    returnYellowFruitEffect(fruit_effect:cc.Node){
        fruit_effect.parent = null;
        this.fruit_effect_yellow_pool.push(fruit_effect);
    }


    requestLeftFruit(){
        if(this.left_half_fruit_pool.length > 0){
            let index = this.left_half_fruit_pool.length - 1;
            let node = this.left_half_fruit_pool[index];
            this.left_half_fruit_pool.splice(index,1);
            return node;
        }else{
            let left_fruit_node = cc.instantiate(this.left_half_fruit_prefab);
            return left_fruit_node;
        }
    }

    returnLeftFruit(left_fruit:cc.Node){
        left_fruit.parent = null;
        this.left_half_fruit_pool.push(left_fruit);
    }

    //初始化右边半个水果对象
    init_right_half_fruit(){
        for(let i=0;i<10;i++){
            let right_fruit_node = cc.instantiate(this.right_half_fruit_prefab);
            this.right_half_fruit_pool.push(right_fruit_node);
        }
    }

    requestRightFruit(){
        if(this.right_half_fruit_pool.length > 0){
            let index = this.right_half_fruit_pool.length - 1;
            let node = this.right_half_fruit_pool[index];
            this.right_half_fruit_pool.splice(index,1);
            return node;
        }else{
            let right_fruit_node = cc.instantiate(this.right_half_fruit_prefab);
            return right_fruit_node;
        }
    }

    returnRightFruit(right_fruit:cc.Node){
        right_fruit.parent = null;
        this.right_half_fruit_pool.push(right_fruit);
    }

}
