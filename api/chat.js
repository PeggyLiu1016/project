import OpenAI from 'openai';

// 初始化 OpenAI (Vercel 會自動抓環境變數 OPENAI_API_KEY)
const openai = new OpenAI();

// Vercel Serverless Function 標準寫法
export default async function handler(req, res) {
  // 1. 設定 CORS (讓你的網頁可以連進來)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. 處理預檢請求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. 處理正式請求
  try {
    const { messages } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      // 這裡不強制 JSON 模式，避免報錯
    });

    const reply = completion.choices[0].message.content;
    
    // 4. 回傳結果
    res.status(200).json({ content: reply });

  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: error.message || '伺服器錯誤' });
  }
}