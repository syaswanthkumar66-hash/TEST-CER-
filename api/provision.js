// api/provision.js
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ success: false, error: 'Username and password are required' });
    }

    // Load secrets from Vercel Environment Variables
    const appId = process.env.EMQX_APP_ID;
    const appSecret = process.env.EMQX_APP_SECRET;
    const apiUrl = process.env.EMQX_API_URL;

    // Create the Base64 Auth Token
    const token = Buffer.from(`${appId}:${appSecret}`).toString('base64');
    const endpoint = `${apiUrl}/api/v5/authentication/password_based:built_in_database/users`;

    try {
        // Fire the request from the Server (Bypasses CORS entirely)
        const emqxResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${token}`
            },
            body: JSON.stringify({
                user_id: username,
                password: password
            })
        });

        if (emqxResponse.ok) {
            return res.status(200).json({ success: true, message: `Successfully added ${username} to EMQX Console!` });
        } else {
            const errorData = await emqxResponse.json();
            return res.status(emqxResponse.status).json({ success: false, error: errorData.message || 'EMQX API Rejected the Request' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: 'Internal Vercel Server Error' });
    }
}
