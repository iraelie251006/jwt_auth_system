import express from 'express';
import connectDB from './config/db.js';
import authRouter from './routes/auth.js';
import { userRouter } from './routes/user.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(cookieParser())
app.use('/api/auth', authRouter);
app.use('/api/profile', userRouter);

connectDB()

app.get('/', (req, res) => {
  res.send('JWT Auth API running');
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`)
})
