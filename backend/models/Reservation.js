const sql = require("mssql");

class Reservation {
	static async getAll() {
		const result =
			await sql.query`SELECT * FROM Rezerwacja ORDER BY Data_rezerwacji DESC`;
		return result.recordset;
	}

	static async getById(id) {
		try {
		  const reservationResult = await sql.query`
			SELECT 
			  r.ID_rezerwacji,
			  r.Data_rezerwacji,
			  r.Termin_odbioru,
			  r.Status_rezerwacji,
			  k.Imie,
			  k.Nazwisko,
			  k.Email,
			  k.Telefon
			FROM Rezerwacja r
			JOIN Klient k ON r.ID_klienta = k.ID_klienta
			WHERE r.ID_rezerwacji = ${id}
		  `;
		  
		  if (reservationResult.recordset.length === 0) return null;
	  
		  const reservation = reservationResult.recordset[0];
	  
		  const itemsResult = await sql.query`
			SELECT 
			  pr.ID_produktu,
			  p.Nazwa,
			  pr.Ilosc,
			  p.Cena
			FROM Pozycja_rezerwacji pr
			JOIN Produkt p ON pr.ID_produktu = p.ID_produktu
			WHERE pr.ID_rezerwacji = ${id}
		  `;
		  
		  reservation.Pozycje = itemsResult.recordset;
	  
		  return reservation;
		} catch (error) {
		  throw new Error(`Błąd pobierania rezerwacji: ${error.message}`);
		}
	  }
	  

	static async create(reservationData) {
		const transaction = new sql.Transaction();

		try {
			await transaction.begin();

			// 1. Utwórz klienta
			const clientResult = await new sql.Request(transaction)
				.input("imie", sql.NVarChar, reservationData.imie)
				.input("nazwisko", sql.NVarChar, reservationData.nazwisko)
				.input("email", sql.NVarChar, reservationData.email)
				.input("telefon", sql.NVarChar, reservationData.telefon).query`
          INSERT INTO Klient (Imie, Nazwisko, Email, Telefon)
          OUTPUT INSERTED.ID_klienta
          VALUES (@imie, @nazwisko, @email, @telefon)
        `;

			const clientId = clientResult.recordset[0].ID_klienta;

			// 2. Utwórz rezerwację
			const reservationResult = await new sql.Request(transaction)
				.input("clientId", sql.Int, clientId)
				.input("termin_odbioru", sql.DateTime, reservationData.termin_odbioru)
				.query`
          INSERT INTO Rezerwacja (ID_klienta, Termin_odbioru)
          OUTPUT INSERTED.ID_rezerwacji
          VALUES (@clientId, @termin_odbioru)
        `;

			const reservationId = reservationResult.recordset[0].ID_rezerwacji;

			// 3. Dodaj pozycje rezerwacji
			for (const produkt of reservationData.produkty) {
				await new sql.Request(transaction)
					.input("reservationId", sql.Int, reservationId)
					.input("productId", sql.Int, produkt.ID_produktu)
					.input("ilosc", sql.Int, produkt.Ilosc).query`
            INSERT INTO Pozycja_rezerwacji (ID_rezerwacji, ID_produktu, Ilosc)
            VALUES (@reservationId, @productId, @ilosc)
          `;

				// Aktualizuj stan magazynowy
				await new sql.Request(transaction)
					.input("productId", sql.Int, produkt.ID_produktu)
					.input("ilosc", sql.Int, produkt.Ilosc).query`
            UPDATE Produkt
            SET Stan_magazynowy = Stan_magazynowy - @ilosc
            WHERE ID_produktu = @productId
          `;
			}

			await transaction.commit();
			return reservationId;
		} catch (error) {
			await transaction.rollback();
			throw new Error(`Błąd transakcji: ${error.message}`);
		}
	}
}

module.exports = Reservation;
