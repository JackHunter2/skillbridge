import 'dotenv/config';

const MODEL = process.env.AI_MODEL;
const t0 = Date.now();

const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
        body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Balas satu kata saja: halo' }] }],
            generationConfig: { maxOutputTokens: 300, thinkingConfig: { thinkingLevel: 'minimal' } },
        }),
        signal: AbortSignal.timeout(120000),
    }
);

console.log('Model  :', MODEL);
console.log('Status :', res.status);
console.log('Durasi :', ((Date.now() - t0) / 1000).toFixed(1), 'detik');
console.log((await res.text()).slice(0, 700));