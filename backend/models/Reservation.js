const sql = require('mssql');

class Reservation {
  static async getAll() {
    const result = await sql.query`SELECT * FROM Rezerwacja ORDER BY Data_rezerwacji DESC`;
    return result.recordset;
  }

  static async getById(id) {
    const reservationResult = await sql.query`
      SELECT * FROM Rezerwacja WHERE ID_rezerwacji = ${id}
    `;
    
    if (reservationResult.recordset.length === 0) {
      return null;
    }
    
    const reservation = reservationResult.recordset[0];
    
    const itemsResult = await sql.query`
      SELECT pr.*, p.Nazwa, p.Cena
      FROM Pozycja_rezerwacji pr
      JOIN Produkt p ON pr.ID_produktu = p.ID_produktu
      WHERE pr.ID_rezerwacji = ${id}
    `;
    
    reservation.pozycje = itemsResult.recordset;
    
    return reservation;
  }

  static async create(reservationData) {
    const transaction = new sql.Transaction();
    
    try {
      await transaction.begin();
      
      const insertReservationResult = await new sql.Request(transaction).query`
        INSERT INTO Rezerwacja (ID_klienta, Termin_odbioru, Status_rezerwacji)
        VALUES (${reservationData.id_klienta}, ${reservationData.termin_odbioru}, 'Złożona')
        SELECT SCOPE_IDENTITY() AS ID_rezerwacji
      `;
      
      const reservationId = insertReservationResult.recordset[0].ID_rezerwacji;

      for (const item of reservationData.produkty) {
        await new sql.Request(transaction).query`
          INSERT INTO Pozycja_rezerwacji (ID_rezerwacji, ID_produktu, Ilosc)
          VALUES (${reservationId}, ${item.id_produktu}, ${item.ilosc})
        `;
        
        await new sql.Request(transaction).query`
          UPDATE Produkt
          SET Stan_magazynowy = Stan_magazynowy - ${item.ilosc}
          WHERE ID_produktu = ${item.id_produktu}
        `;
      }
      
      await transaction.commit();
      
      return reservationId;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = Reservation;
