// api/security.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    const appId = process.env.EMQX_APP_ID;
    const appSecret = process.env.EMQX_APP_SECRET;
    const apiUrl = process.env.EMQX_API_URL;
    const token = Buffer.from(`${appId}:${appSecret}`).toString('base64');

    // Notice the endpoint ends in /all instead of /users
    const endpoint = `${apiUrl}/api/v5/authorization/sources/built_in_database/rules/all`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${token}`
            },
            // Applying the dynamic placeholder rule globally
            body: JSON.stringify({
                rules: [
                    {
                        permission: "allow",
                        action: "all",
                        topic: "${username}/#"
                    }
                ]
            })
        });

        if (response.ok || response.status === 204) {
            return res.status(200).json({ success: true, message: "Global Zero-Trust Security Enabled!" });
        } else {
            const errorData = await response.json();
            return res.status(response.status).json({ 
                success: false, 
                error: errorData.message || JSON.stringify(errorData) 
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: 'Internal Vercel Server Error' });
    }
}
