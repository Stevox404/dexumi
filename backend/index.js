const server = require('./src');
const port = process.env.PORT || 8000;

server.listen(port, () => {
    console.info('Server running on port:', port);
});