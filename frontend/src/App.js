import React, {useState, useEffect, useRef, createRef} from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {redirect} from 'react-router-dom';
import SentGameInviteForm from "./components/forms/SentGameInviteForm";
import GameOverForm from "./components/forms/GameOverForm";
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
import RacingGame from './games/racingGame/RacingGame';
import SpeedyPizzaGame from './games/speedy_pizza/SpeedyPizzaGame';
import NotFoundPage from './pages/NotFoundPage';
import DataManager from './dataManager';
import PopText from './components/PopText';
import FirstMultiGame from './multi_games/FirstMultiGame';
import {socket} from './socket';
import './App.css';
import Cookies from 'js-cookie';
import TicTacToeMultiGame from './multi_games/TicTacToe/TicTacToeMultiGame';
import { sendPOST, sendAsyncPOST } from './tools';
import MultiGamePage from './pages/MultiGamePage';
import NavBar from './components/NavBar';
import PrintablesPage from './pages/PrintablesPage';
import LinkNumbersPrintable from './pages/printables/LinkNumbersPrintable';

function App()
{
    const [gameInvites, setGameInvites] = useState([]);
    const sentGameInviteRef = useRef(null);
    const [reloader, setReloader] = useState(false);

    let ranStart = false;

    useEffect(() =>
    {
        if(ranStart)
            return;

        console.log("AFTER");

        socket.on("game_invite_sent", function(data)
        {
            setGameInvites(gameInvites.concat([[data.gameUrl, data.fromUser]]));
            sentGameInviteRef.current.show(data.gameUrl, data.fromUser);
        });

        socket.on("game_invite_canceled", function(data)
        {
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

        socket.emit("accept_game_invite", {gameUrl: gameUrl, fromUser: username, token: DataManager.token}, function(data)
        {
            if(data[1] != 0)
                DataManager.popTextRef.current.show("Failed to create game");
        });

        //return redirect("/login");
    }

    function declineGameInvite(gameUrl, username)
    {
        removeGameInvite(gameUrl, username);

        socket.emit("decline_game_invite", {gameUrl: gameUrl, fromUser: username, token: DataManager.token});
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

                    <Route path="/sign_up" element={<SignUpPage></SignUpPage>}></Route>

                    <Route path="/game-first" element={<><GamePage/><FirstGame/></>}></Route>
                    <Route path="/game-sling" element={<><GamePage/><SlingGame/></>}></Route>
                    <Route path="/game-camera" element={<><GamePage/><CameraGame/></>}></Route>
                    <Route path="/game-racing" element={<><GamePage/><RacingGame/></>}></Route>
                    <Route path="/game-speedy_pizza" element={<><GamePage/><SpeedyPizzaGame/></>}></Route>

                    <Route path="/multiplayer/game-first" element={<><MultiGamePage/><FirstMultiGame/></>}></Route>
                    <Route path="/multiplayer/game-tic_tac_toe" element={<TicTacToeMultiGame/>}></Route>

                    <Route path="/color-palette" element={<ColorPalettePage/>}></Route>
                    <Route path="/printables" element={<PrintablesPage/>}></Route>
                    <Route path="/printables/link-numbers" element={<LinkNumbersPrintable/>}></Route>

                    <Route path="*" element={<NotFoundPage/>}></Route>

                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
