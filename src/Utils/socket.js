import io from 'socket.io-client';


/**@type {SocketIOClient.Socket} */
let socket;
export async function connectSocket(){
    if(!socket){
        socket = io();
        return new Promise((resolve) => {
            socket.on('connect', () => {
                console.log('Connected.', window.location.origin);
                resolve(socket);
            });
        })
    }
    return socket;
}