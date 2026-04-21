const Groq = require("groq-sdk");
const config = require("../config");

const groq = config.groqApiKey ? new Groq({ apiKey: config.groqApiKey }) : null;

function extractAction(responseText) {
  try {
    const match = responseText.match(/\{[\s\S]*\}$/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    if (parsed && typeof parsed.action === "string") return parsed;
    return null;
  } catch {
    return null;
  }
}

async function runAgent({ prompt, message }) {
  if (!groq) {
    const fallback = `AI offline mode: processed message '${message}'.`;
    return { response: fallback, action: null, model: "offline" };
  }

  const completion = await groq.chat.completions.create({
    model: config.groqModel,
    temperature: 0.2,
    max_tokens: 900,
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: message },
    ],
  });

  const response = completion.choices[0]?.message?.content || "";
  return {
    response,
    action: extractAction(response),
    model: config.groqModel,
  };
}

module.exports = { runAgent };