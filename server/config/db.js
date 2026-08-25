import mongoose from 'mongoose';

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nofoodwaste';
  const fallbackUri = 'mongodb://127.0.0.1:27017/nofoodwaste';

  try {
    console.log(`[MongoDB] Connecting to database...`);
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (primaryError) {
    console.error(`[MongoDB Connection Warning] Primary URI failed (${primaryError.message}). Trying local fallback...`);

    // If primary URI is different from fallback, try fallback to local MongoDB instance
    if (primaryUri !== fallbackUri) {
      try {
        const fallbackConn = await mongoose.connect(fallbackUri, {
          serverSelectionTimeoutMS: 5000
        });
        console.log(`[MongoDB] Fallback Connected successfully: ${fallbackConn.connection.host}`);
        return;
      } catch (fallbackError) {
        console.error(`[MongoDB Connection Error] Local fallback also failed: ${fallbackError.message}`);
      }
    }
  }
};

export default connectDB;
