import React, { useEffect, useRef, useState } from 'react';

const Game = () => {
  // Persistent State (simuliert eine Datenbank/Garage)
  const [garage, setGarage] = useState({
    selectedColor: '#3b82f6',
    ownedColors: ['#3b82f6']
  });

  const canvasRef = useRef(null);
  const requestRef = useRef();
  
  // Wir nutzen ein Ref für den Spielzustand, aber wir müssen sicherstellen, 
  // dass die Farbe beim Reset aus dem aktuellen State kommt.
  const gameStateRef = useRef({
    player: { x: 175, y: 350, width: 50, height: 50, speed: 7, hasShield: false, color: '#3b82f6' },
    obstacles: [],
    powerups: [],
    score: 0,
    gameOver: false,
    keys: {},
    lastSpawnTime: 0,
    lastPowerupScore: 0,
    shieldCount: 0,
  });

  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showCarMenu, setShowCarMenu] = useState(false);
  const [menuColor, setMenuColor] = useState('#3b82f6');

  useEffect(() => {
    const handleKeyDown = (e) => (gameStateRef.current.keys[e.code] = true);
    const handleKeyUp = (e) => (gameStateRef.current.keys[e.code] = false);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // WICHTIG: resetGame muss die aktuelle garage.selectedColor kennen!
  const resetGame = (colorToUse) => {
    setCountdown(3);
    setIsGameOver(false);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      gameStateRef.current = {
        player: { 
          x: 175, 
          y: 350, 
          width: 50, 
          height: 50, 
          speed: 7, 
          hasShield: false,
          color: colorToUse // Hier wird die Farbe explizit gesetzt!
        },
        obstacles: [],
        powerups: [],
        score: 0,
        gameOver: false,
        keys: {},
        lastSpawnTime: performance.now(),
        lastPowerupScore: 0,
        shieldCount: 0,
      };
      setScore(0);
      setCountdown(0);
    }, 3000);
  };

  const update = (deltaTime) => {
    const state = gameStateRef.current;
    if (state.gameOver || countdown > 0 || showCarMenu) return;

    if (state.keys['ArrowLeft'] && state.player.x > 0) {
      state.player.x -= state.player.speed;
    }
    if (state.keys['ArrowRight'] && state.player.x < 400 - state.player.width) {
      state.player.x += state.player.speed;
    }

    if (state.score > 0 && state.score % 10 === 0 && state.score !== state.lastPowerupScore) {
      state.powerups.push({
        x: Math.random() * (400 - 30),
        y: -50,
        width: 30,
        height: 30,
        speed: 4,
      });
      state.lastPowerupScore = state.score;
    }

    const now = performance.now();
    if (now - state.lastSpawnTime > 1000) {
      const width = 40 + Math.random() * 30;
      state.obstacles.push({
        x: Math.random() * (400 - width),
        y: -50,
        width: width,
        height: 30,
        speed: 3 + Math.random() * 4,
      });
      state.lastSpawnTime = now;
    }

    state.powerups.forEach((p, index) => {
      p.y += p.speed;
      if (
        state.player.x < p.x + p.width &&
        state.player.x + state.player.width > p.x &&
        state.player.y < p.y + p.height &&
        state.player.y + state.player.height > p.y
      ) {
        state.player.hasShield = true;
        state.shieldCount += 1;
        state.powerups.splice(index, 1);

        if (state.shieldCount >= 3) {
          setShowCarMenu(true);
        }
      }
      if (p.y > 400) state.powerups.splice(index, 1);
    });

    state.obstacles.forEach((obs, index) => {
      obs.y += obs.speed;
      if (
        state.player.x < obs.x + obs.width &&
        state.player.x + state.player.width > obs.x &&
        state.player.y < obs.y + obs.height &&
        state.player.y + state.player.height > obs.y
      ) {
        if (state.player.hasShield) {
          state.player.hasShield = false;
          state.obstacles.splice(index, 1);
        } else {
          state.gameOver = true;
          setIsGameOver(true);
        }
      }
      if (obs.y > 400) {
        state.obstacles.splice(index, 1);
        state.score += 1;
        setScore(state.score);
      }
    });
  };

  const draw = (ctx) => {
    const state = gameStateRef.current;
    ctx.clearRect(0, 0, 400, 400);

    ctx.fillStyle = '#22c55e';
    state.powerups.forEach((p) => {
      ctx.fillRect(p.x, p.y, p.width, p.height);
    });

    ctx.fillStyle = '#ef4444';
    state.obstacles.forEach((obs) => {
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });

    ctx.fillStyle = state.player.hasShield ? '#a855f7' : (state.player.color || '#3b82f6');
    ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);
    
    if (state.player.hasShield) {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 4;
      ctx.strokeRect(state.player.x - 2, state.player.y - 2, state.player.width + 4, state.player.height + 4);
    }
  };

  const gameLoop = (time) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    update(time);
    draw(ctx);
    if (!gameStateRef.current.gameOver && countdown === 0 && !showCarMenu) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [countdown, showCarMenu]);

  const handleSaveCar = () => {
    // 1. Garage aktualisieren
    setGarage(prev => {
      const newOwned = prev.ownedColors.includes(menuColor) 
        ? prev.ownedColors 
        : [...prev.ownedColors, menuColor];
      return {
        ...prev,
        selectedColor: menuColor,
        ownedColors: newOwned
      };
    });

    setShowCarMenu(false);
    gameStateRef.current.shieldCount = 0;
    // 2. Reset mit der gewählten Farbe aufrufen!
    resetGame(menuColor);
  };

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f3f4f6' 
    }}>
      <div style={{ marginBottom: '10px', fontSize: '24px', fontWeight: 'bold' }}>Score: {score}</div>
      <div style={{ position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <canvas ref={canvasRef} width={400} height={400} style={{ backgroundColor: '#ffffff', display: 'block' }} />
        
        {(isGameOver || countdown > 0) && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', color: 'white'
          }}>
            {isGameOver ? (
              <>
                <h2 style={{ margin: '0 0 10px 0' }}>GAME OVER</h2>
                <button onClick={() => resetGame(garage.selectedColor)} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', borderRadius: '5px', border: 'none', backgroundColor: '#3b82f6', color: 'white' }}>
                  Nochmal spielen
                </button>
              </>
            ) : (
              <h2 style={{ margin: '0' }}>Startet in {countdown}...</h2>
            )}
          </div>
        )}

        {showCarMenu && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.95)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', color: '#333', padding: '20px'
          }}>
            <h2 style={{ margin: '0 0 15px 0' }}>Wähle dein Auto!</h2>
            
            <div style={{ 
              width: '120px', height: '60px', backgroundColor: menuColor, 
              borderRadius: '10px', position: 'relative', marginBottom: '20px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}>
              <div style={{ position: 'absolute', top: '10px', left: '25px', width: '40px', height: '20px', backgroundColor: '#add8e6', borderRadius: '5px' }} />
              <div style={{ position: 'absolute', bottom: '-5px', left: '15px', width: '20px', height: '10px', backgroundColor: '#333', borderRadius: '5px' }} />
              <div style={{ position: 'absolute', bottom: '-5px', right: '15px', width: '20px', height: '10px', backgroundColor: '#333', borderRadius: '5px' }} />
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
              {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1', '#ec4899'].map(color => (
                <div 
                  key={color}
                  onClick={() => setMenuColor(color)}
                  style={{ 
                    width: '30px', height: '30px', backgroundColor: color, 
                    borderRadius: '50%', cursor: 'pointer', border: menuColor === color ? '3px solid #000' : '2px solid transparent' 
                  }}
                />
              ))}
            </div>

            <button onClick={handleSaveCar} style={{ 
              padding: '10px 30px', fontSize: '18px', cursor: 'pointer', borderRadius: '5px', 
              border: 'none', backgroundColor: '#333', color: 'white' 
            }}>
              Los geht's!
            </button>
          </div>
        )}
      </div>
      <p style={{ marginTop: '15px', color: '#6b7280' }}>Nutze die Pfeiltasten ← → zum Ausweichen</p>
    </div>
  );
};

export default Game;
