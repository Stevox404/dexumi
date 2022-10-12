const server = require('./backend/index');
var pjson = require('./package.json');

const PROXY_PORT = pjson.PROXY_PORT;

window.addEventListener("DOMContentLoaded", () => {
    server.listen(PROXY_PORT, () => {
        console.info('Server running on port:', PROXY_PORT);
    });
});