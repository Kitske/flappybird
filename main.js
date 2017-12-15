var temp = window.innerWidth;
var gameWidth = temp < 490 ? 490 : temp;
var gameHeight = 490;
var wallSpeed = 200;
var difficulty = 1;
var numberOfWallsPerScreen = gameWidth / 490;
var mainState = {
    preload: function () {
        game.load.image('wall', 'assets/block.png');
        game.load.image('holetop', 'assets/holetop.png');
        game.load.image('holebot', 'assets/holebot.png');
        game.load.spritesheet('bird', 'assets/bird.png', 42, 32);
        game.load.audio('hit', 'assets/audio/hit.wav');
        game.load.audio('die', 'assets/audio/die.wav');
        game.load.audio('jump', 'assets/audio/jump.wav');
        game.load.audio('point', 'assets/audio/point.wav');
        game.load.audio('swooshing', 'assets/audio/swooshing.wav');
        game.load.audio('wing', 'assets/audio/wing.wav');
        this.jumpSound = game.add.audio('jump');
        this.dieSound = game.add.audio('die');
        this.hitSound = game.add.audio('hit');
        this.pointSound = game.add.audio('point');
        this.swooshingSound = game.add.audio('swooshing');
        this.wingSound = game.add.audio('wing');
    },
    addScore: function () {
        if (this.bird.alive) {
            this.pointSound.play();
            difficulty *= 1.02;
            this.score += 1;
            this.labelScore.text = this.score;
        }
    },
    create: function () {
        this.score = 0;
        this.labelScore = game.add.text(gameWidth / 2, gameHeight - 50, "0",
            {font: "30px Arial", fill: "#ff0017"});
        this.walls = game.add.group();

        game.stage.backgroundColor = '#71c5cf';

        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.bird = game.add.sprite(100, gameHeight / 2, 'bird');
        this.bird.animations.add('flying');

        this.bird.anchor.setTo(0.25, 0.5);

        game.physics.arcade.enable(this.bird);

        this.bird.body.gravity.y = 1000 * difficulty;

        var spaceKey = game.input.keyboard.addKey(
            Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);
        this.enterKey = game.input.keyboard.addKey(
            Phaser.Keyboard.ENTER);
        this.enterKey.onDown.add(this.pause, this);
        this.pause_label = game.add.text(gameWidth / 2, 20, '⏸', {font: '24px Arial', fill: '#ff0003'});
        this.pause_label.inputEnabled = true;
        this.addWall();
    }, pause: function () {
        if (game.paused) {
            this.pause_label.setText('⏸');
            game.paused = false;
            menu.destroy();
            choiseLabel.destroy();
            return;
        }
        this.pause_label.setText('▶');
        game.paused = true;

        menu = game.add.sprite(gameWidth / 2, gameHeight / 2, 'menu');
        menu.anchor.setTo(0.5, 0.5);
    },

    update: function () {
        this.labelScore.bringToTop();

        if (!this.bird.alive) this.bird.angle -= 10;
        else if (this.bird.angle < 60)
            this.bird.angle += 2;
        if (this.bird.y > gameHeight) {
            this.restartGame();
        }
        else if (this.bird.y < 0)
            this.bird.body.velocity.y = 10;
        game.physics.arcade.overlap(
            this.bird, this.walls, this.hitWall, null, this);
    },
    jump: function () {
        if (this.bird.alive === false || this.bird.y - this.bird.body.height * 1.5 < 0)
            return;
        this.bird.animations.play('flying', 10, true);
        var animation = game.add.tween(this.bird);

        animation.to({angle: -20}, 200 / difficulty);

        this.jumpSound.play();
        animation.start();
        if (this.bird.body.velocity.y < 0 && this.bird.body.velocity.y > -15000) this.bird.body.velocity.y *= 20;
        this.bird.body.velocity.y = -gameHeight * 0.5;
    },

    restartGame: function () {
        difficulty = 1;
        game.state.start('main');
    },

    addBlock: function (x, y, z) {
        var wall;
        if (z === 0) wall = game.add.sprite(x, y, 'wall');
        else if (z === 1) wall = game.add.sprite(x, y, 'holetop');
        else wall = game.add.sprite(x, y, 'holebot');
        this.walls.add(wall);

        game.physics.arcade.enable(wall);

        wall.body.velocity.x = -wallSpeed * difficulty;

        wall.checkWorldBounds = true;
        wall.outOfBoundsKill = true;
    },
    addWall: function () {

        var hole = Math.floor(Math.random() * 5) + 1;

        for (var i = 0; i < 8; i++)
            if (i !== hole && i !== hole + 1) {
                if (i === hole - 1) this.addBlock(gameWidth, i * 60, 1);
                else if (i === hole + 2) this.addBlock(gameWidth, i * 60, 2);
                else this.addBlock(gameWidth, i * 60, 0);
            }
        this.nextWall = game.time.events.add(Phaser.Timer.SECOND * gameWidth / numberOfWallsPerScreen / wallSpeed, this.addWall, this);
        this.scoreTimer = game.time.events.add(Phaser.Timer.SECOND * (gameWidth + 60) / wallSpeed / difficulty, this.addScore, this);
    }, hitWall: function () {
        if (this.bird.alive === false)
            return;
        this.hitSound.play();
        this.bird.body.velocity.x = -wallSpeed / 3;
        this.bird.anchor.setTo(0.5, 0.5);
        this.bird.alive = false;

        game.time.events.remove(this.nextWall);
        this.walls.forEach(function (wa) {
            wa.body.velocity.x = 0;
        }, this);
    }
};

var game = new Phaser.Game(gameWidth, gameHeight);
game.state.add('main', mainState);
game.state.start('main');