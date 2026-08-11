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
    cur_level_wave_count = 0;//当前关卡有几个子关卡
    cur_level_idx:number = 0;//当前是第几个大关卡
    cur_wave_idx:number = 0;//当前是第几个小关卡
    cur_wave_total:number = 0;//当前小关卡的水果总数
    kill_num:number = 0;//当前小关卡切掉了多少个水果
    level_total_num:number = 0;//记录当前大关卡总共有多少个水果
    level_kill_num:number = 0;//当前大关卡切掉了多少个水果
    public level_get_gold:number = 0;//当前关卡获得金币奖励

    //子关卡个数
    level_wave_count_arr:Array<number> = [5,6,8];
    //缩放水果变量
    scale_speed:number = 70;
    max_distance:number = 30;
    distance:number = 0;
    //是否需要缩放
    is_scale = false;
    //是否是一刀切
    is_one_kill:boolean = false;

    init(game:Game){
        this.game = game;
        this.cur_level_idx = this.game.dataMgr.get_max_level();
        if(this.cur_level_idx < 20){
            this.load_level_data();
        }
    }

    //加载游戏数据
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
                //旋转动画的名称
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

    //加载下一关卡数据
    load_next_level_data(){
        this.get_level_wave_count();
        if(this.level_arr[this.cur_level_idx]){
            return;
        }
        let level = new Level();
        level.level_index = this.cur_level_idx;
        let total_count = 0;
        let type1 = Math.floor(Math.random() * this.game.fruit_imgs.length);
        let type2 = Math.floor(Math.random() * this.game.fruit_imgs.length);
        if(type2 == type1){
            type2 = Math.floor(Math.random() * this.game.fruit_imgs.length);
        }
        for(let j=0;j<this.cur_level_wave_count;j++){
            let wave = new Wave();
            let index = Math.floor(Math.random()*FruitData.shape_arr.length);
            wave.fruit_shape = FruitData.shape_arr[index];
            //wave.fruit_types = FruitData.fruit_types[i][j];
            //旋转动画的名称
            //let anim_index = Math.floor(Math.random()*14)+1;
            let anim_index = this.get_fruit_anim_index();
            let anim_name = "rotate"+anim_index+"_anim";
            wave.fruit_rotate_name = anim_name;
            //水果种类
            let r_num = Math.floor(Math.random() * 3);
            for(let k=0;k<wave.fruit_shape.length;k++){
                if(r_num==0){//单一品种
                    wave.fruit_types.push(type1+1);
                }else if(r_num==1){//两种水果间隔
                    if(k%2==0){
                        wave.fruit_types.push(type1+1);
                    }else{
                        wave.fruit_types.push(type2+1);
                    }
                }else{ //两种水果对半摆放
                    if(k <= Math.floor(wave.fruit_shape.length * 0.5)){
                        wave.fruit_types.push(type1+1);
                    }else{
                        wave.fruit_types.push(type2+1);
                    }
                }
            }

            level.waves.push(wave);
            total_count += wave.fruit_shape.length;
        }
        level.levle_total_count = total_count;
        this.level_arr[this.cur_level_idx] = level;            
    }

    //开始关卡
    start_level(){
        
        if(this.cur_level_idx > 0 && this.cur_level_idx%5==0){
            this.game.bannerAd.createGameBannerAd();
        }else{
            this.game.bannerAd.showGameBannerAd();
        }
        if(this.game.inGameUI.knife_3_count>0){
            this.game.inGameUI.show_knife_3();
        }
        if(this.game.isOpenShare){
            this.game.inGameUI.knife_3.active = true;
            this.game.inGameUI.wuqi_btn.active = true;
        }
        this.game.baseBgUI.cur_level_gold = 0;
        this.game.baseBgUI.show_level_gold_ui();
        this.level_get_gold = 0;
        this.level_kill_num = 0;
        this.game.inGameUI.update_level_txt(this.cur_level_idx+1);
        if(this.cur_level_idx >= 19){
            this.load_next_level_data();
        }
        this.start_wave();
        this.level_total_num = this.level_arr[this.cur_level_idx].levle_total_count;
    }
    //结束关卡
    end_level(){
        this.cur_level_idx++;
        this.cur_wave_idx = 0;
        //this.start_level();
        this.game.bannerAd.hideGameBannerAd();
        this.game.rewardUI.show_reward_ui();
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
        //设置水果从上掉下来的动画
        this.fruit_ui.runAction(seq);
    }




    //前面20关卡水果
    fruit_20_level(cur_wave:Wave){
        this.is_scale = false;
        if(this.cur_level_idx > 10){
            this.is_scale = Math.random() >= 0.7
        }
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
        if(fruit_type==11 || fruit_type==16){//1.绿色
            color_tyep = 1;
        }else if(fruit_type==3 || fruit_type==4 || fruit_type==12|| fruit_type==18){//0.红色
            color_tyep = 0;
        }else if(fruit_type==8 || fruit_type==9 || fruit_type==13|| fruit_type==15|| fruit_type==17){//2.黄色
            color_tyep = 2;
        }
        return color_tyep;
    }

    //获取关卡的子关卡个数
    get_level_wave_count(){
        if(this.cur_level_idx < 100){
            this.cur_level_wave_count = 5;
        }else if(this.cur_level_idx < 300){
            this.cur_level_wave_count = 6;
        }else{
            this.cur_level_wave_count = 8;
        }
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
        //将水果从父节点中移除
        this.fruit_ui.removeAllChildren();
        this.fruit_ui.getComponent(cc.Animation).stop();
        this.fruit_ui.rotation = 0;
        this.cur_wave_idx++;
        if(this.cur_wave_idx == this.level_arr[this.cur_level_idx].waves.length){
            //console.log("结束关卡")
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
                if(this.is_one_kill == false){
                    this.game.inGameUI.play_pet_win_anim();
                }else{
                    this.is_one_kill = false;
                }
                this.end_wave();
            }.bind(this),0.5);
        }
    }

    //更新当前关卡进度
    update_level_progress(){
        let progress = Math.floor(this.level_kill_num / this.level_total_num * 100) / 100;
        this.game.inGameUI.update_level_progress(progress);
    }

    //重新开始当前关卡
    restart_cur_level(){
        this.cur_wave_idx = 0;
        if(this.game.inGameUI.knife_3_count>0){
            this.game.inGameUI.show_knife_3();
        }
        if(this.game.isOpenShare){
            this.game.inGameUI.knife_3.active = true;
            this.game.inGameUI.wuqi_btn.active = true;
        }
        this.game.baseBgUI.cur_level_gold = 0;
        this.game.baseBgUI.show_level_gold_ui();
        this.level_get_gold = 0;
        this.level_kill_num = 0;
        this.game.inGameUI.update_level_txt(this.cur_level_idx+1);
        if(this.cur_level_idx >= 19){
            this.load_next_level_data();
        }
        this.start_wave();
        this.level_total_num = this.level_arr[this.cur_level_idx].levle_total_count;
    }

    //回收水果，并初始状态
    reset_level_state(){
        this.game.kill_fruit_num = 0;
        //播放盘子动画，清空盘子里的果片
        this.game.sliceMgr.slice_index = 0;
        this.game.sliceMgr.play_panzi_anim();
        //将之前的水果回收
        for(let i=0;i<this.fruit_ui.children.length;i++){
            let fruit = this.fruit_ui.children[i];
            this.game.fruitPoolMgr.returnFruit(fruit);
        }
        //将水果从父节点中移除
        this.fruit_ui.removeAllChildren();
        this.fruit_ui.getComponent(cc.Animation).stop();
        this.fruit_ui.rotation = 0;
        //重置已切水果数量
        this.kill_num = 0;
    }

    update(dt:number){
        if(this.is_scale==false){
            return;
        }

        var dx = dt * this.scale_speed;
        this.distance += dx;
        if(this.distance >= this.max_distance){
            this.scale_speed = -this.scale_speed;
        }else if(this.distance <=0 ){
            this.scale_speed = -this.scale_speed;
        }
        for(let fruit of this.fruit_ui.children){
            if(fruit.x > 0){
                fruit.x += dx;
            }else if(fruit.x < 0){
                fruit.x -= dx;
            }
        }

        /*
        if(this.node.parent.y > 0){
            this.node.parent.y -= dx;
        }else if(this.node.parent.y < 0){
            this.node.parent.y += dx;
        }*/
    }


    
    /*
    21关-100关
    关卡难度的刷新规则：
    70%简单、30%普通，
    困难关卡：每个12关，刷新动作的规则：60%简单、30%普通、10%困难。

    100-300关
    关卡难度的刷新规则：50%简单，30%普通，20%困难
    困难关卡：每隔13关，设置一个卡点，刷新动作的规则：40%简单、30%普通、30%困难。

    300后
    关卡难度的刷新规则：30%简单，40%普通，30%困难
    困难关卡：每隔19关，设置一个卡点，刷新动作的规则：30%简单、30%普通、40%困难。
    */
   //计算关卡的难度
    get_fruit_anim_index(){
        let anim_index = 1;
        //201关-500关
        if(this.cur_level_idx>200&&this.cur_level_idx<=500){
            if(this.cur_level_idx%12==0){
                //困难关卡：每个12关，刷新动作的规则：60%简单、30%普通、10%困难。
                let r_num = Math.random()*100;
                if(r_num <60){
                    //60%简单
                    let easy_index = Math.floor(Math.random()*FruitData.easy_fruit_anims.length)
                    anim_index = FruitData.easy_fruit_anims[easy_index];
                }else if(r_num>=60&&r_num<90){
                    //30%普通
                    let normal_index = Math.floor(Math.random()*FruitData.normal_fruit_anims.length)
                    anim_index = FruitData.normal_fruit_anims[normal_index];
                }else{
                    //10%困难
                    let hard_index = Math.floor(Math.random()*FruitData.hard_fruit_anims.length)
                    anim_index = FruitData.hard_fruit_anims[hard_index];
                }
            }else{
                //70%简单、30%普通
                let r_num = Math.random()*100;
                if(r_num <70){
                    //70%简单
                    let easy_index = Math.floor(Math.random()*FruitData.easy_fruit_anims.length)
                    anim_index = FruitData.easy_fruit_anims[easy_index];
                }else{
                    //30%普通
                    let normal_index = Math.floor(Math.random()*FruitData.normal_fruit_anims.length)
                    anim_index = FruitData.normal_fruit_anims[normal_index];
                }
            }
        //500-1000关
        }else if(this.cur_level_idx>500&&this.cur_level_idx<=1000){
            if(this.cur_level_idx%17==0){
                // 困难关卡：每隔13关，设置一个卡点，刷新动作的规则：40%简单、30%普通、30%困难。
                let r_num = Math.random()*100;
                if(r_num <40){
                    //40%简单
                    let easy_index = Math.floor(Math.random()*FruitData.easy_fruit_anims.length)
                    anim_index = FruitData.easy_fruit_anims[easy_index];
                }else if(r_num>=40 && r_num<70){
                    //30%普通
                    let normal_index = Math.floor(Math.random()*FruitData.normal_fruit_anims.length)
                    anim_index = FruitData.normal_fruit_anims[normal_index];
                }else{
                    //30%困难
                    let hard_index = Math.floor(Math.random()*FruitData.hard_fruit_anims.length)
                    anim_index = FruitData.hard_fruit_anims[hard_index];
                }
            }else{
                //关卡难度的刷新规则：50%简单，30%普通，20%困难
                let r_num = Math.random()*100;
                if(r_num <50){
                    //50%简单
                    let easy_index = Math.floor(Math.random()*FruitData.easy_fruit_anims.length)
                    anim_index = FruitData.easy_fruit_anims[easy_index];
                }else if(r_num>=50 && r_num<80){
                    //30%普通
                    let normal_index = Math.floor(Math.random()*FruitData.normal_fruit_anims.length)
                    anim_index = FruitData.normal_fruit_anims[normal_index];
                }else{
                    //20%困难
                    let hard_index = Math.floor(Math.random()*FruitData.hard_fruit_anims.length)
                    anim_index = FruitData.hard_fruit_anims[hard_index];
                }

            }
        //300关之后
        }else if(this.cur_level_idx>1000){
            if(this.cur_level_idx%19==0){
                //困难关卡：每隔19关，设置一个卡点，刷新动作的规则：30%简单、30%普通、40%困难。
                let r_num = Math.random()*100;
                if(r_num <30){
                    //30%简单
                    let easy_index = Math.floor(Math.random()*FruitData.easy_fruit_anims.length)
                    anim_index = FruitData.easy_fruit_anims[easy_index];
                }else if(r_num>=30 && r_num<60){
                    //30%普通
                    let normal_index = Math.floor(Math.random()*FruitData.normal_fruit_anims.length)
                    anim_index = FruitData.normal_fruit_anims[normal_index];
                }else{
                    //40%困难
                    let hard_index = Math.floor(Math.random()*FruitData.hard_fruit_anims.length)
                    anim_index = FruitData.hard_fruit_anims[hard_index];
                }
            }else{
                // 关卡难度的刷新规则：30%简单，40%普通，30%困难
                let r_num = Math.random()*100;
                if(r_num <30){
                    //30%简单
                    let easy_index = Math.floor(Math.random()*FruitData.easy_fruit_anims.length)
                    anim_index = FruitData.easy_fruit_anims[easy_index];
                }else if(r_num>=30 && r_num<70){
                    //30%普通
                    let normal_index = Math.floor(Math.random()*FruitData.normal_fruit_anims.length)
                    anim_index = FruitData.normal_fruit_anims[normal_index];
                }else{
                    //40%困难
                    let hard_index = Math.floor(Math.random()*FruitData.hard_fruit_anims.length)
                    anim_index = FruitData.hard_fruit_anims[hard_index];
                }
            }
        }
        return anim_index;
    }
}
