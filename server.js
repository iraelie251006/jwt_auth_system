import express from 'express';

const app = express();

app.use(express.json())

app.get('/', (req, res) => {
  res.send('JWT Auth API running');
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`)
})
