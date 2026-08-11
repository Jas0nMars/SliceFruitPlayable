import PetData from "../Other/PetData"
import PetUI from "../UI/PetUI"
const {ccclass, property} = cc._decorator;

@ccclass
export default class PetPageUI extends cc.Component {

    @property(cc.Integer)
    pet_id:number = 1;//宠物id

    //邀请好友
    @property(cc.Sprite)
    friend_icon:cc.Sprite = null;
    @property(cc.Label)
    friend_name:cc.Label = null;
    

    //标题
    @property(cc.Sprite)
    title_sprite:cc.Sprite = null;
    //按钮
    @property(cc.Sprite)
    btn_title:cc.Sprite = null;
    //宠物名称
    @property(cc.Label)
    name_label:cc.Label = null;

    //使用中
    @property(cc.SpriteFrame)
    using_txt_sf:cc.SpriteFrame = null;
    //已解锁
    @property(cc.SpriteFrame)
    unlock_txt_sf:cc.SpriteFrame = null;
    //未解锁
    @property(cc.SpriteFrame)
    lock_txt_sf:cc.SpriteFrame = null;

    //炫耀一下
    @property(cc.SpriteFrame)
    share_one_sf:cc.SpriteFrame = null;
    //邀请好友
    @property(cc.SpriteFrame)
    yaoqing_sf:cc.SpriteFrame = null;
    //使用
    @property(cc.SpriteFrame)
    use_txt_sf:cc.SpriteFrame = null;


    //是否解锁
    is_unlock:boolean = false;
    //是否邀请好友
    is_yaoqing:boolean = false;
    //是否正在使用
    is_using:boolean = false;
    //宠物数据
    petData:PetData = null;
    petUI:PetUI = null;
    //宠物节点
    pet_ske:cc.Node = null;

    setPetData(data:PetData,petUI:PetUI){
        this.pet_ske = this.node.getChildByName("pet_ske");
        this.petUI = petUI;
        this.petData = data;
        //设置宠物的名字
        this.name_label.string = data.pet_name;
        //设置是否解锁标题
        if(data.is_lock > 0){
            if(data.is_using){//正在使用
                this.title_sprite.spriteFrame = this.using_txt_sf;
                //设置按钮的状态
                this.btn_title.spriteFrame = this.share_one_sf;
            }else{//已经解锁，未使用
                this.title_sprite.spriteFrame = this.unlock_txt_sf;
                //设置按钮的状态
                this.btn_title.spriteFrame = this.use_txt_sf;
            }
            this.pet_ske.color = new cc.Color(255,255,255,255);
        }else{//未解锁
            this.title_sprite.spriteFrame = this.lock_txt_sf;
            this.pet_ske.color = new cc.Color(124,124,124,255);
            //设置按钮的状态
            this.btn_title.spriteFrame = this.yaoqing_sf;
        }
        //设置邀请好友的头像和昵称
        if(data.is_invite > 0 && data.friend_name && data.friend_icon){
            //显示好友头像和昵称
            this.friend_icon.node.active = true;
            this.friend_name.node.active = true;
            this.friend_name.string = "解锁好友:"+data.friend_name;
            //加载好友头像
            let imgurl = data.friend_icon +"?aa=aa.jpg";
            let self = this;
            cc.loader.load(imgurl, function(err, texture){
                if(err){
                    self.friend_icon.spriteFrame = petUI.normal_icon;
                }else{
                    self.friend_icon.spriteFrame = new cc.SpriteFrame(texture);
                }
            });
        }else{
            //隐藏好友头像和昵称
            this.friend_icon.node.active = false;
            this.friend_name.node.active = false;
        }
    }

    btn_click(){
        if(this.petData.is_lock > 0){
            if(this.petData.is_using > 0){//正在使用
                //分享
                //console.log("炫耀一下")
                this.petUI.pet_share_once();
            }else{//已经解锁，未使用
                //使用当前点击的宠物
                //console.log("使用当前点击的宠物");
                //将之前使用中的宠物设置为已解锁状态
                this.using_cur_pet();//使用当前点击的宠物皮肤
            }
        }else{//未解锁
            this.petUI.pet_share(this.pet_id);
            //邀请好友的分享
            //console.log("邀请好友解锁宠物！");
            //this.unlock_pet();//解锁当前宠物
        }
    }

    //解锁当前宠物
    unlock_pet(){
        this.petData.is_lock = 1;
        this.title_sprite.spriteFrame = this.unlock_txt_sf;
        //设置按钮的状态
        this.btn_title.spriteFrame = this.use_txt_sf;
        //修改宠物的颜色
        this.pet_ske.color = new cc.Color(255,255,255,255);
        //保存数据
        this.petUI.save_pet_datas();
    }

    //使用当前点击的宠物
    using_cur_pet(){
        let armatureDisplay = this.pet_ske.getComponent(dragonBones.ArmatureDisplay);
        this.petUI.game.inGameUI.change_pet_skin(armatureDisplay);
        //修改当前宠物为使用状态
        this.petData.is_using = 1;
        this.title_sprite.spriteFrame = this.using_txt_sf;
        this.btn_title.spriteFrame = this.share_one_sf;

        //修改上一次选中的宠物为未使用状态
        let pre_petPageUI = this.petUI.pre_petPageUI;
        pre_petPageUI.petData.is_using = 0;
        pre_petPageUI.title_sprite.spriteFrame = this.unlock_txt_sf;
        pre_petPageUI.btn_title.spriteFrame = this.use_txt_sf;

        //设置当前为选中的宠物
        this.petUI.pre_petPageUI = this;
         //保存数据
         this.petUI.save_pet_datas();
         this.petUI.game.inGameUI.pet_id = this.pet_id;
         this.petUI.game.dataMgr.set_cur_pet_id(this.pet_id);
    }
}
