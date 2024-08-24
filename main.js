kaboom({
    width: 1280,
    height: 720,
    scale: 1.05,
    debug: false
})

loadSprite("background", "assets/background/background_layer_1.png")
loadSprite("trees", "assets/background/background_layer_2.png")
loadSpriteAtlas("assets/oak_woods_tileset.png", {
    "ground-golden": {
        "x": 16,
        "y": 0,
        "width": 16,
        "height": 16,
    },
    "deep-ground": {
        "x": 16,
        "y": 32,
        "width": 16,
        "height": 16
    },
    "ground-silver": {
        "x": 150,
        "y": 0,
        "width": 16,
        "height": 16
    }
})

loadSprite("shop", "assets/shop_anim.png", {
    sliceX: 6,
    sliceY: 1,
    anims: {
        "default": {
            from: 0,
            to: 5,
            speed: 12,
            loop: true
        }
    }
})
loadSprite("fence", "assets/fence_1.png")
loadSprite("sign", "assets/sign.png")

loadSprite("idle-player1", "assets/idle-player1.png", {
    sliceX: 8, sliceY: 1, anims: { "idle": {from: 0, to: 7, speed: 12, loop: true}}
})
loadSprite("jump-player1", "assets/jump-player1.png", {
    sliceX: 2, sliceY: 1, anims: { "jump": { from: 0, to: 1, speed: 2, loop: true}}
})
loadSprite("attack-player1", "assets/attack-player1.png", {
    sliceX: 6, sliceY: 1, anims: { "attack": { from: 1, to: 5, speed: 18}}
})
loadSprite("run-player1", "assets/run-player1.png", {
    sliceX: 8, sliceY: 1, anims: { "run": { from: 0, to: 7, speed: 18}}
})
loadSprite("death-player1", "assets/death-player1.png", {
    sliceX: 6, sliceY: 1, anims: { "death": { from: 0, to: 5, speed: 10}}
})
loadSprite("shield", "assets/shield.png")

loadSprite("idle-player2", "assets/idle-player2.png", {
    sliceX: 4, sliceY: 1, anims: { "idle": { from: 0, to: 3, speed: 8, loop: true}}
})
loadSprite("jump-player2", "assets/jump-player2.png", {
    sliceX: 2, sliceY: 1, anims: {"jump": { from: 0, to: 1, speed: 2, loop: true}}
})
loadSprite("attack-player2", "assets/attack-player2.png", {
    sliceX: 4, sliceY: 1, anims: { "attack": { from: 0, to: 3, speed: 18}}
})
loadSprite("run-player2", "assets/run-player2.png", {
    sliceX: 8, sliceY: 1, anims: { "run": { from: 0, to: 7, speed: 18}}
})
loadSprite("death-player2", "assets/death-player2.png", {
    sliceX: 7, sliceY: 1, anims: { "death": { from: 0, to: 6, speed: 10}}
})

scene("fight", () => {
    const background = add([
        sprite("background"),
        scale(4)
    ])

    background.add([
        sprite("trees"),
    ])

    const groundTiles = addLevel([
        "","","","","","","","","",
        "------#######-----------",
        "dddddddddddddddddddddddd",
        "dddddddddddddddddddddddd"
        ], {
        tileWidth: 16,
        tileHeight: 16,
        tiles: {
            "#": () => [
                sprite("ground-golden"),
                area(),
                body({isStatic: true})
            ],
            "-": () => [
                sprite("ground-silver"),
                area(),
                body({isStatic: true}),
            ],
            "d": () => [
                sprite("deep-ground"),
                area(),
                body({isStatic: true})
            ]
        }
    })
    
    groundTiles.use(scale(4))

    const shop = background.add([
        sprite("shop"),
        pos(170, 15),
    ])

    shop.play("default")

   // left invisible wall
   add([
    rect(16, 720),
    area(),
    body({isStatic: true}),
    pos(-20,0)
   ])

   // right invisible wall
   add([
    rect(16, 720),
    area(),
    body({isStatic: true}),
    pos(1280,0)
   ])

   background.add([
    sprite("fence"),
    pos(85, 125)
   ])

   background.add([
    sprite("fence"),
    pos(10, 125)
   ])

   background.add([
    sprite("sign"),
    pos(290, 115)
   ])

    function makePlayer(posX, posY, width, height, scaleFactor, id) {
        return add([
            pos(posX, posY),
            scale(scaleFactor),
            area({shape: new Rect(vec2(0), width, height)}),
            anchor("center"),
            body({stickToPlatform: true}),
            {
                isCurrentlyJumping: false,
                health: 500,
                sprites: {
                    run: "run-" + id,
                    idle: "idle-" + id,
                    jump: "jump-" + id,
                    attack: "attack-" + id,
                    death: "death-" + id
                }
            }
        ])
    }

    setGravity(1100)

    const player1 = makePlayer(200, 100, 16, 42, 4, "player1")
    player1.use(sprite(player1.sprites.idle))
    player1.play("idle")

    function run(player, speed, flipPlayer) {
        if (player.health === 0) {
            return
        }
    
        if (player.curAnim() !== "run"
            && !player.isCurrentlyJumping) {
            player.use(sprite(player.sprites.run))
            player.play("run")
        }
        player.move(speed,0)
        player.flipX = flipPlayer
    }

    function resetPlayerToIdle(player) {
        player.use(sprite(player.sprites.idle))
        player.play("idle")
    }

    onKeyDown("d", () => {
        run(player1, 500, false)
    })
    onKeyRelease("d", () => {
        if (player1.health !== 0) {
            resetPlayerToIdle(player1)
            player1.flipX = false
        }
    })

    onKeyDown("a", () => {
        run(player1, -500, true)
    })
    onKeyRelease("a", () => {
        if (player1.health !== 0) {
            resetPlayerToIdle(player1)
            player1.flipX = true
        }
    })

    function makeJump(player) {
        if (player.health === 0) {
            return
        }
    
        if (player.isGrounded()) {
            const currentFlip = player.flipX
            player.jump()
            player.use(sprite(player.sprites.jump))
            player.flipX = currentFlip
            player.play("jump")
            player.isCurrentlyJumping = true
        }
    }

    function resetAfterJump(player) {
        if (player.isGrounded() && player.isCurrentlyJumping) {
            player.isCurrentlyJumping = false
            if (player.curAnim() !== "idle") {
                resetPlayerToIdle(player)
            }
        }
    }

    onKeyDown("w", () => {
        makeJump(player1)
    })

    player1.onUpdate(() => resetAfterJump(player1))

    function attack(player, excludedKeys) {
        if (player.health === 0) {
            return
        }
    
        for (const key of excludedKeys) {
            if (isKeyDown(key)) {
                return
            }
        }
    
        const currentFlip = player.flipX
        if (player.curAnim() !== "attack") {
            player.use(sprite(player.sprites.attack))
            player.flipX = currentFlip
            const slashX = player.pos.x + 30
            const slashXFlipped = player.pos.x - 350
            const slashY = player.pos.y - 200
            
            add([
                rect(300,300),
                area(),
                pos(currentFlip ? slashXFlipped: slashX, slashY),
                opacity(0),
                player.id + "attackHitbox"
            ])
    
            player.play("attack", {
                onEnd: () => {
                    resetPlayerToIdle(player)
                    player.flipX = currentFlip
                }
            }) 
        }
    }

    onKeyPress("space", () => {
        attack(player1, ["a", "d", "w"])
    })

    onKeyRelease("space", () => {
        destroyAll(player1.id + "attackHitbox")
    })

    const player2 = makePlayer(1000, 200, 16, 45, 4, "player2")
    player2.use(sprite(player2.sprites.idle))
    player2.play("idle")
    player2.flipX = true

    onKeyDown("right", () => {
        run(player2, 500, false)
    })
    onKeyRelease("right", () => {
        if (player2.health !== 0) {
            resetPlayerToIdle(player2)
            player2.flipX = false
        }
    })

    onKeyDown("left", () => {
        run(player2, -500, true)
    })
    onKeyRelease("left", () => {
        if (player2.health !== 0) {
            resetPlayerToIdle(player2)
            player2.flipX = true
        }
    })

    onKeyDown("up", () => {
        makeJump(player2)
    })

    player2.onUpdate(() => resetAfterJump(player2))

    onKeyPress("down", () => {
        attack(player2, ["left", "right", "up"])
    })

    onKeyRelease("down", () => {
        destroyAll(player2.id + "attackHitbox")
    })

    // Variables for Peterson's algorithm
    let shieldTurn = 0;
    let shieldFlag = [false, false];

    // Variable to track shield usage
    let shieldInUse = false;
    let lastShieldUser = null;
    let canUseShieldAgain = [true, true]; // Track cooldown for each player

    // Cooldown period in milliseconds
    const shieldCooldown = 2000;

   // Initialize shieldActive flag for each player
    player1.shieldActive = false;
    player2.shieldActive = false;

function tryUseShield(playerIndex, player, shieldSpriteName, excludedKeys) {
    // Check if any excluded key is pressed
    for (const key of excludedKeys) {
        if (isKeyDown(key)) {
            return;
        }
    }

    // Peterson's algorithm entry section
    shieldFlag[playerIndex] = true;
    shieldTurn = 1 - playerIndex;

    while (shieldFlag[1 - playerIndex] && shieldTurn === 1 - playerIndex) {
        // Busy-wait until it's this player's turn
    }

    // Critical Section
    if (!shieldInUse && canUseShieldAgain[playerIndex]) {
        shieldInUse = true;
        lastShieldUser = playerIndex;
        player.shieldActive = true;

        // Calculate the position for the shield in front of the player
        var shieldOffsetX = player.flipX ? -player.width / 1.5 : player.width / 20;
        var shieldPosX = player.pos.x + shieldOffsetX;
        var shieldPosY = 410;

        // Remove any existing shield sprites before adding a new one
        if (player.shieldSprite) {
            destroy(player.shieldSprite);
        }

        player.shieldSprite = add([
            sprite(shieldSpriteName),
            pos(shieldPosX, shieldPosY), // Position the shield in front of the player
            scale(8),
            "defenseShield",
        ]);

        canUseShieldAgain[playerIndex] = false;

        // Start cooldown timer
        setTimeout(() => {
            canUseShieldAgain[playerIndex] = true;
        }, shieldCooldown);

        // Release the shield after some time
        setTimeout(() => {
            if (player.shieldSprite) {
                destroy(player.shieldSprite);
                player.shieldSprite = null;
            }
            shieldInUse = false;
            player.isDefending = false;
            player.shieldActive = false; // Shield is no longer active
        }, 1000); // Keep the shield for 3 seconds
    }

    // Exit section for Peterson's algorithm
    shieldFlag[playerIndex] = false;
}

// Player 1 (index 0)
onKeyPress("f", () => {
    player1.isDefending = true;
    tryUseShield(0, player1, "shield", ["a", "d", "w"]);
});

// Player 2 (index 1)
onKeyPress("l", () => {
    player2.isDefending = true;
    tryUseShield(1, player2, "shield", ["left", "right", "up"]);
});

// Disable excluded keys when shield is active
onKeyDown(["a", "d", "w"], () => {
    if (player1.shieldActive) {
        return; // Ignore the input if the shield is active
    }
    // Normal movement logic here
});

onKeyDown(["left", "right", "up"], () => {
    if (player2.shieldActive) {
        return; // Ignore the input if the shield is active
    }
    // Normal movement logic here
});



    //Adding defense into the game
    // Add defense flags to players
    player1.isDefending = false;
    player2.isDefending = false;


    // Player 1 (index 0)
    onKeyPress("f", () => {
        player1.isDefending = true;
        tryUseShield(0, player1, player2, "shield",["a", "d", "w"]);
    });

    // Player 2 (index 1)
    onKeyPress("l", () => {
        player2.isDefending = true;
        tryUseShield(1, player2, player1, "shield",["left", "right", "up"]);
    });
    const counter = add([
        rect(100,100),
        pos(center().x, center().y - 300),
        color(10,10,10),
        area(),
        anchor("center")
       ])
    
    const count = counter.add([
        text("60"),
        area(),
        anchor("center"),
        {
            timeLeft: 60,
        }
    ])

    const winningText = add([
        text(""),
        area(),
        anchor("center"),
        pos(center())
    ])
    
    let gameOver = false
    onKeyDown("enter", () => gameOver ? go("fight") : null)

    function declareWinner(winningText, player1, player2) {
        if (player1.health > 0 && player2.health > 0
            || player1.health === 0 && player2.health === 0) {
            winningText.text = "Tie!"
        } else if (player1.health > 0 && player2.health === 0) {
            winningText.text = "Player 1 won!"
            player2.use(sprite(player2.sprites.death))
            player2.play("death")
        } else {
            winningText.text = "Player 2 won!"
            player1.use(sprite(player1.sprites.death))
            player1.play("death")
        }
    }

    const countInterval = setInterval(() => {
        if (count.timeLeft === 0) {
            clearInterval(countInterval)
            declareWinner(winningText, player1, player2)
            gameOver = true
    
            return
        }
        count.timeLeft--
        count.text = count.timeLeft
    }, 1000)

    const player1HealthContainer = add([
        rect(500, 70),
        area(),
        outline(5),
        pos(90, 20),
        color(200,0,0)
       ])
       
    const player1HealthBar = player1HealthContainer.add([
        rect(498, 65),
        color(0,180,0),
        pos(498, 70 - 2.5),
        rotate(180)
    ])

    // Modify collision detection to check defense status
    player1.onCollide(player2.id + "attackHitbox", () => {
        if (gameOver || player1.isDefending) {
            return;
        }
        
        if (player1.health !== 0) {
            player1.health -= 50
            tween(player1HealthBar.width, player1.health, 1, (val) => {
                player1HealthBar.width = val
            }, easings.easeOutSine) 
        } 
        
        if (player1.health === 0) {
            clearInterval(countInterval)
            declareWinner(winningText, player1, player2)
            gameOver = true
        }
    })

    const player2HealthContainer = add([
        rect(500, 70),
        area(),
        outline(5),
        pos(690, 20),
        color(200,0,0)
    ])
       
    const player2HealthBar = player2HealthContainer.add([
        rect(498, 65),
        color(0,180,0),
        pos(2.5, 2.5),
    ])
    
    player2.onCollide(player1.id + "attackHitbox", () => {
        if (gameOver || player2.isDefending) {
            return;
        }
        
        if (player2.health !== 0) {
            player2.health -= 50 
            tween(player2HealthBar.width, player2.health, 1, (val) => {
                player2HealthBar.width = val
            }, easings.easeOutSine) 
        } 
        
        if (player2.health === 0) {
            clearInterval(countInterval)
            declareWinner(winningText, player1, player2)
            gameOver = true
        }
    })
})

go("fight")