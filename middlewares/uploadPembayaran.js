const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, path.join(__dirname, "../uploads"));

    },

    filename: (req, file, cb) => {

        const unique = Date.now();

        const ext = path.extname(file.originalname);

        const userName =
            req.user?.nama || "user";

        const cleanName = userName
            .toLowerCase()
            .replace(/\s+/g, "-");

        const name =
            `bukti-pembayaran-${cleanName}-${unique}${ext}`;

        cb(null, name);

    }

});

module.exports = multer({ storage });