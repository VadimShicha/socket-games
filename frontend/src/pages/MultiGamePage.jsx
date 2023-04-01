import React from 'react';
import NavBar from '../components/NavBar';
import AuthUser from '../components/AuthUser';

function MultiGamePage()
{
    return (
        <>
            <AuthUser></AuthUser>
            <NavBar page={-1}></NavBar>
            <div className="nav_bar_body">

            </div>
        </>
    )
}

export default MultiGamePage;