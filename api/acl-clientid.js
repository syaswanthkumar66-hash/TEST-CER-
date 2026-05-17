// api/acl-clientid.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    const { clientId, topic, action } = req.body;

    if (!clientId || !topic) {
        return res.status(400).json({ success: false, error: 'Client ID and Topic are required' });
    }

    const appId = process.env.EMQX_APP_ID;
    const appSecret = process.env.EMQX_APP_SECRET;
    const apiUrl = process.env.EMQX_API_URL;
    const token = Buffer.from(`${appId}:${appSecret}`).toString('base64');

    // 🎯 TARGETING THE CLIENT ID ACL DATABASE
    const endpoint = `${apiUrl}/api/v5/authorization/sources/built_in_database/rules/clientid/${clientId}`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${token}`
            },
            body: JSON.stringify({
                rules: [
                    {
                        permission: "allow",
                        action: action || "all", // "publish", "subscribe", or "all"
                        topic: topic
                    }
                ]
            })
        });

        if (response.ok || response.status === 204) {
            return res.status(200).json({ 
                success: true, 
                message: `✅ Granted Read/Write access to Client ID: ${clientId} for topic: ${topic}` 
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
