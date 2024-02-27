const MOUNTAINS = [
    {name: "Kilimanjaro", height: 5895, place: "Tanzania"},
    {name: "Everest", height: 8848, place: "Nepal"},
    {name: "Mount Fuji", height: 3776, place: "Japan"},
    {name: "Vaalserberg", height: 323, place: "Netherlands"},
    {name: "Denali", height: 6168, place: "United States"},
    {name: "Popocatepetl", height: 5465, place: "Mexico"},
    {name: "Mont Blanc", height: 4808, place: "Italy/France"}
];

// Your code here
function elt(type, ...children) {
    let node = document.createElement(type);
    for (let child of children) {
        if (typeof child != "object") {
            child = document.createTextNode(child.toString());
        }
        node.appendChild(child);
    }
    return node;
}

let table = document.getElementById("mountains");
let tableHeader = elt(
    "tr",
    ...Object.keys(MOUNTAINS[0]).map(column => elt("th", column))
    );
table.appendChild(tableHeader);

for (let mountain of MOUNTAINS) {
    let rowData = Object.values(mountain).map(value => elt("td", value));
    let tableRow = elt(
        "tr",
        ...rowData
    );
    table.appendChild(tableRow);
}

for (let tableRow of table.children) {
    for (let node of tableRow.children) {
        node.style.textAlign = "left";
        node.style.paddingLeft = "15px";
        node.style.paddingRight = "15px";
    }
}