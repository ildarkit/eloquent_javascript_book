const roads = ["Дом Алисы-Дом Боба",
 "Дом Алисы-Склад",
 "Дом Алисы-Почта",
 "Дом Боба-Ратуша",
 "Дом Дарии-Дом Эрни",
 "Дом Дарии-Ратуша",
 "Дом Эрни-Дом Греты",
 "Дом Греты-Ферма",
 "Дом Греты-Магазин",
 "Рынок-Ферма",
 "Рынок-Почта",
 "Рынок-Магазин",
 "Рынок-Ратуша",
 "Магазин-Ратуша"];

function buildGraph(edges) {
    let graph = Object.create(null);

    function addEdge(from, to) {
        if (graph[from] == null) {
            graph[from] = [to];
        } else {
            graph[from].push(to);
        }
    }

    for (let [from, to] of edges.map(r => r.split("-"))) {
        addEdge(from, to);
        addEdge(to, from);
    }
    return graph;
}

const roadGraph = buildGraph(roads);

class VillageState {
    constructor(place, parcels) {
        this.place = place;
        this.parcels = parcels;
    }

    move(destination) {
        if (!roadGraph[this.place].includes(destination)) {
            return this;
        }
        let parcels = this.parcels.map(p => {
            if (p.place != this.place) return p;
            return {place: destination, address: p.address};
        }).filter(p => p.place != p.address);
        return new VillageState(destination, parcels);
    }
}

function runRobot(state, robot, memory, logging = true) {
    for (let turn = 0;; turn++) {
        if (state.parcels.length == 0) {
            if (logging)
                console.log(`Выполнено за ${turn} ходов`);
            return turn;
        }
        let action = robot(state, memory);
        state = state.move(action.direction);
        memory = action.memory;
        if (logging)
            console.log(`Переход в направлении ${action.direction}`);
    }
}

function initState(parcelCount = 5) {
    let parcels = [];
    for (let i = 0; i < parcelCount; i++) {
        let address = randomPick(Object.keys(roadGraph));
        let place;
        do {
            place = randomPick(Object.keys(roadGraph));
        } while (place == address);
        parcels.push({place, address});
    }
    return new VillageState("Почта", parcels);
}

function compareRobots(memory, ...robots) {
    const STEPS = 100;
    let turn = new Array(robots.length).fill(0);
    for (let i = 0; i < STEPS; i++) {
        let state = initState();
        for (let j = 0; j < robots.length; j++) {
            let start = performance.now();
            turn[j] += runRobot(state, robots[j], memory, logging = false);
        }
    }
    for (let i = 0; i < robots.length; i++) {
        console.log(
            "Avg переходов роботом",
            `${robots[i].name} = ${turn[i] / STEPS}`
        );
    }
}

// -------------------------------------
// random robot
// -------------------------------------
function randomPick(array) {
    let choice = Math.floor(Math.random() * array.length);
    return array[choice];  
}

function randomRobot(state) {
    return {direction: randomPick(roadGraph[state.place])};
}

// -------------------------------------
// route robot
// -------------------------------------
const mailRoute = [
   "Дом Алисы",
   "Склад",
   "Дом Алисы",
   "Дом Боба",
   "Ратуша",
   "Дом Дарии",
   "Дом Эрни",
   "Дом Греты",
   "Магазин", 
   "Дом Греты",
   "Ферма",
   "Рынок",
   "Почта" 
];

function routeRobot(state, memory) {
    if (memory == undefined || memory.length == 0) {
        memory = mailRoute;
    }
    return {direction: memory[0], memory: memory.slice(1)};
}

// -------------------------------------
// oriented robot
// -------------------------------------
function findRoute(graph, from, to) {
    let work = [{at: from, route: []}];
    for (let i = 0; i < work.length; i++) {
        let {at, route} = work[i];
        for (let place of graph[at]) {
            if (place == to) return route.concat(place);
            if (work.some(w => w.at != place)) {
                work.push({
                    at: place,
                    route: route.concat(place)
                });
            }
        }
    }
}

function goalOrientedRobot({place, parcels}, route) {
    if (route == undefined || route.length == 0) {
        let parcel = parcels[0];
        if (parcel.place != place) {
            route = findRoute(roadGraph, place, parcel.place);
        } else {
            route = findRoute(roadGraph, place, parcel.address);
        }
    }
    return {direction: route[0], memory: route.slice(1)};
}

// -------------------------------------
// bfs robot
// -------------------------------------
class Queue extends Map {
    constructor() {
      super();
      this.insertionIndex = 0;
      this.removalIndex = 0;
    }
  
    enqueue(element) {
      this.set(this.insertionIndex, element);
      this.insertionIndex++;
    }
  
    dequeue() {
      const el = this.get(this.removalIndex);
      if (typeof el !== 'undefined') {
        this.delete(this.removalIndex);
        this.removalIndex++;
      }
      return el;
    }
  }

function bfsRoute(graph, from, to) {
    let queue = new Queue();
    queue.enqueue(from);
    let visited = new Map();
    visited[from] = 0;
    visited[to] = 0;
    let process = true;

    while (process && queue.size > 0) {
        let current = queue.dequeue();
        for (let node of graph[current]) {
            if (node == to && visited[node] != undefined) {
                visited[node] = current;
                process = false;
                break;
            }
            if (visited[node] == undefined) {
                visited[node] = current;
                queue.enqueue(node);
            }
        }
    }
    return getRoute(visited, from, to); 
}

function getRoute(visited, from, to) {
    let route = [to];
    while (from != to) {
        to = visited[to];
        route.push(to);
    }
    route.pop();
    return route.reverse();
}

function bfsRobot({place, parcels}, route) {
    if (route == undefined || route.length == 0) {
        let parcel = parcels.find(
            p => p.place == place && roadGraph[place].some(n => n == p.address));
        if (!parcel) parcel = parcels.find(p => p.place == place);
        if (!parcel) parcel = parcels[0];
        if (parcel.place != place) {
            route = bfsRoute(roadGraph, place, parcel.place);
        } else {
            route = bfsRoute(roadGraph, place, parcel.address);
        }
    }
    return {direction: route[0], memory: route.slice(1)};
}

const state = initState();

console.log("Runnig random robot...");
runRobot(state, randomRobot);
console.log("End random robot");

console.log("Runnig route robot...");
runRobot(state, routeRobot, mailRoute);
console.log("End route robot");

console.log("Runnig oriented robot...");
runRobot(state, goalOrientedRobot);
console.log("End oriented robot");

console.log("Runnig bfs robot...");
runRobot(state, bfsRobot);
console.log("End bfs robot");
let memory;
compareRobots(memory, randomRobot, routeRobot, bfsRobot, goalOrientedRobot);