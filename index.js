const canvas = document.querySelector('canvas')
const sidebar = document.getElementById('sidebar')
const help_message = document.getElementById('help-message')
width = window.innerWidth
height = window.innerHeight
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const ctx = canvas.getContext('2d')
let time = 0.0
let direction = 'up'
let paused = false;
const radius = 5
let selectedPoint = null
let curve = []
let currentTab = document.getElementById('point-tab')
currentTab.classList.toggle('selected-tab')
const points = []
points.draw = drawPoints

function distance(x,y,a,b){
    return Math.sqrt((x-a)**2 + (b-y)**2)
}

function drawPoint() {
    ctx.strokeStyle = 'black'
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, 6.28, false)
    ctx.stroke()
}

function drawPoints(){
    ctx.strokeStyle = 'black'
    if (this.length == 0) 
        return
    this.forEach(p => {
        p.draw()
    })
    ctx.beginPath()
    ctx.moveTo(this[0].x, this[0].y)
    for (let i = 1; i < this.length; i++){
        ctx.lineTo(this[i].x, this[i].y)
    }
    ctx.stroke()
}

function drawCurve(points) {
    ctx.strokeStyle = 'red'
    ctx.beginPath()
    for (let i = 0; i < points.length - 1; i++) {
        ctx.moveTo(points[i].x, points[i].y)
        ctx.lineTo(points[i+1].x, points[i+1].y)
    }
    ctx.stroke()
    ctx.strokeStyle = 'black'
}

function Point(x, y) {
    this.x = x 
    this.y = y
    this.r = radius
    this.draw = drawPoint
}

function plot(a) {
    if (a.length == 0) {
        drawCurve(curve)
        return
    }
    if (a.length == 1){
        if (!paused) curve.push(a[0])
    }
    a.draw()
    const b = []
    b.draw = drawPoints
    for (let i = 0; i < a.length - 1; i++) {
        const x = ( a[i+1].x - a[i].x)*time + a[i].x
        const y = ( a[i+1].y - a[i].y)*time + a[i].y
        b.push(new Point(x,y))
    }
    plot(b)
}

function select(x,y){
    for (let i = 0; i < points.length; i++) {
        if (distance(points[i].x, points[i].y, x, y) < radius) 
            return points[i]
    }
    return null
}

window.addEventListener('resize', () => {
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
})

document.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect()
    selectedPoint = select(event.x - rect.x, event.y - rect.y)
})

document.addEventListener('mousemove', (event) => {
    if (selectedPoint != null) {
        selectedPoint.x = event.x
        selectedPoint.y = event.y
        curve = []
    } 
})

document.addEventListener('mouseup', (event) => {
    if (event.target != canvas) return
    if (selectedPoint == null) {
        points.push(new Point(event.x, event.y))
        curve = []
    }
    selectedPoint = null
})

sidebar.addEventListener('click', (event) => {
    switch (event.target.id) {
        case 'delete': 
            const length = points.length
            for (let i = 0; i < length; i++) {
                points.pop()
            }
            curve = [];
            break;
        case 'help': document.getElementById('help-message').classList.toggle('hidden'); break;
        case 'settings': 
            document.getElementById('settings-container').classList.toggle('hidden'); 
            document.getElementById('settings-container').addEventListener('click', function f(event) {
                currentTab.classList.toggle('selected-tab')
                currentTab = event.target
                currentTab.classList.toggle('selected-tab')
            }); 
            break;
        case 'pause': paused= !paused; break;
    }
})

setInterval( () => {
    ctx.clearRect(0,0,canvas.width,canvas.height)
    if (!paused) {
        if (direction == 'up') time += 0.01
        else time -= 0.01
        if (time > 1.0) {
            direction = 'down'
            curve = []
        }
        if (time < 0.0) {
            direction = 'up'
            curve = []
        }
    }
    plot(points)
}, 30)