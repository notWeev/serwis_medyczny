const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // Sprawdź, czy nagłówek Authorization jest obecny
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Brak tokenu autoryzacyjnego' });
    }

    // Pobierz token z nagłówka
    const token = req.headers.authorization.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Brak tokenu autoryzacyjnego' });
    }
    
    // Zweryfikuj token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Sprawdź, czy użytkownik nadal istnieje
    const user = await User.getById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Użytkownik nie istnieje' });
    }
    
    // Dodaj dane użytkownika do obiektu żądania
    req.userData = {
      userId: decoded.userId,
      email: decoded.email,
      isAdmin: decoded.isAdmin || false // Domyślnie użytkownik nie jest administratorem
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token wygasł' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Nieprawidłowy token' });
    }
    return res.status(401).json({ message: 'Autoryzacja nieudana' });
  }
};
