// api/list-whitelisted-clients.js
export default async function handler(req, res) {
    // Only allow GET requests for fetching data
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    const appId = process.env.EMQX_APP_ID;
    const appSecret = process.env.EMQX_APP_SECRET;
    const apiUrl = process.env.EMQX_API_URL;
    
    // Generate the master security token
    const token = Buffer.from(`${appId}:${appSecret}`).toString('base64');

    // 🎯 TARGETING THE CLIENT ID DATABASE (GET Request)
    const endpoint = `${apiUrl}/api/v5/authentication/clientid_based:built_in_database/users`;

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
            // Clean up the data before sending it to your frontend
            const approvedClients = data.data.map(client => ({
                clientId: client.clientid, // The whitelisted MAC Address / ID
                created_at: client.created_at
            }));

            return res.status(200).json({ 
                success: true, 
                totalCount: approvedClients.length,
                clients: approvedClients 
            });
        } else {
            return res.status(response.status).json({ 
                success: false, 
                error: data.message || 'Failed to fetch Whitelisted Client IDs' 
            });
        }
    } catch (error) {
        console.error('EMQX API Error:', error);
        return res.status(500).json({ success: false, error: 'Internal Vercel Server Error' });
    }
}
