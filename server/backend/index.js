import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan'

//Routes
import CodeSampleRouter from './routes/codesample.js'
import CLientInputRouter from './routes/clientinput.js'

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'))
dotenv.config();
const PORT = process.env.PORT || 5000;


app.use('/test', CodeSampleRouter);
app.use('/submit', CLientInputRouter);


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
