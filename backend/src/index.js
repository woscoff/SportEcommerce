import 'dotenv/config.js'
import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import MongoStore from 'connect-mongo'
import passport from 'passport'
import nodemailer from 'nodemailer'
import { engine } from 'express-handlebars'
import { __dirname } from './path.js'
import * as path from 'path'
import router from './routes/index.routes.js'
import routerUser from './routes/users.routes.js'
import routerSession from './routes/sessions.routes.js'
import initializePassport from './config/passport.js'
import cors from 'cors'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import { readMessages, createMessage } from './services/messageServices.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { log, middlewareLogger } from './middlewares/logger.js'
import { Server as SocketServer } from 'socket.io'
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';

const whiteList = [
  "http://localhost:3000",
  "http://localhost:8080"
]
const corsOpts = {
  origin: function (origin, callback) {
    (whiteList.indexOf(origin) !== -1 || !origin)
      ? callback(null, true)
      : callback(new Error('Not allowed by CORS policy'))
  },
  credentials: true
}


const app = express()
const PORT = process.env.PORT || 8080;

app.use(cors(corsOpts))
const swaggerOpts = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: "Natufriend - API documentation",
      description: "Description of the APIRest"
    }
  },
  apis: [`${__dirname}/docs/**/*.yaml`]
}
const specs = swaggerJSDoc(swaggerOpts)
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs))



app.use(express.json())
app.use(middlewareLogger)
//app.use(cors(corsOptions))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(process.env.JWT_SECRET))
app.use(session({
    store: new MongoStore({
        mongoUrl: process.env.MONGODBURL,
        mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
        ttl: 210
    }),
    secret: '1234coder',
    resave: false,
    saveUninitialized: false,
    rolling: false
}))



initializePassport()
 app.use(passport.initialize())
app.use(passport.session()) 
//initializePassport(passport)
app.use('/user', routerSession);
//app.use('/auth', routerSession)
//app.use('/', router)
//app.use('/', express.static(__dirname + '/public'))
//app.use(errorHandler)

// app.engine('handlebars', engine());
// app.set('view engine', 'handlebars');
// app.set('views', path.resolve(__dirname, './views'))

app.set("port", process.env.PORT)

app.use('/', router)
app.use('/', express.static(__dirname + '/public'))

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'src/public/img')
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}${file.originalname}`)
//     }
// })







//const upload = multer({ storage: storage })




export const io = new Server();

export const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAILER_EMAIL,
      pass: process.env.MAILER_PASSWORD,
      authMethod: 'LOGIN'
    },
    tls: {
      rejectUnauthorized: false  
    }
  });

  app.use(errorHandler)

io.on("connection", async (socket) => {
    console.log("Chat client online");

    socket.on("message", async newMessage => {
        await createMessage([newMessage]);
        const messages = await readMessages();
        console.log(messages)
        socket.emit("allMessages", messages)
    })

    socket.on("load messages", async () => {
        const messages = await readMessages()
        console.log(messages)
        socket.emit("allMessages", messages)
    })
})

const connectToMongoDB = async () => {
  await mongoose.connect(process.env.MONGODBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .catch(error => log('error', error.message))
  log('info', `Database connected`)
}

connectToMongoDB()

/* const server = app.listen(app.get("port"), () => {
  log('info', `Server running on http://localhost:${app.get("port")}`);
}) */

app.listen(PORT, () => console.log(`Listening on ${PORT}`))

