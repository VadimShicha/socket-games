import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';

function NotFoundPage(props)
{
    const location = useLocation();

    return (
        <>
            <NavBar page={-1}></NavBar>
            <div className="nav_bar_body">
                <h2>404 Page Not Found</h2>
                <p>Page "{location.pathname}" not found</p>
                <Link to="/">Go to home page</Link>
            </div>
        </>
    )
}

export default NotFoundPage;