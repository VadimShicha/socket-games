import React, {useState, useEffect, useRef} from 'react';
import {Link} from 'react-router-dom';
import "../styles/NavBar.css";
import DataManager from '../dataManager';
import LoginPage from '../pages/LoginPage';
import { sendPOST } from '../tools';
import Cookies from 'js-cookie';
import ConfettiExplosion from 'react-confetti-explosion';

const regularClass = "nav_bar_li";
const selectedClass = "nav_bar_li_selected";

function NavBar(props)
{
    const classNames = [useState(regularClass), useState(regularClass), useState(regularClass), useState(regularClass)]; //array of nav bar tab class names

    const [menuHidden, setMenuHidden] = useState(true);
    const [loginDivHidden, setLoginDivHidden] = useState(true);
    const loginDivRef = useRef(null);

    const [username, setUsername] = useState("");
    const [loggedIn, setLoggedIn] = useState(Cookies.get("logged_in") === 'true');

    const [isExploding, setIsExploding] = useState(false);

    //set the selected nav bar tab
    function setSelectedIndex(index)
    {
        for(let i = 0; i < classNames.length; i++)
            classNames[i][1](regularClass); //call the set function for i (1 is the index for the set function)
        
        if(index != -1)
            classNames[index][1](selectedClass);
    }

    useEffect(() =>
    {
        setSelectedIndex(props.page);

        const onclick = (event) =>
        {
            if(!loginDivRef.current.contains(event.target))
                setLoginDivHidden(true);
        };

        document.addEventListener("click", onclick, true);

        return () =>
        {
            document.removeEventListener("click", onclick, true);
        }
    }, []);

    useEffect(() =>
    {
        setSelectedIndex(props.page);
    }, [props.page]);

    return (
        <div>
            {isExploding && <span style={{position: "absolute", left: "70px", top: "10px"}}><ConfettiExplosion particleCount={500} particleSize={20} force={0.7} colors={["#28bb11", "#11a4bb", "#d63b1c", "#d6d01c", "#d6791c"]} onComplete={() => setIsExploding(false)}/></span>}
            <div className="nav_bar_login_div_container" ref={loginDivRef}>
                <div className="nav_bar_login_div" style={{marginTop: loginDivHidden ? "-220px" : "40px"}}>
                    <LoginPage loginSuccess={() => {setLoginDivHidden(true); setLoggedIn(true);}}></LoginPage>
                </div>
            </div>
            <div className="nav_bar">
                <ul className="nav_bar_ul">
                    <img onClick={() => {setIsExploding(true);}} className="nav_bar_image" src="/assets/trumpet_long.svg"></img>
                    <li className="nav_bar_title nav_bar_li nav_bar_regular"><Link className="nav_bar_title_a" to="/"><b>Trumpet Games</b></Link></li>
                    
                    <li className={`${classNames[0][0]} nav_bar_text nav_bar_regular`}><Link to="/">Singleplayer</Link></li>
                    <li className={`${classNames[1][0]} nav_bar_text nav_bar_regular`}><Link to="/multiplayer">Multiplayer</Link></li>

                    <span hidden={!loggedIn}>
                        <li className={`${classNames[2][0]} nav_bar_text nav_bar_regular`}><Link to="/social">Social</Link></li>
                        <li className={`${classNames[3][0]} nav_bar_text nav_bar_regular`}><Link to="/settings">Settings</Link></li>
                        <li className="nav_bar_username">{username}</li>
                    </span>
                    <span hidden={loggedIn}>
                        <button onClick={() => setLoginDivHidden(false)} className="nav_bar_login_button">Login</button>
                        <Link to="/sign_up"><button className="nav_bar_sign_up_button">Sign Up</button></Link>
                    </span>

                    <div className="nav_bar_short">
                        <span hidden={!loggedIn}>
                            <li className="nav_bar_center_title nav_bar_title nav_bar_li"><Link className="nav_bar_title_a" to="/"><b>Trumpet Games</b></Link></li>
                        </span>
                        <button className="nav_bar_menu_button" onClick={() => setMenuHidden(!menuHidden)}></button>

                    </div>
                </ul>
            </div>
            <div className="nav_bar_menu_div nav_bar_short" hidden={menuHidden}>
                <div className="nav_bar_menu_div_nail top_left_nail"></div>
                <div className="nav_bar_menu_div_nail top_right_nail"></div>
                <div className="nav_bar_menu_div_nail bottom_left_nail"></div>
                <div className="nav_bar_menu_div_nail bottom_right_nail"></div>

                <Link to="/">Singleplayer</Link>
                <Link to="/multiplayer">Multiplayer</Link>

                <span hidden={!loggedIn}>
                    <Link to="/social">Social</Link>
                    <Link to="/settings">Settings</Link>
                </span>
            </div>
        </div>
    );
}

export default NavBar;