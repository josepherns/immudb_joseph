import ImmudbClient from 'immudb-node';

// Initialize the Immudb client
const IMMUDB_HOST = '127.0.0.1';
const IMMUDB_PORT = '3322';
const IMMUDB_USER = 'immudb';
const IMMUDB_PWD = 'immudb';

const cl = new ImmudbClient({ host: IMMUDB_HOST, port: IMMUDB_PORT });

export default async function handler(req, res) {
  // Ensure the correct HTTP method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Login to Immudb with credentials
    await cl.login({ user: IMMUDB_USER, password: IMMUDB_PWD });

    // Retrieve all keys from Immudb by scanning keys
    const scanRes = await cl.scan({ prefix: '' });

    if (scanRes && scanRes.keys && scanRes.keys.length > 0) {
      // Filter out log keys (example: all keys starting with 'log:')
      const logKeys = scanRes.keys.filter(key => key.startsWith('log:'));
      
      if (logKeys.length > 0) {
        return res.status(200).json({
          success: true,
          logKeys,
        });
      } else {
        return res.status(404).json({ error: 'No log keys found' });
      }
    } else {
      return res.status(404).json({ error: 'No keys found in Immudb' });
    }
  } catch (error) {
    return res.status(500).json({
      error: 'Database operation failed',
      details: error.details || error.message,
      code: error.code,
      suggestion: 'Verify your Immudb credentials and connection',
    });
  }
}
