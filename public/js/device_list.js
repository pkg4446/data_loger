equipment();
async function equipment() {
    const response = await fetchData("device/list",{
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token')
    })
    
    console.log(await response.text());
}