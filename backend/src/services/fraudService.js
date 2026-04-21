function scoreRisk({ amountWei, recipient, remark }) {
  let score = 0;
  const value = BigInt(amountWei || "0");

  if (value > BigInt("100000000000000000000")) score += 0.5;
  if ((recipient || "").includes("0000")) score += 0.2;
  if (/seed|private key|urgent/i.test(remark || "")) score += 0.3;

  return Math.min(1, score);
}

function blockIfHighRisk(score) {
  if (score >= 0.85) {
    const error = new Error("Fraud prevention blocked this transaction");
    error.statusCode = 422;
    throw error;
  }
}

module.exports = { scoreRisk, blockIfHighRisk };