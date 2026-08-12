/**
 * 多语言管理器 - 可复用的国际化模块
 * 
 * 功能：
 * 1. 支持多语言切换（en, id, pt-BR）
 * 2. 从 resources/i18n/ 目录加载 JSON 翻译文件
 * 3. 支持占位符替换 {0}, {1}, ...
 * 4. 提供语言变化监听机制
 */
import { _decorator, Component, resources, JsonAsset, Node } from 'cc';
const { ccclass } = _decorator;

export type LanguageType = 'en' | 'id' | 'pt-BR';

@ccclass('I18nManager')
export class I18nManager extends Component {

    private static _instance: I18nManager | null = null;
    private _current_language: LanguageType = 'en';
    private _language_data: Map<string, Map<string, string>> = new Map();
    private _listeners: Set<() => void> = new Set();

    static get instance(): I18nManager | null {
        return I18nManager._instance;
    }

    static get current_language(): LanguageType {
        return I18nManager._instance?._current_language ?? 'en';
    }

    static init(default_lang: LanguageType = 'en'): void {
        if (!I18nManager._instance) {
            let node = new Node('__I18nManager__');
            I18nManager._instance = node.addComponent(I18nManager) as I18nManager;
        }
        I18nManager._instance!._load_language(default_lang);
    }

    static get(key: string, ...args: any[]): string {
        if (!I18nManager._instance) return key;
        
        let lang_data = I18nManager._instance._language_data.get(I18nManager._instance._current_language);
        if (!lang_data) return key;
        
        let text = lang_data.get(key);
        if (!text) return key;
        
        if (args.length > 0) {
            for (let i = 0; i < args.length; i++) {
                text = text.replace(`{${i}}`, String(args[i]));
            }
        }
        
        return text;
    }

    static set_language(lang: LanguageType): void {
        if (!I18nManager._instance) return;
        I18nManager._instance._load_language(lang);
    }

    static on_language_change(callback: () => void): void {
        if (!I18nManager._instance) return;
        I18nManager._instance._listeners.add(callback);
    }

    static off_language_change(callback: () => void): void {
        if (!I18nManager._instance) return;
        I18nManager._instance._listeners.delete(callback);
    }

    private _load_language(lang: LanguageType): void {
        this._current_language = lang;
        
        if (this._language_data.has(lang)) {
            this._notify_listeners();
            return;
        }
        
        resources.load(`i18n/${lang}`, JsonAsset, (err, json_asset) => {
            if (err) {
                console.error(`[I18nManager] 加载语言文件失败: ${lang}`, err);
                return;
            }
            
            let data = json_asset.json as { [key: string]: string };
            let map = new Map<string, string>();
            for (let key in data) {
                map.set(key, data[key]);
            }
            
            this._language_data.set(lang, map);
            this._notify_listeners();
        });
    }

    private _notify_listeners(): void {
        for (let listener of this._listeners) {
            try {
                listener();
            } catch (e) {
                console.error('[I18nManager] 监听器执行错误:', e);
            }
        }
    }
}
