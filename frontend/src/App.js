import React, {useState, useEffect, createRef, useRef} from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {redirect} from 'react-router-dom';
import SentGameInviteForm from "./components/forms/SentGameInviteForm";
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/nav/SettingsPage';
import GameListPage from './pages/nav/GameListPage';
import MultiGameListPage from './pages/nav/MultiGameListPage';
import ColorPalettePage from './pages/ColorPalettePage';
import GamePage from './pages/GamePage';
import FirstGame from './games/FirstGame';
import SlingGame from './games/SlingGame';
import SocialPage from './pages/nav/SocialPage';
import CameraGame from './games/CameraGame';
import NotFoundPage from './pages/NotFoundPage';
import DataManager from './dataManager';
import PopText from './components/PopText';
import FirstMultiGame from './multi_games/FirstMultiGame';
import {socket} from './socket';
import Cookies from 'js-cookie';
import MainContent from './components/MainContent';
import './App.css';
import TicTacToeMultiGame from './multi_games/TicTacToeMultiGame';

function App()
{
    const [gameInvites, setGameInvites] = useState([]);
    const sentGameInviteRef = useRef(null);

    let ranStart = false;

    useEffect(() =>
    {
        if(ranStart)
            return;

        socket.on("game_invite_sent", function(data)
        {
            console.log(data);
            console.log(sentGameInviteRef);
            setGameInvites(gameInvites.concat([[data.gameUrl, data.fromUser]]));
            sentGameInviteRef.current.show(data.gameUrl, data.fromUser);
        });

        socket.on("game_invite_canceled", function(data)
        {
            console.log(data);
            removeGameInvite(data.gameUrl, data.username);
            sentGameInviteRef.current.hide();
        });

        ranStart = true;
    }, []);

    function removeGameInvite(gameUrl, username)
    {
        setGameInvites(gameInvites.filter(invite => (invite[0] != gameUrl && invite[1] != username)));
    }

    function acceptGameInvite(gameUrl, username)
    {
        removeGameInvite(gameUrl, username);

        socket.emit("accept_game_invite", {gameUrl: gameUrl, fromUser: username, token: Cookies.get("token")}, function(data)
        {
            Cookies.set("gameID", data.gameID);
        });

        return redirect("/login");
    }

    function declineGameInvite(gameUrl, username)
    {
        removeGameInvite(gameUrl, username);

        socket.emit("decline_game_invite", {gameUrl: gameUrl, fromUser: username, token: Cookies.get("token")});
    }

    return (
        <div className="App">
            <PopText ref={DataManager.popTextRef}></PopText>
            <BrowserRouter>
                <SentGameInviteForm ref={sentGameInviteRef} accept={acceptGameInvite} decline={declineGameInvite}></SentGameInviteForm>
                <Routes>
                    <Route index element={<GameListPage/>}></Route>
                    <Route path="/multiplayer" element={<MultiGameListPage/>}></Route>
                    <Route path="/social" element={<SocialPage gameInvites={gameInvites} removeGameInvite={removeGameInvite}/>}></Route>
                    <Route path="/settings" element={<SettingsPage/>}></Route>

                    <Route path="/login" element={<LoginPage></LoginPage>}></Route>
                    <Route path="/sign_up" element={<SignUpPage></SignUpPage>}></Route>

                    <Route path="/game-first" element={<><GamePage/><FirstGame/></>}></Route>
                    <Route path="/game-sling" element={<><GamePage/><SlingGame/></>}></Route>
                    <Route path="/game-camera" element={<><GamePage/><CameraGame/></>}></Route>

                    <Route path="/multiplayer/game-first" element={<><GamePage/><FirstMultiGame/></>}></Route>
                    <Route path="/multiplayer/game-tic_tac_toe" element={<><GamePage/><TicTacToeMultiGame/></>}></Route>

                    <Route path="/color-palette" element={<ColorPalettePage></ColorPalettePage>}></Route>

                    <Route path="*" element={<NotFoundPage/>}></Route>

                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
