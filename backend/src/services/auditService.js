const db = require("../db");
const { makeId } = require("../utils/id");

function writeAudit({ userId = null, action, entityType, entityId = null, level = "info", details = {} }) {
  db.prepare(`
    INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, level, details_json, created_at)
    VALUES (@id, @user_id, @action, @entity_type, @entity_id, @level, @details_json, @created_at)
  `).run({
    id: makeId("audit"),
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    level,
    details_json: JSON.stringify(details),
    created_at: new Date().toISOString(),
  });
}

module.exports = { writeAudit };