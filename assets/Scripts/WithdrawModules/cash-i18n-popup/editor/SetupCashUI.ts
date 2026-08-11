/**
 * 现金系统 UI 搭建脚本
 * 
 * 在 Cocos Creator 编辑器控制台中执行：
 * const { setupCashUI } = require('assets/editor/SetupCashUI');
 * setupCashUI();
 */

import { Node, Label, UITransform, Color, Size, Vec3, director, Widget } from 'cc';

/**
 * 自动创建现金系统所需的 UI 节点
 */
export function setupCashUI(): void {
    console.log('[SetupCashUI] 开始创建现金系统 UI...');

    const scene = director.getScene();
    if (!scene) {
        console.error('[SetupCashUI] 没有活动场景');
        return;
    }

    // 查找 Canvas
    let canvas = scene.getChildByName('Canvas');
    if (!canvas) {
        console.error('[SetupCashUI] 未找到 Canvas 节点');
        return;
    }

    // 查找或创建 UILayer
    let uiLayer = canvas.getChildByName('UILayer');
    if (!uiLayer) {
        uiLayer = new Node('UILayer');
        const uiTransform = uiLayer.addComponent(UITransform);
        uiTransform.setContentSize(new Size(720, 200));
        uiLayer.setPosition(new Vec3(0, 480, 0));
        canvas.addChild(uiLayer);
        console.log('[SetupCashUI] 创建 UILayer');
    }

    // ===== 创建竖屏现金标签 =====
    let cashInfoPortrait = uiLayer.getChildByName('CashInfoPortrait');
    if (!cashInfoPortrait) {
        cashInfoPortrait = new Node('CashInfoPortrait');
        const portraitTransform = cashInfoPortrait.addComponent(UITransform);
        portraitTransform.setContentSize(new Size(200, 50));
        cashInfoPortrait.setPosition(new Vec3(-250, 550, 0)); // 左上角
        uiLayer.addChild(cashInfoPortrait);
        console.log('[SetupCashUI] 创建 CashInfoPortrait');
    }

    // 添加背景（可选）
    let bgPortrait = cashInfoPortrait.getChildByName('Background');
    if (!bgPortrait) {
        bgPortrait = new Node('Background');
        const bgTransform = bgPortrait.addComponent(UITransform);
        bgTransform.setContentSize(new Size(200, 50));
        // TODO: 可以添加 Sprite 组件作为背景
        cashInfoPortrait.addChild(bgPortrait);
    }

    // 创建或更新 Label
    let lbCashNumPortrait = cashInfoPortrait.getChildByName('LbCashNum');
    if (!lbCashNumPortrait) {
        lbCashNumPortrait = new Node('LbCashNum');
        const labelTransform = lbCashNumPortrait.addComponent(UITransform);
        labelTransform.setContentSize(new Size(200, 50));
        
        const label = lbCashNumPortrait.addComponent(Label);
        label.string = '$0';
        label.fontSize = 40;
        label.lineHeight = 50;
        label.color = new Color(255, 215, 0, 255); // 金色
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        
        cashInfoPortrait.addChild(lbCashNumPortrait);
        console.log('[SetupCashUI] 创建 LbCashNum (竖屏)');
    } else {
        // 确保有 Label 组件
        if (!lbCashNumPortrait.getComponent(Label)) {
            const label = lbCashNumPortrait.addComponent(Label);
            label.string = '$0';
            label.fontSize = 40;
            label.color = new Color(255, 215, 0, 255);
        }
        console.log('[SetupCashUI] LbCashNum (竖屏) 已存在');
    }

    // ===== 创建横屏现金标签（可选）=====
    let cashInfoLandscape = uiLayer.getChildByName('CashInfoLandscape');
    if (!cashInfoLandscape) {
        cashInfoLandscape = new Node('CashInfoLandscape');
        const landscapeTransform = cashInfoLandscape.addComponent(UITransform);
        landscapeTransform.setContentSize(new Size(200, 50));
        cashInfoLandscape.setPosition(new Vec3(-500, 300, 0)); // 横屏位置
        cashInfoLandscape.active = false; // 默认隐藏
        uiLayer.addChild(cashInfoLandscape);
        console.log('[SetupCashUI] 创建 CashInfoLandscape');
    }

    let lbCashNumLandscape = cashInfoLandscape.getChildByName('LbCashNum');
    if (!lbCashNumLandscape) {
        lbCashNumLandscape = new Node('LbCashNum');
        const labelTransform = lbCashNumLandscape.addComponent(UITransform);
        labelTransform.setContentSize(new Size(200, 50));
        
        const label = lbCashNumLandscape.addComponent(Label);
        label.string = '$0';
        label.fontSize = 40;
        label.lineHeight = 50;
        label.color = new Color(255, 215, 0, 255); // 金色
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        
        cashInfoLandscape.addChild(lbCashNumLandscape);
        console.log('[SetupCashUI] 创建 LbCashNum (横屏)');
    } else {
        if (!lbCashNumLandscape.getComponent(Label)) {
            const label = lbCashNumLandscape.addComponent(Label);
            label.string = '$0';
            label.fontSize = 40;
            label.color = new Color(255, 215, 0, 255);
        }
        console.log('[SetupCashUI] LbCashNum (横屏) 已存在');
    }

    console.log('[SetupCashUI] ========================================');
    console.log('[SetupCashUI] ✅ 现金系统 UI 创建完成！');
    console.log('[SetupCashUI] ');
    console.log('[SetupCashUI] 节点结构：');
    console.log('[SetupCashUI]   Canvas');
    console.log('[SetupCashUI]     └── UILayer');
    console.log('[SetupCashUI]           ├── CashInfoPortrait (竖屏)');
    console.log('[SetupCashUI]           │     └── LbCashNum (Label: "$0")');
    console.log('[SetupCashUI]           └── CashInfoLandscape (横屏，默认隐藏)');
    console.log('[SetupCashUI]                 └── LbCashNum (Label: "$0")');
    console.log('[SetupCashUI] ');
    console.log('[SetupCashUI] 下一步操作：');
    console.log('[SetupCashUI] 1. Ctrl+S 保存场景');
    console.log('[SetupCashUI] 2. 选中 GameScene 节点');
    console.log('[SetupCashUI] 3. 在属性检查器中：');
    console.log('[SetupCashUI]    - 拖拽 "LbCashNum" (竖屏) 到 "Lb Cash Num Portrait"');
    console.log('[SetupCashUI]    - 拖拽 "LbCashNum" (横屏) 到 "Lb Cash Num Landscape"');
    console.log('[SetupCashUI] 4. 运行游戏测试');
    console.log('[SetupCashUI] ========================================');
}

// 导出到全局，方便控制台调用
if (typeof window !== 'undefined') {
    (window as any).setupCashUI = setupCashUI;
}

console.log('[SetupCashUI] 已加载。在控制台输入 setupCashUI() 执行');
