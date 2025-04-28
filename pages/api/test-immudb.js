import { client, connectToImmudb } from "../../lib/immudbClient";

export default async function handler(req, res) {
  try {
    await connectToImmudb();

    await client.set({ key: "hello", value: "world" });

    const response = await client.get({ key: "hello" });

    res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}