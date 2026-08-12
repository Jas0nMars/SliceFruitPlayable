/**
 * 现金飞行动画组件
 * 用于切割水果时现金飞向计数器的动画效果
 */
import { _decorator, Component, Node, tween, Vec3, UITransform, Sprite, SpriteFrame, Color, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CashFlyComp')
export class CashFlyComp extends Component {
    
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
        onComplete?: (reward: number) => void,
        prefab?: Prefab
    ): void {
        // 优先使用传入的 prefab，其次查找 Canvas 上的 CashFlyComp 组件
        const compInstance = parent.getComponent(CashFlyComp);
        const flyPrefab = prefab || (compInstance ? compInstance.cashPrefab : null);
        let flyNode: Node;
        
        if (flyPrefab) {
            flyNode = instantiate(flyPrefab);
            flyNode.name = 'CashFly_Prefab';
        } else {
            flyNode = new Node('CashFly_Default');
            const sprite = flyNode.addComponent(Sprite);
            sprite.color = new Color(255, 215, 0, 255);
            flyNode.setScale(80, 40, 1);
        }
        
        parent.addChild(flyNode);

        const uiTransform = parent.getComponent(UITransform);
        if (!uiTransform) {
            flyNode.destroy();
            return;
        }

        const startLocal = uiTransform.convertToNodeSpaceAR(startPos);
        flyNode.setPosition(startLocal);

        const targetWorldPos = targetNode.getWorldPosition();
        const targetLocal = uiTransform.convertToNodeSpaceAR(targetWorldPos);

        tween(flyNode)
            .to(0.5, {
                position: targetLocal,
                scale: new Vec3(0.3, 0.3, 1)
            }, { easing: 'sineOut' })
            .call(() => {
                flyNode.destroy();
                if (onComplete) {
                    onComplete(reward);
                }
            })
            .start();
    }
}
