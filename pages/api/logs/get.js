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

  const { logKey } = req.query;

  if (!logKey) {
    return res.status(400).json({ error: 'Log key is required' });
  }

  try {
    // Login to Immudb with credentials
    await cl.login({ user: IMMUDB_USER, password: IMMUDB_PWD });

    // Retrieve the log entry from Immudb
    const getRes = await cl.get({ key: logKey });

    if (getRes && getRes.value) {
      return res.status(200).json({
        success: true,
        log: JSON.parse(getRes.value),
      });
    } else {
      return res.status(404).json({ error: 'Log not found' });
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
