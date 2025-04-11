module.exports = (req, res, next) => {
  const adminKey = req.headers['admin-key'];
  
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ message: 'Brak uprawnień administratora' });
  }
  
  next();
};
