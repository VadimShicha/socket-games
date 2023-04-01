//send a post request to the server with and object of data
export function sendPOST(obj, func)
{
    window.fetch(process.env.REACT_APP_API_URL + '/server',
    {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify(obj)
    }).
    then(res => res.json()
    ).then(data => {
        func(data);
    })
    .catch((error) =>
    {
        console.log("ERROR");
        console.log(error);
    });

    console.log("FINISHED");
};