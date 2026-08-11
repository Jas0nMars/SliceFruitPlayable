

window.SocketManager={
    url:'',
    handlers:{},
    socketOpen:0,
    inited:false,
    //监听socket状态事件
    addSocketHanlder:function(){
        if(this.inited){
            return;
        }
        this.inited=true;
        wx.onSocketOpen(this.onConnect.bind(this));
        wx.onSocketClose(this.onClose.bind(this));
        wx.onSocketError(this.onError.bind(this));
        wx.onSocketMessage(this.onMessage.bind(this));
    },
    connect:function(url,cb){
        if( this.socketOpen===1||this.socketOpen===2){//连接中不处理
            return;
        }
        this.addSocketHanlder();
        this.url=url;
        //console.log(url+'链接中');
        wx.connectSocket({
        url: 'wss://'+url,
        // header: {
        // 'content-type': 'application/json'
        // },
        });
        let self=this;
        setTimeout(function(){//链接超时处理
            if(self.socketOpen===1){
                self.socketOpen=0;
                self.connect(self.url);
            }
        },5000)
    },
    onConnect:function(){//链接成功
        this.socketOpen=2;
        //console.log(this.url+' ws链接成功');
        this.sendData('login',{'id':Global.user_id})
    },
    sendData:function(fun_name,data){//发送数据
        if(this.socketOpen!==2){
            //console.log('socket未连接发送'+fun_name)
            return;
        }
        //console.log('发送服务器数据');
        let mess={
            name:fun_name,
            data:data
        }
        //console.log(mess);
        wx.sendSocketMessage({
            data:JSON.stringify(mess)
        })
        
    },
    onClose:function(){//关闭连接
        this.socketOpen=0;
        let self=this;
        setTimeout(function(){
            //console.log(self.url+'链接关闭');
            self.connect(self.url);
        },1000);
  
    },
    onMessage:function(data){//接受数据
        data=JSON.parse(data.data);
        let fun_name=data.name;
        let _data=data.data;
        //console.log('接受服务器消息');
        //console.log(data);
        if(this.handlers[fun_name]){
            for(let i=0;i<this.handlers[fun_name].length;++i){
                let handler=this.handlers[fun_name][i];
                handler.callback&&handler.callback.call(handler.target,_data);
            }
        }
  
    },
    onError:function(){//链接出错
        this.socketOpen=0;
        // this.close();
        //console.log(this.url+'链接失败了');
        this.connect(this.url);
    },
    addHanlder:function(name,callback,target){//添加监听函数
        if(!this.handlers[name]){
            this.handlers[name]=[];
        }
        this.handlers[name].push({
            callback:callback,
            target:target,
        })
    },
    removeHandler:function(name,callback,target){//移除监听函数
        if(!this.handlers[name]){
           return;
        }
        for(let i=0;i<this.handlers[fun_name].length;++i){
            let handler=this.handlers[fun_name][i];
            if(handler.callback===callback&&handler.target===handler){
                this.handlers.splice(i,1);
                break;
            }
        }
    },
    close:function(){
        
        wx.closeSocket();
    }
}
module.exports=window.SocketManager=SocketManager;
SocketManager.LOGIN='login';
SocketManager.SHARE='share';
SocketManager.NOTIFY_SHARE='notify_share';