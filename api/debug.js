// // api/debug.js
export default async function handler(req, res) {
    const appId = process.env.EMQX_APP_ID;
    const appSecret = process.env.EMQX_APP_SECRET;
    const apiUrl = process.env.EMQX_API_URL;
    const token = Buffer.from(`${appId}:${appSecret}`).toString('base64');

    // This endpoint lists ALL authenticators installed on your server
    const endpoint = `${apiUrl}/api/v5/authentication`;

    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: { 'Authorization': `Basic ${token}` }
        });
        
        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to reach EMQX' });
    }
}
export default async function handler(req, res) {
    const appId = process.env.EMQX_APP_ID;
    const appSecret = process.env.EMQX_APP_SECRET;
    const apiUrl = process.env.EMQX_API_URL;
    const token = Buffer.from(`${appId}:${appSecret}`).toString('base64');

    // This endpoint lists ALL authenticators installed on your server
    const endpoint = `${apiUrl}/api/v5/authentication`;

    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: { 'Authorization': `Basic ${token}` }
        });
        
        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to reach EMQX' });
    }
}
