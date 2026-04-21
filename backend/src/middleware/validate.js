const { ZodError } = require("zod");

function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.validatedBody = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.issues });
      }
      return next(error);
    }
  };
}

module.exports = { validateBody };