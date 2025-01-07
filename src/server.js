import http from "http";

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello World\n");
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

server.get('/', (req, res) => {
    console.log('Handling request to /');
    res.send('Hello World!');
})

server.get('/file', (req, res) => {
    console.log('Handling request to /file');
    fs.readFile('./data/artvis_dump_NEW-semicolon.csv', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(data);
        }
    });
});
