import http from 'http';
import { Server } from 'socket.io';
import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedRouter from './routers/seedRouters.js';
import productRouter from './routers/productRouters.js';
import userRouter from './routers/userRoutes.js';
import orderRouter from './routers/orderRoutes.js';
import uploadRouter from './routers/uploadRoutes.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to Database.');
    })
    .catch(err => console.log(err.message));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/key/paypal', async (req, res) => {
    res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});

app.get('/api/key/google', async (req, res) => {
    res.send({ key: process.env.GOOGLE_API_KEY || '' });
});

app.use('/api/upload', uploadRouter);
app.use('/api/seed', seedRouter);
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '/frontend/build')));
app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '/frontend/build/index.html'))
);

app.use((err, req, res, next) => {
    res.status(500).send({ message: err.message });
});

const port = process.env.PORT || 5000;

const httpServer = http.Server(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
const users = [];

io.on('connection', (socket) => {
    console.log('connection', socket.id);

    socket.on('disconnect', () => {
        const user = users.find((x) => x.socketId === socket.id);

        if (user) {
            user.online = false;
            console.log('Offline', user.name);

            const admin = users.find((x) => x.isAdmin && x.online);

            if (admin) {
                io.to(admin.socketId).emit('updateUser', user);
            }
        }
    });

    socket.on('onLogin', (user) => {
        const updatedUser = {
            ...user,
            online: true,
            socketId: socket.id,
            messages: [],
        };

        const existUser = users.find((x) => x._id === updatedUser._id);

        if (existUser) {
            existUser.socketId = socket.id;
            existUser.online = true;
        } else {
            users.push(updatedUser);
        }

        console.log('Online', user.name);
        const admin = users.find((x) => x.isAdmin && x.online);

        if (admin) {
            io.to(admin.socketId).emit('updateUser', updatedUser);
        }

        if (updatedUser.isAdmin) {
            io.to(updatedUser.socketId).emit('listUsers', users);
        }
    });

    socket.on('onUserSelected', (user) => {
        const admin = users.find((x) => x.isAdmin && x.online);
        if (admin) {
            const existUser = users.find((x) => x._id === user._id);
            io.to(admin.socketId).emit('selectUser', existUser);
        }
    });

    socket.on('onMessage', (message) => {
        if (message.isAdmin) {
            const user = users.find((x) => x._id === message._id && x.online);
            if (user) {
                io.to(user.socketId).emit('message', message);
                user.messages.push(message);
            }
        } else {
            const admin = users.find((x) => x.isAdmin && x.online);
            if (admin) {
                io.to(admin.socketId).emit('message', message);
                const user = users.find((x) => x._id === message._id && x.online);
                user.messages.push(message);
            } else {
                io.to(socket.id).emit('message', {
                    name: 'Admin',
                    body: 'Sorry. I am not online right now',
                });
            }
        }
    });
});

httpServer.listen(port, () => {
    console.log(`Serve at http://localhost:${port}`);
});

// app.listen(port, () => {
//     console.log(`serve at http://localhost:${port}`);
// });