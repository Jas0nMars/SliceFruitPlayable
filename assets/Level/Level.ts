import Wave from "./Wave"

const {ccclass, property} = cc._decorator;

@ccclass
export default class Level extends cc.Component {

    public waves:Array<Wave> = [];
    public waveIdx:number = 0;
    public levle_total_count = 0;
    public level_index:number = 0;

}
