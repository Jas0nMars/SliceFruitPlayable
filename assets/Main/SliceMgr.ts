import Game from "./Game"

const {ccclass, property} = cc._decorator;

@ccclass
export default class SliceMgr extends cc.Component {

    @property(cc.Prefab)
    fruit_slice_perfab:cc.Prefab = null;

    @property(cc.Node)
    shan_node:cc.Node = null;

    @property([cc.SpriteFrame])
    slice_imgs:Array<cc.SpriteFrame> = [];

    slice_index:number = 0;

    fruit_slices:cc.Node = null;
    game:Game = null;

    init(game){
        this.game = game;
        this.fruit_slices = this.node.getChildByName("fruit_slices");
    }

    add_slice(fruit_type:number){
        this.scheduleOnce(function(){
            if(this.slice_index < this.fruit_slices.children.length){
                let fruit_slice = this.fruit_slices.children[this.slice_index];
                fruit_slice.getComponent(cc.Sprite).spriteFrame = this.slice_imgs[fruit_type];
                fruit_slice.x = Math.round((Math.random() - 0.5) * 8);
                fruit_slice.active = true;
                this.slice_index++;
            }else{
                let fruit_slice = cc.instantiate(this.fruit_slice_perfab);
                fruit_slice.getComponent(cc.Sprite).spriteFrame = this.slice_imgs[fruit_type];
                this.fruit_slices.addChild(fruit_slice);
                fruit_slice.x = Math.round((Math.random() - 0.5) * 8);
                fruit_slice.y = 13 * this.slice_index;
                this.slice_index++;
            }
            this.show_shan();
        }.bind(this),0.7);
    }

    //显示雨伞
    show_shan(){
        //更新雨伞的位置
        let slice_node = this.fruit_slices.children[this.slice_index-1];
        this.shan_node.x = slice_node.x+20;
        this.shan_node.y = slice_node.y+10;
        if(this.shan_node.active == false){
            this.shan_node.active = true;
        }
    }

    //播放盘子扔果片的动画，并把盘子里的果片隐藏
    play_panzi_anim(){
        this.node.getComponent(cc.Animation).play();
    }

    //盘子动画播放完毕
    panzi_anim_finished(){
        this.slice_index = 0;
        this.shan_node.active = false;
        for(let fruit_slice of this.node.getChildByName("fruit_slices").children){
            fruit_slice.active = false;
        }
    }

}
