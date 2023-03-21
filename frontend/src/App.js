import {useEffect, useState, createContext} from 'react';
import {BrowserRouter, Routes, Route, useNavigate, Navigation} from 'react-router-dom';
import {Redirect} from 'react-router';
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
import './App.css';
import CameraGame from './games/CameraGame';
import NotFoundPage from './pages/NotFoundPage';
import DataManager from './dataManager';
import PopText from './components/PopText';
import FirstMultiGame from './multi_games/FirstMultiGame';
import {socket} from './socket';

function App()
{
    // const [nextNavigate, setNextNavigate] = useState(null);
    // console.log("BLAH");

    

    // useEffect(() =>
    // {
    //     if(nextNavigate == null)
    //         return;

    //     navigate(nextNavigate);
    //     setNextNavigate(null);
    // }, [nextNavigate]);


    function load()
    {
        console.log("SJHdj");
        //const navigate = useNavigate();
        socket.on("send_to_game", (args) =>
        {
            console.log("SDHDh");
            //DataManager.navigate("/multiplayer/game-" + args.gameName);

            //setNextNavigate("/multiplayer/game-" + args.gameName);
        });  
    }
    

    

    return (
        <div className="App">
            <PopText ref={DataManager.popTextRef}></PopText>
            <BrowserRouter>
                <Routes onLoad={load}>
                    <Route index element={<GameListPage/>}></Route>
                    <Route path="/multiplayer" element={<MultiGameListPage/>}></Route>
                    <Route path="/social" element={<SocialPage/>}></Route>
                    <Route path="/settings" element={<SettingsPage/>}></Route>

                    <Route path="/login" element={<LoginPage></LoginPage>}></Route>
                    <Route path="/sign_up" element={<SignUpPage></SignUpPage>}></Route>

                    <Route path="/game-first" element={<><GamePage/><FirstGame/></>}></Route>
                    <Route path="/game-sling" element={<><GamePage/><SlingGame/></>}></Route>
                    <Route path="/game-camera" element={<><GamePage/><CameraGame/></>}></Route>

                    <Route path="/multiplayer/game-first" element={<><GamePage/><FirstMultiGame/></>}></Route>

                    <Route path="/color-palette" element={<ColorPalettePage></ColorPalettePage>}></Route>

                    <Route path="*" element={<NotFoundPage/>}></Route>

                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
