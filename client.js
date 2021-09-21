// node client.js localhost 8000
const { Socket } = require('net');
// Para que pueda leer lo que pongas en consola.
// Input: process.stdin es la consola y stdout tambien es la consola.
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

const END = 'END';
const ERR = "ERR: you can't right now.";

const error = (message) => {
  console.error(message);
  // Se pone '1' ya que se pone '0' cuando todo a salido OK, pero cuando a salido mal se pone 1.
  process.exit(1);
};

const connect = (host, port) => {
  console.log(`Connecting to ${host}:${port}`);

  const socket = new Socket();
  // Conectarte al host localhost con el puerto que quieres, en este caso es el 8000 que es el que esta puesto en el server.js
  socket.connect({ host, port });
  // Para escribir en el socket (Envias bits, los mensajes serian asi '<Buffer 48 6f 6c 61>')
  socket.setEncoding('utf-8');

  socket.on('connect', () => {
    console.log('Connected');
    // Preguntarle al usuario el nombre que quiere.
    readline.question('Choose your username: ', (username) => {
      socket.write(username);
      console.log(`Type any message to send it, type ${END} to finish.`);
    });
    // Cuando el usuario escriba una linea en la consola y se enviara el socket con la informacion que ha escrito el usuario en la consola.
    readline.on('line', (message) => {
      socket.write(message);
      if (message === END) {
        // Si el cliente escribe END entonces se le cerrara la conexion con el server y la consola.
        socket.end();
        console.log('Disconnected');
      }
    });

    socket.on('data', (data) => {
      if (data === ERR) {
        socket.end();
      }
      // Estamos trayendo la informacion que nos ha enviado el servidor que en este caso es lo que hemos escrito a nosotros mismos.
      console.log(data);
    });
  });

  // Si se tiene algun error que lo muestre en la consola y se cierre.
  socket.on('error', (err) => error(err.message));

  // Cuando el servidor nos confirme la finalizacion entonces cerramos el programa. Ya que si lo poniamos dentro del message === END lo que pasaba es que salia un error ya que el cliente se cerraba antes del que el servidor lo supiese. Ya que con windows destruye los sockets cuando matas un programa y petaba.
  socket.on('close', () => process.exit(0));
};

// Pillar el host que se unir el cliente como el puerto de ese host.
const main = () => {
  if (process.argv.length !== 4) {
    error(`Usage: node ${__filename} host port`);
  }

  let [, , host, port] = process.argv;
  if (isNaN(port)) {
    error(`Invalid port ${port}`);
  }
  port = Number(port);

  connect(host, port);
};

// Significa que no me han importado
if (module === require.main) {
  main();
}
