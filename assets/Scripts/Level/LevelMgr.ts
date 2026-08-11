import FruitData from "../Main/FruitData"
import Level from "./Level"
import Wave from "./Wave"
import Game from "../Main/Game"

const {ccclass, property} = cc._decorator;

@ccclass
export default class LevelMgr extends cc.Component {

    @property(cc.Node)
    fruit_ui:cc.Node = null;

    level_arr:Array<Level> = [];
    game:Game = null;
    cur_level_idx:number = 0;
    cur_wave_idx:number = 0;
    cur_wave_total:number = 0;
    kill_num:number = 0;

    init(game:Game){
        this.game = game;
        this.cur_level_idx = 0;
        this.load_level_data();
    }

    load_level_data(){
        for(let i=0;i<FruitData.shape_group.length;i++){
            let level = new Level();
            level.level_index = i;
            for(let j=0;j<FruitData.shape_group[i].length;j++){
                let wave = new Wave();
                let index = FruitData.shape_group[i][j] - 1;
                wave.fruit_shape = FruitData.shape_arr[index];
                wave.fruit_types = FruitData.fruit_types[i][j];
                let anim_index = FruitData.anim_group[i][j];
                let anim_name = "rotate"+anim_index+"_anim";
                wave.fruit_rotate_name = anim_name;
                level.waves.push(wave);
            }
            this.level_arr.push(level);
        }
    }

    start_level(){
        this.cur_wave_idx = 0;
        this.start_wave();
    }

    end_level(){
        // 关卡结束，由外部弹窗处理
    }

    start_wave(){
        let wave = this.level_arr[this.cur_level_idx].waves[this.cur_wave_idx];
        this.cur_wave_total = wave.fruit_shape.length;
        this.fruit_ui.y = 600;
        this.fruit_20_level(wave);
        let end_func = cc.callFunc(function(){
            this.fruit_ui.getComponent(cc.Animation).play(wave.fruit_rotate_name);
            this.game.inGameUI.is_gaming = true;
        }.bind(this));
        let seq = cc.sequence([cc.moveTo(0.2,cc.v2(0,200)),end_func])
        this.fruit_ui.runAction(seq);
    }

    fruit_20_level(cur_wave:Wave){
        for(let i=0;i<cur_wave.fruit_shape.length;i++){
            let point = cur_wave.fruit_shape[i];
            let fruit_node = this.game.fruitPoolMgr.requestFruit();
            fruit_node.getChildByName("fruit").getComponent(cc.Sprite).spriteFrame = this.game.fruit_imgs[cur_wave.fruit_types[i]-1];
            let fruit_com = fruit_node.getChildByName("fruit").getComponent("Fruit");
            fruit_com.fruit_type = cur_wave.fruit_types[i];
            fruit_com.color_type = 3;//白色（type1固定白色）
            fruit_com.is_killed = false;
            fruit_com.self_random_rotate();
            this.fruit_ui.addChild(fruit_node);
            fruit_node.x = point.x;
            fruit_node.y = point.y;
        }
    }

    end_wave(){
        this.scheduleOnce(function(){
            this.game.kill_fruit_num = 0;
            for(let i=0;i<this.fruit_ui.children.length;i++){
                let fruit = this.fruit_ui.children[i];
                this.game.fruitPoolMgr.returnFruit(fruit);
            }
            this.fruit_ui.removeAllChildren();
            this.fruit_ui.getComponent(cc.Animation).stop();
            this.fruit_ui.rotation = 0;
            this.cur_wave_idx++;
            if(this.cur_wave_idx == this.level_arr[this.cur_level_idx].waves.length){
                this.end_level();
            }else{
                this.start_wave();
            }
        }.bind(this),0.2);
    }

    update_kill_fruit(){
        this.kill_num++;
        if(this.kill_num == this.cur_wave_total){
            this.game.inGameUI.is_gaming = false;
            this.scheduleOnce(function(){
                this.kill_num = 0;
                this.end_wave();
            }.bind(this),0.5);
        }
    }

    restart_cur_level(){
        this.cur_wave_idx = 0;
        this.start_wave();
    }

    reset_level_state(){
        this.game.kill_fruit_num = 0;
        for(let i=0;i<this.fruit_ui.children.length;i++){
            let fruit = this.fruit_ui.children[i];
            this.game.fruitPoolMgr.returnFruit(fruit);
        }
        this.fruit_ui.removeAllChildren();
        this.fruit_ui.getComponent(cc.Animation).stop();
        this.fruit_ui.rotation = 0;
        this.kill_num = 0;
    }
}
