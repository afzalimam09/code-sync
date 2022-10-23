import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import { ACTIONS } from "../Actions";
import Client from "../components/Client"
import Editor from "../components/Editor"
import { initSocket } from '../socket/socket';
import toast from 'react-hot-toast';
import EditorNav from "../components/EditorNav";

const EditorPage = () => {

    const reactNavigator = useNavigate();
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();
    const [clients, setClients] = useState([]);

    useEffect(() => {
        const init = async() => {
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });

            // Listening for joined event
            socketRef.current.on(ACTIONS.JOINED, ({clients, username, socketId}) => {
                if(username !== location.state?.username) {
                    toast.success(`${username} joined the room`);
                    console.log(`${username} joined the room`);
                }
                setClients(clients);
                socketRef.current.emit(ACTIONS.SYNC_CODE, {
                    code: codeRef.current,
                    socketId
                });
            });

            //Listening for disconnected
            socketRef.current.on(ACTIONS.DISCONNECTED, ({socketId, username}) => {
                toast.success(`${username} left the room.`);
                setClients((prev) => {
                    return prev.filter(client => client.socketId !== socketId);
                });
            });

        }
        init();
        return () => {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        };
    }, []);


    if(!location.state) {
        return <Navigate to='/'/>
    }

    const handleClick = () => {
        const element = document.getElementById('main');
        const aside = document.getElementById('aside');
        const openBtn = document.getElementById('openBtn');
        aside.style.display = 'none';
        openBtn.style.display = 'block';
        element.classList.remove('mainWrap');
    }

    const copyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success(`Room Id has been copied!`);
        } catch (error) {
            toast.error(`Could not copy the Room Id!`);
            console.log(error);
        }
    }

    const leaveRoom = () => {
        reactNavigator('/');
    }

  return (
    <div id="main" className="mainWrap">

        <div id="aside" className="aside">
            <button className="closeBtn" onClick={handleClick}><i className="bi bi-x"></i></button>
            <div className="asideInner">
                <div className="logo">
                    <img className="logoImage" src="/code-sync.png" alt="logo" />
                </div>
                <h3>Connected</h3>
                <div className="clientsList">
                    {clients.map((client) => (
                        <Client key={client.socketId} username={client.username}/>
                    ))}
                </div>
            </div>

            <button className="btn copyBtn" onClick={copyRoomId}>Copy ROOM ID</button>
            <button className="btn leaveBtn" onClick={leaveRoom}>Leave</button>
        </div>

        <div className="editorWrap">
            <EditorNav/>
            <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code) => {codeRef.current = code}} />
        </div>
    </div>
  )
}

export default EditorPage