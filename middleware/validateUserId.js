// Middleware untuk memvalidasi ID pengguna
const validateUserId = async (req, res, next) => {
  const { id } = req.params;

  // Pastikan ID adalah string heksadesimal yang valid
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(404).json({ message: 'ID Pengguna tidak valid' });
  }

  // Lanjutkan ke middleware atau handler berikutnya
  next();
};

module.exports = validateUserId;
