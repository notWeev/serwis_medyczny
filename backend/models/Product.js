const sql = require('mssql');

class Product {
  static async getAll() {
    try {
      const result = await sql.query`SELECT * FROM Produkt`;
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }
  
  static async getById(id) {
    try {
      const result = await sql.query`SELECT * FROM Produkt WHERE ID_Produktu = ${id}`;
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }
  
  static async create(productData) {
    try {
      const { nazwa, opis, kategoriaid, cena, stanmagazynowy, statusdostepnosci } = productData;
      const result = await sql.query`
        INSERT INTO Produkt (nazwa, opis, kategoriaid, cena, stanmagazynowy, statusdostepnosci, datadodania)
        VALUES (${nazwa}, ${opis}, ${kategoriaid}, ${cena}, ${stanmagazynowy}, ${statusdostepnosci}, GETDATE())
        SELECT SCOPE_IDENTITY() AS ID_Produktu
      `;
      return result.recordset[0].ProductID;
    } catch (error) {
      throw error;
    }
  }
  
  static async update(id, productData) {
    try {
      const { nazwa, opis, kategoriaid, cena, stanmagazynowy, statusdostepnosci } = productData;
      const result = await sql.query`
        UPDATE Produkt
        SET nazwa = ${nazwa},
            opis = ${opis},
            kategoriaid = ${kategoriaid},
            cena = ${cena},
            stanmagazynowy = ${stanmagazynowy},
            statusdostepnosci = ${statusdostepnosci}
        WHERE ID_Produktu = ${id}
      `;
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw error;
    }
  }
  
  static async delete(id) {
    try {
      const checkReservations = await sql.query`
        SELECT COUNT(*) AS count FROM PozycjaRezerwacji WHERE ID_Produktu = ${id}
      `;
      
      if (checkReservations.recordset[0].count > 0) {
        throw new Error('Nie można usunąć produktu, który jest powiązany z rezerwacjami');
      }
      
      const result = await sql.query`DELETE FROM Produkt WHERE ID_Produktu = ${id}`;
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getByCategory(categoryId) {
    try {
      const result = await sql.query`
        SELECT * FROM Produkt 
        WHERE kategoriaid = ${categoryId}
      `;
      return result.recordset;
    } catch (error) {
      throw error;
    }
  }

  static async updateStock(id, quantity) {
    try {
      const result = await sql.query`
        UPDATE Produkt
        SET stanmagazynowy = stanmagazynowy - ${quantity}
        WHERE ID_Produktu = ${id} AND stanmagazynowy >= ${quantity}
      `;
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Product;
