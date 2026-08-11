
const {ccclass, property} = cc._decorator;

@ccclass
export default class Wave {
    
    //成员变量
    public fruit_types:Array<number> = [];//1.水果的种类
    public fruit_shape:Array<cc.Vec2> = null;//2.水果摆放的形状
    public fruit_rotate_name:string = null;//3.水果旋转的动画名称
}
