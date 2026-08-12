import { _decorator, Component, Node, tween, Vec3, view, UITransform, Sprite, SpriteFrame, instantiate, find } from "cc";
import Game from "./Game";
import Fruit from "./Fruit";
import FruitEffect from "./FruitEffect";

const { ccclass, property } = _decorator;

@ccclass
export default class Knife extends Component {

    @property
    knife_type: number = 1;

    @property
    slice_radius: number = 80; // 切割检测半径

    @property(Node)
    plate_node: Node = null; // 果盘目标节点（半水果飞向该节点位置）

    @property
    plate_stack_offset: number = 13; // 每个水果的果盘堆叠高度偏移

    // 半水果两阶段动画时长
    private static readonly ARC_DURATION = 0.3;   // 贝塞尔弧线飞出
    private static readonly PLATE_DURATION = 0.4;  // 飞向果盘

    game: Game = null;
    height: number = 0;
    knife_y: number = 0;
    private _idleTween: any = null;
    private _rotateTween: any = null;
    private _is_shooting: boolean = false;

    // 飞刀消除计数：每投掷一次发生消除算一次，累计 3 次强制通关
    throw_elimination_count: number = 0;
    private _throw_kill_count: number = 0; // 当前投掷的切中数

    // 半水果追踪数据
    private _halfFruits: Node[] = [];
    private _halfData: {
        side: number;
        startPos: Vec3;
        ctrlPos: Vec3;
        endPos: Vec3;
        plateTarget: Vec3;
        rotSpeed: number;
        phase: number;
        elapsed: number;
    }[] = [];

    onLoad() {
        this.height = view.getVisibleSize().height;
        this.knife_y = this.node.position.y;
    }

    init(game: Game) {
        this.game = game;
        this.play_idle_anim();
    }

    //发射飞刀
    shoot_knife(finish_func: Function) {
        this.node.setRotationFromEuler(0, 0, 0);
        this.node.setPosition(0, this.knife_y, 0);
        this._is_shooting = true;
        this._throw_kill_count = 0; // 重置本次投掷切中计数



        //停止待机浮动
        if (this._idleTween) { this._idleTween.stop(); this._idleTween = null; }

        //旋转动画
        this._rotateTween = tween(this.node)
            .by(0.6, { eulerAngles: new Vec3(0, 0, -2160) })
            .start();

        //向上移动
        tween(this.node)
            .to(0.6, { position: new Vec3(0, this.height - 300, 0) })
            .call(() => {
                this._is_shooting = false;
                if (this._rotateTween) { this._rotateTween.stop(); this._rotateTween = null; }

                // 本次投掷有切中水果，累计消除次数
                if (this._throw_kill_count > 0) {
                    this.throw_elimination_count++;
                }
                this._throw_kill_count = 0;

                this.game.inGameUI.combo_kill_num = 0;

                this.node.setPosition(0, this.knife_y, 0);
                this.node.setRotationFromEuler(0, 0, 0);
                this.play_idle_anim();
                if (finish_func) finish_func();
            })
            .start();
    }

    play_idle_anim() {
        //待机浮动动画
        this._idleTween = tween(this.node)
            .to(0.5, { position: new Vec3(0, this.knife_y + 30, 0) }, { easing: "sineInOut" })
            .to(0.5, { position: new Vec3(0, this.knife_y - 30, 0) }, { easing: "sineInOut" })
            .union()
            .repeatForever()
            .start();
    }

    update(dt: number) {
        //更新半水果物理模拟
        this._update_half_fruits(dt);

        if (!this._is_shooting) return;

        // 手动碰撞检测：飞刀飞行中每帧检查与水果的距离
        let fruitContainer = this.game.levelMgr.fruit_ui;
        if (!fruitContainer) return;

        let knife_pos = this.node.worldPosition;

        for (let i = 0; i < fruitContainer.children.length; i++) {
            let fruit_node = fruitContainer.children[i];
            if (!fruit_node.active) continue;

            let fruit_com = fruit_node.getComponent(Fruit);
            if (!fruit_com || fruit_com.is_killed) continue;

            let fruit_pos = fruit_node.worldPosition;
            let dx = knife_pos.x - fruit_pos.x;
            let dy = knife_pos.y - fruit_pos.y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.slice_radius) {
                this._slice_fruit(fruit_node, fruit_com);
            }
        }
    }

    _slice_fruit(fruit_node: Node, fruit_com: Fruit) {
        fruit_com.is_killed = true;
        this._throw_kill_count++; // 累计本次投掷切中数

        //坐标系转换：取水果自身世界坐标，转为 fruit_effect_ui 本地坐标
        let fruit_w_pos = fruit_node.worldPosition.clone();
        let uiTransform = this.game.inGameUI.fruit_effect_ui.getComponent(UITransform);
        if (!uiTransform) {
            console.error("[Knife] fruit_effect_ui 没有 UITransform 组件!");
            return;
        }
        let fruit_h_pos = uiTransform.convertToNodeSpaceAR(fruit_w_pos);

        //水果切半掉落（内部处理原始节点隐藏回收）
        this._spawn_half_fruit(fruit_node, fruit_com.fruit_type);

        //果汁粒子特效
        if (this.game.inGameUI.guozhi_ui) {
            let guozhi_node = this.game.fruitPoolMgr.requestGuozhiEffect();
            this.game.inGameUI.guozhi_ui.addChild(guozhi_node);
            guozhi_node.setPosition(fruit_h_pos.x, fruit_h_pos.y, 0);
            this.scheduleOnce(() => {
                this.game.fruitPoolMgr.returnGuozhiEffect(guozhi_node);
            }, 1.1);
        }

        //水果爆裂特效
        if (this.game.inGameUI.fruit_effect_ui) {
            let fruit_effect = this.game.fruitPoolMgr.requestWhiteFruitEffect();
            let fe_com = fruit_effect?.getComponent(FruitEffect);
            this.game.inGameUI.fruit_effect_ui.addChild(fruit_effect);
            fruit_effect.setPosition(fruit_h_pos.x, fruit_h_pos.y, 0);
            if (fe_com) {
                fe_com.play_fruit_effect();
            }
        }

        this.game.levelMgr.update_kill_fruit();
        this.game.kill_fruit_num++;
        this.game.inGameUI.combo_kill_num++;

        // 现金飞行：从水果位置飞向 cash_label
        if (this.game.cashSystem) {
            this.game.cashSystem.onBlocksEliminated([fruit_w_pos]);
        }
    }

    _spawn_half_fruit(fruit_node: Node, fruit_type: number) {
        let canvas = find('Canvas');
        let container = canvas || this.game.inGameUI.fruit_effect_ui;
        if (!container) {
            console.error("[Knife] _spawn_half_fruit: container 为空!");
            return;
        }

        let worldPos = fruit_node.worldPosition.clone();
        let killNum = this.game.inGameUI.combo_kill_num;

        // 获取半果精灵图（可选，与 Unity FruitController.SpawnHalfFruits 一致）
        let halfSprite: SpriteFrame = null;
        let halfImgs = this.game.half_fruit_imgs;
        if (halfImgs && halfImgs.length > 0) {
            let idx = fruit_type - 1;
            if (idx >= 0 && idx < halfImgs.length) {
                halfSprite = halfImgs[idx];
            }
        }

        // 隐藏并回收原始节点
        fruit_node.active = false;
        fruit_node.parent.removeChild(fruit_node);
        this.game.fruitPoolMgr.returnFruit(fruit_node);

        // 将水果世界坐标转为容器本地坐标
        let containerUT = container.getComponent(UITransform);
        let localPos = containerUT
            ? containerUT.convertToNodeSpaceAR(worldPos)
            : new Vec3(worldPos.x, worldPos.y, 0);

        for (let dir = -1; dir <= 1; dir += 2) {
            let half = instantiate(fruit_node);
            half.active = true; // 关键：克隆继承自已隐藏的 fruit_node，必须显式激活
            let fc = half.getComponent(Fruit);
            if (fc) {
                fc.is_killed = true;
                if (fc['_rotateTween']) { fc['_rotateTween'].stop(); fc['_rotateTween'] = null; }
            }

            let sp = half.getComponent(Sprite);
            if (halfSprite) {
                // 有独立半果精灵图 → 直接替换（与 Unity SetHalfSprite 一致）
                sp.spriteFrame = halfSprite;
            } else if (sp) {
                // 无独立半果图 → 用 Fill 裁剪原始水果图
                sp.type = Sprite.Type.FILLED;
                sp.fillType = Sprite.FillType.HORIZONTAL;
                if (dir === -1) {
                    sp.fillStart = 0;
                    sp.fillRange = 0.5;
                } else {
                    sp.fillStart = 0.5;
                    sp.fillRange = 0.5;
                }
            }

            // 左右镜像
            half.setScale(dir, 1, 1);

            container.addChild(half);
            half.setPosition(localPos.x, localPos.y, 0);
            half.setRotationFromEuler(0, 0, 0);

            // 贝塞尔弧线参数（匹配 Unity HalfFruitController 节奏）
            let peakOffset = 200 + Math.floor(Math.random() * 100);
            let ctrlPos = new Vec3(localPos.x + dir * 40, localPos.y + peakOffset, 0);
            let endPos = new Vec3(localPos.x + dir * 60, localPos.y, 0);

            // 旋转速度：左侧 +360/0.8s，右侧 -540/0.8s
            let rotSpeed = dir > 0 ? -540 / 0.8 : 360 / 0.8;

            // 果盘目标位置：取 plate_node 的世界坐标，转为容器本地坐标
            let plateWorldPos = this.plate_node ? this.plate_node.worldPosition : new Vec3(100, 540, 0);
            let plateTarget = containerUT
                ? containerUT.convertToNodeSpaceAR(plateWorldPos)
                : new Vec3(plateWorldPos.x, plateWorldPos.y, 0);
            plateTarget.y += killNum * this.plate_stack_offset;

            this._halfFruits.push(half);
            this._halfData.push({
                side: dir,
                startPos: localPos.clone(),
                ctrlPos,
                endPos,
                plateTarget,
                rotSpeed,
                phase: 0,
                elapsed: 0,
            });
        }
    }

    _update_half_fruits(dt: number) {
        for (let i = this._halfFruits.length - 1; i >= 0; i--) {
            let half = this._halfFruits[i];
            if (!half.isValid) {
                this._halfFruits.splice(i, 1);
                this._halfData.splice(i, 1);
                continue;
            }

            let data = this._halfData[i];
            data.elapsed += dt;

            if (data.phase === 0) {
                // Phase 1: 贝塞尔弧线飞出 (0.3s)
                let t = Math.min(data.elapsed / Knife.ARC_DURATION, 1);
                let pos = this._bezier2(data.startPos, data.ctrlPos, data.endPos, t);
                half.setPosition(pos.x, pos.y, pos.z);

                if (t >= 1) {
                    data.phase = 1;
                    data.elapsed = 0;
                    half.setPosition(data.endPos.x, data.endPos.y, data.endPos.z);
                }
            } else if (data.phase === 1) {
                // Phase 2: 线性飞向果盘 (0.4s)
                let t = Math.min(data.elapsed / Knife.PLATE_DURATION, 1);
                let pos = new Vec3(
                    data.endPos.x + (data.plateTarget.x - data.endPos.x) * t,
                    data.endPos.y + (data.plateTarget.y - data.endPos.y) * t,
                    0
                );
                half.setPosition(pos.x, pos.y, pos.z);

                if (t >= 1) {
                    // 动画结束，销毁
                    half.destroy();
                    this._halfFruits.splice(i, 1);
                    this._halfData.splice(i, 1);
                    continue;
                }
            }

            // 持续旋转
            let euler = half.eulerAngles;
            half.setRotationFromEuler(0, 0, euler.z + data.rotSpeed * dt);
        }
    }

    // 二阶贝塞尔曲线
    _bezier2(a: Vec3, b: Vec3, c: Vec3, t: number): Vec3 {
        let u = 1 - t;
        return new Vec3(
            u * u * a.x + 2 * u * t * b.x + t * t * c.x,
            u * u * a.y + 2 * u * t * b.y + t * t * c.y,
            u * u * a.z + 2 * u * t * b.z + t * t * c.z,
        );
    }
}
