"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var socket_io_1 = require("socket.io");
var http_1 = __importDefault(require("http"));
var path_1 = __importDefault(require("path"));
var app = express_1.default();
app.use(cors_1.default());
var server = http_1.default.createServer(app);
var io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
app.use(express_1.default.static(path_1.default.join(__dirname, "dist/draw_board")));
var users = [];
var emails = [];
var body_parser_1 = __importDefault(require("body-parser"));
var jsonParser = body_parser_1.default.json();
var db = __importStar(require("./db-connection"));
io.on("connection", function (socket) {
    socket.on("disconnect", function () {
        if (socket.data.username) {
            users[socket.data.room_code].delete(socket.data.username);
            if (users[socket.data.room_code].size == 0) {
                delete users[socket.data.room];
            }
            io.emit("user_list" + socket.data.room_code, Array.from(users[socket.data.room_code])); // Emitir la lista de usuarios a todos
            io.emit("user left", socket.data.username); // Avisar a todos que un usuario ha salido
        }
    });
    socket.on("join room", function (info) {
        //info = info.info
        socket.join("" + info.code);
        console.log("User " + info.user_name + " joined room " + info.code);
        console.log(info);
        socket.data.username = info.user_name;
        socket.data.room_code = info.code;
        if (!users[info.code]) {
            users[info.code] = new Set();
        }
        users[info.code].add(info.user_name);
        if (!emails[info.code]) {
            emails[info.code] = new Set();
        }
        emails[info.code].add(info.email);
        io.emit("user_list_" + info.code, Array.from(emails[info.code]));
        console.log(emails);
        socket.on("start game" + info.code, function (user_list) { return __awaiter(void 0, void 0, void 0, function () {
            var user_emails, users_data, i, query, db_response, err_1, gamedata;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
            return __generator(this, function (_0) {
                switch (_0.label) {
                    case 0:
                        console.log("Esto es info en back:" + JSON.stringify(user_list));
                        user_emails = user_list;
                        console.log("USER EMAILS:" + user_emails);
                        users_data = [];
                        i = 0;
                        _0.label = 1;
                    case 1:
                        if (!(i < user_emails.length)) return [3 /*break*/, 6];
                        _0.label = 2;
                    case 2:
                        _0.trys.push([2, 4, , 5]);
                        query = "SELECT * FROM players WHERE id='" + user_emails[i] + "'";
                        return [4 /*yield*/, db.query(query)];
                    case 3:
                        db_response = _0.sent();
                        if (db_response.rows.length > 0) {
                            console.log("Usuario encontrado: " + db_response.rows[0].id);
                            users_data.push(db_response.rows[0]);
                        }
                        else {
                            console.log("Player not found.");
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _0.sent();
                        console.error(err_1);
                        return [3 /*break*/, 5];
                    case 5:
                        i++;
                        return [3 /*break*/, 1];
                    case 6:
                        console.log("USERSDATA:" + users_data);
                        gamedata = {
                            //añadir toda la info de los players boss y turno
                            player1: {
                                name: users_data[0].name,
                                health_points: users_data[0].health_points,
                                mana_points: users_data[0].mana_points,
                                strength: users_data[0].strength,
                                magical_damage: users_data[0].magical_damage,
                                critical_chance: users_data[0].critical_chance,
                                critical_damage: users_data[0].critical_damage,
                                defense: users_data[0].defense,
                            },
                            player2: {
                                name: (_a = users_data[1]) === null || _a === void 0 ? void 0 : _a.name,
                                health_points: (_b = users_data[1]) === null || _b === void 0 ? void 0 : _b.health_points,
                                mana_points: (_c = users_data[1]) === null || _c === void 0 ? void 0 : _c.mana_points,
                                strength: (_d = users_data[1]) === null || _d === void 0 ? void 0 : _d.strength,
                                magical_damage: (_e = users_data[1]) === null || _e === void 0 ? void 0 : _e.magical_damage,
                                critical_chance: (_f = users_data[1]) === null || _f === void 0 ? void 0 : _f.critical_chance,
                                critical_damage: (_g = users_data[1]) === null || _g === void 0 ? void 0 : _g.critical_damage,
                                defense: (_h = users_data[1]) === null || _h === void 0 ? void 0 : _h.defense,
                            },
                            player3: {
                                name: (_j = users_data[2]) === null || _j === void 0 ? void 0 : _j.name,
                                health_points: (_k = users_data[2]) === null || _k === void 0 ? void 0 : _k.health_points,
                                mana_points: (_l = users_data[2]) === null || _l === void 0 ? void 0 : _l.mana_points,
                                strength: (_m = users_data[2]) === null || _m === void 0 ? void 0 : _m.strength,
                                magical_damage: (_o = users_data[2]) === null || _o === void 0 ? void 0 : _o.magical_damage,
                                critical_chance: (_p = users_data[2]) === null || _p === void 0 ? void 0 : _p.critical_chance,
                                critical_damage: (_q = users_data[2]) === null || _q === void 0 ? void 0 : _q.critical_damage,
                                defense: (_r = users_data[2]) === null || _r === void 0 ? void 0 : _r.defense,
                            },
                            player4: {
                                name: (_s = users_data[3]) === null || _s === void 0 ? void 0 : _s.name,
                                health_points: (_t = users_data[3]) === null || _t === void 0 ? void 0 : _t.health_points,
                                mana_points: (_u = users_data[3]) === null || _u === void 0 ? void 0 : _u.mana_points,
                                strength: (_v = users_data[3]) === null || _v === void 0 ? void 0 : _v.strength,
                                magical_damage: (_w = users_data[3]) === null || _w === void 0 ? void 0 : _w.magical_damage,
                                critical_chance: (_x = users_data[3]) === null || _x === void 0 ? void 0 : _x.critical_chance,
                                critical_damage: (_y = users_data[3]) === null || _y === void 0 ? void 0 : _y.critical_damage,
                                defense: (_z = users_data[3]) === null || _z === void 0 ? void 0 : _z.defense,
                            },
                            boss: {
                                health: 500,
                                damage: Math.floor(Math.random() * (100 - 40 + 1) + 40),
                            },
                            game: {
                                current_turn: 1,
                                current_player: 0,
                                game_over: false,
                                game_finished: false,
                            },
                        };
                        console.log("GAME START:" + info.code);
                        io.emit("game started" + info.code, gamedata);
                        socket.on("turn" + info.code, function (action) {
                            console.log("Turn emited", "turn" + info.code);
                            console.log(action);
                            var user_emails = user_list;
                            console.log("USER EMAILS turn:" + user_emails);
                            //gestionar game data de turno
                            if (action.damage > 0) {
                                gamedata.boss.health = gamedata.boss.health - action.damage;
                                console.log("VIDA BOSS :" + gamedata.boss.health);
                            }
                            if (action.heal > 0) {
                                gamedata.player1.health_points =
                                    gamedata.player1.health_points + action.heal;
                                gamedata.player2.health_points =
                                    gamedata.player2.health_points + action.heal;
                                gamedata.player3.health_points =
                                    gamedata.player3.health_points + action.heal;
                                gamedata.player4.health_points =
                                    gamedata.player4.health_points + action.heal;
                            }
                            if (action.defense > 0) {
                                gamedata.player1.defense = gamedata.player1.defense + action.defense;
                                gamedata.player2.defense = gamedata.player2.defense + action.defense;
                                gamedata.player3.defense = gamedata.player3.defense + action.defense;
                                gamedata.player4.defense = gamedata.player4.defense + action.defense;
                            }
                            action = {
                                name: action.name,
                                heal: 0,
                                damage: 0,
                                defense: 0,
                            };
                            //asignar turno
                            gamedata.game.current_turn++;
                            gamedata.game.current_player =
                                gamedata.game.current_turn % (user_emails.length + 1);
                            if ((gamedata.game.current_player == 0 &&
                                gamedata.player1.health_points <= 0 &&
                                user_emails.length >= gamedata.game.current_player - 1) ||
                                (gamedata.game.current_player == 1 &&
                                    gamedata.player2.health_points <= 0 &&
                                    user_emails.length >= gamedata.game.current_player - 1) ||
                                (gamedata.game.current_player == 2 &&
                                    gamedata.player3.health_points <= 0 &&
                                    user_emails.length >= gamedata.game.current_player - 1) ||
                                (gamedata.game.current_player == 3 &&
                                    gamedata.player4.health_points <= 0 &&
                                    user_emails.length >= gamedata.game.current_player - 1)) {
                                gamedata.game.current_turn++;
                                gamedata.game.current_player =
                                    gamedata.game.current_turn % (user_emails.length + 1);
                            }
                            console.log(gamedata.game);
                            if (gamedata.boss.health <= 0) {
                                gamedata.game.game_finished = true;
                                console.log("GAME FINISHED WIN DATA:" + JSON.stringify(gamedata));
                                io.emit("finished_turn" + info.code, gamedata);
                            }
                            else if (gamedata.player1.health_points <= 0 &&
                                gamedata.player2.health_points <= 0 &&
                                gamedata.player3.health_points <= 0 &&
                                gamedata.player4.health_points <= 0) {
                                gamedata.game.game_over = true;
                                gamedata.game.game_finished = true;
                                io.emit("finished_turn" + info.code, gamedata);
                            }
                            else {
                                if (gamedata.game.current_player == user_emails.length - 1) {
                                    console.log("SOLO PLAYER");
                                    gamedata.game.current_turn++;
                                    console.log("TURNO EXTRA BOSS: " + gamedata.game.current_turn);
                                    gamedata.game.current_player =
                                        gamedata.game.current_turn % (user_emails.length + 1);
                                    var boss_action = Math.floor(Math.random() * (5 - 1 + 1) + 1);
                                    console.log("Accion del boss:" + boss_action);
                                    if (boss_action > 2) {
                                        gamedata.player1.health_points =
                                            gamedata.player1.health_points -
                                                (gamedata.boss.damage - gamedata.player1.defense / 2);
                                        gamedata.player2.health_points =
                                            gamedata.player2.health_points -
                                                (gamedata.boss.damage - gamedata.player2.defense / 2);
                                        gamedata.player3.health_points =
                                            gamedata.player3.health_points -
                                                (gamedata.boss.damage - gamedata.player3.defense / 2);
                                        gamedata.player4.health_points =
                                            gamedata.player4.health_points -
                                                (gamedata.boss.damage - gamedata.player4.defense / 2);
                                        console.log("Vida de los jugadores:" + gamedata.player1.health_points);
                                    }
                                    else {
                                        gamedata.boss.health =
                                            gamedata.boss.health +
                                                Math.floor(Math.random() * (250 - 50 + 1) + 50);
                                        console.log("Vida del boss:" + gamedata.boss.health);
                                    }
                                }
                                console.log("GAMEDATA end turn:" + JSON.stringify(gamedata));
                                io.emit("finished_turn" + info.code, gamedata);
                            }
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
app.get("/player/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, db_response, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Petici\u00F3n recibida al endpoint GET /player/:id.");
                console.log("Par\u00E1metro recibido por URL: " + req.params.id);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                query = "SELECT * FROM players WHERE id='" + req.params.id + "'";
                return [4 /*yield*/, db.query(query)];
            case 2:
                db_response = _a.sent();
                if (db_response.rows.length > 0) {
                    console.log("Usuario encontrado: " + db_response.rows[0].id);
                    res.json(db_response.rows[0]);
                }
                else {
                    console.log("Player not found.");
                    res.json("Player not found");
                }
                return [3 /*break*/, 4];
            case 3:
                err_2 = _a.sent();
                console.error(err_2);
                res.status(500).send("Internal Server Error");
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post("/player", jsonParser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, db_response, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Petici\u00F3n recibida al endpoint POST /player. \n        Body: " + JSON.stringify(req.body));
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                query = "INSERT INTO players (\n        id, name, health_points, mana_points, strength, magical_damage,\n        critical_chance, critical_damage, defense, experience,\n        level, currency\n        ) VALUES \n        ( '" + req.body.id + "', '" + req.body.name + "', " + req.body.health_points + ", " + req.body.mana_points + ",\n        " + req.body.strength + ", " + req.body.magical_damage + ", " + req.body.critical_chance + ",\n        " + req.body.critical_damage + ", " + req.body.defense + ", " + req.body.experience + ",\n        " + req.body.level + ", " + req.body.currency + "\n        )";
                return [4 /*yield*/, db.query(query)];
            case 2:
                db_response = _a.sent();
                if (db_response.rowCount == 1) {
                    console.log("Player a\u00F1adido");
                    res.json("El registro ha sido creado correctamente.");
                }
                else {
                    res.json("El registro NO ha sido creado.");
                }
                return [3 /*break*/, 4];
            case 3:
                err_3 = _a.sent();
                console.error(err_3);
                res.status(500).send("Internal Server Error");
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
var port = process.env.PORT || 3000;
server.listen(port, function () {
    return console.log("App listening on PORT " + port + ".\n\n    ENDPOINTS:\n    \n     - GET /user/:email\n     - GET /products/:name\n     - GET /products/id/:id\n     - GET /products/price/:price\n     - GET /products\n     - POST /user\n     - POST\n     ");
});
