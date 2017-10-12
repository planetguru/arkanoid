const UP = 1
const DOWN = 0
const LEFT = 0
const RIGHT = 1
const STRAIGHT = 2

function moveRight() {
    unplotPaddle(paddle);
    if (paddle.RPoint.XPos < 4) {
        paddle.RPoint.XPos++;
        paddle.MPoint.XPos++;
        paddle.LPoint.XPos++;
    }
    plotPaddle(paddle)
}
function moveLeft() {
    unplotPaddle(paddle);
    if (paddle.LPoint.XPos > 0) {
        paddle.RPoint.XPos--;
        paddle.MPoint.XPos--
        paddle.LPoint.XPos--;
    }
    plotPaddle(paddle)
}
basic.forever(() => {
    input.onButtonPressed(Button.B, () => {
        moveRight()
    })
    input.onButtonPressed(Button.A, () => {
        moveLeft()
    })
})
basic.forever(() => {
    basic.pause(2000)
    while (true) {
        ball.animate();
        basic.pause(500)
    }
})

// build a wall 
let wall: Point[] = [new Point(0, 0),
new Point(1, 0), new Point(2, 0), new Point(3, 0),
new Point(4, 0),
new Point(0, 1), new Point(1, 1), new Point(2, 1), new Point(3, 1),
new Point(4, 1),
]

for (let pt of wall) { led.plot(pt.XPos, pt.YPos) }

// make a paddle
let paddle: Paddle = new Paddle();
plotPaddle(paddle);

// make a ball - define starting position
let ball: Ball = new Ball(3, 3);
ball.draw();

// set the ball direction
ball.setVerticalDirection(UP);
ball.setHorizontalDirection(RIGHT);
function plotPaddle(Pad: Paddle) {
    for (let pt of Pad.getPoints()) {
        led.plot(pt.XPos, pt.YPos)
    }
}
function unplotPaddle(Pad: Paddle) {
    for (let pt2 of Pad.getPoints()) {
        led.unplot(pt2.XPos, pt2.YPos)
    }
}
class Paddle {
    LPoint: Point;
    MPoint: Point;
    RPoint: Point;
    points: Point[];

    constructor() {
        this.LPoint = new Point(2, 4);
        this.MPoint = new Point(3, 4);
        this.RPoint = new Point(4, 4);

        this.points = [
            this.LPoint, this.MPoint, this.RPoint
        ];
    }

    getPoints(): Point[] {
        return this.points
    }

    // boolean check if paddle is on a point
    isOnPoint(x: number, y: number): boolean {
        if (this.LPoint.XPos == x && this.LPoint.YPos == y) {
            return true
        }
        if (this.MPoint.XPos == x && this.LPoint.YPos == y) {
            return true
        }
        if (this.RPoint.XPos == x && this.RPoint.YPos == y) {
            return true
        }
        return false;
    }

    // boolean check if paddle upper corner on a point
    hasCornerTouching(x: number, y: number): boolean {
        if (this.LPoint.XPos - 1 == x && this.LPoint.YPos == y) {
            return true
        }
        if (this.RPoint.XPos + 1 == x && this.RPoint.YPos == y) {
            return true
        }
        return false;
    }

    hasRightCornerTouching(x: number, y: number): boolean {
        if (this.RPoint.XPos + 1 == x && this.LPoint.YPos == y) {
            return true;
        }
        return false;
    }

    hasLeftCornerTouching(x: number, y: number): boolean {
        if (this.LPoint.XPos - 1 == x && this.LPoint.YPos == y) {
            return true
        }
        return false;
    }

    isTouchingCentre(x: number, y: number): boolean {
        //console.log("CHECK")
        if (this.MPoint.XPos == x && this.MPoint.YPos == y) {
            return true
        }
        return false;
    }
}
class Ball extends Point {
    horizontalDirection: number;  // up:1 down:0
    verticalDirection: number; // right:1 left: 0
    originalXPos: number;
    originalYPos: number;

    undraw() {
        led.unplot(this.XPos, this.YPos);
    }
    draw() {
        led.plot(this.XPos, this.YPos);
    }
    setVerticalDirection(direction: number) {
        this.verticalDirection = direction;
    }
    setHorizontalDirection(direction: number) {
        this.horizontalDirection = direction;
    }

    animate() {
        this.undraw();
        this.originalXPos = this.XPos;
        this.originalYPos = this.YPos;

        // if ball is touching the paddle, bounce up
        if (true == this.isOnPaddle()) {
            this.paddleBounce();
        }

        if (true == this.isOnPaddleCentre()) {
            // console.log("CENTRE")
            this.paddleCentreBounce();
        } else {
            //console.log("NOCENTRE")
        }

        if (true == this.isOnPaddleCorner()) {
            this.paddleCornerBounce();
        }

        // if ball is on boundary, switch direction
        if (true == this.isOnBoundary()) {
            this.boundaryBounce();
        }

        // if new pixel has a brick in it, don't redraw
        this.move()
        this.draw();
    }

    boundaryBounce() {
        // which boundary?
        if (true == this.onLeftBoundary()) {
            this.setHorizontalDirection(RIGHT);
        }
        if (true == this.onRightBoundary()) {
            this.setHorizontalDirection(LEFT)
        }
        if (true === this.onTopBoundary()) {
            this.setVerticalDirection(DOWN)
            if (this.horizontalDirection == STRAIGHT) {
                this.setHorizontalDirection(LEFT)
            }
        }
        if (true == this.onBottomBoundary()) {
            gameEnd();
        }
    }

    paddleBounce() {
        if (DOWN == this.verticalDirection) {
            this.setVerticalDirection(UP);
        }
    }

    paddleCornerBounce() {
        // if ball is moving left towards right corner, or
        // if ball is moving right towards left corner, then 
        // switch the horizontal direction
        if (this.horizontalDirection == LEFT && this.isOnPaddleRightCorner()) {
            this.setHorizontalDirection(RIGHT);
        }
        if (this.horizontalDirection == RIGHT && this.isOnPaddleLeftCorner()) {
            this.setHorizontalDirection(LEFT);
        }
    }

    paddleCentreBounce() {
        this.setHorizontalDirection(STRAIGHT);
    }

    move() {
        if (RIGHT == this.horizontalDirection) {
            this.XPos++;
        }
        if (LEFT == this.horizontalDirection) {
            this.XPos--;
        }
        if (UP == this.verticalDirection) {
            this.YPos--;
        } else {
            this.YPos++;
        }
    }

    isOnPaddle(): boolean {
        if (this.YPos != 3) {
            return false;
        }
        // ypos is 3 check point for paddle is 1 point below the ball
        let ypoint = this.YPos + 1;
        //console.log("paddle check:" + this.XPos + ", " + ypoint)
        if (paddle.isOnPoint(this.XPos, ypoint)) {
            return true;
        }
        if (paddle.hasCornerTouching(this.XPos, ypoint)) {
            return true;
        }
        console.log("nohit")
        return false
    }

    isOnPaddleCorner(): boolean {
        if (this.YPos != 3) {
            return false;
        }
        // ypos is 3 check point for paddle is 1 point below the ball
        let ypoint = this.YPos + 1;

        if (paddle.hasCornerTouching(this.XPos, ypoint)) {
            return true;
        }
        return false
    }

    isOnPaddleCentre(): boolean {
        if (this.YPos != 3) {
            return false;
        }
        // ypos is 3 check point for paddle is 1 point below the ball
        let ypoint = this.YPos + 1;

        if (paddle.isTouchingCentre(this.XPos, ypoint)) {
            return true;
        }
        return false
    }

    isOnPaddleRightCorner(): boolean {
        if (paddle.hasRightCornerTouching(this.XPos, this.YPos + 1)) {
            return true;
        }
        return false;
    }

    isOnPaddleLeftCorner(): boolean {
        if (paddle.hasLeftCornerTouching(this.XPos, this.YPos + 1)) {
            return true;
        }
        return false;
    }

    isOnBoundary(): boolean {
        if (this.XPos == 0 ||
            this.XPos == 4 ||
            this.YPos == 0 ||
            this.YPos == 4) {
            return true;
        } else {
            return false
        }
    }
    onLeftBoundary(): boolean {
        if (this.XPos == 0) {
            return true;
        }
        return false;
    }
    onRightBoundary(): boolean {
        if (this.XPos == 4) {
            return true;
        }
        return false
    }
    onTopBoundary(): boolean {
        if (this.YPos == 0) {
            return true;
        }
        return false;
    }
    onBottomBoundary(): boolean {
        if (this.YPos == 4) {
            return true;
        }
        return false
    }
}

class Point {
    XPos: number;
    YPos: number;

    constructor(x: number, y: number) {
        this.XPos = x;
        this.YPos = y;
    }

    set(x: number, y: number) {
        console.log("now setting a ball point x,y to: " + x + ", " + y)
        this.XPos = x;
        this.YPos = y;
    }
}

function gameEnd() {
    led.plotAll();
}
