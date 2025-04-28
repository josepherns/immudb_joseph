import ImmudbClient from 'immudb-node';

// Initialize the Immudb client
const IMMUDB_HOST = '127.0.0.1';
const IMMUDB_PORT = '3322';
const IMMUDB_USER = 'immudb';
const IMMUDB_PWD = 'immudb';

const cl = new ImmudbClient({ host: IMMUDB_HOST, port: IMMUDB_PORT });

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Login to Immudb with credentials
    await cl.login({ user: IMMUDB_USER, password: IMMUDB_PWD });

    // Scan the database for all keys (limit the results to avoid huge payloads)
    const scanRes = await cl.scan({ prefix: 'log:', limit: 100 }); // Adjust limit as needed

    if (!scanRes || scanRes.keys.length === 0) {
      return res.status(404).json({ error: 'No logs found' });
    }

    // Retrieve log values for each key
    const logPromises = scanRes.keys.map(async (key) => {
      const getRes = await cl.get({ key });
      return {
        key,
        value: JSON.parse(getRes.value),
      };
    });

    const logs = await Promise.all(logPromises);

    return res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Database operation failed',
      details: error.details || error.message,
      code: error.code,
      suggestion: 'Verify your Immudb credentials and connection',
    });
  }
}
