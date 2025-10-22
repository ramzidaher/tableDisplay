const { getAllPresets, getPresetById, createPreset, updatePreset, deletePreset } = require('./db');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const path = event.path;
    const method = event.httpMethod;

    // Parse request body for POST/PUT requests
    let body = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch (e) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid JSON in request body' })
        };
      }
    }

    // Route handling
    if (method === 'GET' && path === '/.netlify/functions/presets') {
      // Get all presets
      const presets = await getAllPresets();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(presets)
      };
    }

    if (method === 'GET' && path.includes('/presets/')) {
      // Get specific preset by ID
      const id = parseInt(path.split('/').pop());
      if (isNaN(id)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid preset ID' })
        };
      }

      const preset = await getPresetById(id);
      if (!preset) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Preset not found' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(preset)
      };
    }

    if (method === 'POST' && path === '/.netlify/functions/presets') {
      // Create new preset
      const { text, priority = 'normal' } = body;

      if (!text || text.trim() === '') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Text is required' })
        };
      }

      const preset = await createPreset(text.trim(), priority);
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(preset)
      };
    }

    if (method === 'PUT' && path.includes('/presets/')) {
      // Update preset
      const id = parseInt(path.split('/').pop());
      if (isNaN(id)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid preset ID' })
        };
      }

      const { text, priority } = body;

      if (!text || text.trim() === '') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Text is required' })
        };
      }

      const preset = await updatePreset(id, text.trim(), priority);
      if (!preset) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Preset not found' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(preset)
      };
    }

    if (method === 'DELETE' && path.includes('/presets/')) {
      // Delete preset
      const id = parseInt(path.split('/').pop());
      if (isNaN(id)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid preset ID' })
        };
      }

      const preset = await deletePreset(id);
      if (!preset) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Preset not found' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Preset deleted successfully' })
      };
    }

    // Method not allowed
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Error in presets function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
