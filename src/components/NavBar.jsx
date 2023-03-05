import React, {useState, useRef, useEffect} from 'react';
import {sendPOST} from '../tools'

const regularClass = "nav_bar_li";
const selectedClass = "nav_bar_li_selected";

function NavBar(props)
{
    const classNames = [useState(regularClass), useState(regularClass), useState(regularClass), useState(regularClass)]; //array of nav bar tab class names

    //set the selected nav bar tab
    function setSelectedIndex(index)
    {
        for(let i = 0; i < classNames.length; i++)
            classNames[i][1](regularClass); //call the set function for i (1 is the index for the set function)
        
        if(index != -1)
            classNames[index][1](selectedClass);
    }

    useEffect(function()
    {
        switch(props.page)
        {
            case "":
                setSelectedIndex(0);
                break;
            case "multiplayer":
                setSelectedIndex(1);
                break;
            case "social":
                setSelectedIndex(2);
                break;
            case "settings":
                setSelectedIndex(3);
                break;
            default:
                setSelectedIndex(-1);
                return;
        }
    }, [props.page]);

    return (
        <div className="nav_bar">
            <ul>
                <img className="nav_bar_image" width="40" height="40" src="./ico.svg"></img>
                <li className="{nav_bar_li} nav_bar_title"><b>Socket Games</b></li>
                <li className={classNames[0][0]}><a href="/">Singleplayer</a></li>
                <li className={classNames[1][0]}><a href="/multiplayer">Multiplayer</a></li>
                <li className={classNames[2][0]}><a href="/social">Social</a></li>
                <li className={classNames[3][0]}><a href="/settings">Settings</a></li>
            </ul>
        </div>
    );
}

export default NavBar;