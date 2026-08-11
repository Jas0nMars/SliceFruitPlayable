import Game from "../Main/Game"
import PetData from "../Other/PetData"
import PetPageUI from "./PetPageUI";
const {ccclass, property} = cc._decorator;

@ccclass
export default class PetUI extends cc.Component {

    @property(cc.Node)
    content:cc.Node = null;
    @property(cc.Node)
    load_ui:cc.Node = null;
    @property(cc.Label)
    pet_num:cc.Label = null;
     //默认头像图片
     @property(cc.SpriteFrame)
     normal_icon:cc.SpriteFrame = null;
    
    game:Game = null;
    petDataList:Array<PetData> = [];
    pet_names:Array<string> = ["欢天喜地","大吉大利","恭喜发财","时运亨通","儿孙满堂","永远美丽","家庭和睦","寿比南山","才高八斗","飞黄腾达","喜气洋洋","招财进宝","福星高照","吉祥如意","万寿无疆"];
    enter_view_index:number = 0;
    //上一次使用的宠物
    pre_petPageUI:PetPageUI = null;
    //是否是第一次显示
    is_frist_show:boolean = true;
    //用户解锁的宠物列表
    unlock_pet_arr:Array<number> = [3,6,9];

    init(game:Game){
        this.game = game;
        this.pet_num.string = "已解锁:1只";
        this.init_pet_data();
    }

    //初始化宠物数据
    init_pet_data(){
        this.petDataList = this.game.dataMgr.get_pet_data_list()
        if(this.petDataList.length == 0){
            for(let i=0;i<15;i++){
                let petData:PetData = new PetData();
                petData.pet_name=this.pet_names[i];
                if(i==0){
                    petData.is_lock = 1;
                    petData.is_using = 1;
                    petData.is_invite = 0;
                }
                this.petDataList.push(petData);
            }

            //测试代码-----start--------------
            /*
            let json_str = JSON.stringify(this.petDataList)
            console.log("json_str="+json_str);
            let petList = JSON.parse(json_str);
            console.log("petList="+petList);
            */
            //测试代码-----end--------------
        }
    }

    //保存宠物数据到本地
    save_pet_datas(){
        this.game.dataMgr.set_pet_data_list(this.petDataList);
    }

    //从服务器请求宠物数据
    request_pet_data(){
        let self = this;
        wx.request({
            url:"https://xyx.xmxk513.com/games_fruit/index.php/api/Pets/getPets",
            data:{
                user_id:window.Global.user_id,
            },
            header:{
                'Content-Type':'application/x-www-form-urlencoded'
            },
            method:"POST",
            success:res=>{
                //console.log("user_id:"+window.Global.user_id);
                //console.log("获取宠物数据-----:"+JSON.stringify(res));
                let json = JSON.parse(JSON.stringify(res));
                let pet_count = json.data.msg.length+1;
                this.uploadMaxPetCount(pet_count);
                this.pet_num.string = "已解锁:"+(pet_count)+"只";
                if(pet_count==15){
                    self.game.inGameUI.red_point.active = false;
                }
                //模拟服务器端数据
                for(let item of json.data.msg){
                    let petItem:PetData = this.petDataList[item.petid-1];
                    if(petItem.is_lock==0){
                        petItem.is_lock = 1;
                        let petPage = this.content.children[item.petid-1].children[0];
                        if(petPage){
                            //更新宠物状态
                            let petPageUI = petPage.getComponent("PetPageUI");
                            petPageUI.setPetData(petItem,self);
                        }
                    }
                }
            },
            fail:res=>{
                //console.log("获取宠物数据-----请求服务端获取用户信息失败:"+res);
            }
        });
        

    }

    //初始化宠物数据
    init_pet_view(){
       this.sync_page(1,this)
       .then(this.sync_page(2,this))
       .then(this.sync_page(3,this))
       .then(this.sync_page(4,this))
       .then(this.sync_page(5,this))
       .then(this.sync_page(6,this))
       .then(this.sync_page(7,this))
       .then(this.sync_page(8,this))
       .then(this.sync_page(9,this))
       .then(this.sync_page(10,this))
       .then(this.sync_page(11,this))
       .then(this.sync_page(12,this))
       .then(this.sync_page(13,this))
       .then(this.sync_page(14,this))
       .then(this.sync_page(15,this));
    }

    sync_page(index,self){
        return new Promise(function(resolve,reject){
            self.loadPagePrefab(index,function(){
                resolve();
            });
        });
    }

    //更新宠物的ui
    update_pet_ui(pet_id:number){
        let petPageUI = this.content.children[pet_id-1].children[0].getComponent("PetPageUI");
        petPageUI.setPetData(this.petDataList[pet_id-1],this);
    }

    //动态加载怪物的prefab对象池
    loadPagePrefab(index,end_func){
        cc.loader.loadRes("pet_prefabs/page"+index, function (err, prefab) {
            let page = cc.instantiate(prefab);
            let petPageUI = page.getComponent("PetPageUI");
            petPageUI.setPetData(this.petDataList[index-1],this);
            if(index == this.game.inGameUI.pet_id){
                this.pre_petPageUI = petPageUI;
                //console.log("动态加载宠物="+index);
            }
            this.content.children[index-1].addChild(page);
            page.x = 0;
            if(end_func){
                //console.log("index="+index)
                end_func();
            }
            if(index==15){
                this.load_ui.active = false;
            }
        }.bind(this));
    }

    //0.首页进入  1.结束进入 2.结算进入
    show_pet_ui(viewIndex:number){
        this.request_pet_data();
        this.game.soundMgr.play_pet_bgm_audio();
        this.game.bannerAd.hideHomeBannerAd();
        this.enter_view_index = viewIndex;
        this.node.active = true;
        if(this.is_frist_show){
            this.is_frist_show = false;
            //初始化宠物
            this.init_pet_view();
        }
    }
    
    hide_pet_ui(){
        this.game.bannerAd.showHomeBannerAd();
        this.game.soundMgr.stop_pet_bgm_audio();
        this.node.active = false;
        if(this.enter_view_index == 0){//游戏界面
            this.game.inGameUI.node.x = 0;
        }else if(this.enter_view_index == 1){//结束界面
            this.game.gameoverUI.show_gameover_ui();
        }else if(this.enter_view_index == 2){//结算界面
            this.game.rewardUI.show_reward_ui();
            this.game.inGameUI.node.x = 0;
        }
    }

    pet_share(pet_id:number){//带参数分享
        if(typeof(wx) == 'undefined') {
            return;
        }
        let user_id = window.Global.user_id;
        wx.showShareMenu({
            withShareTicket: false
        });
        var path = cc.url.raw("resources/share_img3.png");
        let title = "猪年行大运，我这养了好多宠物猪，进来一起粘粘喜气吧。"
        if (cc.loader.md5Pipe) {
            path = cc.loader.md5Pipe.transformURL(path);
        }
        //console.log("pet_share分享-----pet_id="+pet_id);
        //主动拉起分享接口
        wx.shareAppMessage({ 
            title: title,
            imageUrl:path,
            query:'user_id='+user_id+'&pet_id='+pet_id,
        })
    }

    pet_share_once(){//炫耀一下
        if(typeof(wx) == 'undefined') {
            return;
        }
        wx.showShareMenu({
            withShareTicket: false
        });
        var path = cc.url.raw("resources/share_img3.png");
        let title = "猪年行大运，我这养了好多宠物猪，进来一起粘粘喜气吧。"
        if (cc.loader.md5Pipe) {
            path = cc.loader.md5Pipe.transformURL(path);
        }
        //主动拉起分享接口
        wx.shareAppMessage({ 
            title: title,
            imageUrl:path,
        })
    }

    // 上传宠物数量
    uploadMaxPetCount(count) {
        if(!window["wx"]) return;
        count = count.toString()
        window["wx"].setUserCloudStorage({
            KVDataList: [
                { key:"petCountKey", value: count},
            ],
            success: (res) => {
                //console.log("上传宠物数量成功！")
            },
            fail: (res) => {
            }
        })
    }


}
