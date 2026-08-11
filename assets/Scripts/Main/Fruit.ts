
const {ccclass, property} = cc._decorator;

@ccclass
export default class Fruit extends cc.Component {
    
    @property(cc.Integer)
    fruit_type:number = 0;
    color_type:number = 0;//果汁颜色:0 红色，1 绿色，2 黄色
    public is_killed:boolean = false;
    start(){
        this.self_random_rotate();
    }

    //水果自身过一段时间旋转
    self_random_rotate(){
        let rotate_time = Math.round(Math.random() * 30)/10 + 0.6;
        let angle = Math.floor(Math.random() * 120) + 60;
        let delay_time = Math.round(Math.random() * 10)/10;
        this.scheduleOnce(function(){
            this.node.runAction(cc.rotateTo(0.5,this.node.rotation + angle));
        }.bind(this),delay_time);
        this.schedule(function(){
            this.node.runAction(cc.rotateTo(0.5,this.node.rotation + angle));
        }.bind(this),rotate_time + 0.5,cc.macro.REPEAT_FOREVER,delay_time); 
    }

    onCollisionEnter(other:cc.Collider, self:cc.Collider){
        //console.log("碰撞到水果-------")
        this.unscheduleAllCallbacks();
        //this.node.active = false;
    }
}
