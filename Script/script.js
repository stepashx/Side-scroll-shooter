const canvas = document.getElementById('myCanvas')
const ctx = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    dx: 2,
    health: 3,

    Draw() {
        ctx.beginPath()
        ctx.rect(this.x, this.y, 50, 50)
        ctx.fillStyle = "lime"
        ctx.fill()
        ctx.closePath()
    },

    DrawCheck() {
        if (this.x + 50 > canvas.width)
        {
            this.x -= this.dx
        }

        if (this.x < 0)
        {
            this.x += this.dx
        }
    },

    Move() {
        if (rightPressed && !leftPressed)
        {
            this.x += this.dx
        }

        else if (!rightPressed && leftPressed)
        {
            this.x -= this.dx
        }
    }
}

class Bullet {
    constructor(x, y, ballRadius, velocity, color, side) {
        this.x = x
        this.y = y
        this.ballRadius = ballRadius
        this.velocity = velocity
        this.color = color
        this.side = side
    }

    Draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI * 2, false)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.closePath()
    }

    Update() {
        this.y -= this.velocity
    }

    Animate () {
        requestAnimationFrame(this.Animate)
        this.Draw()
        this.Update()
    }
}

addEventListener('click', () => {
    const bullet = new Bullet(player.x + 25, player.y, 5, 3, 'green', 'friend' )
    bullet.Animate()
})

addEventListener("keydown", keyDownHandler, false);
addEventListener("keyup", keyUpHandler, false);

rightPressed = false
leftPressed = false

function keyDownHandler(e) {
    if(e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    }
    else if(e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if(e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    }
    else if(e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function mainDraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    player.Move()
    player.DrawCheck()
    player.Draw()
    console.log(player.x, canvas.width, player.dx)
}

setInterval(mainDraw, 10)

