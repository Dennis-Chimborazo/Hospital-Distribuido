import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors({
    origin: 'http://localhost:3000', // o el dominio de tu frontend
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

export default app;


