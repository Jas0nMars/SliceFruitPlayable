import { _decorator, Component, AudioSource, AudioClip, resources } from "cc";

const { ccclass, property } = _decorator;

/**
 * 音效管理器（对齐 Unity SoundManager.cs）
 * 资源放在 resources/Sounds/ 目录
 */
@ccclass
export default class SoundManager extends Component {

    private _audio_source: AudioSource = null;
    private _shoot_clip: AudioClip = null;
    private _kill_fruit_clip: AudioClip = null;
    private _fail_clip: AudioClip = null;

    onLoad() {
        this._audio_source = this.node.getComponent(AudioSource);
        if (!this._audio_source) {
            this._audio_source = this.node.addComponent(AudioSource);
        }
        this._audio_source.playOnAwake = false;
        this._load_clips();
    }

    private _load_clips() {
        resources.load("Sounds/shoot", AudioClip, (err, clip) => {
            if (!err) this._shoot_clip = clip;
        });
        resources.load("Sounds/kill_fruit", AudioClip, (err, clip) => {
            if (!err) this._kill_fruit_clip = clip;
        });
        resources.load("Sounds/fail", AudioClip, (err, clip) => {
            if (!err) this._fail_clip = clip;
        });
    }

    private _play(clip: AudioClip) {
        if (!clip || !this._audio_source) return;
        this._audio_source.playOneShot(clip);
    }

    /** 发射飞刀音效 */
    play_shoot() { this._play(this._shoot_clip); }

    /** 切水果音效 */
    play_kill_fruit() { this._play(this._kill_fruit_clip); }

    /** 失败音效 */
    play_fail() { this._play(this._fail_clip); }
}
