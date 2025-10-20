"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const path = require('path');
const app = express();
const routes = require('./routes');
const jwt = require('jsonwebtoken');
const port = 4040;
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'app', 'views'));
app.listen(port, () => {
    console.log('Servidor online');
});
app.use(routes);
//# sourceMappingURL=app.js.map