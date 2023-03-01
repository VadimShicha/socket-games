import {useEffect, useState} from 'react';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/nav/SettingsPage';
import GameListPage from './pages/nav/GameListPage';
import GamePage from './pages/GamePage';
import NavBar from './components/NavBar';
import FirstGame from './games/FirstGame';
import SlingGame from './games/SlingGame';
import SocialPage from './pages/nav/SocialPage';
import {sendPOST} from './tools';
import Cookies from 'js-cookie';
import './App.css';

function App()
{
    const [page, setPage] = useState("");
    const [navPageIndex, setNavPageIndex] = useState(0);

    function loadPage(page)
    {
        //if the page isn't a login or sign up page auth the login token
        if(page != "login" && page != "sign_up")
        {
            //check if the login token is valid
            sendPOST({requestID: "auth_token", token: Cookies.get("token")}, function(data)
            {
                //if the auth failed redirect to login page
                if(!data.success)
                    window.location.hash = "#login";
            });
        }
        
        setPage(page);
    }

    onhashchange = function(e)
    {
        //console.log(e.newURL.split('#')[1] + " (ONCHANGE)");
        loadPage(e.newURL.split('#')[1]);
    };

    window.onload = function()
    {
        //console.log(window.location.hash.substring(1) + " (ONLOAD)");
        loadPage(window.location.hash.substring(1));
    };

    return (
        <div className="App">
            <div hidden={page != "" && page != "social" && page != "settings" && page.slice(0, 5) != "game-"}>
                <NavBar page={page}></NavBar>
            </div>
            <div hidden={page != ""}>
                <GameListPage></GameListPage>
            </div>
            <div hidden={page != "social"}>
                <SocialPage></SocialPage>
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
            <div hidden={page.slice(0, 5) != "game-"}>
                <GamePage></GamePage>

                <div hidden={page.slice(5) != "first"}>
                    <FirstGame></FirstGame>
                </div>
                <div hidden={page.slice(5) != "sling"}>
                    <SlingGame></SlingGame>
                </div>
            </div>
        </div>
    );
}

export default App;
