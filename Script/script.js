const canvas = document.getElementById('myCanvas')
const ctx = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 50,
    height: 50,
    color: 'lime',
    dx: 10,
    dy: 5,
    health: 3,

    Draw() {
        ctx.beginPath()
        ctx.rect(this.x, this.y, this.width, this.height)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.closePath()
    },

    DrawCheck() {
        if (this.x + 50 > canvas.width) {
            this.x -= this.dx
        } else if (this.x < 0) {
            this.x += this.dx
        }

        if (this.y + 50 > canvas.height) {
            this.y -= this.dy
        } else if (this.y < 0) {
            this.y += this.dy
        }
    },

    Move() {
        if (rightPressed && !leftPressed) {
            this.x += this.dx
        } else if (!rightPressed && leftPressed) {
            this.x -= this.dx
        }

        if (upPressed && !downPressed) {
            this.y -= this.dy
        } else if (!upPressed && downPressed)
        {
            this.y += this.dy
        }

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

    Draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.closePath()
    }

    Update() {
        this.Draw()
        this.y -= this.velocity
    }
}

class Enemy {
    constructor(x, y, width, height, color, dx, dy, bulletRadius = 3) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color
        this.dx = dx
        this.dy = dy
        this.isBegin = false
        this.bulletRadius = bulletRadius
    }

    Draw() {
        ctx.beginPath()
        ctx.rect(this.x, this.y, this.width, this.height)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.closePath()
    }

    DrawCheck() {
        if (this.x + this.width >= canvas.width) {
            this.dx = -this.dx
        } else if (this.x < 0) {
            this.dx = -this.dx
        }

        if (this.y + this.width >= canvas.height / (3 / 2)) {
            this.dy = -this.dy
        } else if (this.y <= 0 && this.isBegin) {
            this.dy = -this.dy
        }

        if (this.y > 0) {
            this.isBegin = true
        }

    }

    Update () {
        this.DrawCheck()
        this.Draw()
        this.x += this.dx
        this.y += this.dy
    }
}

function keyDownHandler(e) {

    if(e.key === "Right" || e.key === "ArrowRight") {

        rightPressed = true
    }
    else if(e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true
    }
    else if(e.key === "Up" || e.key === "ArrowUp")
    {
        upPressed = true
    }
    else if(e.key === "Down" || e.key === "ArrowDown")
    {
        downPressed = true
    }
}

function keyUpHandler(e) {
    if(e.key === "Right" || e.key === "ArrowRight") {

        rightPressed = false
    }
    else if(e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false
    }
    else if(e.key === "Up" || e.key === "ArrowUp")
    {
        upPressed = false
    }
    else if(e.key === "Down" || e.key === "ArrowDown")
    {
        downPressed = false
    }
}

const bullets = []

function Animate() {
    bullets.forEach(bullet => {
        bullet.Update()
        console.log(bullet.y)
        if (bullet.y < 0)
        {
            bullets.shift()
        }
    })
}

addEventListener('click', () => {
    bullets.push(new Bullet(
        player.x + 25,
        player.y - 5,
        5,
        3,
        'lime',
    ))
})

addEventListener("keydown", keyDownHandler, false);
addEventListener("keyup", keyUpHandler, false);

rightPressed = false
leftPressed = false
upPressed = false
downPressed = false

const enemies = []

function CreateEnemies() {
    enemies.push(new Enemy(0, -50, 50, 50, 'red', 4, 1))
    enemies.push(new Enemy(canvas.width - 51, -50, 50, 50, 'red', -4, 1))
    enemies.push(new Enemy(canvas.width / 3, -200, 50, 50, 'red', 4, 1))
    enemies.push(new Enemy(canvas.width / (3 / 2) - 50, -200, 50, 50, 'red', -4, 1))
    enemies.push(new Enemy(canvas.width / 2, -350, 50, 50, 'red', 4, 1))
}

function CreateBoss() {
    enemies.push(new Enemy(canvas.width / 2, -200, 200, 200, 'firebrick', 1, 1))
}

function FirstWave() {
    CreateEnemies()
}

function SecondWave() {
    CreateEnemies()
    setTimeout(CreateEnemies,10000)
}

function ThirdWave() {
    CreateBoss()
}

function EnemiesMove() {
    enemies.forEach(enemy => {
        enemy.Update()
    })
}

ThirdWave()

function mainDraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    Animate()
    EnemiesMove()
    player.Move()
    player.DrawCheck()
    player.Draw()
    console.log(player.x, canvas.width, player.dx)
}

const gamePlay = setInterval(mainDraw, 16)
