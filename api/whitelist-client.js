// api/whitelist-client.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    const { clientId, password } = req.body;

    if (!clientId) {
        return res.status(400).json({ success: false, error: 'Client ID is required' });
    }

    const appId = process.env.EMQX_APP_ID;
    const appSecret = process.env.EMQX_APP_SECRET;
    const apiUrl = process.env.EMQX_API_URL;
    const token = Buffer.from(`${appId}:${appSecret}`).toString('base64');

    // 🎯 TARGETING THE CLIENT ID DATABASE 
    const endpoint = `${apiUrl}/api/v5/authentication/clientid_based:built_in_database/users`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${token}`
            },
            body: JSON.stringify({
                clientid: clientId,
                password: password || "" // Password can be optional depending on your strictness
            })
        });

        if (response.ok || response.status === 201) {
            return res.status(200).json({ 
                success: true, 
                message: `✅ Successfully whitelisted Client ID: ${clientId} in EMQX` 
            });
        } else {
            const errorData = await response.json();
            return res.status(response.status).json({ 
                success: false, 
                error: errorData.message || 'EMQX API Rejected the Request' 
            });
        }
    } catch (error) {
        console.error('EMQX API Error:', error);
        return res.status(500).json({ success: false, error: 'Internal Vercel Server Error' });
    }
}
