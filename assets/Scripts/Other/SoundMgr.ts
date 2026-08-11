
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    
    @property(cc.SpriteFrame)
    off_spriteframe: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    on_spriteframe: cc.SpriteFrame = null;

    @property(cc.Sprite)
    sound_sprite: cc.Sprite = null;

    music_names:Array<string> = ["kill_fruit.mp3","shoot.mp3","btn_click.mp3","clock.mp3","fail.mp3","pet_cry.mp3","pet_bg.mp3"];

    //声音文件
    kill_fruit_audio = null;
    shoot_audio = null;
    btn_click_audio = null;
    clock_audio = null;
    fail_audio = null;
    pet_cry_audio = null;
    pet_bgm_audio = null;

    is_mute_audio:boolean = false;//是否静音
    music_mute:number = 0;

    onLoad () {
        
        this.kill_fruit_audio = new Audio()
        this.kill_fruit_audio.src = this.get_resourc_url(this.music_names[0]);

        this.shoot_audio  = new Audio()
        this.shoot_audio.src = this.get_resourc_url(this.music_names[1]);
        
        this.btn_click_audio  = new Audio()
        this.btn_click_audio.src = this.get_resourc_url(this.music_names[2]);

        this.clock_audio  = new Audio()
        this.clock_audio.src = this.get_resourc_url(this.music_names[3]);

        this.fail_audio  = new Audio()
        this.fail_audio.src = this.get_resourc_url(this.music_names[4]);

        this.pet_cry_audio  = new Audio()
        this.pet_cry_audio.src = this.get_resourc_url(this.music_names[5]);

        this.pet_bgm_audio  = new Audio()
        this.pet_bgm_audio.loop = true;
        this.pet_bgm_audio.src = this.get_resourc_url(this.music_names[6]);

    }

    get_resourc_url(music_name){
        var path = cc.url.raw('resources/sounds/'+music_name);
        if (cc.loader.md5Pipe) {
            path = cc.loader.md5Pipe.transformURL(path);
        }
        return path;
    }

    start(){
        // 从本地获取这个用户的声音设置;
        let music_mute = cc.sys.localStorage.getItem("music_mute");
        if (music_mute) { // 如果本地有输出，才处理;
            music_mute = parseInt(music_mute);
        }
        else {
            music_mute = 0;
        }
        this.music_mute = music_mute;
        if(music_mute==1){//静音
            this.is_mute_audio = true;
            this.sound_sprite.spriteFrame = this.off_spriteframe;
        }else{//播放声音
            this.is_mute_audio = false;
            this.sound_sprite.spriteFrame = this.on_spriteframe;
        }
    }

    // 声音按钮按下，切换状态；
    on_switch_click() {
        this.play_btn_click_audio();
        // music 的switch;
        var b_mute = this.music_mute ? 0 : 1;
        if (b_mute) { // off图片
            this.is_mute_audio = true;
            this.sound_sprite.spriteFrame = this.off_spriteframe; 
        }else { // on图片。
            this.is_mute_audio = false;
            this.sound_sprite.spriteFrame = this.on_spriteframe;
        }
        // 将这个参数存储到本地;
        cc.sys.localStorage.setItem("music_mute", b_mute);
        this.music_mute = b_mute;
    }

    //切水果的声音
    play_kill_fruit_audio(){
        if(this.is_mute_audio){
            return;
        }
        this.kill_fruit_audio.currentTime = 0
        this.kill_fruit_audio.play();
    }

    //发射武器的声音
    play_shoot_audio(){
        if(this.is_mute_audio){
            return;
        }
        this.shoot_audio.currentTime = 0;
        this.shoot_audio.play();
    }

    //按钮点击声音
    play_btn_click_audio(){
        if(this.is_mute_audio){
            return;
        }
        this.btn_click_audio.currentTime = 0
        this.btn_click_audio.play();
    }

    //倒计时时钟声音
    play_clock_audio(){
        if(this.is_mute_audio){
            return;
        }
        this.clock_audio.currentTime = 0
        this.clock_audio.play();
    }

    //未切中水果失败的声音
    play_fail_audio(){
        if(this.is_mute_audio){
            return;
        }
        this.fail_audio.currentTime = 0
        this.fail_audio.play();
    }

    //未切中水果失败的声音
    play_pet_cry_audio(){
        if(this.is_mute_audio){
            return;
        }
        this.pet_cry_audio.currentTime = 0
        this.pet_cry_audio.play();
    }

    //未切中水果失败的声音
    play_pet_bgm_audio(){
        if(this.is_mute_audio){
            return;
        }
        this.pet_bgm_audio.play();
    }
   
     //停止当前正在播放的音乐;
     stop_pet_bgm_audio(){
        this.pet_bgm_audio.pause();
    }
}
