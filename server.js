// server.js (Render)
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const origins = (process.env.ALLOWED_ORIGINS || "")
  .split(",").map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: origins.length ? origins : true,
}));

// Preflight för POST /chatkit/start
app.options("/chatkit/start", cors());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const WORKFLOW_ID = process.env.WORKFLOW_ID;

app.post("/chatkit/start", async (req, res) => {
  try {
    // TODO: uppdatera endpoint/payload enligt din officiella ChatKit-doc
    const r = await fetch("https://api.openai.com/v1/chatkit/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ workflow_id: WORKFLOW_ID }),
    });
    const text = await r.text();
    if (!r.ok) return res.status(500).json({ error: text });
    const json = JSON.parse(text);           // { client_secret: "..." }
    return res.json({ client_secret: json.client_secret });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "start_failed" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`ChatKit backend on :${PORT}`));
