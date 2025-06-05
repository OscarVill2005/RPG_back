import express from "express";
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(express.static(path.join(__dirname, 'dist/draw_board')));

let users: Set<unknown>[] = []
let emails: Set<unknown>[] = []

import bodyParser from 'body-parser';
const jsonParser = bodyParser.json();

import * as db from './db-connection';

io.on('connection', (socket: any) => {

    socket.on('disconnect', () => {
        if (socket.data.username) {

            users[socket.data.room_code].delete(socket.data.username)
            if (users[socket.data.room_code].size == 0) {
                delete users[socket.data.room]
            }
            io.emit('user_list' + socket.data.room_code, Array.from(users[socket.data.room_code])); // Emitir la lista de usuarios a todos
            io.emit('user left', socket.data.username); // Avisar a todos que un usuario ha salido
        }

    });

    socket.on('join room', (info: any) => {
        //info = info.info
        socket.join(`${info.code}`)
        console.log(`User ${info.user_name} joined room ${info.code}`);
        console.log(info)
        socket.data.username = info.user_name;
        socket.data.room_code = info.code

        if (!users[info.code]) {
            users[info.code] = new Set()
        }

        users[info.code].add(info.user_name)

        if (!emails[info.code]) {
            emails[info.code] = new Set()
        }

        emails[info.code].add(info.email)

        io.emit('user_list_' + info.code, Array.from(users[info.code]));
        console.log(users)

        socket.on('start game' + info.code , async (user_list: any) => {
            console.log('Esto es info en back:' + JSON.stringify(user_list))
            let user_emails = user_list;
            console.log('USER EMAILS:' + user_emails);
            let users_data = []

            for (let i = 0; i < user_emails.length; i++) {
                try {
                    let query = `SELECT * FROM players WHERE id='${user_emails[i]}'`;
                    let db_response = await db.query(query);

                    if (db_response.rows.length > 0) {
                        console.log(`Usuario encontrado: ${db_response.rows[0].id}`);
                        users_data.push(db_response.rows[0])
                    } else {
                        console.log(`Player not found.`)
                    }

                } catch (err) {
                    console.error(err);
                }
            }
            console.log('USERSDATA:' + users_data)
            let gamedata = {
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
                    name: users_data[1]?.name,
                    health_points: users_data[1]?.health_points,
                    mana_points: users_data[1]?.mana_points,
                    strength: users_data[1]?.strength,
                    magical_damage: users_data[1]?.magical_damage,
                    critical_chance: users_data[1]?.critical_chance,
                    critical_damage: users_data[1]?.critical_damage,
                    defense: users_data[1]?.defense,
                },
                player3: {
                    name: users_data[2]?.name,
                    health_points: users_data[2]?.health_points,
                    mana_points: users_data[2]?.mana_points,
                    strength: users_data[2]?.strength,
                    magical_damage: users_data[2]?.magical_damage,
                    critical_chance: users_data[2]?.critical_chance,
                    critical_damage: users_data[2]?.critical_damage,
                    defense: users_data[2]?.defense,
                },
                player4: {
                    name: users_data[3]?.name,
                    health_points: users_data[3]?.health_points,
                    mana_points: users_data[3]?.mana_points,
                    strength: users_data[3]?.strength,
                    magical_damage: users_data[3]?.magical_damage,
                    critical_chance: users_data[3]?.critical_chance,
                    critical_damage: users_data[3]?.critical_damage,
                    defense: users_data[3]?.defense,
                },
                boss: {
                    health : Math.floor(Math.random() * (900 - 400 + 1 ) + 400 ),
                    damage : Math.floor(Math.random() * (100 - 40 + 1 ) + 40 ),
                },
                game: {
                    current_turn: 1,
                    current_player: 0,
                    game_over: false,
                    game_finished : false,
                }
            }

            socket.emit('game started' + info.code, gamedata);

            socket.on('turn' + info.code, (action: any) => {
                console.log('Turn emited')
                console.log(action);
                let user_emails = user_list;
                console.log('USER EMAILS turn:' + user_emails)
                //gestionar game data de turno
                if (action.damage > 0){
                gamedata.boss.health = gamedata.boss.health - action.damage;
                console.log('VIDA BOSS :' + gamedata.boss.health);
                }
                if (action.heal > 0){
                    gamedata.player1.health_points = gamedata.player1.health_points + action.heal;
                    gamedata.player2.health_points = gamedata.player2.health_points + action.heal;
                    gamedata.player3.health_points = gamedata.player3.health_points + action.heal;
                    gamedata.player4.health_points = gamedata.player4.health_points + action.heal;
                }
                if (action.defense > 0){
                    gamedata.player1.defense = gamedata.player1.defense + action.defense;
                    gamedata.player2.defense = gamedata.player2.defense + action.defense;
                    gamedata.player3.defense = gamedata.player3.defense + action.defense;
                    gamedata.player4.defense = gamedata.player4.defense + action.defense;                    
                }
                //asignar turno
                gamedata.game.current_turn ++;
                gamedata.game.current_player = gamedata.game.current_turn % (user_emails.length + 1);
                if (gamedata.game.current_player == 0 && gamedata.player1.health_points <= 0 && user_emails.length >= gamedata.game.current_player - 1 ||
                    gamedata.game.current_player == 1 && gamedata.player2.health_points <= 0 && user_emails.length >= gamedata.game.current_player - 1 ||
                    gamedata.game.current_player == 2 && gamedata.player3.health_points <= 0 && user_emails.length >= gamedata.game.current_player - 1 ||
                    gamedata.game.current_player == 3 && gamedata.player4.health_points <= 0 && user_emails.length >= gamedata.game.current_player - 1){
                    gamedata.game.current_turn ++;
                    gamedata.game.current_player = gamedata.game.current_turn % (user_emails.length + 1);                    
                }
                console.log(gamedata.game)
                if(gamedata.boss.health <= 0){
                    gamedata.game.game_finished = true;
                    socket.emit('finished_turn' + info, gamedata)
                } else if (gamedata.player1.health_points <= 0 && gamedata.player2.health_points <= 0 && gamedata.player3.health_points <= 0 && gamedata.player4.health_points <= 0){
                    gamedata.game.game_over = true;
                    gamedata.game.game_finished = true;
                    socket.emit('finished_turn' + info, gamedata)
                } else {
                if (gamedata.game.current_player == user_emails.length - 1){
                    console.log('SOLO PLAYER')
                gamedata.game.current_turn ++;
                    console.log('TURNO EXTRA BOSS: ' + gamedata.game.current_turn);
                gamedata.game.current_player = gamedata.game.current_turn % (user_emails.length + 1);
                let boss_action = Math.floor(Math.random() * (5 - 1 + 1 ) + 1 )
                console.log('Accion del boss:' + boss_action);
                if (boss_action > 2){
                    gamedata.player1.health_points = gamedata.player1.health_points - (gamedata.boss.damage - (gamedata.player1.defense / 2));
                    gamedata.player2.health_points = gamedata.player2.health_points - (gamedata.boss.damage - (gamedata.player2.defense / 2));
                    gamedata.player3.health_points = gamedata.player3.health_points - (gamedata.boss.damage - (gamedata.player3.defense / 2));
                    gamedata.player4.health_points = gamedata.player4.health_points - (gamedata.boss.damage - (gamedata.player4.defense / 2));
                    console.log('Vida de los jugadores:' + gamedata.player1.health_points)
                } else {
                    gamedata.boss.health = gamedata.boss.health + Math.floor(Math.random() * (250 - 50 + 1 ) + 50 );
                    console.log('Vida del boss:' + gamedata.boss.health);
                }
                }
                console.log('GAMEDATA end turn:' + JSON.stringify(gamedata))
                socket.emit('finished_turn' + info, gamedata)
            }
            })

        })

    });


});

app.get('/player/:id', async (req, res) => {
    console.log(`Petición recibida al endpoint GET /player/:id.`);
    console.log(`Parámetro recibido por URL: ${req.params.id}`);

    try {
        let query = `SELECT * FROM players WHERE id='${req.params.id}'`;
        let db_response = await db.query(query);

        if (db_response.rows.length > 0) {
            console.log(`Usuario encontrado: ${db_response.rows[0].id}`);
            res.json(db_response.rows[0]);
        } else {
            console.log(`Player not found.`)
            res.json(`Player not found`);
        }

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }

});

app.post('/player', jsonParser, async (req, res) => {

    console.log(`Petición recibida al endpoint POST /player. 
        Body: ${JSON.stringify(req.body)}`);

    try {

        let query = `INSERT INTO players (
        id, name, health_points, mana_points, strength, magical_damage,
        critical_chance, critical_damage, defense, experience,
        level, currency
        ) VALUES 
        ( '${req.body.id}', '${req.body.name}', ${req.body.health_points}, ${req.body.mana_points},
        ${req.body.strength}, ${req.body.magical_damage}, ${req.body.critical_chance},
        ${req.body.critical_damage}, ${req.body.defense}, ${req.body.experience},
        ${req.body.level}, ${req.body.currency}
        )`;

        let db_response = await db.query(query);

        if (db_response.rowCount == 1) {
            console.log(`Player añadido`)
            res.json(`El registro ha sido creado correctamente.`);
        } else {
            res.json(`El registro NO ha sido creado.`);
        }

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


const port = process.env.PORT || 3000;

server.listen(port, () =>
    console.log(`App listening on PORT ${port}.

    ENDPOINTS:
    
     - GET /user/:email
     - GET /products/:name
     - GET /products/id/:id
     - GET /products/price/:price
     - GET /products
     - POST /user
     - POST
     `));