"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const route = express.Router();
const AuthService = require('./services/auth');
route.get('/', AuthService.login);
//# sourceMappingURL=routes.js.map