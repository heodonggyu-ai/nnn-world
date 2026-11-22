// 밍뉴툰 AI 그림 선생님 서버 (Cloudflare Worker)
// 필요한 설정: 비밀 값 GEMINI_API_KEY, (선택) KV 연결 이름 RL — 기기별 하루 횟수 제한용
const MODEL = 'gemini-flash-latest';
const PER_DAY = 3;            // 기기 하나당 하루 횟수 (앱의 AI_FREE_PER_DAY와 맞추기)
const MAX_IMAGE = 1_500_000;  // 받는 그림 최대 크기(바이트, base64 기준)
const cors = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type' };
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json; charset=utf-8', ...cors } });

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST') return json({ error: 'method' }, 405);
    const url = new URL(req.url);
    let body; try { body = await req.json(); } catch { return json({ error: 'bad json' }, 400); }

    // "이상해요" 신고: 로그에 남김 (Cloudflare 대시보드 → Workers → 이 Worker → Logs 에서 확인)
    if (url.pathname.endsWith('/report')) { console.log('AI_REPORT', JSON.stringify(body).slice(0, 2000)); return json({ ok: true }); }

    const { device, image, prompt } = body || {};
    if (!device || !image || !prompt || image.length > MAX_IMAGE || prompt.length > 8000) return json({ error: 'bad request' }, 400);

    // 기기별 하루 횟수 제한 (KV를 연결했을 때만)
    if (env.RL) {
      const day = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); // 한국 날짜
      const key = `${day}:${String(device).slice(0, 64)}`;
      const n = +(await env.RL.get(key) || 0);
      if (n >= PER_DAY) return json({ error: 'limit' }, 429);
      await env.RL.put(key, String(n + 1), { expirationTtl: 60 * 60 * 30 });
    }

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ inline_data: { mime_type: 'image/jpeg', data: image } }, { text: prompt }] }],
        generationConfig: { response_mime_type: 'application/json', temperature: 0.6, maxOutputTokens: 800 },
        safetySettings: ['HARM_CATEGORY_HARASSMENT', 'HARM_CATEGORY_HATE_SPEECH', 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'HARM_CATEGORY_DANGEROUS_CONTENT']
          .map(category => ({ category, threshold: 'BLOCK_LOW_AND_ABOVE' })),
      }),
    });
    if (!r.ok) { console.log('GEMINI_ERROR', r.status, (await r.text()).slice(0, 500)); return json({ error: 'ai' }, 502); }
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
    try {
      const out = JSON.parse(text);
      if (!out.praise) throw 0;
      return json({ praise: out.praise, tips: (out.tips || []).slice(0, 2), lesson: out.lesson || '', cheer: out.cheer || '' });
    } catch { return json({ error: 'parse' }, 502); }
  },
};
