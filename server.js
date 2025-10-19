import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Tillåt bara din Lovable-domän
app.use(cors({
  origin: [
    "https://preview--riddermark-lead-view.lovable.app/agent",       // ex: https://lovable.dev/projects/xxxx/preview
    "https://<din-prod-domän>"           // om du har egen domän
  ],
  credentials: false
}));

// Miljövariabler i Render
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;      // från OpenAI (samma org/proj som AgentBuilder)
const WORKFLOW_ID     = process.env.WORKFLOW_ID;        // wf_xxx – ditt AgentBuilder workflow-id

// Skapa en ChatKit-session och returnera kortlivad client_secret
app.post("/chatkit/start", async (req, res) => {
  try {
    // OBS: URL & fält måste följa ChatKit-dokumentationen du har.
    // Nedan är ett mönster – uppdatera om din doc säger annat.
    const r = await fetch("https://api.openai.com/v1/chatkit/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        workflow_id: WORKFLOW_ID,
        // ev. metadata: user_id, channel, etc.
      })
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(500).json({ error: text });
    }
    const json = await r.json(); // förväntar { client_secret: "..." , ... }
    return res.json({ client_secret: json.client_secret });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "start_failed" });
  }
});

// (Valfritt) Förnya token
app.post("/chatkit/refresh", async (req, res) => {
  try {
    const { current } = req.body || {};
    // implementera enligt dina ChatKit-docs om refresh behövs
    return res.json({ client_secret: current });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "refresh_failed" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`ChatKit backend running on :${PORT}`));
