$(function() {
    var CANVAS_WIDTH  = 720;
    var CANVAS_HEIGHT = 500;

    var FPS = 45;

    var PADDLE_WIDTH  = 8;
    var PADDLE_HEIGHT = 50;
    var PADDLE_SPEED  = 10;

    var L_PADDLE = {
        x: 2,
        y: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2
    };
    var R_PADDLE = {
        x: CANVAS_WIDTH - PADDLE_WIDTH - 2,
        y: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2
    };

    var BALL_MAX_SPEED = 25;

    var BUTTON_UP   = 38;
    var BUTTON_DOWN = 40;

    var DOM_CONTAINER = '#pong';

    var canvasElement = $("<canvas/>").attr({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
    var context       = canvasElement.get(0).getContext('2d');

    var isUp   = false;
    var isDown = false;

    var leftPaddle  = null;
    var rightPaddle = null;
    var ball        = null;
    var scoreP1     = 0;
    var scoreP2     = 0;

    var Paddle = function(options)
    {
        var options = options || {};

        var defaults = {
            x: 0,
            y: 0,
            width: 10,
            height: 75,
            speed: 10,
            yMinLimit: 0,
            yMaxLimit: 80
        };

        var self = $.extend({}, defaults, options);

        self.draw = function()
        {
            context.beginPath();
            context.rect(self.x, self.y, self.width, self.height);
            context.closePath();
            context.fillStyle = '#eee';
            context.fill();
        };

        self.update = function(direction)
        {
            var direction = direction || "";

            if ( direction == "UP" )
            {
                self.y = self.y + -self.speed >= self.yMinLimit ? (self.y - self.speed) : self.y;
            }
            if ( direction == "DOWN" )
            {
                self.y = self.y + self.height + self.speed <= self.yMaxLimit ? (self.y + self.speed) : self.y;
            }
        };

        return self;
    };

    var Ball = function(options)
    {
        var options = options || {};

        var defaults = {
            x: 0,
            y: 0,
            radius: 10,
            xSpeed: 4,
            ySpeed: 4,
            xMinLimit: 0,
            xMaxLimit: 20,
            yMinLimit: 0,
            yMaxLimit: 20
        };

        var self = $.extend({}, defaults, options);

        self.limitDHit = null;

        self.draw = function()
        {
            context.beginPath();
            context.arc(self.x, self.y, self.radius, 0, 2 * Math.PI, true);
            context.closePath();
            context.fillStyle = '#eee';
            context.fill();
        };

        self.update = function()
        {
            self.limitDHit = "";

            if ( self.x - self.radius + self.xSpeed <= self.xMinLimit || self.x + self.radius + self.xSpeed >= self.xMaxLimit )
            {
                if ( self.xSpeed < 0 )
                {
                    self.limitDHit = "LEFT";
                }
                else
                {
                    self.limitDHit = "RIGHT";
                }

                self.xSpeed = -self.xSpeed;
            }
            if ( self.y - self.radius + self.ySpeed <= self.yMinLimit || self.y + self.radius + self.ySpeed >= self.yMaxLimit )
            {
                if ( self.yMinLimit < 0 )
                {
                    self.limitDHit = "TOP";
                }
                else
                {
                    self.limitDHit = "BOTTOM";
                }

                self.ySpeed = -self.ySpeed;
            }

            self.x += self.xSpeed;
            self.y += self.ySpeed;
        };

        return self;
    };

    var hasCollision = function(a, b)
    {
        return a.x <= b.x + b.width &&
            a.x + a.width >= b.x &&
            a.y <= b.y + b.height &&
            a.y + a.height >= b.y;
    };

    var hasCollisionMM = function(a, b)
    {
        var xMin = Math.max(a.x, b.x);
        var yMin = Math.max(a.y, b.y);
        var xMax = Math.min(a.x + a.width, b.x + b.width);
        var yMax = Math.min(a.y + a.height, b.y + b.height);

        return !( xMin >= xMax || yMin >= yMax );
    }

    var triggerKeyDown = function(event)
    {
        if ( event.which === BUTTON_UP )
        {
            event.preventDefault();

            isUp = true;
        }
        if ( event.which === BUTTON_DOWN )
        {
            event.preventDefault();

            isDown = true;
        }
    }

    var triggerKeyUp = function(event)
    {
        if ( event.which === BUTTON_UP )
        {
            isUp = false;
        }
        if ( event.which === BUTTON_DOWN )
        {
            isDown = false;
        }
    }

    var init = function()
    {
        leftPaddle = new Paddle({
            x: L_PADDLE.x,
            y: L_PADDLE.y,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            speed: PADDLE_SPEED,
            yMinLimit: 0,
            yMaxLimit: CANVAS_HEIGHT
        });

        rightPaddle = new Paddle({
            x: R_PADDLE.x,
            y: R_PADDLE.y,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            paddle: PADDLE_SPEED,
            yMinLimit: 0,
            yMaxLimit: CANVAS_HEIGHT
        });

        ball = new Ball({
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2,
            radius: 5,
            xSpeed: 4 * (Math.floor(Math.random() * 2) ? 1 : -1), // Left it be 4 to prevent unwanted collision behavior
            ySpeed: (Math.random() * 4) * (Math.floor(Math.random() * 2) ? 1 : -1),
            xMinLimit: 0,
            xMaxLimit: CANVAS_WIDTH,
            yMinLimit: 0,
            yMaxLimit: CANVAS_HEIGHT
        });

        $(document).keydown(triggerKeyDown).keyup(triggerKeyUp);

        $(canvasElement).appendTo(DOM_CONTAINER);
    };

    var draw = function()
    {
        // Clear canvas field
        context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        context.beginPath();
        context.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        context.closePath();
        context.fillStyle = '#000';
        context.fill();

        // Draw dashed middle line
        var currentPoint = 0;
        context.beginPath();
        context.strokeStyle = '#eee';
        context.lineWidth   = 2;
        context.moveTo(CANVAS_WIDTH / 2, 0);
        while ( currentPoint < CANVAS_HEIGHT )
        {
            currentPoint += 6; // Length of stroke
            context.lineTo(CANVAS_WIDTH / 2, currentPoint);
            currentPoint += 6; // Spaces between strokes
            context.moveTo(CANVAS_WIDTH / 2, currentPoint);
        }
        context.closePath();
        context.stroke();

        context.fillStyle = '#eee';
        context.font      = '40px Verdana';
        context.textAlign = 'end';
        context.fillText(scoreP1, (CANVAS_WIDTH / 2) - 20 , 50);
        context.textAlign = 'start';
        context.fillText(scoreP2, (CANVAS_WIDTH / 2) + 20 , 50);

        leftPaddle.draw();
        rightPaddle.draw();
        ball.draw();
        ball.update();

        if ( isUp )
        {
            leftPaddle.update("UP");
        }
        if ( isDown )
        {
            leftPaddle.update("DOWN");
        }

        // Delay reaction of 40% (0.0 - 1.0)
        if ( Math.random() > 0.40 )
        {
            if ( rightPaddle.y > ball.y - ball.radius )
            {
                rightPaddle.update("UP");
            }
            else if ( rightPaddle.y + rightPaddle.height < ball.y + ball.radius )
            {
                rightPaddle.update("DOWN");
            }
            else
            {
                // 30% chance of centering the paddle
                if ( Math.random() > 0.7 )
                {
                    //if ( Math.abs(ball.y - rightPaddle.y) < Math.abs(ball.y - rightPaddle.y - rightPaddle.height) )
                    if ( rightPaddle.y + Math.floor(rightPaddle.height / 2) > ball.y )
                    {
                        rightPaddle.update("UP");
                    }
                    //else if ( Math.abs(ball.y - rightPaddle.y + rightPaddle.height) < Math.abs(ball.y - rightPaddle.y + rightPaddle.height - rightPaddle.height) )
                    if ( rightPaddle.y + Math.floor(rightPaddle.height / 2) < ball.y )
                    {
                        rightPaddle.update("DOWN");
                    }
                }
            }
        }

        if ( ball.limitDHit == "LEFT" )
        {
            scoreP2++;
        }
        if ( ball.limitDHit == "RIGHT" )
        {
            scoreP1++;
        }

        var a = {
            x: leftPaddle.x,
            y: leftPaddle.y,
            width: leftPaddle.width + Math.abs(ball.xSpeed),
            height: leftPaddle.height
        };
        var b = {
            x: ball.x,
            y: ball.y,
            width: ball.radius * 2,
            height: ball.radius * 2
        };
        var c = {
            x: rightPaddle.x,// - Math.abs(ball.xSpeed),
            y: rightPaddle.y,
            width: rightPaddle.width,// + Math.abs(ball.xSpeed),
            height: rightPaddle.height
        };

        if ( hasCollision(a, b) )
        {
            console.log("Left Collide!");
            ball.xSpeed = -ball.xSpeed;
            // Check the position where the paddle the ball collides and determine the amount of y speed (divide by paddle height [percent], multiply by 8)
            // Max 4 - Min -4 = 8, Max 5 - Min -5 = 10
            ball.ySpeed = 10 * ((ball.y - (leftPaddle.y + leftPaddle.height / 2)) / leftPaddle.height);
            // Low xSpeed still produces the behavior since it still detects the ball nearby
            ball.x      = leftPaddle.x + leftPaddle.width + ball.radius + Math.abs(ball.xSpeed); // Move ball to prevent epileptic behavior

            //console.log(ball.x + ' ' + (leftPaddle.x + leftPaddle.width) + ' ' + a.x + ' ' + ball.xSpeed);

            if ( Math.abs(ball.xSpeed) < BALL_MAX_SPEED )
            {
                ball.xSpeed *= 1.1; // Increase speed by speed*.1
            }
        }
        if ( hasCollision(c, b) )
        {
            console.log("Right Collide!");
            ball.xSpeed = -ball.xSpeed;
            // Check the position where the paddle the ball collides and determine the amount of y speed (divide by paddle height [percent], multiply by 8)
            // Max 4 - Min -4 = 8, Max 5 - Min -5 = 10
            ball.ySpeed = 10 * ((ball.y - (rightPaddle.y + rightPaddle.height / 2)) / rightPaddle.height);
            // Low xSpeed still produces the behavior since it still detects the ball nearby
            ball.x      = rightPaddle.x - ball.radius - Math.abs(ball.xSpeed); // Move ball to prevent epileptic behavior

            //console.log(ball.x + ' ' + rightPaddle.x + ' ' + c.x + ' ' + ball.xSpeed);

            if ( Math.abs(ball.xSpeed) < BALL_MAX_SPEED )
            {
                ball.xSpeed *= 1.1; // Increase speed by speed*.1
            }
        }
    }

    init();

    setInterval(function()
        {
            draw();
        }, 1000/FPS
    );
});
