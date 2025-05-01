import { useState, useEffect } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');
  const [level, setLevel] = useState('INFO');
  const [response, setResponse] = useState(null);
  const [logKey, setLogKey] = useState('');
  const [retrievedLog, setRetrievedLog] = useState(null);
  const [logKeys, setLogKeys] = useState([]);  // State to store all log keys

  // Fetch all available log keys when the component mounts
  useEffect(() => {
    const fetchLogKeys = async () => {
      try {
        const res = await fetch('/api/logs/keys');
        const data = await res.json();

        if (res.ok) {
          setLogKeys(data.logKeys); // Assuming data.logKeys is the array of log keys
        } else {
          setResponse({ success: false, message: data.error });
        }
      } catch (error) {
        setResponse({
          success: false,
          message: error.message || 'Network error occurred',
        });
      }
    };

    fetchLogKeys();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Generate timestamp on submission
    const timestamp = new Date().toISOString();

    try {
      const res = await fetch('/api/logs/set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp,
          message,
          level,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResponse({ success: true, data });
        setMessage('');  // Reset message input
        setLevel('INFO');  // Reset level to default
        setLogKey(data.key);  // Save the log key for retrieval
      } else {
        setResponse({ success: false, message: data.error || data.details });
      }
    } catch (error) {
      setResponse({
        success: false,
        message: error.message || 'Network error occurred',
      });
    }
  };

  const handleRetrieveLog = async () => {
    if (!logKey) {
      setResponse({ success: false, message: 'Log key is required' });
      return;
    }

    try {
      const res = await fetch(`/api/logs/get?logKey=${logKey}`);
      const data = await res.json();

      if (res.ok) {
        setRetrievedLog(data.log);
        setResponse({ success: true, data });
      } else {
        setResponse({ success: false, message: data.error });
      }
    } catch (error) {
      setResponse({
        success: false,
        message: error.message || 'Network error occurred',
      });
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Insert Log into Immudb</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="message" style={{ display: 'block', marginBottom: '5px' }}>
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div>
          <label htmlFor="level" style={{ display: 'block', marginBottom: '5px' }}>
            Log Level
          </label>
          <select
            id="level"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            style={{ padding: '8px', width: '100%' }}
          >
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="ERROR">ERROR</option>
            <option value="DEBUG">DEBUG</option>
          </select>
        </div>
        <button
          type="submit"
          style={{
            padding: '10px 15px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Submit Log
        </button>
      </form>

      <div>
        <h2>Retrieve Log</h2>
        <input
          type="text"
          placeholder="Enter Log Key"
          value={logKey}
          onChange={(e) => setLogKey(e.target.value)}
          style={{ padding: '8px', width: '100%' }}
        />
        <button
          onClick={handleRetrieveLog}
          style={{
            padding: '10px 15px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px',
          }}
        >
          Retrieve Log
        </button>
      </div>

      {/* Display available log keys */}
      <div>
        <h2>Available Log Keys</h2>
        <ul>
          {logKeys?.map((key) => (
            <li key={key}>{key}</li>
          ))}
        </ul>
      </div>

      {response && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: response.success ? '#e6ffed' : '#ffebee',
            border: `1px solid ${response.success ? '#a3d9a5' : '#f44336'}`,
            borderRadius: '4px',
          }}
        >
          {response.success ? (
            <>
              <h3 style={{ color: '#2e7d32', marginTop: 0 }}>Success!</h3>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </>
          ) : (
            <p style={{ color: '#d32f2f' }}>Error: {response.message}</p>
          )}
        </div>
      )}

      {retrievedLog && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f0f8ff',
            border: '1px solid #0070f3',
            borderRadius: '4px',
          }}
        >
          <h3>Retrieved Log:</h3>
          <pre>{JSON.stringify(retrievedLog, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
