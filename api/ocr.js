let cachedToken = null;
let cachedTokenExpiresAt = 0;

const TOKEN_URL = 'https://aip.baidubce.com/oauth/2.0/token';
const OCR_URL = 'https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic';
const MAX_BASE64_LENGTH = 8 * 1024 * 1024;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    return res.status(200).json({ configured: hasBaiduConfig() });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!hasBaiduConfig()) {
    return res.status(503).json({ error: 'Baidu OCR is not configured on the server' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const image = normalizeBase64Image(body && body.image);

    if (!image) {
      return res.status(400).json({ error: 'Missing image' });
    }

    if (image.length > MAX_BASE64_LENGTH) {
      return res.status(413).json({ error: 'Image is too large' });
    }

    const token = await getAccessToken();
    const words = await recognizeText(token, image);

    return res.status(200).json({ text: words.join(''), words });
  } catch (error) {
    console.error('[ocr]', error);
    return res.status(500).json({ error: 'OCR request failed' });
  }
};

function hasBaiduConfig() {
  return Boolean(process.env.BAIDU_API_KEY && process.env.BAIDU_SECRET_KEY);
}

function normalizeBase64Image(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  const commaIndex = trimmed.indexOf(',');
  return commaIndex >= 0 ? trimmed.slice(commaIndex + 1) : trimmed;
}

async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && cachedTokenExpiresAt > now + 60_000) {
    return cachedToken;
  }

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: process.env.BAIDU_API_KEY,
    client_secret: process.env.BAIDU_SECRET_KEY
  });

  const response = await fetch(`${TOKEN_URL}?${params.toString()}`, {
    method: 'POST'
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Unable to fetch Baidu token');
  }

  cachedToken = data.access_token;
  cachedTokenExpiresAt = now + Math.max(0, Number(data.expires_in || 0) - 120) * 1000;
  return cachedToken;
}

async function recognizeText(token, image) {
  const params = new URLSearchParams({
    image,
    language_type: 'CHN_ENG'
  });

  const response = await fetch(`${OCR_URL}?access_token=${encodeURIComponent(token)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });

  const data = await response.json();
  if (!response.ok || data.error_code) {
    throw new Error(data.error_msg || 'Baidu OCR request failed');
  }

  return Array.isArray(data.words_result)
    ? data.words_result.map((item) => item.words || '').filter(Boolean)
    : [];
}
