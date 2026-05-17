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

    // 🎯 THE FIX: Target the main '/clients' folder (not the specific ID)
    const endpoint = `${apiUrl}/api/v5/authorization/sources/built_in_database/rules/clients`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST', // 🎯 THE FIX: POST is used to create new rules
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${token}`
            },
            body: JSON.stringify({
                clientid: clientId, // 🎯 THE FIX: EMQX expects the ID inside the payload for a POST
                rules: [
                    {
                        permission: "allow",
                        action: action || "all", 
                        topic: topic
                    }
                ]
            })
        });

        // 201 Created or 200 OK or 204 No Content are all successes
        if (response.ok || response.status === 201 || response.status === 204) {
            return res.status(200).json({ 
                success: true, 
                message: `✅ Granted Read/Write access to Client ID: ${clientId} for topic: ${topic}` 
            });
        } else {
            // 🎯 DEEP ERROR EXTRACTOR: Pull the exact error from EMQX
            const errorText = await response.text();
            let errorMessage = 'EMQX API Rejected the Request';
            
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.reason || JSON.stringify(errorData);
            } catch (e) {
                errorMessage = errorText || `Status Code: ${response.status}`;
            }

            return res.status(response.status).json({ 
                success: false, 
                error: `EMQX Error: ${errorMessage}` 
            });
        }
    } catch (error) {
        console.error('Vercel Fetch Error:', error);
        return res.status(500).json({ success: false, error: 'Internal Vercel Server Error' });
    }
}
