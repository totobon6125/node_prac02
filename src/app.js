import express from 'express';
import cookieParser from 'cookie-parser';

import indexRouter from './routes/index.js';
import logMiddleware from './middlewares/log.middleware.js';
import errorHandlingMiddleware from './middlewares/error-handling.middleware.js';

const app = express();
const PORT = process.env.port;

app.use(logMiddleware); 
app.use(express.json());
app.use(cookieParser());
app.use('/api', [indexRouter]);
app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(`${PORT}포트 연결!`);
});

