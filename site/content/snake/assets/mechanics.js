//#region Variables
let grid;
let snakeLength;
let spawnNewSegment;
let isPickUp;
let pickUpSound;
let highscore;
const START_X = 3;
const START_Y = 18;
const REFRESH_RATE = 300;
//#endregion
//#region Engine Methods
function start(){
    //initialize variables
    grid = [
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
    ];
    frameDelay = REFRESH_RATE;
    snakeLength = 0;
    spawnNewSegment = false;
    pickUpSound = new Audio("assets/sounds/pickUp.wav");
    pickUpSound.volume = 0.4;
    //Fetch High Score
    highscore = window.localStorage.getItem('highscore');
    if(highscore == null) window.localStorage.setItem('highscore', "0"+snakeLength.toString());
    updateHighscore();
    //Spawn Game Entities
    let head = new SnakeHead(20, "assets/sprites/snakeHeadUp.png", "0", START_X, START_Y, 10);
    head.setIdle(jsonData.snakeHeadUp);
    entities.push(head);  
    spawnPickUp();
}
function update(){
    //Handle Spawning Next Segment 
    if(spawnNewSegment){
        spawnNewSnakeSegment();
        spawnNewSegment = false;
    }
    if(!isPickUp) spawnPickUp();
}
//Load in JSON file
function addFileToLoad(){
    fileToLoad = 'assets/data.json';
}
//#endregion
//#region Methods
//Called each time pick up is collected
function spawnNewSnakeSegment(){
    snakeLength += 1;
    let newId = snakeLength.toString();
    let body = new SnakeBody(20, "assets/sprites/snakeBodyVertical.png", newId, 0, 0, 10);
    body.setIdle(jsonData.snakeBodyUp);
    entities.push(body);
    isPickUp = false;
    pickUpSound.play();
    updateHighscore();
}
function updateHighscore(){
    highscore = window.localStorage.getItem('highscore');
    let snakeLengthText = snakeLength.toString();
    if(snakeLength < 10) snakeLengthText = "0"+snakeLengthText;
    if(snakeLength > highscore){
        window.localStorage.setItem('highscore', snakeLengthText);
        highscore = window.localStorage.getItem('highscore');
    }
    //temporary until engine text entities added
    let text = document.getElementById("scoreText");
    text.innerText = "Current Score: "+snakeLengthText + " Highscore: " + highscore;
    console.log("Current Score:",snakeLengthText, "Highscore:", highscore);
}
//Currently chooses randomly, Can be improved
function spawnPickUp(){
    let randX = Math.floor(Math.random() * 20);
    let randY = Math.floor(Math.random() * 20);
    if(randX == 0 && randY == 0) randX += 1;
    if(randX == START_X && randY == START_Y) randX += 1;
    if(grid[randX][randY] != null) return;
    let p = new PickUp(randX, randY);
    p.setIdle(jsonData.pickUp);
    entities.push(p);
    grid[randX][randY] = p;
    isPickUp = true;
}
function gameOver(){
    console.log("game over");
    resetGame();
}
//#endregion
//#region Entity Child Classes
//Parent class for all elements that exist in the grid
class SnakePiece extends Entity{
    segmentNo;
    gridX;
    gridY;
    prevGridX;
    prevGridY;
    constructor(height, imageUrl, id, x, y){
        super(height, imageUrl, id, x*20, y*20);
        this.segmentNo = parseInt(id);
        this.gridX = x;
        this.gridY = y;
    }
    //Handles interactions with grid variable
    placeInGrid(x,y){
        
        let toX = x;
        let toY = y;
        if(toX > 19 || toY > 19 || toX < 0 || toY < 0){
            gameOver();
            return;
        } 
        if(!(this.gridX == toX && this.gridY == toY)){
            if(grid[toX][toY] != null && this.segmentNo == 0){
                let gridEntity = grid[toX][toY];
                if(gridEntity.segmentNo == "p") {
                    spawnNewSegment = true;
                    gridEntity.destroy();
                }
                else if(gridEntity.segmentNo != snakeLength) {
                    gameOver();
                    return;
                }
            }
            grid[this.gridX][this.gridY] = null;
            this.prevGridX = this.gridX;
            this.prevGridY = this.gridY;
            this.gridX = toX;
            this.gridY = toY;  
            grid[this.gridX][this.gridY] = this;
            this.setPosition(this.gridX*20,this.gridY*20);
        }    
    }
}
//Snake head class including player controls
class SnakeHead extends SnakePiece{
    moveDirection = "up";
    constructor(height, imageUrl, id, x, y){
        super(height, imageUrl, id, x, y);
    }
    update(){
        //Movement handling
        switch(this.moveDirection){
            case "up":
                this.placeInGrid(this.gridX, this.gridY - 1);
                this.setIdle(jsonData.snakeHeadUp);
                break;
            case "down":
                this.placeInGrid(this.gridX, this.gridY + 1);
                this.setIdle(jsonData.snakeHeadDown);
                break;
            case "left":
                this.placeInGrid(this.gridX - 1, this.gridY);
                this.setIdle(jsonData.snakeHeadLeft);
                break;
            case "right":
                this.placeInGrid(this.gridX + 1, this.gridY);
                this.setIdle(jsonData.snakeHeadRight);
                break;
        }
    }
    //Input handling
    handleLeftInput(){
        if(this.moveDirection == "up" || this.moveDirection == "down"){
            this.moveDirection = "left";
        }     
    }
    handleRightInput(){
        if(this.moveDirection == "up" || this.moveDirection == "down"){
            this.moveDirection = "right";
        }  
    }
    handleUpInput(){
        if(this.moveDirection == "left" || this.moveDirection == "right"){
            this.moveDirection = "up";
        }  
    }
    handleDownInput(){
        if(this.moveDirection == "left" || this.moveDirection == "right"){
            this.moveDirection = "down";
        }  
    }
}
//Snake body pieces class
class SnakeBody extends SnakePiece{  
    constructor(height, imageUrl, id, x, y){ 
        super(height, imageUrl, id, x, y);
    }
    update(){
        this.findPosition();
    }
    findPosition(){
        let nextPosX;
        let nextPosY;
        for(let e in entities){
            if(entities[e].segmentNo == this.segmentNo - 1){
                this.placeInGrid(entities[e].prevGridX, entities[e].prevGridY);
                nextPosX = entities[e].gridX; nextPosY = entities[e].gridY;
            }
        }
        //Check for which body piece sprite to use, could be improved
        let prevDifX = this.gridX - this.prevGridX;
        let prevDifY = this.gridY - this.prevGridY;
        let nextDifX = nextPosX - this.gridX;
        let nextDifY = nextPosY - this.gridY;
        if(nextDifX == 0 && prevDifX == 0) this.setIdle(jsonData.snakeBodyVertical);
        else if(nextDifY == 0 && prevDifY == 0) this.setIdle(jsonData.snakeBodyHorizontal);
        else if(nextDifY == 1 && prevDifX == 1) this.setIdle(jsonData.snakeBodyCornerDownLeft);
        else if(nextDifY == 1 && prevDifX == -1) this.setIdle(jsonData.snakeBodyCornerDownRight);
        else if(nextDifY == -1 && prevDifX == 1) this.setIdle(jsonData.snakeBodyCornerUpLeft);
        else if(nextDifY == -1 && prevDifX == -1) this.setIdle(jsonData.snakeBodyCornerUpRight);
        else if(nextDifX == 1 && prevDifY == 1) this.setIdle(jsonData.snakeBodyCornerUpRight);
        else if(nextDifX == 1 && prevDifY == -1) this.setIdle(jsonData.snakeBodyCornerDownRight);
        else if(nextDifX == -1 && prevDifY == 1) this.setIdle(jsonData.snakeBodyCornerUpLeft);
        else if(nextDifX == -1 && prevDifY == -1) this.setIdle(jsonData.snakeBodyCornerDownLeft);
        else this.setIdle(jsonData.blank);
    }
}
//class for apple pick ups
class PickUp extends Entity{
    segmentNo = "p";
    constructor(x, y){
        super(20, "assets/sprites/pickUpAnimations/apple1.png", "p", x*20, y*20);
    }
    update(){};
}
//#endregion