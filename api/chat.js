import OpenAI from 'openai';

// Vercel 會自動從後台設定讀取這個變數，程式碼裡不用寫死
const openai = new OpenAI({
apiKey: process.env.OPENAI_API_KEY,
});


// 這是 Vercel Serverless Function 的標準寫法
export default async function handler(req, res) {
  // 設定 CORS，允許你的網頁呼叫這個後端
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 處理預檢請求 (Preflight request)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只允許 POST 請求' });
  }

  try {
    const { messages } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: messages,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    
    // 回傳成功結果
    res.status(200).json({ content: reply });

  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: error.message || '伺服器發生錯誤' });
  }
}