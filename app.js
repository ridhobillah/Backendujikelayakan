require('dotenv').config()

const express = require('express')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 3000

// =====================
// MIDDLEWARE
// =====================
app.use(cors())

// untuk JSON (raw body di Postman)
app.use(express.json())

// untuk form-data / x-www-form-urlencoded (tanpa file)
app.use(express.urlencoded({ extended: true }))

// static file (uploads)
app.use('/uploads', express.static('uploads'))

// =====================
// ROUTES
// =====================
const kendaraanRoute = require('./routes/kendaraan.route')
const kategoriRoute = require('./routes/kategori.route')
const userRoute = require("./routes/user.route");
const penyewaanRoute = require("./routes/penyewaan.route");
const pembayaranRoute = require("./routes/pembayaran.route");
const auth = require("./middlewares/auth");

app.use('/api/kendaraan', kendaraanRoute)
app.use('/api/kategori', auth, kategoriRoute)
app.use("/api/user", userRoute);
app.use("/api/penyewaan", auth, penyewaanRoute);
app.use("/api/pembayaran",auth, pembayaranRoute);

// =====================
// DEFAULT ROUTE
// =====================
app.get('/', (req, res) => {
    res.send('API Rental Kendaraan')
})

// =====================
// START SERVER
// =====================
app.listen(port, () => {
    console.log(`Server berjalan di port ${port}`)
})