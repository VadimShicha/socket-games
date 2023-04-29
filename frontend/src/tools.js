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
    });
};

export function userOnMobile()
{
    return window.navigator.userAgent.toLowerCase().includes("mobi") || window.navigator.userAgent.toLowerCase().includes("tablet");
}

export async function sendAsyncPOST(obj)
{
    const res = await window.fetch(process.env.REACT_APP_API_URL + '/server',
    {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify(obj)
    });
    const then = await res.json();
    console.log(then);
    let data;
    await then.then(async(d) => data = d);
    return data;
}