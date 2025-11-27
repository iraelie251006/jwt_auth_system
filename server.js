import express from 'express';
import connectDB from './config/db.js';

const app = express();

app.use(express.json())

connectDB()

app.get('/', (req, res) => {
  res.send('JWT Auth API running');
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`)
})
