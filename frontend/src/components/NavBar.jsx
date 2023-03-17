import React, {useState, useEffect} from 'react';
import "./NavBar.css";

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

        console.log(index);
    }

    useEffect(() =>
    {
        setSelectedIndex(props.page);
    }, []);

    // useEffect(function()
    // {
    //     //setSelectedIndex(props.page);
    //     switch(props.page)
    //     {
    //         case "":
    //             setSelectedIndex(0);
    //             break;
    //         case "multiplayer":
    //             setSelectedIndex(1);
    //             break;
    //         case "social":
    //             setSelectedIndex(2);
    //             break;
    //         case "settings":
    //             setSelectedIndex(3);
    //             break;
    //         default:
    //             setSelectedIndex(-1);
    //             return;
    //     }
    // }, [props.page]);

    return (
        <div className="nav_bar">
            <ul className="nav_bar_ul">
                <img className="nav_bar_image" src="./assets/ico.svg"></img>
                <li className="nav_bar_title nav_bar_li"><b>Socket Games</b></li>
                <li className={`${classNames[0][0]} nav_bar_text`}><a href="/">Singleplayer</a></li>
                <li className={`${classNames[1][0]} nav_bar_text`}><a href="/multiplayer">Multiplayer</a></li>
                <li className={`${classNames[2][0]} nav_bar_text`}><a href="/social">Social</a></li>
                <li className={`${classNames[3][0]} nav_bar_text`}><a href="/settings">Settings</a></li>
                {/* <li style={{position: "fixed", right: "0px", padding: "6px", fontSize: "20px"}}>Username</li> */}
            </ul>
        </div>
    );
}

export default NavBar;