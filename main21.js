//Building a robot

//Meadowfield

const roads = [  
    "Alice's House-Bob's House",  "Alice's House-Bob's Cabin",
    "Alice's House-Post Office", "Bob's House-Town Hall",
    "Daria's House-Ernie's House", "Daria's House- Town Hall",
    "Ernie's House-Grete's House", "Grete's House-Farm",
    "Grete's House-Shop", "Marketplace-Farm",
    "Marketplace-Post Office", "Marketplace-Town Hall",
    "Shop-Town Hall"
]

//A graph is a collection of Points

function buildGraph(edges){
    let graph = Object.create(null);
    function addEdge(from, to){
        if(graph[from]==null){
            graph[from] = [to];
        }else{
            graph[from].push(to);
        }
    }

    for(let [from, to] of edges.map(r => r.split("-"))){

        addEdge(from, to);
        addEdge(to, from);
    }
    
    return graph;
     
}

const roadGraph = buildGraph(roads);

class VillageState{
    constructor(place, parcels){
        this.place = place;
        this.parcels = parcels;
    }
    move(destination){
        if(!roadGraph[this.place].includes(destination)){
        return this;
        }else{
            let parcels = this.parcels.map(p=>{
                if(p.place != this.place) return p;
                return{place:destination, address:p.address};
            }).filter(p=>p.place != p.address);
            return new VillageState(destination, parcels);
        }
    }
}

// let first = new VillageState("Post Office", [{place:"Post Office", address:"Alice's House"}]);
// let next = first.move("Alice's House");

// console.log(next.place);
// console.log(next.parcels);
// console.log(first.place);

//Persistent Data

//Object.freeze  changes an Oobject so that wrtitng to its properties is ignored.
//Ann objectt shouldn't be messed with.

// let object = Object.freeze({value:5});
// object.value = 10;
// console.log(object.value);

//Simulation

// function runRobot(state, robot, memory){
//     for(let turn =0;;turn ++){
//         if(state.parcels.length == 0){
//             console.log(`Done in ${turn} turns`);
//             break;
//         }
//         let action = robot(state, memory);
//         state = state.move(action.direction);
//         memory= action.memory;
//         console.log(`Turn ${turn +1}: Moved to ${action.direction}`);
//     }
// }

function randomPick(array){
    let choice = Math.floor(Math.random()* array.length);
    return array[choice];
}

function randomRobot(state){
    return {direction: randomPick(roadGraph[state.place])};
}

VillageState.random = function(parcelCount =3){
    let parcels = [];
    for(let i=0; i<parcelCount; i++){
        let address = randomPick(Object.keys(roadGraph));
        
        let place;
        do{
            place = randomPick(Object.keys(roadGraph));
        }while(place == address);
        parcels.push({place, address});
    }
    return new VillageState("Post Office", parcels);
};

// runRobot(VillageState.random(), randomRobot);

const mailRoute = [
    "Alice's House", "Cabin", "Alice's House", "Bob's House", "Town Hall", "Doria's House", "Ernie's House", "Grete's House", "Shop", "Grete's House", "Farm", "Marketplace", "Post Office"

]

function routeRobot(state, memory){
    if(memory.length == 0){
        memory = mailRoute;
    }
    return {direction:memory[0], memory:memory.slice(1)};
}



function findRoute(graph, from, to){
    let work = [{at:from, route:[]}];
    for(let i=0; i<work.length; i++){
        let{at, route} = work[i];
        for(let place of graph[at]){
            if(place == to)return route.concat(place);
            if(!work.some(w=>w.at == place)){
                work.push({at:place, route:route.concat(place)});
            }
        }
    }
}

// const graph ={
//     A:["B", "C"],
//     B:["A", "D"],
//     C:["A", "D"],
//     D:["B", "C","E"],
//     E:["D"]
// };

// let route = findRoute(graph, "A", "E");
// console.log(route);

function goalOrientedRobot({place, parcels}, route){
    if(route.length == 0){
        let parcel = parcels[0];
        if(parcel.place != place){
            route = findRoute(roadGraph, place, parcel.place);
        }else{
            route = findRoute(roadGraph, place, parcel.address);
        }
    
    }
    return {direction: route[0], memory:route.slice(1)};
};


//Exercises

//Measuring Robots

function runRobotSteps(state, robot, memory){
    for(let turns = 0;; turns ++){
        if(state.parcels.length == 0){
            return turns;
        }
        let action = robot(state, memory);
        state = state.move(action.direction);
        memory = action.memory;
    }
}

function compareRobots(robot1, memory1, robot2, memory2){
    let totalStepOne = 0;
    let totalStepTwo =0;
    let numTask = 100;

    for(let i =0; i<numTask; i++){
        let state = VillageState.random();
        totalStepOne += runRobotSteps(state, robot1, memory1);
        totalStepTwo += runRobotSteps(state, robot2, memory2);
    }

    console.log(`Robot1 average steps: ${totalStepOne/numTask} steps per task`);
    console.log(`Robot 2 average steps: ${totalStepTwo/numTask}`);
}

// compareRobots(routeRobot, [], goalOrientedRobot, []);

//ROBOT EFFICIENCY

function goalOrientedRobot2({place,parcels}, route){
    if(route.length == 0){
        let routes = parcels.map(parcel=>{
            if(parcel.place != place){
                route = findRoute(roadGraph,place,parcel.place);
            }else{
                route = findRoute(roadGraph,place,parcel.address);
            }
        });

        route =routes.reduce((a,b)=> a.length < b.length ? a:b);
    }

    return {direction:route[0], memory:route.slice(1)};
}

//Persistent Data

class PGroup{
    #members = [];
    constructor(members){
        this.#members = members;
    }
    add(value){
        if(this.has(value)) return this;
            return new PGroup(this.#members.concat([value]));
    }
    delete(value){
        if(!this.has(value)) return this;
        return new PGroup (this.#members.filter(v=> v !== value));
    }
    has(value){
        return this.#members.includes(value);
    }

    static empty =  new PGroup([])
    
    }

let a = PGroup.empty.add("a");
let ab = a.add("b");
let b = ab.delete("a");

// console.log(b.has("b"));
// console.log(a.has("b"));
// console.log(b.has("a"));

//practise on getters and setters

class Rectangle{
    constructor(width, height){
        this.width = width;
        this.height = height;
    }

    get area(){
        return this.width * this.height;
    };

    set area(vale){
        console.log("Area cannot be set directly.");
    }
}

const rect = new Rectangle(10,5);

// console.log(rect.area);

    // rect.area = 60;


let student = { firstName: "Monica"};

Object.defineProperty(student, "getName",{
    get: function(){
        return this.firstName;
    }
});

Object.defineProperty(student, "changeName",{
    set: function(value){
        this.firstName = value;
    }
});

// console.log(student.getName);

student.changeName = "Sarah";

// console.log(student.getName);

let p = {
    n1:"Anurag",
    n2:"Das",

    get name(){
        return `${this.n1} ${this.n2}`;
    },
    set name(name){
        [this.n1, this.n2] = name.split(" ");
    }
};

// console.log(p.name);

p.name = "Anuj Jain";

// console.log(p.name);

let person = {
    _firstName:"John",
    _secondName:"Doe",

    get fullName(){
        return `${this._firstName} ${this._secondName}`;
    },
    set fullName(name){
        let parts = name.split(" ");
        this._firstName = parts[0];
        this._secondName = parts[1] || " ";
    }
};

// console.log(person.fullName);

class InputError extends Error {}


let user = {
    _username:"guest",
    get username(){
        return this._username;
    },

    set username(name){
        if(typeof name === "string" && name.trim() !== ""){
            this._username = name;
        }else{
            throw new Error("Invalid username, Username can't be empty you'll be login as a guest user");
        }
    }
};

// try{

//     user.username = "";

// }catch(e){
//     if(!(e instanceof InputError))
//         throw e;
// }finally{
//     console.log(user.username)
// }

//Recursive functions

//Factorial of a given Number

function getFactorial(n){
    if(n == 0) return 1;
    if(n == 1) return 1;

    return n * getFactorial(n - 1);
}

//Sum of Natural numbers 
function sumOfNaturalNumbers(a){
    if( a == 0 ) return 0;
    if(a == 1) return 1;

    return a + sumOfNaturalNumbers(a-1);


}