# 现金系统 + 多语言系统 + 结算弹窗 通用模块包

> 适用于 Cocos Creator 3.7+ 的可复用模块，提供现金奖励飞行动画、多语言支持和试玩完成弹窗三大功能。

## 模块组成

| 文件 | 功能 |
|------|------|
| `scripts/system/CashSystem.ts` | 现金系统核心：管理金额、飞行动画触发、数字滚动、货币符号 |
| `scripts/system/I18nManager.ts` | 多语言管理器：加载翻译文件、占位符替换、语言切换监听 |
| `scripts/ui/CashFlyComp.ts` | 现金飞行动画组件 |
| `scripts/ui/I18nLabel.ts` | 多语言自动标签组件（零代码翻译） |
| `scripts/ui/TrialCompletePopup.ts` | 试玩完成弹窗：入场动画、喷钱效果、呼吸动画 |
| `editor/SetupCashUI.ts` | 编辑器脚本：自动搭建现金 UI 节点 |
| `resources/i18n/*.json` | 翻译文件（英语/印尼语/巴西葡萄牙语） |

## 集成步骤

### 第 1 步：复制文件

将模块包中的文件复制到目标 Cocos Creator 项目的 `assets/` 目录下：

```
目标项目 assets/
├── scripts/
│   ├── system/
│   │   ├── CashSystem.ts          ← 复制
│   │   └── I18nManager.ts         ← 复制
│   └── ui/
│       ├── CashFlyComp.ts         ← 复制
│       ├── I18nLabel.ts           ← 复制
│       └── TrialCompletePopup.ts  ← 复制
├── editor/
│   └── SetupCashUI.ts             ← 复制
└── resources/
    └── i18n/
        ├── en.json                ← 复制
        ├── id.json                ← 复制
        └── pt-BR.json             ← 复制
```

> **注意**：如果目标项目已有 `scripts/system/` 或 `scripts/ui/` 目录，直接合并即可，不会冲突。

### 第 2 步：初始化系统

在你的游戏场景脚本中（如 `GameScene.ts`）添加初始化代码：

```typescript
import { CashSystem } from '../system/CashSystem';
import { I18nManager } from '../system/I18nManager';
import { TrialCompletePopup } from '../ui/TrialCompletePopup';

// 在 initGame() 或 start() 中：

// 1. 初始化多语言系统（必须在 CashSystem 之前）
I18nManager.init('id');  // 参数：默认语言 'en' | 'id' | 'pt-BR'

// 2. 初始化现金系统
this._cashSystem = new CashSystem(
    this.canvasNode!,           // Canvas 节点
    this.lbCashNumPortrait,     // 竖屏现金 Label 节点
    this.lbCashNumLandscape,    // 横屏现金 Label 节点（可选，传 null）
    {
        initialAmount: 0,
        currencySymbol: '$',
        scrollSpeed: 5,
        // minReward / maxReward 不传则根据语言自动设置：
        //   id: 30000~50000, pt-BR: 500~800, en: 10~20
    }
);

// 3. 设置完成回调
this._cashSystem.setOnCompleteCallback(() => {
    // 所有现金飞行完毕后的逻辑（如弹出结算弹窗）
});
```

### 第 3 步：每帧更新

在场景的 `update()` 中调用：

```typescript
update(dt: number): void {
    if (this._cashSystem) {
        this._cashSystem.update(dt);
    }
}
```

### 第 4 步：触发现金飞行

方块消除时调用：

```typescript
this._cashSystem.onBlocksEliminated(eliminatedPositions);
```

### 第 5 步：搭建现金 UI

**方法 A：使用编辑器脚本（推荐）**

在 Cocos Creator 编辑器控制台中执行：

```javascript
const { setupCashUI } = require('assets/editor/SetupCashUI');
setupCashUI();
```

自动创建以下节点结构：

```
Canvas
└── UILayer
    ├── CashInfoPortrait（竖屏）
    │   └── LbCashNum（Label）
    └── CashInfoLandscape（横屏，默认隐藏）
        └── LbCashNum（Label）
```

然后将 `LbCashNum` 节点拖拽绑定到 GameScene 组件的属性上。

**方法 B：手动创建**

在 Canvas 下创建包含 Label 组件的节点，绑定到 GameScene 的属性上即可。

### 第 6 步：搭建结算弹窗

在场景中创建以下节点结构，然后在 `TrialCompletePopup` 组件中绑定：

```
TrialCompletePopup（根节点 - 空节点，初始 active=false）
├── Mask                    ← Sprite 组件，半透明黑色遮罩
├── Board                   ← Sprite 组件，弹窗背景板
│   ├── ImgGlow            ← Sprite 组件，圆形光晕
│   ├── WinIcon1           ← Sprite 组件，胜利图标1
│   ├── WinIcon2           ← Sprite 组件，胜利图标2
│   ├── CashBoard          ← 空节点或 Sprite，现金展示区
│   │   └── LbCashNum      ← Label 组件，显示现金数量
│   └── CashBtn            ← Button 或 Sprite，点击领取区域
└── SprayOrigin            ← 空节点，喷钱起点位置
```

**组件属性绑定：**

| 属性 | 说明 |
|------|------|
| `maskNode` | 遮罩背景节点 |
| `boardNode` | 弹窗底板节点 |
| `winIcon1/2` | 胜利图标节点 |
| `cashBoardNode` | 现金展示区节点 |
| `cashBtnNode` | 现金按钮节点 |
| `lbCashNum` | 现金数量 Label 节点 |
| `imgGlow` | 光晕节点 |
| `sprayOrigin` | 喷钱起点节点 |
| `cashFrames` | 现金图片 SpriteFrame 数组（用于喷钱效果） |

## API 速查

### CashSystem

```typescript
// 构造
new CashSystem(canvasNode, lbPortrait, lbLandscape, config?)

// 配置
interface CashSystemConfig {
    initialAmount?: number;        // 初始金额，默认 0
    minReward?: number;            // 最小奖励（不传按语言自动设置）
    maxReward?: number;            // 最大奖励（不传按语言自动设置）
    currencySymbol?: string;       // 货币符号，默认 '$'
    enableThousandsSeparator?: boolean;  // 千位分隔符，默认 false
    scrollSpeed?: number;          // 滚动速度，默认 5
}

// 方法
update(dt)                          // 每帧更新（必须）
onBlocksEliminated(positions)       // 方块消除时触发现金飞行
markPendingComplete()               // 标记等待完成（关卡结束时调用）
setOnCompleteCallback(cb)           // 设置完成回调
getCashAmount(): number             // 获取实际累计金额
getCashDisplay(): number            // 获取显示金额（与标签一致）
setCashAmount(amount)               // 直接设置金额
addCash(amount)                     // 增加金额
setOrientation(isLandscape)         // 切换横竖屏
reset()                             // 重置
destroy()                           // 销毁
```

### I18nManager

```typescript
// 初始化
I18nManager.init('id');             // 'en' | 'id' | 'pt-BR'

// 获取翻译
I18nManager.get('key');             // 返回翻译文本
I18nManager.get('key', arg1, arg2); // 替换 {0}, {1} 占位符

// 切换语言
I18nManager.set_language('pt-BR');

// 监听变化
I18nManager.on_language_change(callback);
I18nManager.off_language_change(callback);

// 获取当前语言
I18nManager.current_language;       // 只读属性
```

### I18nLabel（零代码翻译）

在任意带 Label 的节点上添加 `I18nLabel` 组件，设置 `text_key` 即可自动翻译，语言切换时自动刷新。

### TrialCompletePopup

```typescript
// 显示弹窗
popup.show(cashAmount?, onComplete?);

// 隐藏弹窗
popup.hide();
```

## 自定义语言

### 添加新语言

1. 在 `resources/i18n/` 下创建新的 JSON 文件，如 `ja.json`
2. 在 `I18nManager.ts` 中将新语言加入 `LanguageType`：

```typescript
export type LanguageType = 'en' | 'id' | 'pt-BR' | 'ja';
```

3. 在 `CashSystem.ts` 的 `LANGUAGE_REWARD_MAP` 中添加奖励范围：

```typescript
const LANGUAGE_REWARD_MAP: Record<string, LanguageRewardConfig> = {
    'id':    { min: 30000, max: 50000 },
    'pt-BR': { min: 500,   max: 800   },
    'en':    { min: 10,    max: 20    },
    'ja':    { min: 100,   max: 500   },  // 新增
};
```

4. 在 `getCurrencySymbol()` 中添加货币符号：

```typescript
if (lang === 'ja') return '¥';
```

## 注意事项

1. **必须在 update 中调用 `cashSystem.update(dt)`**，否则数字滚动动画不生效
2. **I18nManager.init() 必须在 CashSystem 之前调用**，否则 CashSystem 无法获取当前语言
3. **现金标签节点必须包含 Label 组件**
4. **TrialCompletePopup 节点初始状态应设为 active=false**
5. **i18n JSON 文件必须放在 `resources/i18n/` 目录下**，I18nManager 通过 `resources.load()` 异步加载
