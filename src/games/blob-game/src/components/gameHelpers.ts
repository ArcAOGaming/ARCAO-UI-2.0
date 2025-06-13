import { gatewayUrl } from '../../../../shared-components/Constants';

// Game Constants
export const GAME_CONSTANTS = {
    POINTS: {
        SURVIVAL_TIME: 1,  // points per second of survival
        FOOD_BLOB: 10,    // points for eating a food blob
        PLAYER_EATEN: 50  // points for eating another player
    },
    GROWTH: {
        FOOD_BLOB: 1,     // size increase for eating food
        PLAYER_EATEN: 3   // size increase for eating another player
    },
    INITIAL_SIZE: 20,
    WORLD: {
        WIDTH: 2000,
        HEIGHT: 2000,
        MAX_SIZE: 200     // Maximum size is 10% of world width
    },
    FOOD: {
        COUNT: 30,
        RADIUS: 3,
        GROWTH_RATE: 0.1,
        MIN_EATABLE_SIZE: 15
    },
    BOT: {
        COUNT: 20,
        VIEW_RANGE: 300,
        DECISION_RATE: 1000,
        MOVEMENT_SMOOTHING: 0.08,
        GROWTH_RATE: 0.25
    },
    GRID: {
        SIZE: 50
    }
};

// Collision detection helper
export const checkCollision = (x1: number, y1: number, r1: number, x2: number, y2: number, r2: number): boolean => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < r1 + r2;
};

// Distance calculation helper
export const getDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
};

// Bot appearance helpers
interface BazarProfile {
    profile: {
        ProfileImage: string;
    };
}

interface CacheItem {
    profile?: {
        ProfileImage?: string;
    };
}

// Keep track of used profile images
let usedProfileImages = new Set<string>();

// Reset used profiles (call this when starting a new game)
export const resetUsedProfiles = () => {
    usedProfileImages.clear();
};

export const getBotAppearance = () => {
    try {
        const cache = JSON.parse(localStorage.getItem('bazarProfileCache') || '{}') as Record<string, CacheItem>;
        const validProfiles = Object.values(cache).filter((p: CacheItem): p is BazarProfile => {
            return Boolean(
                p &&
                p.profile &&
                typeof p.profile === 'object' &&
                'ProfileImage' in p.profile &&
                typeof p.profile.ProfileImage === 'string' &&
                p.profile.ProfileImage !== "" &&
                !usedProfileImages.has(p.profile.ProfileImage) // Only include unused profiles
            );
        });
        
        if (validProfiles.length > 0) {
            const selectedProfile = validProfiles[Math.floor(Math.random() * validProfiles.length)];
            // Mark this profile as used
            usedProfileImages.add(selectedProfile.profile.ProfileImage);
            return {
                useProfile: true,
                image: `${gatewayUrl}${selectedProfile.profile.ProfileImage}`,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`  // Fallback color
            };
        }
    } catch (e) {
        console.error('Error accessing bazarProfileCache:', e);
    }
    return {
        useProfile: false,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };
};

export const getBotColor = () => {
    return getBotAppearance().color;
};

// Game state interfaces
interface Bot {
    x: number;
    y: number;
    radius: number;
    color: string;
    speed: number;
    targetX: number;
    targetY: number;
    lastDecision: number;
    personality: number;
    currentVelX: number;
    currentVelY: number;
    isLargeBot: boolean;
    style?: any;
}

interface GameState {
    player: {
        x: number;
        y: number;
        radius: number;
    };
    foods: Array<{
        x: number;
        y: number;
        radius: number;
    }>;
    bots: Bot[];
    viewport: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    currentScore: number;
}

interface UpdateBotsCallbacks {
    handleScoreUpdate: (score: number) => void;
    handleGameOver: () => void;
    spawnNewBot: (spawnQuadrant: number) => void;
}

// Bot behavior functions
export const updateBotBehavior = (
    bot: Bot,
    foods: Array<{x: number; y: number}>,
    player: {x: number; y: number; radius: number},
    otherBots: Bot[]
) => {
    const now = Date.now();
    if (now - bot.lastDecision < GAME_CONSTANTS.BOT.DECISION_RATE) return;
    bot.lastDecision = now;

    // Find nearby food
    const nearbyFood = foods.filter(food => {
        const dx = food.x - bot.x;
        const dy = food.y - bot.y;
        return Math.sqrt(dx * dx + dy * dy) < GAME_CONSTANTS.BOT.VIEW_RANGE;
    });

    // Find nearby threats (bigger bots and player)
    const threats = [...otherBots, player].filter(other => {
        if (other === bot) return false;
        const dx = other.x - bot.x;
        const dy = other.y - bot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < GAME_CONSTANTS.BOT.VIEW_RANGE * 1.5 && other.radius > bot.radius * 1.2;
    });

    if (threats.length > 0) {
        // Run away from the closest threat
        const closestThreat = threats.reduce((closest, threat) => {
            const dx = threat.x - bot.x;
            const dy = threat.y - bot.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (!closest || distance < closest.distance) {
                return { threat, distance };
            }
            return closest;
        }, null as { threat: any; distance: number } | null);

        if (closestThreat) {
            // Run in the opposite direction
            const dx = bot.x - closestThreat.threat.x;
            const dy = bot.y - closestThreat.threat.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            bot.speed = 3;
            bot.targetX = bot.x + (dx / distance) * GAME_CONSTANTS.BOT.VIEW_RANGE;
            bot.targetY = bot.y + (dy / distance) * GAME_CONSTANTS.BOT.VIEW_RANGE;
            
            bot.targetX = Math.max(bot.radius, Math.min(GAME_CONSTANTS.WORLD.WIDTH - bot.radius, bot.targetX));
            bot.targetY = Math.max(bot.radius, Math.min(GAME_CONSTANTS.WORLD.HEIGHT - bot.radius, bot.targetY));
            return;
        }
    }

    // If no threats, normal food seeking behavior
    bot.speed = 2;
    if (nearbyFood.length > 0) {
        // Find closest food
        const closest = nearbyFood.reduce((prev, curr) => {
            const prevDist = Math.sqrt(Math.pow(prev.x - bot.x, 2) + Math.pow(prev.y - bot.y, 2));
            const currDist = Math.sqrt(Math.pow(curr.x - bot.x, 2) + Math.pow(curr.y - bot.y, 2));
            return currDist < prevDist ? curr : prev;
        });

        bot.targetX = closest.x;
        bot.targetY = closest.y;
    } else {
        // Random movement if no food nearby
        bot.targetX = bot.x + (Math.random() - 0.5) * GAME_CONSTANTS.BOT.VIEW_RANGE;
        bot.targetY = bot.y + (Math.random() - 0.5) * GAME_CONSTANTS.BOT.VIEW_RANGE;
        
        bot.targetX = Math.max(bot.radius, Math.min(GAME_CONSTANTS.WORLD.WIDTH - bot.radius, bot.targetX));
        bot.targetY = Math.max(bot.radius, Math.min(GAME_CONSTANTS.WORLD.HEIGHT - bot.radius, bot.targetY));
    }
};

export const updateBots = (
    gameState: GameState,
    ctx: CanvasRenderingContext2D,
    callbacks: UpdateBotsCallbacks,
    imagePatternCache: Map<string, HTMLImageElement>
) => {
    const botsToRemove: Bot[] = [];

    for (const bot of gameState.bots) {
        // Update AI behavior
        updateBotBehavior(bot, gameState.foods, gameState.player, gameState.bots.filter(b => b !== bot));

        // Calculate desired velocity
        const dx = bot.targetX - bot.x;
        const dy = bot.targetY - bot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const speed = bot.speed * (1 - (bot.radius / GAME_CONSTANTS.WORLD.MAX_SIZE) * 0.5);
            
            // Calculate new position
            const targetVelX = (dx / distance) * speed;
            const targetVelY = (dy / distance) * speed;

            bot.currentVelX += (targetVelX - bot.currentVelX) * GAME_CONSTANTS.BOT.MOVEMENT_SMOOTHING;
            bot.currentVelY += (targetVelY - bot.currentVelY) * GAME_CONSTANTS.BOT.MOVEMENT_SMOOTHING;

            bot.x += bot.currentVelX;
            bot.y += bot.currentVelY;
        }

        // Check collisions with food
        const foodToRemove = [];
        for (let i = 0; i < gameState.foods.length; i++) {
            const food = gameState.foods[i];
            if (checkCollision(bot.x, bot.y, bot.radius, food.x, food.y, GAME_CONSTANTS.FOOD.RADIUS)) {
                foodToRemove.push(i);
                
                // Calculate growth based on current size
                const sizeRatio = bot.radius / GAME_CONSTANTS.WORLD.MAX_SIZE;
                const growthFactor = Math.max(0.05, GAME_CONSTANTS.GROWTH.FOOD_BLOB * (1 - sizeRatio));
                
                // Update size
                bot.radius = Math.min(GAME_CONSTANTS.WORLD.MAX_SIZE, bot.radius + growthFactor);
            }
        }

        // Remove eaten food
        for (let i = foodToRemove.length - 1; i >= 0; i--) {
            gameState.foods.splice(foodToRemove[i], 1);
        }

        // Check collisions with player
        let skipRemainingCollisions = false;
        if (checkCollision(bot.x, bot.y, bot.radius, gameState.player.x, gameState.player.y, gameState.player.radius)) {
            if (bot.radius > gameState.player.radius) {
                // Bot eats player - game over
                callbacks.handleGameOver();
                return;
            } else {
                // Player eats bot
                botsToRemove.push(bot);
                gameState.player.radius = Math.min(
                    GAME_CONSTANTS.WORLD.MAX_SIZE,
                    gameState.player.radius + GAME_CONSTANTS.GROWTH.PLAYER_EATEN
                );
                gameState.currentScore += GAME_CONSTANTS.POINTS.PLAYER_EATEN;
                callbacks.handleScoreUpdate(gameState.currentScore);
                skipRemainingCollisions = true;
            }
        }

        if (skipRemainingCollisions) continue;

        // Check collisions with other bots
        for (const otherBot of gameState.bots) {
            if (bot === otherBot || botsToRemove.includes(bot) || botsToRemove.includes(otherBot)) continue;

            if (checkCollision(bot.x, bot.y, bot.radius, otherBot.x, otherBot.y, otherBot.radius)) {
                if (bot.radius > otherBot.radius) {
                    botsToRemove.push(otherBot);
                    // Calculate growth based on eaten bot's size
                    const sizeRatio = bot.radius / GAME_CONSTANTS.WORLD.MAX_SIZE;
                    const growthFactor = Math.max(0.05, GAME_CONSTANTS.GROWTH.FOOD_BLOB * (1 - sizeRatio));
                    bot.radius = Math.min(
                        GAME_CONSTANTS.WORLD.MAX_SIZE,
                        bot.radius + growthFactor
                    );
                }
            }
        }

        // Keep in bounds
        const bounds = checkBoundaries(bot);
        if (bounds.hitWall) {
            bot.currentVelX *= 0.8;
            bot.currentVelY *= 0.8;
        }

        // Draw bot
        const screenX = bot.x - gameState.viewport.x + gameState.viewport.width / 2;
        const screenY = bot.y - gameState.viewport.y + gameState.viewport.height / 2;
        drawCircle(ctx, screenX, screenY, bot.radius, bot.style, false, imagePatternCache);
    }

    // Remove eaten bots and spawn new ones
    if (botsToRemove.length > 0) {
        gameState.bots = gameState.bots.filter(bot => !botsToRemove.includes(bot));
        
        // Spawn new bots to replace eaten ones
        for (let i = 0; i < botsToRemove.length; i++) {
            const spawnQuadrant = Math.floor(Math.random() * 4);
            callbacks.spawnNewBot(spawnQuadrant);
        }
    }
};

// Boundary check helper
export const checkBoundaries = (entity: { x: number; y: number; radius: number }) => {
    let hitWall = false;
    const margin = entity.radius || 0;
    
    if (entity.x < margin) {
        entity.x = margin;
        hitWall = true;
    }
    if (entity.x > GAME_CONSTANTS.WORLD.WIDTH - margin) {
        entity.x = GAME_CONSTANTS.WORLD.WIDTH - margin;
        hitWall = true;
    }
    if (entity.y < margin) {
        entity.y = margin;
        hitWall = true;
    }
    if (entity.y > GAME_CONSTANTS.WORLD.HEIGHT - margin) {
        entity.y = GAME_CONSTANTS.WORLD.HEIGHT - margin;
        hitWall = true;
    }
    
    return { hitWall };
};

// Drawing utilities
export const drawGrid = (ctx: CanvasRenderingContext2D, viewport: any) => {
    // Draw vertical lines with light grey color
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.lineWidth = 1;
    for (let x = 0; x < viewport.width; x += GAME_CONSTANTS.GRID.SIZE) {
        const offsetX = x - (viewport.x % GAME_CONSTANTS.GRID.SIZE);
        ctx.beginPath();
        ctx.moveTo(offsetX, 0);
        ctx.lineTo(offsetX, viewport.height);
        ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y < viewport.height; y += GAME_CONSTANTS.GRID.SIZE) {
        const offsetY = y - (viewport.y % GAME_CONSTANTS.GRID.SIZE);
        ctx.beginPath();
        ctx.moveTo(0, offsetY);
        ctx.lineTo(viewport.width, offsetY);
        ctx.stroke();
    }
};

export const drawCircle = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    radius: number, 
    style: { useProfile?: boolean; image?: string; color: string } | string, 
    isPlayer: boolean = false,
    imagePatternCache: Map<string, HTMLImageElement>
) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    if (typeof style === 'object' && style.useProfile && style.image) {
        // Check if the image is cached
        let img = imagePatternCache.get(style.image);
        if (!img) {
            img = new Image();
            img.crossOrigin = "anonymous";
            img.src = style.image;

            const tempImg = img; // Create a stable reference for the callbacks
            img.onload = () => {
                imagePatternCache.set(style.image!, tempImg);
                ctx.drawImage(tempImg, x - radius, y - radius, radius * 2, radius * 2);
            };

            img.onerror = (error) => {
                console.error('Error loading image for circle:', error);
            };

            // Use a fallback color while loading the image
            ctx.fillStyle = style.color || '#000000';
            ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        } else {
            ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);
        }
    } else {
        ctx.fillStyle = typeof style === 'object' ? style.color : style;
        ctx.fill();
    }

    ctx.restore();

    if (isPlayer) {
        // Add an outline for the player
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.strokeStyle = '#0066ff';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
};

// Player movement
interface PlayerState {
    x: number;
    y: number;
    radius: number;
    speed: number;
    speedBoost: boolean;
    speedBoostEndTime?: number;
}

interface ViewportState {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface MouseState {
    x: number;
    y: number;
}

export const updatePlayerPosition = (
    player: PlayerState,
    mouse: MouseState,
    viewport: ViewportState
) => {
    if (!mouse) return;

    const dx = mouse.x - viewport.width / 2;
    const dy = mouse.y - viewport.height / 2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Minimum distance threshold for movement
    const minDistance = 20;
    
    // Only move if we're beyond the minimum distance
    if (distance > minDistance) {
        const speedMultiplier = Math.max(1, 3 - (player.radius / GAME_CONSTANTS.INITIAL_SIZE) * 0.5);
        const boostMultiplier = player.speedBoost ? 2 : 1;
        
        // Smooth movement interpolation
        const targetX = player.x + (dx / distance) * player.speed * speedMultiplier * boostMultiplier;
        const targetY = player.y + (dy / distance) * player.speed * speedMultiplier * boostMultiplier;
        
        // Apply smooth movement
        player.x += (targetX - player.x) * 0.4;
        player.y += (targetY - player.y) * 0.4;
        
        // Handle speed boost timeout
        if (player.speedBoost && player.speedBoostEndTime && Date.now() > player.speedBoostEndTime) {
            player.speedBoost = false;
        }
        
        // Clamp position within world bounds
        player.x = Math.max(player.radius, Math.min(GAME_CONSTANTS.WORLD.WIDTH - player.radius, player.x));
        player.y = Math.max(player.radius, Math.min(GAME_CONSTANTS.WORLD.HEIGHT - player.radius, player.y));
        
        // Update viewport (camera) position smoothly
        viewport.x += (player.x - viewport.x) * 0.03;
        viewport.y += (player.y - viewport.y) * 0.03;
    }
};

// Bot spawning
export const spawnNewBot = (gameState: GameState, spawnQuadrant: number) => {
    let x = 0, y = 0;  // Initialize with default values
    
    // Calculate spawn position
    switch(spawnQuadrant) {
        case 0: 
            x = Math.random() * (GAME_CONSTANTS.WORLD.WIDTH * 0.4);
            y = Math.random() * (GAME_CONSTANTS.WORLD.HEIGHT * 0.4);
            break;
        case 1:
            x = GAME_CONSTANTS.WORLD.WIDTH * 0.6 + Math.random() * (GAME_CONSTANTS.WORLD.WIDTH * 0.4);
            y = Math.random() * (GAME_CONSTANTS.WORLD.HEIGHT * 0.4);
            break;
        case 2:
            x = Math.random() * (GAME_CONSTANTS.WORLD.WIDTH * 0.4);
            y = GAME_CONSTANTS.WORLD.HEIGHT * 0.6 + Math.random() * (GAME_CONSTANTS.WORLD.HEIGHT * 0.4);
            break;
        default: // case 3
            x = GAME_CONSTANTS.WORLD.WIDTH * 0.6 + Math.random() * (GAME_CONSTANTS.WORLD.WIDTH * 0.4);
            y = GAME_CONSTANTS.WORLD.HEIGHT * 0.6 + Math.random() * (GAME_CONSTANTS.WORLD.HEIGHT * 0.4);
    }

    const newBot: Bot = {
        x,
        y,
        radius: GAME_CONSTANTS.INITIAL_SIZE * (0.8 + Math.random() * 0.4),
        color: getBotColor(),
        style: getBotAppearance(),
        speed: 2,
        targetX: x,
        targetY: y,
        lastDecision: 0,
        personality: Math.random(),
        currentVelX: 0,
        currentVelY: 0,
        isLargeBot: false
    };

    gameState.bots.push(newBot);
    return newBot;
};
