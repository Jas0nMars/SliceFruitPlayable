
const {ccclass, property} = cc._decorator;

@ccclass
export default class TOastUI extends cc.Component {

    @property(cc.Node)
    msg_label: cc.Node = null;

    show_toast(msg:string){
        this.unscheduleAllCallbacks();
        this.msg_label.getComponent(cc.Label).string = msg;
        this.node.width = msg.length * 40 + 80;
        this.node.active = true;
        this.scheduleOnce(function(){
            this.node.active = false;
        }.bind(this),2);
    }

}
