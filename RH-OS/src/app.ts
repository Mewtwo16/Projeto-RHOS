import express from 'express';
import path from 'path';
import session from 'express-session';

const app = express();

app.set(`view engine`, `react`);
app.set(`views`, path.join(__dirname, `../app/views`));

app.use(session({
    secret: `some_secret_key`,
    resave: false,
    saveUninitialized: true
}))

const authService = require(`./services/authService`);
