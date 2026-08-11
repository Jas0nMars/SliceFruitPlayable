import Game from "./Game"

const {ccclass, property} = cc._decorator;

@ccclass
export default class FruitEffect extends cc.Component {
    //果汁颜色:0 红色，1 绿色，2 黄色
    @property(cc.Integer)
    color_type:number = 0;
    game:Game = null;
    
    dragonDisplay:dragonBones.ArmatureDisplay = null;
    
    init(game){
        this.game = game;
        this.dragonDisplay = this.node.getComponent(dragonBones.ArmatureDisplay);
        this.dragonDisplay.addEventListener(dragonBones.EventObject.COMPLETE, this.animationEventHandler, this);
    }

    //播放水果特效
    play_fruit_effect(){
        this.node.active = true;
        this.dragonDisplay.playAnimation("newAnimation",1);
    }

    animationEventHandler(event){
        if (event.type == dragonBones.EventObject.COMPLETE) {
            //果汁颜色:0 红色，1 绿色，2 黄色
            if(this.color_type == 0){
                this.game.fruitPoolMgr.returnRedFruitEffect(this.node);
            }else if(this.color_type == 1){
                this.game.fruitPoolMgr.returnGreenFruitEffect(this.node);
            }else if(this.color_type == 2){
                this.game.fruitPoolMgr.returnYellowFruitEffect(this.node);
            }else{
                this.game.fruitPoolMgr.returnWhiteFruitEffect(this.node);
            }
        } 
    }
}
