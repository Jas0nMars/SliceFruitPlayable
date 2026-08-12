import { _decorator, Component, Node, tween, Tween, Vec3, Sprite } from "cc";
import Game from "../Main/Game";
import Fruit from "../Main/Fruit";
import FruitData from "../Main/FruitData";
import Level from "./Level";
import Wave from "./Wave";

const { ccclass, property } = _decorator;

@ccclass
export default class LevelMgr extends Component {

    @property(Node)
    fruit_ui: Node = null;

    level_arr: Array<Level> = [];
    game: Game = null;
    cur_level_idx: number = 0;
    cur_wave_idx: number = 0;
    cur_wave_total: number = 0;
    kill_num: number = 0;

    init(game: Game) {
        this.game = game;
        this.cur_level_idx = 0;
        this.load_level_data();
        this.start_level();
    }

    load_level_data() {
        for (let i = 0; i < FruitData.shape_group.length; i++) {
            let level = new Level();
            level.level_index = i;
            for (let j = 0; j < FruitData.shape_group[i].length; j++) {
                let wave = new Wave();
                let index = FruitData.shape_group[i][j] - 1;
                wave.fruit_shape = FruitData.shape_arr[index];
                wave.fruit_types = FruitData.fruit_types[i][j];
                let anim_index = FruitData.anim_group[i][j];
                let anim_name = "rotate" + anim_index + "_anim";
                wave.fruit_rotate_name = anim_name;
                level.waves.push(wave);
            }
            this.level_arr.push(level);
        }
    }

    start_level() {
        this.cur_wave_idx = 0;
        this.start_wave();
    }

    end_level() {
        this.game.is_level_ended = true; // 标记关卡已结束
        // 所有水果切割完成，标记现金系统等待完成
        // 现金全部飞完后由 CashSystem 回调自动弹出试玩完成弹窗
        if (this.game.cashSystem) {
            this.game.cashSystem.markPendingComplete();
        }
    }

    start_wave() {
        let wave = this.level_arr[this.cur_level_idx].waves[this.cur_wave_idx];
        this.cur_wave_total = wave.fruit_shape.length;
        this.fruit_ui.setPosition(0, 600, 0);
        this.fruit_20_level(wave);

        //水果入场动画：从上方滑入 + 开始旋转
        tween(this.fruit_ui)
            .to(0.2, { position: new Vec3(0, 200, 0) })
            .call(() => {
                //入场完成后开始持续旋转
                tween(this.fruit_ui)
                    .by(2, { eulerAngles: new Vec3(0, 0, -360) })
                    .union()
                    .repeatForever()
                    .start();
                this.game.inGameUI.is_gaming = true;
            })
            .start();
    }

    fruit_20_level(cur_wave: Wave) {
        for (let i = 0; i < cur_wave.fruit_shape.length; i++) {
            let point = cur_wave.fruit_shape[i];
            let fruit_node = this.game.fruitPoolMgr.requestFruit();
            fruit_node.getComponent(Sprite).spriteFrame = this.game.fruit_imgs[cur_wave.fruit_types[i] - 1];
            let fruit_com = fruit_node.getComponent(Fruit);
            fruit_com.fruit_type = cur_wave.fruit_types[i];
            fruit_com.color_type = 3; //白色
            fruit_com.is_killed = false;
            fruit_com.self_random_rotate();
            this.fruit_ui.addChild(fruit_node);
            fruit_node.setPosition(point.x, point.y, 0);
        }
    }

    end_wave() {
        this.scheduleOnce(() => {
            this.game.kill_fruit_num = 0;
            //回收水果
            for (let i = 0; i < this.fruit_ui.children.length; i++) {
                let fruit = this.fruit_ui.children[i];
                this.game.fruitPoolMgr.returnFruit(fruit);
            }
            this.fruit_ui.removeAllChildren();
            //停止旋转
            Tween.stopAllByTarget(this.fruit_ui);
            this.fruit_ui.eulerAngles = Vec3.ZERO;
            this.cur_wave_idx++;
            if (this.cur_wave_idx == this.level_arr[this.cur_level_idx].waves.length) {
                this.end_level();
            } else {
                this.start_wave();
            }
        }, 0.2);
    }

    update_kill_fruit() {
        this.kill_num++;
        if (this.kill_num == this.cur_wave_total) {
            this.game.inGameUI.is_gaming = false;
            this.scheduleOnce(() => {
                this.kill_num = 0;
                this.end_wave();
            }, 0.5);
        }
    }

    restart_cur_level() {
        this.cur_wave_idx = 0;
        this.kill_num = 0;
        this.game.kill_fruit_num = 0;
        this.start_wave();
    }

    reset_level_state() {
        this.game.kill_fruit_num = 0;
        for (let i = 0; i < this.fruit_ui.children.length; i++) {
            let fruit = this.fruit_ui.children[i];
            this.game.fruitPoolMgr.returnFruit(fruit);
        }
        this.fruit_ui.removeAllChildren();
        Tween.stopAllByTarget(this.fruit_ui);
        this.fruit_ui.eulerAngles = Vec3.ZERO;
        this.kill_num = 0;
    }
}
