import { _decorator, Component, Node, Label, UITransform } from "cc";

const { ccclass, property } = _decorator;

@ccclass
export default class ToastUI extends Component {

    @property(Node)
    msg_label: Node = null;

    show_toast(msg: string) {
        this.unscheduleAllCallbacks();
        this.msg_label.getComponent(Label).string = msg;
        let uiTransform = this.node.getComponent(UITransform);
        if (uiTransform) {
            uiTransform.width = msg.length * 40 + 80;
        }
        this.node.active = true;
        this.scheduleOnce(() => {
            this.node.active = false;
        }, 2);
    }
}
