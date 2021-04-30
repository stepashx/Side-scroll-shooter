const canvas = document.getElementById('myCanvas')
const ctx = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

let rightPressed = false
let leftPressed = false
let upPressed = false
let downPressed = false
let spacePressed = false;
let score = 0;
let scoreRecord = 0;
let isKeyboard = false
let isMouse = false
let isMenu = true
let isGame = false
let isEnd = false
let isFirstWave = false
let isSecondWave = false
let isThirdWave = false
const periodForShoot = 17
let nowTimeForShoot = 0
let mx = 0
let my = 0
let Move
let player
const friendBullets = []
const enemyBullets = []
const enemies = []
const buttons = []

class Button {
    constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }
}

class Player {
    constructor(x, y, width = 100, height = 100, dx = 10, dy = 5, health = 3, isGodMod = false, periodOfGodTime = 180, GodModTime = 180) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.dx = dx
        this.dy = dy
        this.health = health
        this.isGodMod = isGodMod
        this.periodOfGodTime = periodOfGodTime
        this.GodModTime = GodModTime
    }
}

function spaceShooting() {
    if (spacePressed){
        if (nowTimeForShoot >= periodForShoot) {
            nowTimeForShoot = 0
            createFriendBullet()
        } else {
            nowTimeForShoot++
        }
    } else {
        nowTimeForShoot = periodForShoot
    }
}

function DrawShield() {
    const shieldModel = new Image();
    shieldModel.src = "img/energy-shield-png.png"
    ctx.drawImage(shieldModel, player.x - 20, player.y - 15, 140, 140);
}

function DrawHealth() {
    ctx.beginPath()
    ctx.fillStyle = "white";
    ctx.font = "30px serif";
    ctx.fillText("HP: " + player.health, canvas.width - 125, 30)
    ctx.closePath()
}

function PlayerAutoShoot() {
    if (nowTimeForShoot >= periodForShoot) {
        nowTimeForShoot = 0
        createFriendBullet()
    } else{
        nowTimeForShoot++
    }
}

function UpdatePlayerCheckForWalls() {
    if (player.x + player.width >= canvas.width) {
        player.x -= player.dx
    } else if (player.x < 0) {
        player.x += player.dx
    }

    if (player.y + 50 > canvas.height) {
        player.y -= player.dy
    } else if (player.y < 0) {
        player.y += player.dy
    }
}

function DrawPlayer() {
    const playerModel = new Image();
    playerModel.src = 'img/player.png';
    ctx.drawImage(playerModel, player.x, player.y, player.width, player.height);
}

function MovePlayerWithKeyboard() {
    if (rightPressed && !leftPressed) {
        player.x += player.dx
    } else if (!rightPressed && leftPressed) {
        player.x -= player.dx
    }

    if (upPressed && !downPressed) {
        player.y -= player.dy
    } else if (!upPressed && downPressed) {
        player.y += player.dy
    }
}

function MovePlayerWithMouse() {
    player.x = mx - 50
    player.y = my - 50
}

function CheckPlayerGodMod () {
    if (player.GodModTime < player.periodOfGodTime) {
        player.GodModTime++
        player.isGodMod = true
        DrawShield()
    } else {
        player.isGodMod = false
    }
}

function checkHealth (character) {
    return character.health <= 0
}

function UpdatePlayer() {
    if (checkHealth(player)) {
        isGame = false
        isEnd = true
        if (score > scoreRecord) {
            scoreRecord = score
        }
    } else {
        if (isMouse) {
            PlayerAutoShoot()
        } else if (isKeyboard) {
            spaceShooting()
        }
        CheckPlayerGodMod()
        UpdatePlayerCheckerForObstacle()
        Move()
        UpdatePlayerCheckForWalls()
        DrawPlayer()
    }
}

class Bullet {
    constructor(x, y, ballRadius, velocity, color) {
        this.x = x
        this.y = y
        this.ballRadius = ballRadius
        this.velocity = velocity
        this.color = color
    }
}

function AnimateBullets() {
    friendBullets.forEach((bullet, index, object) => {
        UpdateBullet(bullet)
        if (bullet.y < 0) {
            bullet = null
            object.splice(index, 1)
        }
    })

    enemyBullets.forEach(function (bullet, index, object) {
        UpdateBullet(bullet)
        if (bullet.y - bullet.ballRadius >= canvas.height) {
            bullet = null
            object.splice(index, 1)
        }
    })
}

function DrawBullet(bullet) {
    ctx.beginPath()
    ctx.arc(bullet.x, bullet.y, bullet.ballRadius, 0, Math.PI * 2, false)
    ctx.fillStyle = bullet.color
    ctx.fill()
    ctx.closePath()
}

function UpdateBullet(bullet) {
    DrawBullet(bullet)
    bullet.y -= bullet.velocity
}

function createFriendBullet() {
    friendBullets.push(new Bullet(
        player.x + 50,
        player.y + 5,
        5,
        8,
        'lime'
    ))
}

class Enemy {
    constructor(x, y, dx, image = 'img/enemy.png', width = 100, height = 100, dy = 1, health = 3, bulletRadius = 5, bulletSpeed = -5, periodOfShooting = 45, timeAtNow = 45) {
        this.x = x
        this.y = y
        this.image = image
        this.width = width
        this.height = height
        this.dx = dx
        this.dy = dy
        this.isBegin = false
        this.health = health
        this.bulletRadius = bulletRadius
        this.bulletSpeed = bulletSpeed
        this.periodOfShooting = periodOfShooting
        this.timeAtNow = timeAtNow
    }
}

function DrawEnemy(enemy) {
    const enemyModel = new Image();
    enemyModel.src = enemy.image;
    ctx.drawImage(enemyModel, enemy.x, enemy.y, enemy.width, enemy.height);
}

function EnemiesMove() {
    enemies.forEach((enemy, enemyIndex) => {
        friendBullets.forEach((bullet, bulletIndex) => {
            if (PointInTexture(bullet.x + bullet.ballRadius, bullet.y, enemy) ||
                PointInTexture(bullet.x - bullet.ballRadius, bullet.y, enemy) ||
                PointInTexture(bullet.x, bullet.y + bullet.ballRadius, enemy) ||
                PointInTexture(bullet.x, bullet.y - bullet.ballRadius, enemy) ||
                PointInTexture(bullet.x + bullet.ballRadius, bullet.y + bullet.ballRadius, enemy) ||
                PointInTexture(bullet.x - bullet.ballRadius, bullet.y + bullet.ballRadius, enemy) ||
                PointInTexture(bullet.x + bullet.ballRadius, bullet.y - bullet.ballRadius, enemy) ||
                PointInTexture(bullet.x - bullet.ballRadius, bullet.y - bullet.ballRadius, enemy)) {
                bullet = null
                friendBullets.splice(bulletIndex, 1)
                enemy.health--
            }
        })

        if (checkHealth(enemy)) {
            score += Math.trunc(Math.random() * (100 - 50) + 50)
            enemy = null
            enemies.splice(enemyIndex, 1)
        } else {
            EnemyUpdate(enemy)
        }
    })
}

function UpdateEnemyCheckForWalls(enemy) {
    if (enemy.x + enemy.width >= canvas.width) {
        enemy.dx = -enemy.dx
    } else if (enemy.x < 0) {
        enemy.dx = -enemy.dx
    }

    if (enemy.y + enemy.width >= canvas.height / (3 / 2)) {
        enemy.dy = -enemy.dy
    } else if (enemy.y <= 0 && enemy.isBegin) {
        enemy.dy = -enemy.dy
    }

    if (enemy.y > 0) {
        enemy.isBegin = true
    }
}

function EnemyShoot (enemy) {
    if (enemy.timeAtNow >= enemy.periodOfShooting && enemy.isBegin) {
        enemy.timeAtNow = 0
        enemyBullets.push(new Bullet(
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height + enemy.bulletRadius,
            enemy.bulletRadius,
            enemy.bulletSpeed,
            'red'
        ))
    }
}

function EnemyUpdate (enemy) {
    enemy.timeAtNow++
    EnemyShoot(enemy)
    UpdateEnemyCheckForWalls(enemy)
    DrawEnemy(enemy)
    enemy.x += enemy.dx
    enemy.y += enemy.dy
}

function CheckEnemies() {
    return enemies.length <= 0
}

function CreateEnemies() {
    enemies.push(new Enemy(
        0,
        -50,
        4
    ))
    enemies.push(new Enemy(
        canvas.width - 101,
        -50,
        -4
    ))
    enemies.push(new Enemy(
        canvas.width / 3,
        -200,
        4
    ))
    enemies.push(new Enemy(
        canvas.width / (3 / 2) - 50,
        -200,
        -4
    ))
}

function CreateBoss() {
    enemies.push(new Enemy(
        canvas.width / 2,
        -200,
        4,
        'img/boss.png',
        300,
        200,
        1,
        60,
        10,
        -10,
        25,
        25
    ))

}

function FirstWave() {
    CreateEnemies()
}
function SecondWave() {
    CreateEnemies()
    setTimeout(CreateEnemies,7500)

}
function ThirdWave() {
    CreateBoss()
}

function UpdatePlayerCheckerForObstacle () {
    enemyBullets.forEach((bullet, index) => {
        if (PointInTexture(bullet.x + bullet.ballRadius, bullet.y, player) ||
            PointInTexture(bullet.x - bullet.ballRadius, bullet.y, player) ||
            PointInTexture(bullet.x, bullet.y + bullet.ballRadius, player) ||
            PointInTexture(bullet.x, bullet.y - bullet.ballRadius, player) ||
            PointInTexture(bullet.x + bullet.ballRadius, bullet.y + bullet.ballRadius, player) ||
            PointInTexture(bullet.x - bullet.ballRadius, bullet.y + bullet.ballRadius, player) ||
            PointInTexture(bullet.x + bullet.ballRadius, bullet.y - bullet.ballRadius, player) ||
            PointInTexture(bullet.x - bullet.ballRadius, bullet.y - bullet.ballRadius, player)
        ) {
            bullet = null
            enemyBullets.splice(index, 1)
            if (!player.isGodMod) {
                player.health--
            }
            if (player.health > 0 && !player.isGodMod) {
                player.GodModTime = 0
            }
        }
    })

    enemies.forEach(enemy => {
        if (PointInTexture(player.x, player.y, enemy) ||
            PointInTexture(player.x + player.width, player.y, enemy) ||
            PointInTexture(player.x + player.width, player.y + player.height, enemy) ||
            PointInTexture(player.x, player.y + player.height, enemy)
        ) {
            if (!player.isGodMod) {
                player.health--
            }
            if (player.health > 0 && !player.isGodMod) {
                player.GodModTime = 0
            }
        }
    })
}

function keyDownHandler(e) {
    if(e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true
    } else if(e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true
    } else if(e.key === "Up" || e.key === "ArrowUp") {
        upPressed = true
    } else if(e.key === "Down" || e.key === "ArrowDown") {
        downPressed = true
    }
    if(e.key === ' ') {
        spacePressed = true
    }
}
function keyUpHandler(e) {
    if(e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false
    } else if(e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false
    } else if(e.key === "Up" || e.key === "ArrowUp") {
        upPressed = false
    } else if(e.key === "Down" || e.key === "ArrowDown") {
        downPressed = false
    }
    if(e.key === ' ') {
        spacePressed = false
    }
}

addEventListener("keydown", keyDownHandler);
addEventListener("keyup", keyUpHandler);

function drawStartMenu() {
    ctx.beginPath()
    ctx.font = "50px serif";
    ctx.fillStyle = "white";
    ctx.fillText("SCORE RECORD: " + scoreRecord, canvas.width / 2, canvas.height / 2 - 65);
    ctx.font = "40px serif";
    ctx.fillText("SELECT CONTROL", canvas.width / 2, canvas.height / 2);
    ctx.fillText("Play with keyboard!(*space* for shooting)", canvas.width / 2, canvas.height / 2 + 65);
    ctx.fillText("OR", canvas.width / 2, canvas.height / 2 + 130);
    ctx.fillText("Play with mouse!(auto shooting)", canvas.width / 2, canvas.height / 2 + 195);
    ctx.closePath()
}

function drawLoseMenu() {
    ctx.beginPath()
    ctx.font = "50px serif";
    ctx.fillStyle = "white";
    ctx.fillText("YOU LOSE!", canvas.width / 2, canvas.height / 2 - 195);
    ctx.fillText("YOUR SCORE: " + score, canvas.width / 2, canvas.height / 2 - 130);
    ctx.fillText("SCORE RECORD: " + scoreRecord, canvas.width / 2, canvas.height / 2 - 65);
    ctx.font = "40px serif";
    ctx.fillText("SELECT CONTROL", canvas.width / 2, canvas.height / 2);
    ctx.fillText("Play with keyboard!(*space* for shooting)", canvas.width / 2, canvas.height / 2 + 65);
    ctx.fillText("OR", canvas.width / 2, canvas.height / 2 + 130);
    ctx.fillText("Play with mouse!(auto shooting)", canvas.width / 2, canvas.height / 2 + 195);
    ctx.closePath()
}

function DrawScore() {
    ctx.beginPath()
    ctx.fillStyle = "white";
    ctx.font = "40px serif";
    ctx.fillText("Score: " + score, 20, 40)
    ctx.closePath()
}

function PointInTexture(pointX, pointY ,character) {
    return pointX >= character.x &&
        pointX <= character.x + character.width &&
        pointY >= character.y &&
        pointY <= character.y + character.height;
}

buttons.push(new Button(
    canvas.width / 2,
    canvas.height / 2 + 65 - 40,
    40 * "Play with keyboard!(*space* for shooting)".length,
    40)
)
buttons.push(new Button(
    canvas.width / 2,
    canvas.height / 2 + 195 - 40,
    40 * "Play with mouse!(auto shooting)".length,
    40)
)

addEventListener('click', function(event)
{
    onmousemove = function (event) {
        mx = event.x
        my = event.y
        console.log(mx, my)
    }
    if (PointInTexture(mx, my, buttons[0]) && (isMenu || isEnd))
    {
        isKeyboard = true
        isMouse = false
        Move = MovePlayerWithKeyboard
        isMenu = false
        isEnd = false
        isGame = true
        while (enemies.length > 0) {
            enemies.pop()
        }
        while (friendBullets.length > 0) {
            friendBullets.pop()
        }
        while (enemyBullets.length > 0) {
            enemyBullets.pop()
        }
        player = new Player(canvas.width / 2 - 25, canvas.height - 100)
        isFirstWave = false
        isSecondWave = false
        isThirdWave = false
        score = 0
    }
    else if (PointInTexture(mx, my, buttons[1]) && (isMenu || isEnd))
    {
        isMouse = true
        isKeyboard = false
        Move = MovePlayerWithMouse
        isMenu = false
        isEnd = false
        isGame = true
        while (enemies.length > 0) {
            enemies.pop()
        }
        while (friendBullets.length > 0) {
            friendBullets.pop()
        }
        while (enemyBullets.length > 0) {
            enemyBullets.pop()
        }
        player = new Player(canvas.width / 2 - 25, canvas.height - 100)
        isFirstWave = false
        isSecondWave = false
        isThirdWave = false
        score = 0
    }
    else if (isGame && isKeyboard)
    {
        createFriendBullet()
    }
});

function mainDraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (isMenu) {
        drawStartMenu()
    } else if (isGame) {
        if (!isFirstWave) {
            FirstWave()
            isFirstWave = true
        } else if (!isSecondWave && CheckEnemies()) {
            SecondWave()
            isSecondWave = true
        } else if (!isThirdWave && CheckEnemies()) {
            ThirdWave()
            isThirdWave = true
        } else if (CheckEnemies()) {
            isFirstWave = false
            isSecondWave = false
            isThirdWave = false
        }
        DrawScore()
        DrawHealth()
        UpdatePlayer()
        AnimateBullets()
        EnemiesMove()
    } else if (isEnd) {
        drawLoseMenu()
    }
}

setInterval(mainDraw, 16)
