import { Vec2 } from "cc";

export default class FruitData {
    //只保留第1关第1波：5个水果竖排直线
    public static shape_arr: Array<Array<Vec2>> = [
        [new Vec2(0, 220), new Vec2(0, 110), new Vec2(0, 0), new Vec2(0, -110), new Vec2(0, -220)],
    ]

    //1关1波，引用 shape_arr 索引（1-based）
    public static shape_group: Array<Array<number>> = [
        [1],
    ];

    //旋转动画编号
    public static anim_group: Array<Array<number>> = [
        [1],
    ];

    //水果种类：wave1 = 5个 type1（白色果汁）
    public static fruit_types: Array<Array<Array<number>>> = [
        [
            [1, 1, 1, 1, 1],
        ],
    ];
}
