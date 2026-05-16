// api/manage.js
export default async function handler(req, res) {
    // Load secrets from Vercel Environment Variables
    const appId = process.env.EMQX_APP_ID;
    const appSecret = process.env.EMQX_APP_SECRET;
    const apiUrl = process.env.EMQX_API_URL;
    const token = Buffer.from(`${appId}:${appSecret}`).toString('base64');

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${token}`
    };

    // ---------------------------------------------------------
    // GET REQUEST: Retrieve all saved usernames from EMQX
    // ---------------------------------------------------------
    if (req.method === 'GET') {
        const endpoint = `${apiUrl}/api/v5/authentication/password_based:built_in_database/users`;

        try {
            const response = await fetch(endpoint, { method: 'GET', headers });
            const data = await response.json();

            if (response.ok) {
                return res.status(200).json({ success: true, users: data.data || [] });
            } else {
                return res.status(response.status).json({ success: false, error: 'Failed to fetch users' });
            }
        } catch (error) {
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }

    // ---------------------------------------------------------
    // DELETE REQUEST: Remove a specific user from EMQX
    // ---------------------------------------------------------
    else if (req.method === 'DELETE') {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ success: false, error: 'Username is required to delete' });
        }

        // Notice the username is appended directly to the URL for a DELETE request
        const endpoint = `${apiUrl}/api/v5/authentication/password_based:built_in_database/users/${username}`;

        try {
            const response = await fetch(endpoint, { method: 'DELETE', headers });
            
            // EMQX returns 204 No Content on a successful delete
            if (response.ok || response.status === 204) {
                return res.status(200).json({ success: true, message: `Successfully deleted ${username}` });
            } else {
                const errorData = await response.json();
                return res.status(response.status).json({ success: false, error: errorData.message || 'Failed to delete' });
            }
        } catch (error) {
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    } 
    
    // Fallback for unsupported methods
    else {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }
}
