// server.mjs
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
// import moment from 'moment-timezone'
import cors from 'cors'; // Importa el paquete 'cors'

import dotenv from 'dotenv'
dotenv.config()


// moment.locale('es')
// moment.tz.setDefault("America/Argentina/Buenos_Aires");

// console.log('utcOffset', moment().utcOffset())
// console.log('tz', moment().tz())
// console.log('now', moment().add(0, 'hour').format("YYYY-MM-DD H:mm"))

const app = express();

// Conectar a la base de datos MongoDB
// mongoose.connect('mongodb://localhost:27017/nombre_de_tu_base_de_datos', { useNewUrlParser: true, useUnifiedTopology: true });

// const url = process.env.MONGO
// const url = 'mongodb://192.168.0.3:27017/mensajes_sms'
const url = 'mongodb://127.0.0.1:27017/mensajes_sms'
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const db = mongoose.connection;
db.on('error', (err) => {
  console.error('FAILED TO CONNECT TO MONGODB');
  console.error(err);
});
db.once('open', () => {
  console.log('CONNECTED TO MONGODB');
//   app.listen(80);
});

mongoose.connect(`${url}?authSource=admin`, options);

// Definir el modelo para tu tabla
const Schema = mongoose.Schema;
const mensajeSchema = new Schema({
  fecha: { type: Date },
  enviado: { type: String },
  intentos: { type: Number },
  numero: { type: String },
  mensaje: { type: String },
}, {
  timestamps: true, // Agrega campos created_at y updated_at automáticamente
  collection: 'mensajes_sb', // Nombre de la colección
});

const Mensaje = mongoose.model('Mensaje', mensajeSchema);

// https://mongoosejs.com/docs/change-streams.html
// Mensaje.watch('mensajes_sb', (change) => {
//     // Haz algo con los usuarios actualizados
//     console.log('Cambio detectado:', change);
// });

// Mensaje.on('change', (change) => {
//     console.log('Cambio detectado:', change);

//     // Puedes agregar lógica para manejar los cambios aquí

//     // Por ejemplo, puedes realizar una solicitud POST a un servicio externo utilizando Axios
//   });

// Mensaje.watch().
//   on('change', data => console.log(data));
app.use(cors());
// app.use(cors({
//   origin: 'http://127.0.0.1:5500', // O especifica el dominio que deseas permitir
// }));

// Middleware para analizar datos JSON
app.use(bodyParser.json());

// Ruta para crear un mensaje
app.post('/mensajes', async (req, res) => {
  try {
    // Establecer un valor predeterminado para la fecha si no se proporciona
    if (!req.body.fecha) {
      req.body.fecha = new Date();
    }

    const mensaje = new Mensaje(req.body);
    await mensaje.save();
    res.status(201).json(mensaje);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el mensaje' });
  }
});

// Ruta para obtener todos los mensajes
app.get('/mensajes', async (req, res) => {
  try {
    const mensajes = await Mensaje.find();
    res.json(mensajes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los mensajes' });
  }
});

// Ruta para obtener un mensaje por ID
app.get('/mensajes/:id', async (req, res) => {
  try {
    const mensaje = await Mensaje.findById(req.params.id);
    if (!mensaje) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }
    res.json(mensaje);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el mensaje' });
  }
});

// Ruta para actualizar un mensaje por ID
app.put('/mensajes/:id', async (req, res) => {
  try {
    const mensaje = await Mensaje.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!mensaje) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }
    res.json(mensaje);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el mensaje' });
  }
});

// Ruta para eliminar un mensaje por ID
app.delete('/mensajes/:id', async (req, res) => {
  try {
    const mensaje = await Mensaje.findByIdAndRemove(req.params.id);
    if (!mensaje) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }
    res.json({ message: 'Mensaje eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el mensaje' });
  }
});

// Iniciar el servidor
const PORT = 3058
app.listen(PORT)
console.log('api is ready in port ', PORT)

