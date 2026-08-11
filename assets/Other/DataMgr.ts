import PetData from "../Other/PetData"

const {ccclass, property} = cc._decorator;

@ccclass
export default class DataMgr extends cc.Component {

    //设置最高关卡
    set_max_level(level){
        if(typeof(wx)=='undefined'){
            cc.sys.localStorage.setItem("max_level",level);
        }else{
            try {
                wx.setStorageSync('max_level', level);
            } catch (e) { }
        }
    }

    //获取最高关卡
    get_max_level(){
        if(typeof(wx)=='undefined'){
            let max_level = cc.sys.localStorage.getItem("max_level");
            if(max_level){
                max_level = parseInt(max_level);
            }else{
                max_level = 0;
            }
            return max_level;
        }else{
            try {
                let max_level = wx.getStorageSync('max_level')
                if (max_level) {
                    max_level = parseInt(max_level);
                }else{
                    max_level = 0;
                }
                return max_level;
            } catch (e) {
                return 0;
            }
            
        }
    }

    //设置总金币
    set_total_gold(total_gold:number){
        if(typeof(wx)=='undefined'){
            cc.sys.localStorage.setItem("total_gold",total_gold);
        }else{
            try {
                wx.setStorageSync('total_gold', total_gold);
            } catch (e) { }
        }
    }

    //获取总金币
    get_total_gold(){
        if(typeof(wx)=='undefined'){
            let total_gold = cc.sys.localStorage.getItem("total_gold");
            if(total_gold){
                total_gold = parseInt(total_gold);
            }else{
                total_gold = 0;
            }
            return total_gold;
        }else{
            try {
                let total_gold = wx.getStorageSync('total_gold')
                if (total_gold) {
                    total_gold = parseInt(total_gold);
                }else{
                    total_gold = 0;
                }
                return total_gold;
            } catch (e) {
                return 0;
            }
            
        }
    }

    //设置第一次登陆
    set_first_login(first_login){
        if(typeof(wx)=='undefined'){
            cc.sys.localStorage.setItem("first_login",first_login);
        }else{
            try {
                wx.setStorageSync('first_login', first_login);
            } catch (e) { }
        }
    }

    //是否是第一次登陆
    get_first_login(){
        if(typeof(wx)=='undefined'){
            let first_login = cc.sys.localStorage.getItem("first_login");
            if(first_login){
                first_login = parseInt(first_login);
            }else{
                first_login = 0;
            }
            return first_login;
        }else{
            try {
                let first_login = wx.getStorageSync('first_login')
                if (first_login) {
                    first_login = parseInt(first_login);
                }else{
                    first_login = 0;
                }
                return first_login;
            } catch (e) {
                return 0;
            }
            
        }
    }

    //设置已经解锁的武器id
    set_enable_knifes(knife_ids:Array<string>){
        let knife_ids_str = JSON.stringify(knife_ids);
        //console.log("knife_ids_str="+knife_ids_str);
        if(typeof(wx)=='undefined'){
            cc.sys.localStorage.setItem("knife_ids",knife_ids_str);
        }else{
            try {
                wx.setStorageSync('knife_ids', knife_ids_str);
            } catch (e) { }
        }
    }

    //获取已经解锁的武器id
    get_enable_knifes(){
        if(typeof(wx)=='undefined'){
            let knife_ids = cc.sys.localStorage.getItem("knife_ids");
            if(!knife_ids){
                knife_ids = "[0]";
            }
            return knife_ids;
        }else{
            try {
                let knife_ids = wx.getStorageSync('knife_ids')
                if(!knife_ids){
                    knife_ids = "[0]";
                }
                return knife_ids;
            } catch (e) {
                return "[0]";
            }
            
        }
    }

    //设置当前使用的武器id
    set_cur_knife_id(cur_knife_id){
        if(typeof(wx)=='undefined'){
            cc.sys.localStorage.setItem("cur_knife_id",cur_knife_id);
        }else{
            try {
                wx.setStorageSync('cur_knife_id', cur_knife_id);
            } catch (e) { }
        }
    }

    //获取当前使用的武器id
    get_cur_knife_id(){
        if(typeof(wx)=='undefined'){
            let cur_knife_id = cc.sys.localStorage.getItem("cur_knife_id");
            if(cur_knife_id){
                cur_knife_id = parseInt(cur_knife_id);
            }else{
                cur_knife_id = 0;
            }
            return cur_knife_id;
        }else{
            try {
                let cur_knife_id = wx.getStorageSync('cur_knife_id')
                if (cur_knife_id) {
                    cur_knife_id = parseInt(cur_knife_id);
                }else{
                    cur_knife_id = 0;
                }
                return cur_knife_id;
            } catch (e) {
                return 0;
            }
            
        }
    }

    //设置体验武器的id
    set_try_knife_id(try_knife_id:number){
        if(typeof(wx)=='undefined'){
            cc.sys.localStorage.setItem("try_knife_id",try_knife_id);
        }else{
            try {
                wx.setStorageSync('try_knife_id', try_knife_id);
            } catch (e) { }
        }
    }

    //获取体验武器的id
    get_try_knife_id(){
        if(typeof(wx)=='undefined'){
            let try_knife_id = cc.sys.localStorage.getItem("try_knife_id");
            if(try_knife_id){
                try_knife_id = parseInt(try_knife_id);
            }else{
                try_knife_id = -1;
            }
            return try_knife_id;
        }else{
            try {
                let try_knife_id = wx.getStorageSync('try_knife_id')
                if (try_knife_id) {
                    try_knife_id = parseInt(try_knife_id);
                }else{
                    try_knife_id = -1;
                }
                return try_knife_id;
            } catch (e) {
                return -1;
            }
        }
    }

     //设置体验武器的次数
    set_try_knife_count(try_knife_count:number){
        if(typeof(wx)=='undefined'){
            cc.sys.localStorage.setItem("try_knife_count",try_knife_count);
        }else{
            try {
                wx.setStorageSync('try_knife_count', try_knife_count);
            } catch (e) { }
        }
    }

    //获取体验武器的次数
    get_try_knife_count(){
        if(typeof(wx)=='undefined'){
            let try_knife_count = cc.sys.localStorage.getItem("try_knife_count");
            if(try_knife_count){
                try_knife_count = parseInt(try_knife_count);
            }else{
                try_knife_count = 0;
            }
            return try_knife_count;
        }else{
            try {
                let try_knife_count = wx.getStorageSync('try_knife_count')
                if (try_knife_count) {
                    try_knife_count = parseInt(try_knife_count);
                }else{
                    try_knife_count = 0;
                }
                return try_knife_count;
            } catch (e) {
                return 0;
            }
        }
    }


     //设置今日分享次数
     set_share_count(share_count:number){
        if(typeof(wx)=='undefined'){
            cc.sys.localStorage.setItem("share_count",share_count);
        }else{
            try {
                wx.setStorageSync('share_count', share_count);
            } catch (e) { }
        }
    }

    //获取今日分享次数
    get_share_count(){
        if(typeof(wx)=='undefined'){
            let share_count = cc.sys.localStorage.getItem("share_count");
            if(share_count){
                share_count = parseInt(share_count);
            }else{
                share_count = 0;
            }
            return share_count;
        }else{
            try {
                let share_count = wx.getStorageSync('share_count')
                if (share_count) {
                    share_count = parseInt(share_count);
                }else{
                    share_count = 0;
                }
                return share_count;
            } catch (e) {
                return 0;
            }
        }
    }

     //保存今天的日期
     set_cur_date(cur_date){
        if(typeof(wx)=='undefined'){
            cc.sys.localStorage.setItem("cur_date",cur_date);
        }else{
            try {
                wx.setStorageSync('cur_date', cur_date);
            } catch (e) { }
        }
    }

    //获取今天的日期
    get_cur_date(){
        if(typeof(wx)=='undefined'){
            let cur_date = cc.sys.localStorage.getItem("cur_date");
            return cur_date;
        }else{
            try {
                let cur_date = wx.getStorageSync('cur_date')
                return cur_date;
            } catch (e) {
                return null;
            }
        }
    }


    //设置每天成功通过的次数
    set_day_level_win_count(level_win_count:number){
        if(typeof(wx)=='undefined'){
            cc.sys.localStorage.setItem("level_win_count",level_win_count);
        }else{
            try {
                wx.setStorageSync('level_win_count', level_win_count);
            } catch (e) { }
        }
    }

    //获取每天成功通过的次数
    get_day_level_win_count(){
        if(typeof(wx)=='undefined'){
            let level_win_count = cc.sys.localStorage.getItem("level_win_count");
            if(level_win_count){
                level_win_count = parseInt(level_win_count);
            }else{
                level_win_count = 0;
            }
            return level_win_count;
        }else{
            try {
                let level_win_count = wx.getStorageSync('try_knife_id')
                if (level_win_count) {
                    level_win_count = parseInt(level_win_count);
                }else{
                    level_win_count = 0;
                }
                return level_win_count;
            } catch (e) {
                return 0;
            }
        }
    }

    //宠物数据---------------------------------宠物数据
    //设置已经解锁的武器id
    set_pet_data_list(petDataList:Array<PetData>){
        let petDataList_str = JSON.stringify(petDataList);
        //console.log("knife_ids_str="+knife_ids_str);
        if(typeof(wx)=='undefined'){
            cc.sys.localStorage.setItem("pet_data_list",petDataList_str);
        }else{
            try {
                wx.setStorageSync('pet_data_list', petDataList_str);
            } catch (e) { }
        }
    }

    //获取已经解锁的武器id
    get_pet_data_list(){
        if(typeof(wx)=='undefined'){
            let pet_data_list = cc.sys.localStorage.getItem("pet_data_list");
            if(!pet_data_list){
                pet_data_list = "[]";
            }
            return JSON.parse(pet_data_list);
        }else{
            try {
                let pet_data_list = wx.getStorageSync('pet_data_list')
                if(!pet_data_list){
                    pet_data_list = "[]";
                }
                return JSON.parse(pet_data_list);
            } catch (e) {
                return JSON.parse("[]");
            }
            
        }
    }


    //获取当前使用的宠物ID
    get_cur_pet_id(){
        if(typeof(wx)=='undefined'){
            let cur_pet_id = cc.sys.localStorage.getItem("cur_pet_id");
            if(!cur_pet_id){
                cur_pet_id = 1;
            }
            return cur_pet_id;
        }else{
            try {
                let cur_pet_id = wx.getStorageSync('cur_pet_id')
                if(!cur_pet_id){
                    cur_pet_id = 1;
                }
                return cur_pet_id;
            } catch (e) {
                return 1;
            }
        }
    }


    //设置当前使用的宠物ID
    set_cur_pet_id(cur_pet_id:number){
        if(typeof(wx)=='undefined'){
            cc.sys.localStorage.setItem("cur_pet_id",cur_pet_id);
        }else{
            try {
                wx.setStorageSync('cur_pet_id', cur_pet_id);
            } catch (e) { }
        }
    }
}
