//send a post request to the server with and object of data
export function sendPOST(obj, func)
{
    fetch('/server',
    {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(obj)
    }).then(
        res => res.json()
    ).then(data => {
        func(data);
    });
}

//sets a single cookie to a value
// export function setCookie(id, value, expireDate)
// {
//     document.cookie = id + "=" + value + ";expires=" + expireDate.toUTCString() + ";path=/";
// }