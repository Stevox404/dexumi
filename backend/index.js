const path = require('path');
const express = require('express');
const fetch = require('node-fetch');


const app = express();
/** @type {import('http').Server} */
const server = require('http').Server(app);

const port = process.env.PORT || 8000;

server.listen(port, () => {
    console.info('Server running on port:', port);
});



/**
 * Static files
 */
const BUILD_PATH = path.resolve(__dirname, '../../build');
app.use(express.static(BUILD_PATH));



app.get('/cors-proxy/*', async (req, res) => {
    if (req.method === 'OPTIONS') {
        // Pre-flight request. Reply successfully:
        res.writeHead(200, withCORS({}, req));
        res.end();
        return;
    }

    let url = req.params[0];
    if (!/^https?:\/\//.test(url)) url = `https://${url}`;

    const response = await fetch(url);
    const headers = {};
    for (let [key, val] of response.headers) {
        headers[key] = val;
    }
    delete headers['accept-ranges'];
    const corsHeaders = withCORS({
        "cache-control": headers['cache-control'],
        "connection": headers['connection'],
        "content-length": headers['content-length'],
        "content-type": headers['content-type'],
        "date": headers['date'],
        "expect-ct": headers['expect-ct'],
        "server": headers['server'],
        "strict-transport-security": headers['strict-transport-security'],
        "vary": headers['vary'],
        "via": headers['via'],
    }, req);

    res.set(corsHeaders);
    const data = await response.text()
    res.send(data);
});

/**
 * Adds CORS headers to the response headers.
 *
 * @param headers {object} Response headers
 * @param request {ServerRequest}
 */
function withCORS(headers = {}, request) {
    headers['access-control-allow-origin'] = '*';
    if (request.headers['access-control-request-method']) {
        headers['access-control-allow-methods'] = request.headers['access-control-request-method'];
        delete request.headers['access-control-request-method'];
    }
    if (request.headers['access-control-request-headers']) {
        headers['access-control-allow-headers'] = request.headers['access-control-request-headers'];
        delete request.headers['access-control-request-headers'];
    }

    headers['access-control-expose-headers'] = Object.keys(headers).join(',');

    return headers;
}

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
    res.status(503).send(err);
});

module.exports = server;