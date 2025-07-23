import express from 'express';
import bodyParser from 'body-parser';
import authRouter from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());

app.use('/api/auth', authRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
