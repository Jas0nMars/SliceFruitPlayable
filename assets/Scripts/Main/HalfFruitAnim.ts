
const {ccclass, property} = cc._decorator;

@ccclass
export default class HalfFruitAnim extends cc.Component {
        
    bz_array:Array<cc.Vec2> = null;
    @property(cc.Integer)
    type:number = 1;//说明:-1:左边半个水果   1:右边半个水果


    show_half_fruit_move(kill_num:number){
        this.node.active = true;
        let half_fruit_dy = 200 + Math.floor(Math.random()*100);
        if(this.type > 0){ //右边半个水果
            this.bz_array = [cc.v2(this.node.x,this.node.y),cc.v2(this.node.x +40,this.node.y + half_fruit_dy),cc.v2(this.node.x +60,this.node.y)];
            let rf = cc.repeatForever(cc.rotateBy(0.8,-540));
            this.node.runAction(rf);
        }else{//左边半个水果 
            this.bz_array = [cc.v2(this.node.x,this.node.y),cc.v2(this.node.x -40,this.node.y + half_fruit_dy),cc.v2(this.node.x -60,this.node.y)];
            let rf = cc.repeatForever(cc.rotateBy(0.8,360));
            this.node.runAction(rf);
        }

        let bz_action = cc.bezierTo(0.3,this.bz_array);
        var end_func = function(){
            let local_pos = this.node.parent.convertToNodeSpaceAR(cc.v2(100,240));
            //飞到点-257,-410后消失
            let move = cc.moveTo(0.4,cc.v2(local_pos.x,local_pos.y + kill_num * 13));
            this.node.runAction(cc.sequence([move,cc.callFunc(function(){
                this.node.active = false;//隐藏
            }.bind(this))]));
        }.bind(this);
        this.node.runAction(cc.sequence([bz_action,cc.callFunc(end_func)]));
        
        
    }
}
