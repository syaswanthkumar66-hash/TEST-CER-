// api/manage.js
export default async function handler(req, res) {
    const appId = process.env.EMQX_APP_ID;
    const appSecret = process.env.EMQX_APP_SECRET;
    const apiUrl = process.env.EMQX_API_URL;
    const token = Buffer.from(`${appId}:${appSecret}`).toString('base64');

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${token}`
    };

    // --- FETCH USERS ---
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

    // --- THE FULL WIPE DELETION ---
    else if (req.method === 'DELETE') {
        const { username } = req.body;
        if (!username) return res.status(400).json({ success: false, error: 'Username required' });

        // Endpoint 1: Delete the Password (Authentication)
        const authEndpoint = `${apiUrl}/api/v5/authentication/password_based:built_in_database/users/${username}`;
        
        // Endpoint 2: Delete the Topic Rules (Authorization/ACL)
        const aclEndpoint = `${apiUrl}/api/v5/authorization/sources/built_in_database/rules/users/${username}`;

        try {
            // 1. Delete the user's password to kill their connection
            const authResponse = await fetch(authEndpoint, { method: 'DELETE', headers });
            
            if (authResponse.ok || authResponse.status === 204 || authResponse.status === 404) {
                
                // 2. If password deletion succeeds (or they didn't have one), wipe their ACL rules
                const aclResponse = await fetch(aclEndpoint, { method: 'DELETE', headers });

                if (aclResponse.ok || aclResponse.status === 204 || aclResponse.status === 404) {
                    return res.status(200).json({ 
                        success: true, 
                        message: `Full Wipe Complete: Deleted password and topic rules for ${username}` 
                    });
                } else {
                    return res.status(aclResponse.status).json({ 
                        success: false, 
                        error: 'Password deleted, but failed to delete topic rules.' 
                    });
                }
            } else {
                const errorData = await authResponse.json();
                return res.status(authResponse.status).json({ 
                    success: false, 
                    error: errorData.message || 'Failed to delete password' 
                });
            }
        } catch (error) {
            return res.status(500).json({ success: false, error: 'Internal Server Error during deletion' });
        }
    } 
    
    else {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }
}
