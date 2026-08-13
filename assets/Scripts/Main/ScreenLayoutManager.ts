import { _decorator, Component, Node, UITransform, Vec3, view, Widget } from 'cc';
import { CashSystem } from './CashSystem';
const { ccclass, property } = _decorator;

/**
 * 单个节点的横竖屏坐标数据
 * 在编辑器中为每个节点配置竖屏和横屏的位置与缩放
 */
@ccclass('LayoutItem')
export class LayoutItem {
    @property({ type: Node })
    node: Node = null;

    // ---- 竖屏坐标 ----
    @property
    p_pos_x: number = 0;
    @property
    p_pos_y: number = 0;
    @property
    p_scale_x: number = 1;
    @property
    p_scale_y: number = 1;
    @property({ tooltip: '竖屏宽度 (0=不修改)' })
    p_width: number = 0;
    @property({ tooltip: '竖屏高度 (0=不修改)' })
    p_height: number = 0;

    // ---- 横屏坐标 ----
    @property
    l_pos_x: number = 0;
    @property
    l_pos_y: number = 0;
    @property
    l_scale_x: number = 1;
    @property
    l_scale_y: number = 1;
    @property({ tooltip: '横屏宽度 (0=不修改)' })
    l_width: number = 0;
    @property({ tooltip: '横屏高度 (0=不修改)' })
    l_height: number = 0;
}

/**
 * 横竖屏管理器
 *
 * 原理：
 *   监听 canvas-resize 事件，检测横竖屏后动态交换设计分辨率的宽高
 *   然后根据 LayoutItem 配置设置对应方向的坐标和缩放
 *
 * 使用方式：
 *   1. 在 Canvas 节点上添加 ScreenLayoutManager 组件
 *   2. 在 layout_items 中拖入需要适配的节点
 *   3. 配置每个节点的竖屏坐标和横屏坐标
 */
@ccclass('ScreenLayoutManager')
export class ScreenLayoutManager extends Component {

    @property({ type: [LayoutItem] })
    layout_items: LayoutItem[] = [];

    @property({ type: Node, tooltip: 'cash_label 节点，竖屏时使用 Widget 左右对齐' })
    cash_info: Node = null;

    is_landscape: boolean = false;
    private _origin_design_w: number = 0;
    private _origin_design_h: number = 0;

    start() {
        // 保存原始设计分辨率（编辑器中设置的值）
        let design = view.getDesignResolutionSize();
        this._origin_design_w = design.width;
        this._origin_design_h = design.height;

        // 先注册事件，确保不会错过 canvas-resize
        view.on('canvas-resize', this.on_canvas_resize, this);

        // 再初始化方向状态（is_landscape 默认为 false，必须在事件注册后设置）
        let size = view.getVisibleSize();
        this.is_landscape = size.width > size.height;

        // 首次进入时也要交换设计分辨率（否则横屏首次进入缩放/位置异常）
        if (this.is_landscape) {
            view.setDesignResolutionSize(this._origin_design_h, this._origin_design_w, view.getResolutionPolicy());
        }

        // 立即应用 cash_info 布局
        this.apply_cash_info_layout();

        // 延迟应用布局，确保在游戏逻辑（LevelMgr 等）初始化完成后再设置坐标
        this.scheduleOnce(() => {
            console.log(`[ScreenLayoutManager] 延迟应用布局, is_landscape=${this.is_landscape}, layout_items.length=${this.layout_items.length}`);
            this.apply_layout();
            this.apply_cash_info_layout();
        }, 0.025);

        // 通知 Game 初始方向（统一管理 cash_info / lb_cash_num / btn_wd 的横竖屏切换）
        let game_comp = this.node.getComponent('Game') as any;
        if (game_comp && game_comp.set_orientation) {
            game_comp.set_orientation(this.is_landscape);
        }

        console.log(`[ScreenLayoutManager] 初始为${this.is_landscape ? '横屏' : '竖屏'}模式`);
    }

    onDestroy() {
        view.off('canvas-resize', this.on_canvas_resize, this);
    }

    on_canvas_resize() {
        let size = view.getVisibleSize();
        let new_is_landscape = size.width > size.height;

        // 仅在横竖屏方向实际切换时才应用布局
        if (new_is_landscape !== this.is_landscape) {
            this.is_landscape = new_is_landscape;

            // 关键：基于原始设计分辨率交换宽高（750x1560 ↔ 1560x750）
            if (this.is_landscape) {
                view.setDesignResolutionSize(this._origin_design_h, this._origin_design_w, view.getResolutionPolicy());
            } else {
                view.setDesignResolutionSize(this._origin_design_w, this._origin_design_h, view.getResolutionPolicy());
            }

            // 应用节点坐标布局
            this.apply_layout();

            // 通知 Game 切换横竖屏状态（统一管理 cash_info / lb_cash_num / btn_wd 的横竖屏切换）
            let game_comp = this.node.getComponent('Game') as any;
            if (game_comp && game_comp.set_orientation) {
                game_comp.set_orientation(this.is_landscape);
            }

            // cash_info 特殊处理
            this.apply_cash_info_layout();

            console.log(`[ScreenLayoutManager] 切换为${this.is_landscape ? '横屏' : '竖屏'}模式`);

            // 刘海屏设备安全区域可能在旋转后延迟更新，二次应用确保位置正确
            this.scheduleOnce(() => {
                let newSize = view.getVisibleSize();
                console.log("[ScreenLayoutManager] " + "二次布局应用", newSize.width + "x" + newSize.height);
                this.apply_cash_info_layout();
            }, 0.1);        }
    }

    /** 查找场景中的 CashSystem（通过 Game 组件获取） */
    private _find_cash_system(): CashSystem | null {
        // ScreenLayoutManager 挂载在 Canvas 上，Game 也在 Canvas 上
        let game_comp = this.node.getComponent('Game') as any;
        if (game_comp && game_comp.cashSystem) {
            return game_comp.cashSystem;
        }
        return null;
    }

    /** 应用横竖屏坐标、缩放和宽高 */
    apply_layout() {
        let visSize = view.getVisibleSize();
        let designSize = view.getDesignResolutionSize();
        console.log(`[ScreenLayoutManager] apply_layout called, is_landscape=${this.is_landscape}, items=${this.layout_items.length}`);
        console.log(`  visibleSize: ${visSize.width}x${visSize.height}, designSize: ${designSize.width}x${designSize.height}`);

        // 同步 GameUI 尺寸，确保触摸区域覆盖整个屏幕
        let game_ui = this.node.getChildByName('GameUI');
        if (game_ui) {
            let ui = game_ui.getComponent(UITransform) || game_ui.addComponent(UITransform);
            ui.setContentSize(designSize.width, designSize.height);
        }
        for (let i = 0; i < this.layout_items.length; i++) {
            let item = this.layout_items[i];
            if (!item || !item.node) {
                console.log(`  [${i}] skip (null)`);
                continue;
            }
            if (this.is_landscape) {
                console.log(`  [${i}] ${item.node.name} → landscape pos(${item.l_pos_x}, ${item.l_pos_y})`);
                item.node.setPosition(new Vec3(item.l_pos_x, item.l_pos_y, 0));
                item.node.setScale(item.l_scale_x, item.l_scale_y, 1);
                if (item.l_width > 0 && item.l_height > 0) {
                    let ui = item.node.getComponent(UITransform) || item.node.addComponent(UITransform);
                    ui.setContentSize(item.l_width, item.l_height);
                }
            } else {
                console.log(`  [${i}] ${item.node.name} → portrait pos(${item.p_pos_x}, ${item.p_pos_y})`);
                item.node.setPosition(new Vec3(item.p_pos_x, item.p_pos_y, 0));
                item.node.setScale(item.p_scale_x, item.p_scale_y, 1);
                if (item.p_width > 0 && item.p_height > 0) {
                    let ui = item.node.getComponent(UITransform) || item.node.addComponent(UITransform);
                    ui.setContentSize(item.p_width, item.p_height);
                }
            }
        }

        // 布局应用后，重启飞刀待机动画（否则旧 tween 锁定的旧坐标会覆盖新位置）
        this._restart_knife_idle();
    }

    /** 重启飞刀待机动画，使其读取新的坐标 */
    private _restart_knife_idle() {
        let game_comp = this.node.getComponent('Game') as any;
        if (game_comp && game_comp.inGameUI && game_comp.inGameUI.center_knife_node_com) {
            let knife = game_comp.inGameUI.center_knife_node_com;
            // 同步 knife_y 缓存为当前布局设置的 Y 坐标，确保 idle/shoot 动画使用正确值
            knife.knife_y = knife.node.position.y;
            console.log(`[ScreenLayoutManager] _restart_knife_idle: knife pos=(${knife.node.position.x.toFixed(1)}, ${knife.node.position.y.toFixed(1)}), knife_y=${knife.knife_y.toFixed(1)}, is_shooting=${knife._is_shooting}`);
            if (!knife._is_shooting) {
                if (knife._idleTween) { knife._idleTween.stop(); knife._idleTween = null; }
                knife.play_idle_anim();
            }
        } else {
            console.log(`[ScreenLayoutManager] _restart_knife_idle: game_comp=${!!game_comp}, inGameUI=${!!(game_comp && game_comp.inGameUI)}, knife_com=${!!(game_comp && game_comp.inGameUI && game_comp.inGameUI.center_knife_node_com)}`);
        }
    }

    /**
     * cash_info 布局（已从 layout_items 移除，由此方法全权处理）：
     *   竖屏 → 720×160，距离顶部 60px，左右各 20px
     *   横屏 → 528×300，距离左侧 50px
     */
    apply_cash_info_layout() {
        if (!this.cash_info) return;
        let targetNode = this.cash_info;
        let ui = targetNode.getComponent(UITransform);
        if (!ui) return;
        let widget = targetNode.getComponent(Widget);
        // 禁用 Widget，完全手动控制
        if (widget) widget.enabled = false;

        // 使用引擎 API 获取实际可见画布尺寸（适配不同机型）
        let visibleSize = view.getVisibleSize();
        let canvas_w = visibleSize.width;
        let canvas_h = visibleSize.height;

        console.log(`[ScreenLayoutManager] apply_cash_info_layout: is_landscape=${this.is_landscape}, canvas=${canvas_w}x${canvas_h}, origin=(${this._origin_design_w},${this._origin_design_h}), anchor=(${ui.anchorX},${ui.anchorY})`);

        if (this.is_landscape) {
            // 横屏：528×300，距离左侧 50px，Y 居中
            ui.setContentSize(528, 300);
            let x = -canvas_w / 2 + 50 + 528 * (1 - ui.anchorX);
            let y = 300 * (0.5 - ui.anchorY);
            targetNode.setPosition(x, y, 0);
        } else {
            // 竖屏：720×160，顶部距离屏幕最上方 60px，X 居中
            ui.setContentSize(720, 160);
            let x = 720 * (0.5 - ui.anchorX);
            let y = canvas_h / 2 - 60 - 160 * (1 - ui.anchorY);
            targetNode.setPosition(x, y, 0);
        }
        console.log(`  → cash_info pos=(${targetNode.position.x.toFixed(1)}, ${targetNode.position.y.toFixed(1)})`);
    }

    /** 递归刷新节点下所有子节点的 Widget */
    refresh_children_widget(parent: Node) {
        for (let child of parent.children) {
            let child_widget = child.getComponent(Widget);
            if (child_widget) {
                child_widget.updateAlignment();
            }
            this.refresh_children_widget(child);
        }
    }
}