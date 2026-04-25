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

function fallbackActionFromMessage(message) {
  const text = String(message || "").toLowerCase();

  if (text.includes("pot") && (text.includes("move") || text.includes("save") || text.includes("savings"))) {
    return {
      action: "createPot",
      params: {
        label: "Auto Savings Pot",
        targetAmountWei: "1000000000000000000",
        yieldEnabled: false,
      },
    };
  }

  if ((text.includes("send") || text.includes("transfer")) && text.includes(".init")) {
    return {
      action: "sendTransfer",
      params: {
        recipient: "alice.init",
        amountWei: "10000000000000000",
        remark: "agent-triggered transfer",
      },
    };
  }

  return null;
}

async function runAgent({ prompt, message }) {
  if (!groq) {
    const fallback = `AI offline mode: processed message '${message}'.`;
    return {
      response: fallback,
      action: fallbackActionFromMessage(message),
      model: "offline",
    };
  }

  try {
    const completion = await groq.chat.completions.create({
      model: config.groqModel,
      temperature: 0.2,
      max_tokens: 900,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: message },
      ],
    });

    const response = completion?.choices?.[0]?.message?.content || "";
    return {
      response,
      action: extractAction(response) || fallbackActionFromMessage(message),
      model: config.groqModel,
    };
  } catch (error) {
    const details = error && error.message ? error.message : "unknown model error";
    return {
      response: `AI fallback mode: primary model unavailable (${details}).`,
      action: fallbackActionFromMessage(message),
      model: "fallback",
    };
  }
}

module.exports = { runAgent };