
const {ccclass, property} = cc._decorator;

@ccclass
export default class FruitData extends cc.Component {

    //只保留第1关第1波：5个水果竖排直线
    public static shape_arr:Array<Array<cc.Vec2>> = [
        [cc.v2(0,220),cc.v2(0,110),cc.v2(0,0),cc.v2(0,-110),cc.v2(0,-220)],
    ]

    //1关1波，引用 shape_arr 索引（1-based）
    public static shape_group:Array<Array<number>> = [
        [1],
    ];

    //旋转动画编号
    public static anim_group:Array<Array<number>> = [
        [1],
    ];

    //水果种类：wave1 = 5个 type1（白色果汁）
    public static fruit_types:Array<Array<Array<number>>> = [
        [
            [1,1,1,1,1],
        ],
    ];
}
