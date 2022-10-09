const path = require('path');
const express = require('express');


const app = express();
/** @type {import('http').Server} */
const server = require('http').Server(app);



/**
 * Static files
 */
const BUILD_PATH = path.resolve(__dirname, '../../build');
app.use(express.static(BUILD_PATH));



/**
 * Default Handler
 */
app.get('*', (_req, res) => {
    res.sendFile(`${BUILD_PATH}/index.html`, err => {
        if (err) {
            console.error("Error loading index html file: ", err);
            res.sendStatus(500);
        }
    });
});


app.all('*', (req, res) => {
    throw new Error({
        status: 501,
        text: "Not Implemented",
    });
});



/**
 * Error Handler
 */
app.use((err, req, res, next) => {    
    if (res.headersSent) {
        return next(err);
    }

    err.status = err.status || 500;
    if (err.text) {
        res.status(err.status).send(err.text);
    } else {
        res.sendStatus(err.status);
    }
});

module.exports = server;