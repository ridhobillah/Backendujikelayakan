const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({
        message: "Token tidak ditemukan"
      });
    }

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, process.env.AUTH_SECRET);

    req.user = decoded;

     if (req.originalUrl === "/api/penyewaan" && req.method === "POST") {
      if (req.user.role === "admin") {
        return res.status(403).json({
          message: "Admin tidak boleh melakukan penyewaan"
        });
      }
    }

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token tidak valid"
    });
  }
};