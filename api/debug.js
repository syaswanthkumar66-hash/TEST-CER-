// api/debug.js
export default async function handler(req, res) {
    try {
        let apiUrl = process.env.EMQX_API_URL || '';

        // 1. SAFETY FIX: If your environment variable is missing 'https://', this adds it automatically!
        if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
            apiUrl = 'https://' + apiUrl;
        }

        const appId = process.env.EMQX_APP_ID;
        const appSecret = process.env.EMQX_APP_SECRET;
        const token = Buffer.from(`${appId}:${appSecret}`).toString('base64');

        const endpoint = `${apiUrl}/api/v5/authentication`;

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: { 'Authorization': `Basic ${token}` }
        });

        // 2. SAFETY FIX: If EMQX returns an HTML error page, this stops Vercel from crashing
        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ 
                error: "EMQX rejected the request", 
                statusCode: response.status,
                emqxResponse: errorText
            });
        }

        // If it succeeds, return the data!
        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        // 3. SAFETY FIX: Catch any catastrophic server failures cleanly
        console.error("Vercel crashed:", error);
        return res.status(500).json({ 
            error: "Vercel API Crashed", 
            details: error.message 
        });
    }
}
