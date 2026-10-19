const { put, get } = require('@vercel/blob');

const PATHNAME = 'deeksha-tracker-data.json';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Fetch tracker state
  if (req.method === 'GET') {
    try {
      const result = await get(PATHNAME, { access: 'public' });
      if (!result || !result.stream) {
        return res.status(200).json({ userTicks: {}, openWeeks: { 1: true }, isDashboardOpen: false });
      }
      const chunks = [];
      for await (const chunk of result.stream) {
        chunks.push(chunk);
      }
      const text = Buffer.concat(chunks).toString('utf-8');
      const data = JSON.parse(text || '{}');
      return res.status(200).json(data);
    } catch (err) {
      console.error('Error fetching tracker state:', err);
      return res.status(200).json({ userTicks: {}, openWeeks: { 1: true }, isDashboardOpen: false, error: err.message });
    }
  }

  // POST: Save tracker state
  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }
      const jsonContent = JSON.stringify(body || {});
      const blob = await put(PATHNAME, jsonContent, {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
      });
      return res.status(200).json({ success: true, url: blob.url });
    } catch (err) {
      console.error('Error saving tracker state:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
