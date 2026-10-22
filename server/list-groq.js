import 'dotenv/config';

const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
});
const data = await res.json();
(data.data || []).map((m) => m.id).sort().forEach((id) => console.log(id));