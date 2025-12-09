// 提報專用：金手指劇本設定檔 (反串版 - 10回合完整版)
// 角色分配：玩家 (詐騙集團) vs AI (貪財受害者阿明)

// 2. 遊戲一開始 AI 先說的話 (修改為您指定的開場白)
window.DEMO_OPENING_MESSAGE = "真假？在家就能賺錢喔？聽起來好讚，教我教我！";

const DEMO_SCRIPT = [
    {
        // Round 1: 
        keywords: ["你也想試試看嗎"], 
        response: "對阿，我也想試試看，請問怎麼開始呢?"
    },
    {
        // Round 2: 
        keywords: ["關注什麼樣的投資"],
        response: "我有看過股票，但還是新手。"
    },
    {
        // Round 3: 
        keywords: ["關注哪些資訊"],
        response: "都加減看看欸，你有推薦的嗎?"
    },
    {
        // Round 4: 
        keywords: ["我可以幫你分析"],
        response: "真的嗎?太好了。要怎麼開始呢?"
    },
    {
        // Round 5: 
        keywords: ["從小額開始"],
        response: "聽起來不錯，小額投資還可以接受。具體要怎麼操作?"
    },
    {
        // Round 6: 
        keywords: ["連結", "http", "網址"],
        response: "好的!我馬上加入。"
    },
    {
        // Round 7: 
        keywords: ["投資金額"],
        response: "還沒，請問要準備多少呢?"
    },
    {
        // Round 8: 
        keywords: ["一萬"],
        response: "好的，我會去準備的!"
    },
    {
        // Round 9: 
        keywords: ["請匯款到這個帳號"],
        response: "好，我現在人在超商 ATM 前面，馬上轉過去。"
    },
    {
        // Round 10: 
        keywords: ["收到你的款項"],
        response: "太好了！那我什麼時候可以看到獲利？群組會公告收益嗎?"
    }
];

// 匯出功能 (支援模糊比對，只要句子裡包含關鍵字即可)
window.checkDemoScript = function(userText) {
    if (!userText) return null;
    
    const lowerUserText = userText.toLowerCase();

    for (let item of DEMO_SCRIPT) {
        for (let key of item.keywords) {
            // 只要對中關鍵句 (或包含該句子)
            if (lowerUserText.includes(key.toLowerCase())) {
                console.log("🎯 命中劇本！關鍵字：" + key);
                return item.response;
            }
        }
    }
    return null; 
};