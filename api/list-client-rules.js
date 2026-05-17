// api/list-client-rules.js
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    const appId = process.env.EMQX_APP_ID;
    const appSecret = process.env.EMQX_APP_SECRET;
    const apiUrl = process.env.EMQX_API_URL;
    const token = Buffer.from(`${appId}:${appSecret}`).toString('base64');

    // 🎯 Target the main '/clients' folder with a GET request
    const endpoint = `${apiUrl}/api/v5/authorization/sources/built_in_database/rules/clients`;

    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            // EMQX returns the list inside a 'data' array
            return res.status(200).json({ 
                success: true, 
                clients: data.data || [] 
            });
        } else {
            return res.status(response.status).json({ 
                success: false, 
                error: data.message || 'Failed to fetch hardware rules' 
            });
        }
    } catch (error) {
        console.error('Vercel Fetch Error:', error);
        return res.status(500).json({ success: false, error: 'Internal Vercel Server Error' });
    }
}
