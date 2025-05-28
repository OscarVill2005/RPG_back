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
        origin: '*',
        methods: ['GET', 'POST']
    }
});
app.use(express_1.default.static(path_1.default.join(__dirname, 'dist/draw_board')));
var users = [];
var body_parser_1 = __importDefault(require("body-parser"));
var jsonParser = body_parser_1.default.json();
var db = __importStar(require("./db-connection"));
io.on('connection', function (socket) {
    socket.on('disconnect', function () {
        if (socket.data.username) {
            users[socket.data.room_code].delete(socket.data.username);
            if (users[socket.data.room_code].size == 0) {
                delete users[socket.data.room];
            }
            io.emit('user_list' + socket.data.room_code, Array.from(users[socket.data.room_code])); // Emitir la lista de usuarios a todos
            io.emit('user left', socket.data.username); // Avisar a todos que un usuario ha salido
        }
    });
    socket.on('join room', function (info) {
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
        io.emit('user_list_' + info.code, Array.from(users[info.code]));
        console.log(users);
        //console.log(socket.rooms)
    });
    /*socket.on('draw', (draw: { prev_p: any, cur_p: any, room_num: any}) => {
        console.log('Received draw data:', draw, draw.room_num);
        io.to(`${draw.room_num}`).emit('draw', {draw});
    });*/
});
app.get('/player/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, db_response, err_1;
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
                err_1 = _a.sent();
                console.error(err_1);
                res.status(500).send('Internal Server Error');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.post('/player', jsonParser, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, db_response, err_2;
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
                err_2 = _a.sent();
                console.error(err_2);
                res.status(500).send('Internal Server Error');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
var port = process.env.PORT || 3000;
app.listen(port, function () {
    return console.log("App listening on PORT " + port + ".\n\n    ENDPOINTS:\n    \n     - GET /user/:email\n     - GET /products/:name\n     - GET /products/id/:id\n     - GET /products/price/:price\n     - GET /products\n     - POST /user\n     - POST\n     ");
});
