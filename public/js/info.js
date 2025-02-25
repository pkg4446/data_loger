page_init();
async function page_init() {

    const send_data = {
        id:     localStorage.getItem('user'),
        token:  localStorage.getItem('token')
    };
    const response = await(await fetchData("user/info",send_data)).json();
    console.log(response);

    const root = ReactDOM.createRoot(document.getElementById("root"));

    function item(params) {return React.createElement("div",{className:""},params);}
    function list(number,params) {return React.createElement("li",{className:""+number},params);}

    let contents = [];

    const container = React.createElement("div",{style:{width: "100%", disply:"block"}},contents);

    root.render(container);
}