import {useEffect, useState} from 'react';
import {BrowserRouter, Routes, Route, useLocation} from 'react-router-dom';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/nav/SettingsPage';
import GameListPage from './pages/nav/GameListPage';
import MultiGameListPage from './pages/nav/MultiGameListPage';
import ColorPalettePage from './pages/ColorPalettePage';
import GamePage from './pages/GamePage';
import NavBar from './components/NavBar';
import FirstGame from './games/FirstGame';
import SlingGame from './games/SlingGame';
import SocialPage from './pages/nav/SocialPage';
import {sendPOST} from './tools';
import Cookies from 'js-cookie';
import PopText from './components/PopText';
import './App.css';
import CameraGame from './games/CameraGame';

function App()
{
    //if last_page key is null asign it the default page url
    // if(sessionStorage.getItem("last_page") == null)
    //     sessionStorage.setItem("last_page", "");

    // const [page, setPage] = useState(sessionStorage.getItem("last_page"));
    //const [page, setPage] = useState("any_unused_url");
    // const [socialPageLoad, setSocialPageLoad] = useState(true);

    //before the page unloads save the last page into session storage to have it be the default value for the page variable on the loading page
    //used to create a smooth transition between pages
    // onbeforeunload = function()
    // {
    //     // sessionStorage.setItem("last_page", page);
    // }

    let popTextRef = null;

    function loadPage(page)
    {
        if(page == "" || page == "multiplayer" || page == "social" || page == "settings")
        {
            //check if the login token is valid
            sendPOST({requestID: "auth_token", token: Cookies.get("token")}, function(data)
            {
                //if the auth failed redirect to login page
                if(!data.success)
                    window.location.href = "login";

            });
        }
        // setPage(page);
        // console.log(page);
        // if(page == "social")
        // {
        //     setSocialPageLoad(!socialPageLoad);
        // }

        // //if the page isn't a login or sign up page auth the login token
        // if(page == "" || page == "multiplayer" || page == "social" || page == "settings")
        // {
        //     //check if the login token is valid
        //     sendPOST({requestID: "auth_token", token: Cookies.get("token")}, function(data)
        //     {
        //         //if the auth failed redirect to login page
        //         if(!data.success)
        //             window.location.href = "login";
        //     });
        // }
        
    }

    // onhashchange = function(e)
    // {
    //     loadPage(e.newURL.split('#')[1]);
    // };

    // window.onload = function()
    // {
    //     console.log("SDHdfjdfj");
    //     console.log(window.location.pathname);
    //     loadPage(window.location.pathname.substring(1));
    //     //loadPage(window.location.hash.substring(1));
    // };

    return (
        <div onLoad={() => loadPage(window.location.pathname.substring(1))} className="App">
            <PopText ref={popTextRef}></PopText>
            <BrowserRouter>
                <Routes>
                    <Route index element={<GameListPage></GameListPage>}></Route>
                    <Route path="/multiplayer" element={<MultiGameListPage></MultiGameListPage>}></Route>
                    <Route path="/social" element={<SocialPage></SocialPage>}></Route>
                    <Route path="/settings" element={<SettingsPage></SettingsPage>}></Route>

                    <Route path="/login" element={<LoginPage></LoginPage>}></Route>
                    <Route path="/sign_up" element={<SignUpPage></SignUpPage>}></Route>

                    <Route path="/game-first" element={<><GamePage></GamePage><FirstGame></FirstGame></>}></Route>
                    <Route path="/game-sling" element={<><GamePage></GamePage><SlingGame></SlingGame></>}></Route>
                    <Route path="/game-camera" element={<><GamePage></GamePage><CameraGame></CameraGame></>}></Route>

                    <Route path="/color-palette" element={<ColorPalettePage></ColorPalettePage>}></Route>

                </Routes>
            </BrowserRouter>
            {/* <div hidden={page != "" && page != "multiplayer" && page != "social" && page != "settings" && page.slice(0, 5) != "game-" && page.slice(0, 9) != "multigame"}>
                <NavBar page={page}></NavBar>
            </div>
            
            <div hidden={page != ""}>
                <GameListPage></GameListPage>
            </div>
            <div hidden={page != "multiplayer"}>
                <MultiGameListPage></MultiGameListPage>
            </div>
            <div hidden={page != "social"}>
                <SocialPage load={socialPageLoad}></SocialPage>
            </div>
            <div hidden={page != "login"}>
                <LoginPage></LoginPage>
            </div>
            <div hidden={page != "sign_up"}>
                <SignUpPage></SignUpPage>
            </div>
            <div hidden={page != "settings"}>
                <SettingsPage></SettingsPage>
            </div>
            <div hidden={page != "color-palette"}>
                <ColorPalettePage></ColorPalettePage>
            </div>
            <div hidden={page.slice(0, 5) != "game-"}>
                <GamePage></GamePage>

                <div hidden={page.slice(5) != "first"}>
                    <FirstGame></FirstGame>
                </div>
                <div hidden={page.slice(5) != "sling"}>
                    <SlingGame></SlingGame>
                </div>
            </div> */}
        </div>
    );
}

export default App;
