const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    // Walidacja danych wejściowych
    const { imie, nazwisko, email, telefon, adres, haslo } = req.body;
    
    if (!imie || !nazwisko || !email || !haslo) {
      return res.status(400).json({ message: 'Wymagane pola: imie, nazwisko, email, haslo' });
    }
    
    // Walidacja formatu email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Niepoprawny format adresu email' });
    }
    
    // Walidacja hasła (min. 8 znaków, zawiera cyfrę i znak specjalny)
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(haslo)) {
      return res.status(400).json({ 
        message: 'Hasło musi mieć co najmniej 8 znaków i zawierać przynajmniej jedną cyfrę oraz jeden znak specjalny' 
      });
    }
    
    const userData = {
      imie,
      nazwisko,
      email,
      telefon: telefon || '',
      adres: adres || '',
      haslo
    };
    
    try {
      const userId = await User.create(userData);
      
      // Generowanie tokenu JWT
      const token = jwt.sign(
        { userId, email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.status(201).json({ 
        message: 'Rejestracja zakończona pomyślnie', 
        token,
        user: {
          id: userId,
          imie,
          nazwisko,
          email
        }
      });
    } catch (error) {
      if (error.message.includes('już istnieje')) {
        return res.status(409).json({ message: error.message });
      }
      throw error;
    }
  } catch (error) {
    res.status(500).json({ message: 'Błąd podczas rejestracji', error: error.message });
  }
};

exports.login = async (req, res) => {
    try {
      const { email, haslo } = req.body;
      
      if (!email || !haslo) {
        return res.status(400).json({ message: 'Wymagane pola: email, haslo' });
      }
      
      // Pobierz użytkownika z bazy danych
      const user = await User.getByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: 'Nieprawidłowy email lub hasło' });
      }
      
      // Sprawdź hasło
      const isPasswordValid = await User.comparePassword(haslo, user.haslo);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Nieprawidłowy email lub hasło' });
      }
      
      // Generowanie tokenu JWT
      const token = jwt.sign(
        { userId: user.klientid, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.status(200).json({
        message: 'Logowanie zakończone pomyślnie',
        token,
        user: {
          id: user.klientid,
          imie: user.imie,
          nazwisko: user.nazwisko,
          email: user.email
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Błąd podczas logowania', error: error.message });
    }
  };
  
  exports.getProfile = async (req, res) => {
    try {
      const userId = req.userData.userId;
      
      const user = await User.getById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
      }
      
      res.status(200).json({
        id: user.klientid,
        imie: user.imie,
        nazwisko: user.nazwisko,
        email: user.email,
        telefon: user.telefon,
        adres: user.adres,
        datarejestracji: user.datarejestracji
      });
    } catch (error) {
      res.status(500).json({ message: 'Błąd podczas pobierania profilu', error: error.message });
    }
  };
  
  exports.updateProfile = async (req, res) => {
    try {
      const userId = req.userData.userId;
      const { imie, nazwisko, telefon, adres } = req.body;
      
      if (!imie || !nazwisko) {
        return res.status(400).json({ message: 'Wymagane pola: imie, nazwisko' });
      }
      
      const userData = {
        imie,
        nazwisko,
        telefon: telefon || '',
        adres: adres || ''
      };
      
      const success = await User.update(userId, userData);
      
      if (success) {
        res.status(200).json({ message: 'Profil został zaktualizowany pomyślnie' });
      } else {
        res.status(404).json({ message: 'Użytkownik nie znaleziony' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Błąd podczas aktualizacji profilu', error: error.message });
    }
  };
  
  exports.changePassword = async (req, res) => {
    try {
      const userId = req.userData.userId;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Wymagane pola: currentPassword, newPassword' });
      }
      
      // Walidacja nowego hasła
      const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ 
          message: 'Nowe hasło musi mieć co najmniej 8 znaków i zawierać przynajmniej jedną cyfrę oraz jeden znak specjalny' 
        });
      }
      
      // Pobierz użytkownika z bazy danych
      const user = await User.getById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
      }
      
      // Pobierz pełne dane użytkownika z hasłem
      const userWithPassword = await User.getByEmail(user.email);
      
      // Sprawdź aktualne hasło
      const isCurrentPasswordValid = await User.comparePassword(currentPassword, userWithPassword.haslo);
      
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ message: 'Aktualne hasło jest nieprawidłowe' });
      }
      
      // Zmień hasło
      const success = await User.changePassword(userId, newPassword);
      
      if (success) {
        res.status(200).json({ message: 'Hasło zostało zmienione pomyślnie' });
      } else {
        res.status(500).json({ message: 'Nie udało się zmienić hasła' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Błąd podczas zmiany hasła', error: error.message });
    }
  };
  
