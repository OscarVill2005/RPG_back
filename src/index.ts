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

        io.emit('user_list_' + info.code, Array.from(users[info.code]));
        console.log(users)

        //console.log(socket.rooms)
    });

    /*socket.on('draw', (draw: { prev_p: any, cur_p: any, room_num: any}) => {
        console.log('Received draw data:', draw, draw.room_num);
        io.to(`${draw.room_num}`).emit('draw', {draw});
    });*/

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