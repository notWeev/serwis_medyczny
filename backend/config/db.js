const sql = require("mssql");

const config = {
	user: process.env.DB_USER || "MedicalShopUser",
	password: process.env.DB_PASSWORD || "SklepMedyczny111!",
	server: process.env.DB_SERVER || "localhost",
	database: process.env.DB_NAME || "SklepMedyczny",
	options: {
		encrypt: true, // dla Azure
		trustServerCertificate: true, // dla lokalnego dev
	},
};

async function connectDB() {
	try {
		await sql.connect(config);
		console.log("Połączono z bazą danych SQL Server");
	} catch (err) {
		console.error("Błąd połączenia z bazą danych:", err);
		process.exit(1);
	}
}

module.exports = {
	connectDB,
	sql,
};
