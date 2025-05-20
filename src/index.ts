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

    try{
        let query = `SELECT * FROM players WHERE id='${req.params.id}'`;
        let db_response = await db.query(query);

        if(db_response.rows.length > 0){
            console.log(`Usuario encontrado: ${db_response.rows[0].id}`);
            res.json(db_response.rows[0]);   
        } else{
            console.log(`PLayer not found.`)
            res.json(`User not found`);
        }

    } catch (err){
        console.error(err);
        res.status(500).send('Internal Server Error');
    }

});


const port = process.env.PORT || 3000;

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