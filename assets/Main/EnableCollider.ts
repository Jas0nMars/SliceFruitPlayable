
const {ccclass, property} = cc._decorator;

@ccclass
export default class EnableCollider extends cc.Component {
    
    onLoad(){
        cc.director.getCollisionManager().enabled = true;// 开启碰撞
        //cc.director.getCollisionManager().enabledDebugDraw = true;//开启碰撞盒
    }
}
