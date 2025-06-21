// Game variables
let player;
let gameArea;
let isJumping = false;
let gravity = 0.6;  // Reduced gravity for easier jumps
let jumpForce = 18; // Increased jump force
let playerVelocity = 0;
let score = 0;
let level = 1;
let lives = 3;
let gameIsRunning = false;
let teachers = [];
let books = [];
let obstacles = [];
let gameSpeed = 5;
let spawnRate = 2000;
let lastSpawnTime = 0;
let bookSpawnRate = 3000;
let lastBookSpawnTime = 0;
let levelCompleteScore = 500;
let frameCount = 0;
let canDoubleJump = false; // Allow double jumping
let jumpCount = 0;

// Game elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const levelCompleteScreen = document.getElementById('level-complete-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const gameCompleteScreen = document.getElementById('game-complete-screen');
const startButton = document.getElementById('start-button');
const nextLevelButton = document.getElementById('next-level-button');
const restartButton = document.getElementById('restart-button');
const playAgainButton = document.getElementById('play-again-button');
const currentLevelDisplay = document.getElementById('current-level');
const currentScoreDisplay = document.getElementById('current-score');
const currentLivesDisplay = document.getElementById('current-lives');
const levelScoreDisplay = document.getElementById('level-score');
const finalScoreDisplay = document.getElementById('final-score');
const winScoreDisplay = document.getElementById('win-score');

// Event listeners
startButton.addEventListener('click', startGame);
nextLevelButton.addEventListener('click', startNextLevel);
restartButton.addEventListener('click', restartGame);
playAgainButton.addEventListener('click', restartGame);

// Add keyboard controls 
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space' || e.key === 'ArrowUp') {
        playerJump();
    }
});

// Better touch controls
document.addEventListener('touchstart', function(e) {
    e.preventDefault(); // Prevent default behavior
    playerJump();
}, { passive: false });

// Click controls
document.addEventListener('click', playerJump);

// Initialize game
function init() {
    gameArea = document.getElementById('game-area');
    
    // Create ground
    const ground = document.createElement('div');
    ground.classList.add('ground');
    gameArea.appendChild(ground);
    
    // Create player
    player = document.getElementById('player');
    
    // Create jump button for mobile
    createMobileControls();
}

// Create mobile-friendly controls
function createMobileControls() {
    const jumpButton = document.createElement('div');
    jumpButton.id = 'jump-button';
    jumpButton.innerText = 'JUMP';
    document.getElementById('game-screen').appendChild(jumpButton);
    
    jumpButton.addEventListener('touchstart', function(e) {
        e.preventDefault();
        playerJump();
    }, { passive: false });
    
    jumpButton.addEventListener('click', playerJump);
}

// Start game
function startGame() {
    init();
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    resetLevel();
    updateLevelDisplay();
    updateScoreDisplay();
    updateLivesDisplay();
    
    gameIsRunning = true;
    gameLoop();
}

// Reset level
function resetLevel() {
    // Clear existing teachers and books
    teachers.forEach(teacher => {
        if (teacher.element) {
            teacher.element.remove();
        }
    });
    
    books.forEach(book => {
        if (book.element) {
            book.element.remove();
        }
    });
    
    obstacles.forEach(obstacle => {
        if (obstacle.element) {
            obstacle.element.remove();
        }
    });
    
    teachers = [];
    books = [];
    obstacles = [];
    
    // Reset player position
    player.style.bottom = '80px';
    player.style.left = '50px';
    
    // Set level-specific parameters
    switch(level) {
        case 1:
            gameSpeed = 4; // Slower initial speed
            spawnRate = 3000; // More time between teachers
            bookSpawnRate = 3000;
            break;
        case 2:
            gameSpeed = 5;
            spawnRate = 2800;
            bookSpawnRate = 2800;
            break;
        case 3:
            gameSpeed = 6;
            spawnRate = 2600;
            bookSpawnRate = 2600;
            break;
        case 4:
            gameSpeed = 7;
            spawnRate = 2400;
            bookSpawnRate = 2400;
            break;
        case 5:
            gameSpeed = 8;
            spawnRate = 2200;
            bookSpawnRate = 2200;
            break;
    }
    
    // Reset jumping state
    isJumping = false;
    playerVelocity = 0;
    jumpCount = 0;
    
    // Add level complete score based on level
    levelCompleteScore = 400 * level; // Slightly easier to complete levels
    
    lastSpawnTime = 0;
    lastBookSpawnTime = 0;
    frameCount = 0;
}

// Player jump function
function playerJump() {
    if (!gameIsRunning) return;
    
    if (!isJumping) {
        // First jump
        isJumping = true;
        playerVelocity = -jumpForce;
        jumpCount = 1;
    } else if (jumpCount === 1) {
        // Double jump
        playerVelocity = -jumpForce * 0.8; // Slightly weaker double jump
        jumpCount = 2;
    }
}

// Update player position
function updatePlayer() {
    // Get current position
    const currentBottom = parseFloat(window.getComputedStyle(player).bottom);
    
    // Apply gravity
    if (isJumping) {
        playerVelocity += gravity;
        const newBottom = currentBottom - playerVelocity;
        
        // Check if player landed
        if (newBottom <= 80) {
            player.style.bottom = '80px';
            isJumping = false;
            playerVelocity = 0;
            jumpCount = 0;
        } else {
            player.style.bottom = `${newBottom}px`;
        }
    }
}

// Spawn teachers based on level
function spawnTeacher() {
    const teacher = {
        element: document.createElement('div'),
        width: 0,
        height: 0,
        posX: 0,
        posY: 0
    };
    
    // Set teacher class based on current level
    teacher.element.classList.add('teacher', `teacher-${level}`);
    gameArea.appendChild(teacher.element);
    
    // Set initial position off-screen to the right
    teacher.posX = window.innerWidth;
    teacher.posY = 80; // On the ground
    
    // Get dimensions after adding to DOM
    const style = window.getComputedStyle(teacher.element);
    teacher.width = parseFloat(style.width);
    teacher.height = parseFloat(style.height);
    
    // Set position
    teacher.element.style.bottom = `${teacher.posY}px`;
    teacher.element.style.left = `${teacher.posX}px`;
    
    // Add some spacing between teachers (don't spawn too close together)
    lastSpawnTime = Date.now() + Math.random() * 500; // Add randomness
    
    teachers.push(teacher);
}

// Spawn books for bonus points
function spawnBook() {
    const book = {
        element: document.createElement('div'),
        width: 30,
        height: 30,
        posX: 0,
        posY: 0
    };
    
    book.element.classList.add('book');
    gameArea.appendChild(book.element);
    
    // Random height between 120 and 250 pixels above ground for easier collection
    const randomHeight = Math.floor(Math.random() * 130) + 120;
    
    // Set initial position
    book.posX = window.innerWidth;
    book.posY = 80 + randomHeight;
    
    // Set position
    book.element.style.bottom = `${book.posY}px`;
    book.element.style.left = `${book.posX}px`;
    
    books.push(book);
}

// Update teacher positions
function updateTeachers() {
    for (let i = 0; i < teachers.length; i++) {
        const teacher = teachers[i];
        
        // Move teacher left
        teacher.posX -= gameSpeed;
        teacher.element.style.left = `${teacher.posX}px`;
        
        // Check if teacher is off-screen
        if (teacher.posX + teacher.width < 0) {
            teacher.element.remove();
            teachers.splice(i, 1);
            i--;
            
            // Add points for successfully avoiding a teacher
            score += 50;
            updateScoreDisplay();
        }
    }
}

// Update book positions
function updateBooks() {
    for (let i = 0; i < books.length; i++) {
        const book = books[i];
        
        // Move book left
        book.posX -= gameSpeed;
        book.element.style.left = `${book.posX}px`;
        
        // Check if book is off-screen
        if (book.posX + book.width < 0) {
            book.element.remove();
            books.splice(i, 1);
            i--;
        }
    }
}

// Check collisions with more forgiving hitboxes
function checkCollisions() {
    const playerRect = player.getBoundingClientRect();
    
    // Create a slightly smaller hitbox for player (more forgiving)
    const playerHitbox = {
        left: playerRect.left + 10,
        right: playerRect.right - 10,
        top: playerRect.top + 15,
        bottom: playerRect.bottom - 5
    };
    
    // Teacher collisions
    for (let i = 0; i < teachers.length; i++) {
        const teacher = teachers[i];
        const teacherRect = teacher.element.getBoundingClientRect();
        
        // Create a slightly smaller hitbox for teachers (more forgiving)
        const teacherHitbox = {
            left: teacherRect.left + 10,
            right: teacherRect.right - 10,
            top: teacherRect.top + 15,
            bottom: teacherRect.bottom - 5
        };
        
        if (!(playerHitbox.right < teacherHitbox.left || 
              playerHitbox.left > teacherHitbox.right || 
              playerHitbox.bottom < teacherHitbox.top || 
              playerHitbox.top > teacherHitbox.bottom)) {
            
            // Collision detected with teacher
            teacher.element.remove();
            teachers.splice(i, 1);
            i--;
            
            // Lose a life
            lives--;
            updateLivesDisplay();
            
            // Check if game over
            if (lives <= 0) {
                gameOver();
                return;
            }
            
            // Visual feedback for getting hit
            player.style.opacity = '0.5';
            setTimeout(() => {
                player.style.opacity = '1';
            }, 1000);
        }
    }
    
    // Book collisions - use larger hitbox for easier collection
    for (let i = 0; i < books.length; i++) {
        const book = books[i];
        const bookRect = book.element.getBoundingClientRect();
        
        // Enlarged hitbox for books (easier to collect)
        const bookHitbox = {
            left: bookRect.left - 5,
            right: bookRect.right + 5,
            top: bookRect.top - 5,
            bottom: bookRect.bottom + 5
        };
        
        if (!(playerRect.right < bookHitbox.left || 
              playerRect.left > bookHitbox.right || 
              playerRect.bottom < bookHitbox.top || 
              playerRect.top > bookHitbox.bottom)) {
            
            // Collision detected with book
            book.element.remove();
            books.splice(i, 1);
            i--;
            
            // Add points
            score += 20;
            updateScoreDisplay();
        }
    }
}

// Update score display
function updateScoreDisplay() {
    currentScoreDisplay.textContent = score;
}

// Update level display
function updateLevelDisplay() {
    currentLevelDisplay.textContent = level;
}

// Update lives display
function updateLivesDisplay() {
    currentLivesDisplay.textContent = lives;
}

// Check if level is complete
function checkLevelComplete() {
    if (score >= levelCompleteScore) {
        levelComplete();
    }
}

// Level complete
function levelComplete() {
    gameIsRunning = false;
    
    // Show level complete screen
    gameScreen.classList.add('hidden');
    levelCompleteScreen.classList.remove('hidden');
    
    // Display score
    levelScoreDisplay.textContent = score;
    
    // Check if final level
    if (level === 5) {
        gameComplete();
    }
}

// Start next level
function startNextLevel() {
    level++;
    
    if (level > 5) {
        level = 5;
    }
    
    levelCompleteScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    resetLevel();
    updateLevelDisplay();
    
    gameIsRunning = true;
    gameLoop();
}

// Game over
function gameOver() {
    gameIsRunning = false;
    
    // Show game over screen
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    
    // Display final score
    finalScoreDisplay.textContent = score;
}

// Game complete
function gameComplete() {
    gameIsRunning = false;
    
    // Show game complete screen
    levelCompleteScreen.classList.add('hidden');
    gameCompleteScreen.classList.remove('hidden');
    
    // Display final score
    winScoreDisplay.textContent = score;
}

// Restart game
function restartGame() {
    // Reset game state
    score = 0;
    level = 1;
    lives = 3;
    
    // Hide screens
    gameOverScreen.classList.add('hidden');
    gameCompleteScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    resetLevel();
    updateLevelDisplay();
    updateScoreDisplay();
    updateLivesDisplay();
    
    gameIsRunning = true;
    gameLoop();
}

// Main game loop
function gameLoop() {
    if (!gameIsRunning) return;
    
    // Request next frame
    requestAnimationFrame(gameLoop);
    
    // Update player
    updatePlayer();
    
    // Spawn teachers based on time
    const currentTime = Date.now();
    if (currentTime - lastSpawnTime > spawnRate) {
        spawnTeacher();
        lastSpawnTime = currentTime;
    }
    
    // Spawn books for bonus points
    if (currentTime - lastBookSpawnTime > bookSpawnRate) {
        spawnBook();
        lastBookSpawnTime = currentTime;
    }
    
    // Update game objects
    updateTeachers();
    updateBooks();
    
    // Check collisions
    checkCollisions();
    
    // Check if level is complete
    frameCount++;
    if (frameCount % 60 === 0) { // Check every ~1 second (assuming 60fps)
        checkLevelComplete();
    }
}