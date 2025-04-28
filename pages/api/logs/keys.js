import ImmudbClient from 'immudb-node';

const IMMUDB_HOST = '127.0.0.1';
const IMMUDB_PORT = '3322';
const IMMUDB_USER = 'immudb';
const IMMUDB_PWD = 'immudb';

const cl = new ImmudbClient({ host: IMMUDB_HOST, port: IMMUDB_PORT });

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Login to Immudb
      await cl.login({ user: IMMUDB_USER, password: IMMUDB_PWD });

      // Define the Get request parameters
      const getReq = { key: '*' }; // Use '*' to get all keys

      // Fetch all keys
      const getRes = await cl.get(getReq);

      // Return the keys as a response
      res.status(200).json(getRes);
    } catch (error) {
      console.error('Error retrieving keys:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    // Return method not allowed if it's not a GET request
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
