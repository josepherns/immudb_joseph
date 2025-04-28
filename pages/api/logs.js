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

  // Validate input
  if (!timestamp || !message || !level) {
    return res.status(400).json({
      error: 'All fields are required',
      received: { timestamp, message, level }
    });
  }

  try {
    // Login to Immudb with credentials
    console.log('Logging into Immudb...');
    await cl.login({ user: IMMUDB_USER, password: IMMUDB_PWD });
    console.log('Login successful!');

    // Create structured log entry
    const logKey = `log:${new Date(timestamp).getTime()}:${level.toLowerCase()}`;
    const logValue = JSON.stringify({
      timestamp,
      message,
      level,
      createdAt: new Date().toISOString(),
    });

    console.log('Saving log to Immudb:', { logKey, logValue });

    // Store log in Immudb
    const setRes = await cl.set({ key: logKey, value: logValue });
    console.log('Log stored successfully:', setRes);

    // Retrieve the log entry to confirm storage
    const getRes = await cl.get({ key: logKey });
    console.log('Retrieved log:', getRes);

    return res.status(200).json({
      success: true,
      key: logKey,
      txId: setRes.txId,  // Return txId to confirm transaction
      message: 'Log stored and retrieved successfully',
      retrievedLog: getRes.value // The value stored in Immudb
    });

  } catch (error) {
    // Log the error for debugging
    console.error('Complete error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack
    });

    return res.status(500).json({
      error: 'Database operation failed',
      details: error.details || error.message,
      code: error.code,
      suggestion: 'Verify your Immudb credentials and connection'
    });
  }
}
