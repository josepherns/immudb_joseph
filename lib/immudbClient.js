import { ImmudbClient } from "immudb-node";

const client = new ImmudbClient();

async function connectToImmudb() {
  await client.login({
    user: "immudb",
    password: "immudb", // Same as set in docker-compose
    serverAddress: "127.0.0.1",
    port: 3322,
  });

  console.log("Connected to immudb");
}

export { client, connectToImmudb };