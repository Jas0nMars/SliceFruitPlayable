let DomainAction = {
    FetchFriend: "FetchFriend",
    FetchFriendScore: "FetchFriendScore", //好友关卡得分排行
    FetchKnifeCount:"FetchKnifeCount",//好友武器数量排行
    FetchPetCount:"FetchPetCount",//宠物数量排行榜
    HorConmpar: "HorConmpar", //横向比较 horizontal comparison
    MoreFriend:"MoreFriend",
}    

const { ccclass, property } = cc._decorator;

@ccclass
export default class wxRankList extends cc.Component {

    static instance:wxRankList=null;

    @property(cc.Sprite)
    rankRender:cc.Sprite=null; // render spr

    @property(cc.Node)
    moreRender:cc.Node=null; // render spr

    @property(cc.Node)
    rankListRender:cc.Node=null; // render spr

    rankTexture:cc.Texture2D=null;
    rankSpriteFrame : cc.SpriteFrame=null;

    update_time = 0;
    is_close:boolean = false;
    update_count:number = 0;
    is_moreRank:boolean = false;

    onLoad() {
        wxRankList.instance=this;
        this.rankTexture = new cc.Texture2D();
        this.rankSpriteFrame = new cc.SpriteFrame();
        this.resizeSharedCanvas(this.rankRender.node.width, this.rankRender.node.height)
    }

    update(dt){
        this.update_count++;
        //if(this.update_count%2==0){
            if(this.is_close){
                this.rankRender.spriteFrame = null;
                return;
            }
            if(this.update_time > 8){
                return;
            }
            this.update_time += dt;
            this.updateRankList();
       // }
    }

    resizeSharedCanvas(width, height){
        if(!window["wx"]) return;
        let sharedCanvas = window["wx"].getOpenDataContext().canvas
        sharedCanvas.width = width
        sharedCanvas.height = height
    }

    changeRender(renderNode:cc.Node){
        if(renderNode.name === "moreRender"){
            this.moreRender.active = true;
            this.rankListRender.active = false;
            this.is_moreRank = true;
        }else if(renderNode.name === "rankListRender"){
            this.moreRender.active = false;
            this.rankListRender.active = true;
            this.is_moreRank = false;
        }
        this.rankRender.node.width = renderNode.width
        this.rankRender.node.height = renderNode.height
        this.rankRender.node.position = renderNode.position
        this.resizeSharedCanvas(renderNode.width, renderNode.height)
    }
    
    updateRankList() {
        if(!window["wx"]) return;
        if(!this.rankTexture) return;
        if(this.is_close){
            this.rankRender.spriteFrame = null;
            return;
        }
        let sharedCanvas = window["wx"].getOpenDataContext().canvas
        this.rankTexture.initWithElement(sharedCanvas);
        this.rankTexture.handleLoadedTexture();
        this.rankSpriteFrame.setTexture(this.rankTexture);
        this.rankRender.spriteFrame = this.rankSpriteFrame;
    }

    close(){
        this.is_close = true;
        this.rankRender.node.active = false;
        this.node.x = 3000;
    }
   
    onPageUp() {
        this.update_time = 0;
        this.postMessage("Paging", -1)
    }

    onPageDown() {
        this.update_time = 0;
        this.postMessage("Paging", 1)
    }

    //分数排行
    loadScoreRank(){
        this.update_count = 0;
        this.node.x = 0;
        this.is_close = false;
        this.rankRender.node.active = true;
        if(this.is_moreRank){
            this.changeRender(this.rankListRender);
        }
        this.postMessage(DomainAction.FetchFriendScore)
        this.update_time = 0;
    }

    //武器数量排行
    loadKnifeCountRank(){
        this.update_count = 0;
        this.node.x = 0;
        this.is_close = false;
        this.rankRender.node.active = true;
        if(this.is_moreRank){
            this.changeRender(this.rankListRender);
        }
        this.postMessage(DomainAction.FetchKnifeCount)
        this.update_time = 0;
    }

    //宠物排行榜
    loadPetCountRank(){
        this.update_count = 0;
        this.node.x = 0;
        this.is_close = false;
        this.rankRender.node.active = true;
        if(this.is_moreRank){
            this.changeRender(this.rankListRender);
        }
        this.postMessage(DomainAction.FetchPetCount)
        this.update_time = 0;
    }

    //横向比较
    loadHorRank(is_fresh:number){
        this.update_count = 0;
        this.node.x = 0;
        this.rankRender.spriteFrame = null;
        this.is_close = false;
        this.rankRender.node.active = true;
        if(this.is_moreRank){
            this.changeRender(this.rankListRender);
        }
        this.postMessage(DomainAction.HorConmpar,is_fresh);
        this.update_time = 0;
    }

    //超越好友
    moreThenFriend(score:number){
        this.update_count = 0;
        this.node.x = 0;
        this.rankRender.spriteFrame = null;
        this.is_close = false;
        this.rankRender.node.active = true;
        if(this.is_moreRank == false){
            this.changeRender(this.moreRender);
        }
        this.postMessage(DomainAction.MoreFriend,score);
        this.update_time = 0;
        
    }

    //向子域发送消息
    postMessage(action, data=null, dataEx=null) {
        if(!window["wx"]) return;
        let openDataContext = window["wx"].getOpenDataContext()
        openDataContext.postMessage({
            action: action,
            data: data,
            dataEx:dataEx,
        })
    }

    

    //删除微信数据
    removeUserKey(key_or_keys) {
        if (!window.window["wx"]) return
        if(typeof(key_or_keys)==="string"){
            key_or_keys = [key_or_keys]
        }
        window["wx"].removeUserCloudStorage({
            keyList: key_or_keys,
            success: (res) => {
            },
            fail: (res) => {
            }
        })
    }

}
