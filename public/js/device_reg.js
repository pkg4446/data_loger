page_init();
async function page_init() {
    const data_row = {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "10px",
        marginBottom: "5px"
    }
    const cell = {
        border: "1px solid #ddd",
        borderRadius: "2px",
        textAlign: "center",
        backgroundColor: "white",
        transition: "transform 0.2s ease"
    }

    const root = ReactDOM.createRoot(document.getElementById("root"));

    const container = React.createElement("div",{className:"submit-container"},[
        React.createElement("h2",null,"장비등록"),
        React.createElement("form",{id:"userForm"},[
            React.createElement("div",{style:data_row},[
                React.createElement("label",{style:cell, htmlFor:"device"},"벌통"),
                React.createElement("input",{style:cell, type:"radio", name:"device_type", value:"hive", defaultChecked:true}),
                React.createElement("label",{style:cell, htmlFor:"device"},"활동감지"),
                React.createElement("input",{style:cell, type:"radio", name:"device_type", value:"active"}),
            ]),
            React.createElement("div",{className:"input-group"},[
                React.createElement("label",{htmlFor:"device"},"장비ID"),
                React.createElement("input",{type:"text", className:"input-field", id:"device", required:true},null),
            ]),
            React.createElement("div",{className:"input-group"},[
                React.createElement("label",{htmlFor:"device_name"},"장비 이름"),
                React.createElement("input",{type:"text", className:"input-field", id:"device_name", required:true},null),
            ]),
            React.createElement("br",null,null),
            React.createElement("button",{className:"submit-button"},"등록"),
        ]),
        React.createElement("div",null,"enable"),
    ]);

    root.render(container);
}

page_init();
