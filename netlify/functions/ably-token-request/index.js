const Ably = require('ably/promises');

exports.handler = async (event, context) => {
  if (!process.env.ABLY_API_KEY) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        error: 'Missing ABLY_API_KEY environment variable. Please configure ABLY_API_KEY in your Netlify environment variables.'
      })
    }
  }

  const clientId = event.queryStringParameters?.clientId || process.env.DEFAULT_CLIENT_ID || "NO_CLIENT_ID";
  const client = new Ably.Rest(process.env.ABLY_API_KEY);
  
  try {
    const tokenRequestData = await client.auth.createTokenRequest({ clientId: clientId });
    return {
      statusCode: 200,
      headers: { 
        "content-type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS"
      },
      body: JSON.stringify(tokenRequestData)
    };
  } catch (error) {
    console.error('Ably token request error:', error);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: 'Failed to create Ably token' })
    };
  }
};
