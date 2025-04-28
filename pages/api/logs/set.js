import ImmudbClient from 'immudb-node';

// Initialize the Immudb client
const IMMUDB_HOST = '127.0.0.1';
const IMMUDB_PORT = '3322';
const IMMUDB_USER = 'immudb';
const IMMUDB_PWD = 'immudb';

const cl = new ImmudbClient({ host: IMMUDB_HOST, port: IMMUDB_PORT });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { timestamp, message, level } = req.body;

  if (!timestamp || !message || !level) {
    return res.status(400).json({
      error: 'All fields are required',
      received: { timestamp, message, level }
    });
  }

  try {
    // Login to Immudb with credentials
    await cl.login({ user: IMMUDB_USER, password: IMMUDB_PWD });

    const logKey = `log:${new Date(timestamp).getTime()}:${level.toLowerCase()}`;
    const logValue = JSON.stringify({
      timestamp,
      message,
      level,
      createdAt: new Date().toISOString(),
    });

    // Store log in Immudb
    const setRes = await cl.set({ key: logKey, value: logValue });

    return res.status(200).json({
      success: true,
      key: logKey,
      txId: setRes.txId,  // Return txId to confirm transaction
      message: 'Log stored successfully',
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
