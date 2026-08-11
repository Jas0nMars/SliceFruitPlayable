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
    cur_level_idx:number = 0;//当前关卡索引（试玩广告固定为0）
    cur_wave_idx:number = 0;//当前是第几个小关卡
    cur_wave_total:number = 0;//当前小关卡的水果总数
    kill_num:number = 0;//当前小关卡切掉了多少个水果
    level_total_num:number = 0;//记录当前大关卡总共有多少个水果
    level_kill_num:number = 0;//当前大关卡切掉了多少个水果
    is_one_kill:boolean = false;

    init(game:Game){
        this.game = game;
        this.cur_level_idx = 0;
        this.load_level_data();
    }

    //加载游戏数据（只加载第1关）
    load_level_data(){
        for(let i=0;i<FruitData.shape_group.length;i++){
            let level = new Level();
            level.level_index = i;
            let total_count = 0;
            for(let j=0;j<FruitData.shape_group[i].length;j++){
                let wave = new Wave();
                let index = FruitData.shape_group[i][j] - 1;
                wave.fruit_shape = FruitData.shape_arr[index];
                wave.fruit_types = FruitData.fruit_types[i][j];
                let anim_index = FruitData.anim_group[i][j];
                let anim_name = "rotate"+anim_index+"_anim";
                wave.fruit_rotate_name = anim_name;
                level.waves.push(wave);
                total_count += wave.fruit_shape.length;
            }
            level.levle_total_count = total_count;
            this.level_arr.push(level);
        }
    }

    //开始关卡
    start_level(){
        this.game.inGameUI.update_level_txt(this.cur_level_idx+1);
        this.level_kill_num = 0;
        this.cur_wave_idx = 0;
        this.start_wave();
        this.level_total_num = this.level_arr[this.cur_level_idx].levle_total_count;
    }

    //结束关卡 → 显示试玩完成弹窗
    end_level(){
        this.game.show_trial_complete();
    }

    //开始子关
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

    //摆放水果
    fruit_20_level(cur_wave:Wave){
        for(let i=0;i<cur_wave.fruit_shape.length;i++){
            let point = cur_wave.fruit_shape[i];
            let fruit_node = this.game.fruitPoolMgr.requestFruit();
            fruit_node.getChildByName("fruit").getComponent(cc.Sprite).spriteFrame = this.game.fruit_imgs[cur_wave.fruit_types[i]-1];
            let fruit_com = fruit_node.getChildByName("fruit").getComponent("Fruit");
            fruit_com.fruit_type = cur_wave.fruit_types[i];
            fruit_com.color_type = this.get_guozhi_color(fruit_com.fruit_type);
            fruit_com.is_killed = false;
            fruit_com.self_random_rotate();
            this.fruit_ui.addChild(fruit_node);
            fruit_node.x = point.x;
            fruit_node.y = point.y;
        }
    }

    //根据水果的id判断水果的果汁颜色
    //果汁颜色:0 红色，1 绿色，2 黄色，3 白色
    get_guozhi_color(fruit_type:number){
        let color_tyep = 3;//白色
        if(fruit_type==11 || fruit_type==16){//绿色
            color_tyep = 1;
        }else if(fruit_type==3 || fruit_type==4 || fruit_type==12|| fruit_type==18){//红色
            color_tyep = 0;
        }else if(fruit_type==8 || fruit_type==9 || fruit_type==13|| fruit_type==15|| fruit_type==17){//黄色
            color_tyep = 2;
        }
        return color_tyep;
    }

    //结束子关
    end_wave(){
        this.scheduleOnce(function(){
            this.game.sliceMgr.play_panzi_anim();
        }.bind(this),0.2);
        this.game.kill_fruit_num = 0;
        //回收水果对象
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
    }

    //更新切到的水果
    update_kill_fruit(){
        this.kill_num++;
        this.level_kill_num ++;
        if(this.kill_num == this.cur_wave_total){
            this.game.inGameUI.is_gaming = false;
            this.scheduleOnce(function(){
                this.kill_num = 0;
                this.is_one_kill = false;
                this.end_wave();
            }.bind(this),0.5);
        }
    }

    //更新当前关卡进度
    update_level_progress(){
        let progress = Math.floor(this.level_kill_num / this.level_total_num * 100) / 100;
        this.game.inGameUI.update_level_progress(progress);
    }

    //重新开始当前关卡（试玩广告：再玩一次）
    restart_cur_level(){
        this.cur_wave_idx = 0;
        this.level_kill_num = 0;
        this.game.inGameUI.update_level_txt(this.cur_level_idx+1);
        this.start_wave();
        this.level_total_num = this.level_arr[this.cur_level_idx].levle_total_count;
    }

    //回收水果，并初始状态
    reset_level_state(){
        this.game.kill_fruit_num = 0;
        this.game.sliceMgr.slice_index = 0;
        this.game.sliceMgr.play_panzi_anim();
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
