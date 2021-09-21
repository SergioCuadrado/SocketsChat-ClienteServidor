// node server.js 8000
// Libreria standard de nodejs
const { Server } = require('net');

// Protocolo que indique que se ha acabado la conexion.
const host = '0.0.0.0';
const END = 'END';

// Mapa de conexiones, almacenar todas las conexiones que se va a mapear 1 socket a 1 usuario
// 127.0.0.1:8000 => 'Sergio'
// 127.0.0.1:9000 => 'Jose'
const connections = new Map();

const error = (message) => {
  console.error(message);
  // Se pone '1' ya que se pone '0' cuando todo a salido OK, pero cuando a salido mal se pone 1.
  process.exit(1);
};

// El mensaje y de donde se ha enviado el mensaje para no enviarlo a el mismo el mensaje que se ha enviado.
const sendMessage = (message, origin) => {
  // Mandar a todos menos a origin el message.
  // Las claves son los sockets es decir los numeros '127.0.0.1:8000 => 'Sergio''
  for (const socket of connections.keys()) {
    if (socket !== origin) {
      socket.write(message);
    }
  }
};

const listen = (port) => {
  const server = new Server();
  // Cuando nos conectamos nos da un socket. Por que para poder conectarte con una maquina a traves de TCP necesitas un socket y con el socket podemos leer información y enviar información
  server.on('connection', (socket) => {
    const remoteSocket = `${socket.remoteAddress}:${socket.remotePort}`;

    console.log(`New connection from ${remoteSocket}`);
    // Para decodificar el mensaje, ya que se envia el mensaje en bits.
    socket.setEncoding('utf-8');

    socket.on('data', (message) => {
      if (!connections.has(socket)) {
        // Colocando como nombre de usuario el primer mensaje que escriba.
        console.log(`Username ${message} set for connection ${remoteSocket}`);
        // Almacenando el socket en el map para saber que usuarios estan conectados.
        connections.set(socket, message);
      } else if (message === END) {
        // Si el mensaje que envia el usuario es un END, entonces la conexion del socket se cierra.
        connections.delete(socket);
        socket.end();
      } else {
        // Saldria el usuario el que ha enviado el mensaje mas el mensaje que ha enviado => [Sergio]: hola
        const fullMessage = `[${connections.get(socket)}]: ${message}`;
        // Enviar el mensaje al resto de clientes.
        console.log(`${remoteSocket} -> ${fullMessage}`);
        sendMessage(fullMessage, socket);
      }
    });

    socket.on('error', (err) => error(err.message));

    socket.on('close', () => {
      console.log(`Connection with ${remoteSocket} closed`);
    });
  });

  // Poner el host: '0.0.0.0' para que no se mezcle con IPv4 y IPv6, asi solo nos acepta conexiones de IPv4
  server.listen({ port, host }, () => {
    console.log('Listening on port 8000');
  });

  server.on('error', (err) => error(err.message));
};

const main = () => {
  if (process.argv.length !== 3) {
    error(`Usage: node ${__filename} port`);
  }
  // Obtener el puerto de los argumentos pasados.
  let port = process.argv[2];
  if (isNaN(port)) {
    error(`Invalid port ${port}`);
  }

  port = Number(port);

  listen(port);
};

// Si este archivo es el archivo main executame esta funcion
if (require.main === module) {
  main();
}
