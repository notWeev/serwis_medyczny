const sql = require('mssql');

class Product {
  static async getAll() {
    const result = await sql.query`SELECT * FROM Produkt`;
    return result.recordset;
  }

  static async getById(id) {
    const result = await sql.query`SELECT * FROM Produkt WHERE ID_produktu = ${id}`;
    return result.recordset[0];
  }

  static async create(productData) {
    const result = await sql.query`
      INSERT INTO Produkt (Nazwa, Opis, ID_kategorii, Cena, Stan_magazynowy, Status_dostepnosci)
      VALUES (${productData.nazwa}, ${productData.opis}, ${productData.id_kategorii}, 
              ${productData.cena}, ${productData.stan_magazynowy}, ${productData.status_dostepnosci})
      SELECT SCOPE_IDENTITY() AS ID_produktu
    `;
    return result.recordset[0].ID_produktu;
  }

  static async update(id, productData) {
    const result = await sql.query`
      UPDATE Produkt
      SET Nazwa = ${productData.nazwa},
          Opis = ${productData.opis},
          ID_kategorii = ${productData.id_kategorii},
          Cena = ${productData.cena},
          Stan_magazynowy = ${productData.stan_magazynowy},
          Status_dostepnosci = ${productData.status_dostepnosci}
      WHERE ID_produktu = ${id}
    `;
    return result.rowsAffected[0] > 0;
  }

  static async delete(id) {
    const result = await sql.query`DELETE FROM Produkt WHERE ID_produktu = ${id}`;
    return result.rowsAffected[0] > 0;
  }
}

module.exports = Product;
