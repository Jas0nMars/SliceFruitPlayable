import { _decorator, Component, director } from "cc";

const { ccclass } = _decorator;

@ccclass
export default class EnableCollider extends Component {
    onLoad() {
        director.getCollisionManager().enabled = true;
    }
}
