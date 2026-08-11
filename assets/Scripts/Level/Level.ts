import Wave from "./Wave"

export default class Level {
    public waves: Array<Wave> = [];
    public waveIdx: number = 0;
    public level_total_count: number = 0;
    public level_index: number = 0;
}
