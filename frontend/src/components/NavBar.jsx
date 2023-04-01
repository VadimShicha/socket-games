import React, {useState, useEffect, useRef} from 'react';
import {Link} from 'react-router-dom';
import "../styles/NavBar.css";
import DataManager from '../dataManager';
import LoginPage from '../pages/LoginPage';
import { sendPOST } from '../tools';

const regularClass = "nav_bar_li";
const selectedClass = "nav_bar_li_selected";

function NavBar(props)
{
    const classNames = [useState(regularClass), useState(regularClass), useState(regularClass), useState(regularClass)]; //array of nav bar tab class names

    const [menuHidden, setMenuHidden] = useState(true);
    const [loginDivHidden, setLoginDivHidden] = useState(true);
    const loginDivRef = useRef(null);

    const [username, setUsername] = useState("");

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
            <div className="nav_bar_login_div_container" ref={loginDivRef}>
                <div className="nav_bar_login_div" style={{marginTop: loginDivHidden ? "-220px" : "40px"}}>
                    <LoginPage loginSuccess={() => {setLoginDivHidden(true);}}></LoginPage>
                </div>
            </div>
            <div className="nav_bar">
                <ul className="nav_bar_ul">
                    <img className="nav_bar_image" src="/assets/ico.svg"></img>
                    <li className="nav_bar_title nav_bar_li nav_bar_regular"><Link className="nav_bar_title_a" to="/"><b>Socket Games</b></Link></li>
                    
                    <li className={`${classNames[0][0]} nav_bar_text nav_bar_regular`}><Link to="/">Singleplayer</Link></li>
                    <li className={`${classNames[1][0]} nav_bar_text nav_bar_regular`}><Link to="/multiplayer">Multiplayer</Link></li>

                    <span hidden={!DataManager.authed}>
                        <li className={`${classNames[2][0]} nav_bar_text nav_bar_regular`}><Link to="/social">Social</Link></li>
                        <li className={`${classNames[3][0]} nav_bar_text nav_bar_regular`}><Link to="/settings">Settings</Link></li>
                        <div className="nav_bar_short">
                            <li className="nav_bar_center_title nav_bar_title nav_bar_li"><Link className="nav_bar_title_a" to="/"><b>Socket Games</b></Link></li>
                            <button className="nav_bar_menu_button" onClick={() => setMenuHidden(!menuHidden)}></button>
                        </div>
                        <li className="nav_bar_username">{username}</li>
                    </span>
                    <span hidden={DataManager.authed}>
                        <button onClick={() => setLoginDivHidden(false)} className="nav_bar_login_button">Login</button>
                        <Link to="/sign_up"><button className="nav_bar_sign_up_button">Sign Up</button></Link>
                    </span>
                </ul>
            </div>
            <div className="nav_bar_menu_div nav_bar_short" hidden={menuHidden}>
                <div className="nav_bar_menu_div_nail top_left_nail"></div>
                <div className="nav_bar_menu_div_nail top_right_nail"></div>
                <div className="nav_bar_menu_div_nail bottom_left_nail"></div>
                <div className="nav_bar_menu_div_nail bottom_right_nail"></div>
                <Link to="/">Singleplayer</Link>
                <Link to="/multiplayer">Multiplayer</Link>
                <Link to="/social">Social</Link>
                <Link to="/settings">Settings</Link>
            </div>
        </div>
    );
}

export default NavBar;