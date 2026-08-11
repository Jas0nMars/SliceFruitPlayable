/**
 * 现金飞行动画组件
 * 用于消除方块时现金飞向计数器的动画效果
 */
import { _decorator, Component, Node, tween, Vec3, UITransform, Sprite, SpriteFrame, Color, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CashFlyComp')
export class CashFlyComp extends Component {
    
    /**
     * 现金预制体（可选）
     * 如果不设置，将使用默认的金色矩形
     */
    @property({ type: Prefab, tooltip: '现金预制体（可选，不设置则使用金色矩形）' })
    cashPrefab: Prefab | null = null;
    
    /**
     * 播放现金飞行动画
     * @param startPos 起始位置（世界坐标）
     * @param targetNode 目标节点（现金计数器）
     * @param reward 奖励金额
     * @param parent 父节点（通常是 Canvas）
     * @param onComplete 动画完成回调
     */
    static playFlyAnimation(
        startPos: Vec3,
        targetNode: Node,
        reward: number,
        parent: Node,
        onComplete?: (reward: number) => void
    ): void {
        // 获取组件实例以访问预制体属性
        const compInstance = parent.getComponent(CashFlyComp);
        let flyNode: Node;
        
        // 如果设置了预制体，使用预制体；否则创建默认金色矩形
        if (compInstance && compInstance.cashPrefab) {
            flyNode = instantiate(compInstance.cashPrefab);
            flyNode.name = 'CashFly_Prefab';
        } else {
            // 创建默认的金色矩形
            flyNode = new Node('CashFly_Default');
            const sprite = flyNode.addComponent(Sprite);
            sprite.color = new Color(255, 215, 0, 255); // 金色
            flyNode.setScale(80, 40, 1); // 设置初始大小
        }
        
        parent.addChild(flyNode);
        
        console.log(`[CashFlyComp] Creating fly node at (${startPos.x.toFixed(0)}, ${startPos.y.toFixed(0)})`);

        // 设置初始位置
        const uiTransform = parent.getComponent(UITransform);
        if (!uiTransform) {
            console.warn('[CashFlyComp] Parent UITransform not found!');
            flyNode.destroy();
            return;
        }

        const startLocal = uiTransform.convertToNodeSpaceAR(startPos);
        flyNode.setPosition(startLocal);

        // 计算目标位置
        const targetWorldPos = targetNode.getWorldPosition();
        const targetLocal = uiTransform.convertToNodeSpaceAR(targetWorldPos);
        
        console.log(`[CashFlyComp] Flying to target (${targetLocal.x.toFixed(0)}, ${targetLocal.y.toFixed(0)})`);

        // 播放飞行动画
        tween(flyNode)
            .to(0.5, {
                position: targetLocal,
                scale: new Vec3(0.3, 0.3, 1)
            }, { easing: 'sineOut' })
            .call(() => {
                console.log('[CashFlyComp] Animation completed, destroying fly node');
                flyNode.destroy();
                if (onComplete) {
                    onComplete(reward);
                }
            })
            .start();
    }
}
