const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./config/db");

// Importuj routery
const productRoutes = require('./routes/products');
const categoryRoutes = require("./routes/categories");
const reservationRoutes = require("./routes/reservations");

const app = express();
const port = process.env.PORT || 3001;

// Połącz z bazą danych
connectDB();

// Middleware
app.use(
	cors({
		origin: process.env.FRONTEND_URL || "http://localhost:3000",
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
		allowedHeaders: ["Content-Type", "Authorization", "Admin-Key"],
	})
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Podstawowa trasa
app.get("/", (req, res) => {
	res.json({ message: "Witaj w API sklepu medycznego!" });
});

// Użyj routerów
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reservations", reservationRoutes);

// Obsługa błędów
app.use((req, res, next) => {
	res.status(404).json({ message: "Nie znaleziono zasobu" });
});

app.use((err, req, res, next) => {
	console.error(err.stack);
	res
		.status(500)
		.json({
			message: "Wystąpił błąd serwera",
			error: process.env.NODE_ENV === "development" ? err.message : undefined,
		});
});

// Uruchomienie serwera
app.listen(port, () => {
	console.log(`Serwer działa na porcie ${port}`);
});

module.exports = app;
