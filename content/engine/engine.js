//#region Initialisation
$(document).ready(loadData);
const SCREEN_HEIGHT = 400;
const SCREEN_WIDTH = 400;
let frameDelay = 100;
let filesToLoad;
let jsonData;
let entities = [];
let lastInput = "";
let isPaused = false;
//Code to be executed when page is loaded
function loadData(){
    const event = new Event("build");
    addFileToLoad();
    
    fetch(fileToLoad)
    .then((response) => response.json())
    .then((json) => {
        console.log("Data loaded");
        jsonData = json;
        main()
    });
}
//Code to be executed when json data is loaded
function main(){
    document.getElementById("a_button").onclick = aButtonClicked;
    document.getElementById("b_button").onclick = bButtonClicked;
    document.getElementById("left_button").onclick = leftButtonClicked;
    document.getElementById("right_button").onclick = rightButtonClicked;
    document.getElementById("up_button").onclick = upButtonClicked;
    document.getElementById("down_button").onclick = downButtonClicked;
    document.getElementById("pause_button").onclick = pauseButtonClicked;
    document.getElementById("menu").style.display = "none";
    start();   
    updateLoop();
    pause();
}
//#endregion
//#region Loop
//Code to be executed every Xms
function updateLoop(){
    handleInput();

    update();
    entityUpdate();
    handleEntityDestroy()

    if(!isPaused) setTimeout(updateLoop, frameDelay);
}
//Entities updated after update function
function entityUpdate(){
    for(let e in entities){
        entities[e].update();
        entities[e].animate();
    }
}
//Entity destruction occurs last
function handleEntityDestroy(){
    for(let i = entities.length - 1; i >= 0; i--){
        entities[i].handleDestroy()
    }
}
//Halts the update loop
function pause(){
    isPaused = true;
    toggleMenu();
}
//Restarts the update loop
function unpause(){
    isPaused = false;
    toggleMenu();
    updateLoop();
}
//#endregion
//#region Input Handling
function handleInput(){
    switch(lastInput){
        case "":
            return;
        case "A":
            console.log("A");
            for(let e in entities){
                entities[e].handleAInput();
            }
            break;
        case "B":
            console.log("B");
            for(let e in entities){
                entities[e].handleBInput();
            }
            break;
        case "Left":
            console.log("Left");
            for(let e in entities){
                entities[e].handleLeftInput();
            }
            break;
        case "Right":
            console.log("Right");
            for(let e in entities){
                entities[e].handleRightInput();
            }
            break;
        case "Up":
            console.log("Up");
            for(let e in entities){
                entities[e].handleUpInput();
            }
            break;
        case "Down":
            console.log("Down");
            for(let e in entities){
                entities[e].handleDownInput();
            }
            break;      
    }
    lastInput = "";
}
function aButtonClicked(){
    if(isPaused) {
        handleContinueButton();
        return;
    }
    lastInput = "A";
}
function bButtonClicked(){
    if(isPaused) {
        handleNewGameButton();
        return;
    }
    lastInput = "B";
}
function leftButtonClicked(){
    if(isPaused) return;
    lastInput = "Left";
}
function rightButtonClicked(){
    if(isPaused) return;
    lastInput = "Right";
}
function upButtonClicked(){ 
    if(isPaused) return;
    lastInput = "Up";
}
function downButtonClicked(){   
    if(isPaused) return;
    lastInput = "Down";
}
function pauseButtonClicked(){
    if(isPaused) unpause();
    else pause();

}
//#endregion
//#region Entity Class
class Entity{
    positionX;
    positionY;
    height;
    idleAnim;
    id;
    animQueue;
    toDestroy = false;
    constructor(height, imageUrl, id, x, y){
        this.positionX = x;
        this.positionY = y;
        this.height = height;
        this.idleAnim = [imageUrl];
        this.id = id;
        this.animQueue = [];
        let screen = $("#screen");
        let entity = document.createElement("div");
        entity.classList.add("entity");
        entity.id = this.id;
        let sprite = document.createElement("img");
        sprite.src = imageUrl;
        sprite.style.height = `${this.height}px`;
        entity.style.left = `${this.positionX}px`;
        entity.style.top = `${this.positionY}px`;
        entity.append(sprite);
        screen.append(entity);
    }
    movePosition(x,y){
        this.positionX += x;
        this.positionY += y;
        this.place();
    }
    setPosition(x,y){
        this.positionX = x;
        this.positionY = y;
        this.place();
    }
    place(){
        if(this.positionX < 0){
            this.positionX = 0;
        }
        if(this.positionY < 0){
            this.positionY = 0;
        }
        if(this.positionX > (SCREEN_WIDTH - this.height)){
            this.positionX = (SCREEN_WIDTH - this.height)
        }
        if(this.positionY > (SCREEN_HEIGHT - this.height)){
            this.positionY = (SCREEN_HEIGHT - this.height);
        }
        let entity = this.getElement();
        entity.style.left = `${this.positionX}px`;
        entity.style.top = `${this.positionY}px`;
    }
    getElement(){
        return document.getElementById(this.id);
    }
    animate(){
        if(this.animQueue.length == 0){
            for(let s in this.idleAnim){
                this.animQueue.push(this.idleAnim[s])
            }
        }
        let img = this.getElement().getElementsByTagName("img")[0];
        let sprite = this.animQueue.shift();
        if(img.src != sprite){
            img.src = sprite;
        }
    }
    setIdle(idleArray){
        this.idleAnim = idleArray;
    }
    pushAnim(animArray){
        for(let s in animArray){
            this.animQueue.push(animArray[s]);
        }
    } 
    destroy(){
        this.toDestroy = true;
    }
    handleDestroy(){
        if(this.toDestroy){
            let f = (e) => e == this;
            let i = entities.findIndex(f);
            entities.splice(i,1);
            this.getElement().remove();
        } 
    }
    //To be implemented in child classes
    update(){}
    handleAInput(){}
    handleBInput(){}
    handleLeftInput(){}
    handleRightInput(){}
    handleUpInput(){}
    handleDownInput(){}
};
//#endregion
//#region Menu
//Displays menu element and pauses game
function toggleMenu(){
    let menu = document.getElementById("menu")
    if(isPaused){
        menu.style.display = "block";
    }
    else{
        menu.style.display = "none";
    }
}
//Handled by A button
function handleContinueButton(){
    console.log("Continue");
    unpause();
}
//Handled by B button - Deletes all entities and restarts
function handleNewGameButton(){
    resetGame();
    unpause();
}
function resetGame(){
    console.log("New Game");
    for(let e in entities){
        entities[e].destroy();
    }
    handleEntityDestroy();
    start();
}
//#endregion
//#region Mechanics boiler plate code to copy and paste in separate file
/*
function start(){
}
function update(){
}
//Load in JSON file
function addFileToLoad(){
    fileToLoad = '';
}
*/
//#endregion