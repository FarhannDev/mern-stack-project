const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(
      `${process.env.DATABASE_URL}/${process.env.DATABASE_NAME}`
    );
  } catch (err) {
    console.error('Koneksi MongoDB gagal:', err);
  }
};

module.exports = connectDB;
