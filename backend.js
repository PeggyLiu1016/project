/**
 * 這是一個後端程式範例 (Node.js)。
 * 它的作用是：接收前端傳來的對話紀錄 -> 加上你的 API Key -> 呼叫 OpenAI -> 把結果回傳給前端。
 * 這樣你的 API Key 永遠只會在後端，不會暴露給玩家。
 */

const functions = require("firebase-functions");
// 這裡需要安裝 openai 套件: npm install openai
const OpenAI = require("openai");

// 在這裡設定你的 API Key (部署時建議設在環境變數，展出急用可先填入)
const API_KEY = "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; 

const openai = new OpenAI({ apiKey: API_KEY });

// 設定跨域請求 (CORS)，允許你的網頁呼叫這個後端
const cors = require('cors')({ origin: true });

exports.chatWithGPT = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }

        try {
            const { messages } = req.body;

            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: messages,
                temperature: 0.7,
                // 強制回傳 JSON 格式以利前端分析分數
                response_format: { type: "json_object" } 
            });

            const reply = completion.choices[0].message.content;
            res.status(200).json({ content: reply });

        } catch (error) {
            console.error("OpenAI Error:", error);
            res.status(500).json({ error: error.message });
        }
    });
});