import express from 'express';
import connectDB from './config/db.js';
import authRouter from './routes/auth.js';

const app = express();

app.use(express.json());
app.use('/api/auth', authRouter);

connectDB()

app.get('/', (req, res) => {
  res.send('JWT Auth API running');
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`)
})
