const express = require('express');
const handlebars = require('express-handlebars');
const app = express();
const path = require("path");
const socketIo = require('socket.io');
const http = require('http');
const mongoose = require('mongoose');

// 1. Conectar a MongoDB
mongoose.connect('mongodb+srv://alanalbertoriva_db_user:l0yVX829VkEDwppM@cluster0.pimrehu.mongodb.net/entregafinalbe1?retryWrites=true&w=majority')
.then(() => {
    console.log('Conectado a MongoDB');
})
.catch(err => {
    console.error('Error al conectar a MongoDB', err);
});

const server = http.createServer(app); // 3. Crear servidor HTTP
const io = socketIo(server); // 4. Integrar Socket.io con el servidor HTTP
app.set('socketio', io);

// Handlebars setup
app.engine('handlebars', handlebars.engine({
  runtimeOptions: {
      //* para acceder a datos obj. anidados
      allowProtoPropertiesByDefault: true,
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.redirect('/api/products');
});

const viewRouter = require('./routes/viewRouter');

app.use(express.json());
app.use('/api', viewRouter);

const PORT = 8080;

app.use(express.static(path.join(__dirname, "public")));

// 6. Manejar conexiones de Socket.io
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');
// Manejar mensajes del cliente
    socket.on('message', (data) => {
        console.log(`Mensaje recibido: ${data}`);
// Enviar el mensaje a todos los clientes conectados (incluido el remitente)
        io.emit('message', `Servidor recibió: ${data}`);
    });
    // Manejar desconexiones
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

// 7. Iniciar el servidor
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
