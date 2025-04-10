const sql = require('mssql');
const bcrypt = require('bcrypt');

class User {
  static async getById(id) {
    try {
      const result = await sql.query`
        SELECT klientid, imie, nazwisko, email, telefon, adres, datarejestracji
        FROM Klient
        WHERE klientid = ${id}
      `;
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  static async getByEmail(email) {
    try {
      const result = await sql.query`
        SELECT klientid, imie, nazwisko, email, telefon, adres, datarejestracji, haslo
        FROM Klient
        WHERE email = ${email}
      `;
      return result.recordset[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(userData) {
    try {
      const { imie, nazwisko, email, telefon, adres, haslo } = userData;
      
      // Sprawdź, czy użytkownik o podanym emailu już istnieje
      const existingUser = await this.getByEmail(email);
      if (existingUser) {
        throw new Error('Użytkownik o podanym adresie email już istnieje');
      }
      
      // Hashuj hasło
      const hashedPassword = await bcrypt.hash(haslo, 10);
      
      const result = await sql.query`
        INSERT INTO Klient (imie, nazwisko, email, telefon, adres, haslo, datarejestracji)
        VALUES (${imie}, ${nazwisko}, ${email}, ${telefon}, ${adres}, ${hashedPassword}, GETDATE())
        SELECT SCOPE_IDENTITY() AS klientid
      `;
      
      return result.recordset[0].klientid;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, userData) {
    try {
      const { imie, nazwisko, telefon, adres } = userData;
      
      const result = await sql.query`
        UPDATE Klient
        SET imie = ${imie},
            nazwisko = ${nazwisko},
            telefon = ${telefon},
            adres = ${adres}
        WHERE klientid = ${id}
      `;
      
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw error;
    }
  }

  static async changePassword(id, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const result = await sql.query`
        UPDATE Klient
        SET haslo = ${hashedPassword}
        WHERE klientid = ${id}
      `;
      
      return result.rowsAffected[0] > 0;
    } catch (error) {
      throw error;
    }
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
