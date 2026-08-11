
const {ccclass, property} = cc._decorator;

@ccclass
export default class PetData{

    //宠物名称
    public pet_name:string = null;
    //是否解锁  0未解锁   1解锁
    public is_lock:number = 0;
    //是否正在使用  0未使用   1使用中
    public is_using:number = 0;
    //是否被邀请    0未邀请   1已邀请
    public is_invite:number = 0;
    //被邀请好友头像地址
    friend_icon:string = null;
    //被邀请好友名称
    friend_name:string = null;

}
