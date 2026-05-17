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

    // 🎯 THE FIX: Changed '/clientid/' to '/clients/' in the URL path
    const endpoint = `${apiUrl}/api/v5/authorization/sources/built_in_database/rules/clients/${clientId}`;

    try {
        const response = await fetch(endpoint, {
            method: 'PUT', // 🎯 THE FIX: EMQX v5 expects a PUT request to update specific rules
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${token}`
            },
            body: JSON.stringify({
                rules: [
                    {
                        permission: "allow",
                        action: action || "all", 
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
