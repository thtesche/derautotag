import React, { useEffect, useRef, useState } from 'react';

// Erstelle ein Top-Down Auto-Sprite für eine gegebene Farbe
function createCarSprite(color, width = 50, height = 50) {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d');
  const w = width;
  const h = height;

  // Schatten
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.roundRect(4, 4, w - 8, h - 8, 8);
  ctx.fill();

  // Karosserie
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(3, 3, w - 6, h - 6, 8);
  ctx.fill();

  // Karosserie-Kontur
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(3, 3, w - 6, h - 6, 8);
  ctx.stroke();

  // Windschutzscheibe (oben = vorne)
  ctx.fillStyle = 'rgba(173, 216, 230, 0.85)';
  ctx.beginPath();
  ctx.roundRect(8, 6, w - 16, 14, 4);
  ctx.fill();

  // Heckscheibe
  ctx.fillStyle = 'rgba(173, 216, 230, 0.6)';
  ctx.beginPath();
  ctx.roundRect(8, h - 20, w - 16, 10, 3);
  ctx.fill();

  // Türen (linke & rechte Linie)
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w / 2, 22);
  ctx.lineTo(w / 2, h - 18);
  ctx.stroke();

  // Räder (4 kleine Rechtecke)
  ctx.fillStyle = '#222';
  const wheelW = 6, wheelH = 10;
  // vorne links
  ctx.fillRect(1, 8, wheelW, wheelH);
  // vorne rechts
  ctx.fillRect(w - wheelW - 1, 8, wheelW, wheelH);
  // hinten links
  ctx.fillRect(1, h - wheelH - 8, wheelW, wheelH);
  // hinten rechts
  ctx.fillRect(w - wheelW - 1, h - wheelH - 8, wheelW, wheelH);

  // Scheinwerfer (vorne)
  ctx.fillStyle = '#ffffaa';
  ctx.beginPath();
  ctx.ellipse(8, 5, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(w - 8, 5, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rücklichter (hinten)
  ctx.fillStyle = '#ff3333';
  ctx.beginPath();
  ctx.ellipse(8, h - 5, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(w - 8, h - 5, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

const Game = () => {
  // Persistent State (simuliert eine Datenbank/Garage)
  const [garage, setGarage] = useState({
    selectedColor: '#3b82f6',
    ownedColors: ['#3b82f6']
  });

  const canvasRef = useRef(null);
  const requestRef = useRef();
  const spriteCacheRef = useRef({});

  // Cache: eine Sprite-Instanz pro Farbe+Höhe-Kombination
  const getSprite = (color, width, height) => {
    const key = `${color}_${width}_${height}`;
    if (!spriteCacheRef.current[key]) {
      spriteCacheRef.current[key] = createCarSprite(color, width, height);
    }
    return spriteCacheRef.current[key];
  };

  // Wir nutzen ein Ref für den Spielzustand, aber wir müssen sicherstellen, 
  // dass die Farbe beim Reset aus dem aktuellen State kommt.
  const gameStateRef = useRef({
    player: { x: 175, y: 350, width: 50, height: 80, speed: 7, hasShield: false, color: '#3b82f6' },
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
            height: 80, 
            speed: 7, 
            hasShield: false,
            color: colorToUse
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

    // Zeichne Spieler-Auto als Sprite (Top-Down)
    const playerColor = state.player.hasShield ? '#a855f7' : (state.player.color || '#3b82f6');
    const playerSprite = getSprite(playerColor, state.player.width, state.player.height);
    ctx.drawImage(playerSprite, state.player.x, state.player.y);
    
    // Schild-Effekt: leuchtender Umriss
    if (state.player.hasShield) {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 12;
      ctx.strokeRect(
        state.player.x - 3, state.player.y - 3,
        state.player.width + 6, state.player.height + 6
      );
      ctx.shadowBlur = 0;
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
            
            {/* Top-Down Auto-Vorschau im Menü */}
            <canvas
              ref={(el) => {
                if (el) {
                  const ctx = el.getContext('2d');
                  const w = 120, h = 180;
                  el.width = w;
                  el.height = h;
                  ctx.clearRect(0, 0, w, h);

                  // Schatten
                  ctx.fillStyle = 'rgba(0,0,0,0.2)';
                  ctx.beginPath();
                  ctx.roundRect(6, 6, w - 12, h - 12, 10);
                  ctx.fill();

                  // Karosserie
                  ctx.fillStyle = menuColor;
                  ctx.beginPath();
                  ctx.roundRect(4, 4, w - 8, h - 8, 10);
                  ctx.fill();

                  // Kontur
                  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                  ctx.lineWidth = 1.5;
                  ctx.beginPath();
                  ctx.roundRect(4, 4, w - 8, h - 8, 10);
                  ctx.stroke();

                  // Windschutzscheibe (oben = vorne)
                  ctx.fillStyle = 'rgba(173, 216, 230, 0.85)';
                  ctx.beginPath();
                  ctx.roundRect(16, 8, w - 32, 20, 5);
                  ctx.fill();

                  // Heckscheibe
                  ctx.fillStyle = 'rgba(173, 216, 230, 0.6)';
                  ctx.beginPath();
                  ctx.roundRect(16, h - 30, w - 32, 14, 4);
                  ctx.fill();

                  // Türlinie
                  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
                  ctx.lineWidth = 1;
                  ctx.beginPath();
                  ctx.moveTo(w / 2, 32);
                  ctx.lineTo(w / 2, h - 26);
                  ctx.stroke();

                  // Räder
                  ctx.fillStyle = '#222';
                  ctx.fillRect(2, 12, 8, 14);
                  ctx.fillRect(w - 10, 12, 8, 14);
                  ctx.fillRect(2, h - 26, 8, 14);
                  ctx.fillRect(w - 10, h - 26, 8, 14);

                  // Scheinwerfer
                  ctx.fillStyle = '#ffffaa';
                  ctx.beginPath();
                  ctx.ellipse(14, 7, 4, 3, 0, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.beginPath();
                  ctx.ellipse(w - 14, 7, 4, 3, 0, 0, Math.PI * 2);
                  ctx.fill();

                  // Rücklichter
                  ctx.fillStyle = '#ff3333';
                  ctx.beginPath();
                  ctx.ellipse(14, h - 7, 4, 3, 0, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.beginPath();
                  ctx.ellipse(w - 14, h - 7, 4, 3, 0, 0, Math.PI * 2);
                  ctx.fill();
                }
              }}
              width={120}
              height={180}
              style={{ marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
            />

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
