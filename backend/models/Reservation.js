const sql = require('mssql');

class Reservation {
  static async getAll() {
    try {
      const result = await sql.query`
        SELECT * FROM Rezerwacja
        ORDER BY datarezerwacji DESC
      `;
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }
  
  static async getById(id) {
    try {
      // Pobierz dane rezerwacji
      const reservationResult = await sql.query`
        SELECT * FROM Rezerwacja
        WHERE rezerwacjaid = ${id}
      `;
      
      if (reservationResult.recordset.length === 0) {
        return null;
      }
      
      const reservation = reservationResult.recordset[0];
      
      // Pobierz pozycje rezerwacji
      const itemsResult = await sql.query`
        SELECT pr.*, p.nazwa, p.cena
        FROM PozycjaRezerwacji pr
        JOIN Produkt p ON pr.produktid = p.ProduktID
        WHERE pr.rezerwacjaid = ${id}
      `;
      
      reservation.pozycje = itemsResult.recordset;
      
      return reservation;
    } catch (error) {
      throw error;
    }
  }
  
  static async create(reservationData) {
    const transaction = new sql.Transaction();
    
    try {
      await transaction.begin();
      
      const { imie, nazwisko, email, telefon, dataodbioruprefereowana, uwagi, pozycje } = reservationData;
      
      // Sprawdź, czy wszystkie produkty są dostępne w wymaganej ilości
      for (const item of pozycje) {
        const productResult = await new sql.Request(transaction).query`
          SELECT stanmagazynowy FROM Produkt WHERE ProduktID = ${item.produktid}
        `;
        
        if (productResult.recordset.length === 0) {
          throw new Error(`Produkt o ID ${item.produktid} nie istnieje`);
        }
        
        const product = productResult.recordset[0];
        
        if (product.stanmagazynowy < item.ilosc) {
          throw new Error(`Niewystarczająca ilość produktu o ID ${item.produktid} na stanie`);
        }
      }
      
      // Utwórz rezerwację
      const insertReservationResult = await new sql.Request(transaction).query`
        INSERT INTO Rezerwacja (datarezerwacji, dataodbioruprefereowana, status, uwagi, imie_klienta, nazwisko_klienta, email_klienta, telefon_klienta)
        VALUES (GETDATE(), ${dataodbioruprefereowana}, 'nowa', ${uwagi}, ${imie}, ${nazwisko}, ${email}, ${telefon})
        SELECT SCOPE_IDENTITY() AS rezerwacjaid
      `;
      
      const reservationId = insertReservationResult.recordset[0].rezerwacjaid;
      
      // Dodaj pozycje rezerwacji
      let totalAmount = 0;
      
      for (const item of pozycje) {
        // Pobierz cenę produktu
        const productResult = await new sql.Request(transaction).query`
          SELECT cena FROM Produkt WHERE ProduktID = ${item.produktid}
        `;
        
        const productPrice = productResult.recordset[0].cena;
        const itemTotal = productPrice * item.ilosc;
        
        // Dodaj pozycję rezerwacji
        await new sql.Request(transaction).query`
          INSERT INTO PozycjaRezerwacji (rezerwacjaid, produktid, ilosc, cenajednostkowa)
          VALUES (${reservationId}, ${item.produktid}, ${item.ilosc}, ${productPrice})
        `;
        
        // Zaktualizuj stan magazynowy
        await new sql.Request(transaction).query`
          UPDATE Produkt
          SET stanmagazynowy = stanmagazynowy - ${item.ilosc}
          WHERE ProduktID = ${item.produktid}
        `;
        
        totalAmount += itemTotal;
      }
      
      // Zaktualizuj kwotę całkowitą rezerwacji
      await new sql.Request(transaction).query`
        UPDATE Rezerwacja
        SET kwotacalkowita = ${totalAmount}
        WHERE rezerwacjaid = ${reservationId}
      `;
      
      await transaction.commit();
      
      return reservationId;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  static async updateStatus(id, status) {
    try {
      const result = await sql.query`
        UPDATE Rezerwacja
        SET status = ${status}
        WHERE rezerwacjaid = ${id}
      `;
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw error;
    }
  }
  
  static async delete(id) {
    const transaction = new sql.Transaction();
    
    try {
      await transaction.begin();
      
      // Pobierz pozycje rezerwacji
      const itemsResult = await new sql.Request(transaction).query`
        SELECT produktid, ilosc FROM PozycjaRezerwacji WHERE rezerwacjaid = ${id}
      `;
      
      // Przywróć stany magazynowe
      for (const item of itemsResult.recordset) {
        await new sql.Request(transaction).query`
          UPDATE Produkt
          SET stanmagazynowy = stanmagazynowy + ${item.ilosc}
          WHERE ProduktID = ${item.produktid}
        `;
      }
      
      // Usuń pozycje rezerwacji
      await new sql.Request(transaction).query`
        DELETE FROM PozycjaRezerwacji WHERE rezerwacjaid = ${id}
      `;
      
      // Usuń rezerwację
      const deleteResult = await new sql.Request(transaction).query`
        DELETE FROM Rezerwacja WHERE rezerwacjaid = ${id}
      `;
      
      await transaction.commit();
      
      return deleteResult.rowsAffected[0] > 0;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = Reservation;
