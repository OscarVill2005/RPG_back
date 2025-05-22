import express from "express";
import cors from 'cors';
const app = express();
app.use(cors());

import bodyParser from 'body-parser';
const jsonParser = bodyParser.json();

import * as db from './db-connection';

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


const port = process.env.PORT || 3300;

app.listen(port, () =>
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