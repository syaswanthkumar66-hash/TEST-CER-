export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    const { username, topic, action } = req.body;

    if (!username || !topic) {
        return res.status(400).json({ success: false, error: 'Username and topic are required' });
    }

    const appId = process.env.EMQX_APP_ID;
    const appSecret = process.env.EMQX_APP_SECRET;
    const apiUrl = process.env.EMQX_API_URL;
    const token = Buffer.from(`${appId}:${appSecret}`).toString('base64');

    const endpoint = `${apiUrl}/api/v5/authorization/sources/built_in_database/rules/users`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${token}`
            },
            body: JSON.stringify([
                {
                    username: username,
                    rules: [
                        {
                            permission: "allow",
                            action: action || "all", 
                            topic: topic
                        }
                    ]
                }
            ])
        });

        if (response.ok || response.status === 204) {
            return res.status(200).json({ success: true, message: `Granted ${username} access to ${topic}` });
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
