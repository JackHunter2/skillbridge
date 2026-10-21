import 'dotenv/config';

const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', {
    headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY },
});
const data = await res.json();

(data.models || [])
    .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
    .filter((m) => /flash/i.test(m.name))
    .forEach((m) => console.log(m.name.replace('models/', '')));