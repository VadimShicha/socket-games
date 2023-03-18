import React, {useState, useEffect} from 'react';
import "./NavBar.css";

const regularClass = "nav_bar_li";
const selectedClass = "nav_bar_li_selected";

function NavBar(props)
{
    const classNames = [useState(regularClass), useState(regularClass), useState(regularClass), useState(regularClass)]; //array of nav bar tab class names

    const [menuHidden, setMenuHidden] = useState(true);

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
        <div>
            <div className="nav_bar">
                <ul className="nav_bar_ul">
                    <img className="nav_bar_image" src="/assets/ico.svg"></img>
                    <li className="nav_bar_title nav_bar_li nav_bar_regular"><a className="nav_bar_title_a" href="/"><b>Socket Games</b></a></li>
                    <li className={`${classNames[0][0]} nav_bar_text nav_bar_regular`}><a href="/">Singleplayer</a></li>
                    <li className={`${classNames[1][0]} nav_bar_text nav_bar_regular`}><a href="/multiplayer">Multiplayer</a></li>
                    <li className={`${classNames[2][0]} nav_bar_text nav_bar_regular`}><a href="/social">Social</a></li>
                    <li className={`${classNames[3][0]} nav_bar_text nav_bar_regular`}><a href="/settings">Settings</a></li>
                    <div className="nav_bar_short">
                        <li className="nav_bar_center_title nav_bar_title nav_bar_li"><a className="nav_bar_title_a" href="/"><b>Socket Games</b></a></li>
                        <button className="nav_bar_menu_button" onClick={() => setMenuHidden(!menuHidden)}></button>
                        
                        

                    </div>
                    {/* <li style={{position: "fixed", right: "0px", padding: "6px", fontSize: "20px"}}>Username</li> */}
                </ul>
            </div>
            <div className="nav_bar_menu_div nav_bar_short" hidden={menuHidden}>
                <div className="nav_bar_menu_div_nail top_left_nail"></div>
                <div className="nav_bar_menu_div_nail top_right_nail"></div>
                <div className="nav_bar_menu_div_nail bottom_left_nail"></div>
                <div className="nav_bar_menu_div_nail bottom_right_nail"></div>
                <a href="/">Singleplayer</a>
                <a href="/multiplayer">Multiplayer</a>
                <a href="/social">Social</a>
                <a href="/settings">Settings</a>
            </div>
        </div>
    );
}

export default NavBar;