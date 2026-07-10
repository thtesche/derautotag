import React, { useEffect, useRef, useState } from 'react';

// SVG-Template für das Top-Down Rennauto (farbunabhängig)
const RACER_SVG_TEMPLATE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 80">
  <ellipse cx="25" cy="42" rx="22" ry="36" fill="rgba(0,0,0,0.15)"/>
  <rect x="3" y="10" width="7" height="12" rx="2" fill="#1a1a1a"/>
  <rect x="40" y="10" width="7" height="12" rx="2" fill="#1a1a1a"/>
  <rect x="3" y="58" width="7" height="12" rx="2" fill="#1a1a1a"/>
  <rect x="40" y="58" width="7" height="12" rx="2" fill="#1a1a1a"/>
  <path d="M25 4 C18 4 12 10 10 20 C8 28 7 35 7 40 C7 55 10 70 15 75 C18 78 22 79 25 79 C28 79 32 78 35 75 C40 70 43 55 43 40 C43 35 42 28 40 20 C38 10 32 4 25 4Z" fill="__COLOR__" stroke="#a4133a" stroke-width="1.2"/>
  <rect x="22" y="8" width="6" height="64" rx="2" fill="rgba(255,255,255,0.25)"/>
  <path d="M16 18 C16 14 20 12 25 12 C30 12 34 14 34 18 L33 28 C33 29 31 30 25 30 C19 30 17 29 17 28Z" fill="rgba(173,216,230,0.8)" stroke="rgba(100,180,210,0.5)" stroke-width="0.5"/>
  <path d="M18 52 C18 48 21 45 25 45 C29 45 32 48 32 52 L31 60 C31 61 29 62 25 62 C21 62 19 61 19 60Z" fill="rgba(173,216,230,0.6)" stroke="rgba(100,180,210,0.4)" stroke-width="0.5"/>
  <rect x="12" y="72" width="26" height="4" rx="2" fill="#a4133a" stroke="#a4133a" stroke-width="0.5"/>
  <ellipse cx="15" cy="8" rx="3" ry="2" fill="#fff9c4"/>
  <ellipse cx="35" cy="8" rx="3" ry="2" fill="#fff9c4"/>
  <ellipse cx="15" cy="74" rx="3" ry="1.5" fill="#ff1744"/>
  <ellipse cx="35" cy="74" rx="3" ry="1.5" fill="#ff1744"/>
  <line x1="25" y1="32" x2="25" y2="50" stroke="rgba(0,0,0,0.1)" stroke-width="0.5"/>
</svg>`;

// Helper: darker version of a hex color
function darkenHexColor(hex, amount) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  r = Math.max(0, Math.floor(r * (1 - amount)));
  g = Math.max(0, Math.floor(g * (1 - amount)));
  b = Math.max(0, Math.floor(b * (1 - amount)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Erstelle ein Top-Down Rennauto-Sprite synchron auf Canvas
function createCarSprite(color, width = 50, height = 50) {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d');
  const cx = width / 2;
  const w = width;
  const h = height;
  
  // Schatten
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(cx + 2, h / 2 + 2, w / 2 + 2, h / 2 - 4, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Räder (4 kleine Rechtecke mit abgerundeten Ecken)
  ctx.fillStyle = '#1a1a1a';
  const wheelW = 7, wheelH = 12, wheelR = 2;
  // vorne links
  ctx.beginPath();
  ctx.roundRect(0, 10, wheelW, wheelH, wheelR);
  ctx.fill();
  // vorne rechts
  ctx.beginPath();
  ctx.roundRect(w - wheelW, 10, wheelW, wheelH, wheelR);
  ctx.fill();
  // hinten links
  ctx.beginPath();
  ctx.roundRect(0, h - wheelH - 8, wheelW, wheelH, wheelR);
  ctx.fill();
  // hinten rechts
  ctx.beginPath();
  ctx.roundRect(w - wheelW, h - wheelH - 8, wheelW, wheelH, wheelR);
  ctx.fill();
  
  // Karosserie - Rennform
  ctx.fillStyle = color;
  ctx.beginPath();
  // Nase (vorne) - abgerundet
  ctx.moveTo(cx, 4);
  ctx.quadraticCurveTo(2, 10, 6, 20);
  ctx.quadraticCurveTo(1, 30, 1, h / 2);
  // Seiten
  ctx.quadraticCurveTo(1, 55, 6, 70);
  ctx.quadraticCurveTo(12, 76, cx, 78);
  // Rechte Seite (hinten)
  ctx.quadraticCurveTo(w - 12, 76, w - 6, 70);
  ctx.quadraticCurveTo(w - 1, 55, w - 1, h / 2);
  // Rechte Seite (vorne)
  ctx.quadraticCurveTo(w - 1, 30, w - 6, 20);
  ctx.quadraticCurveTo(w - 2, 10, cx, 4);
  ctx.closePath();
  ctx.fill();
  
  // Karosserie-Kontur
  ctx.strokeStyle = darkenHexColor(color, 0.2);
  ctx.lineWidth = 1.2;
  ctx.stroke();
  
  // Rennstreifen (Mitte)
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(cx - 3, 8, 6, h - 16);
  
  // Windschutzscheibe (vorne)
  ctx.fillStyle = 'rgba(173,216,230,0.8)';
  ctx.beginPath();
  ctx.moveTo(14, 18);
  ctx.quadraticCurveTo(cx, 12, w - 14, 18);
  ctx.lineTo(w - 17, 28);
  ctx.quadraticCurveTo(cx, 30, 17, 28);
  ctx.closePath();
  ctx.fill();
  
  // Heckscheibe
  ctx.fillStyle = 'rgba(173,216,230,0.6)';
  ctx.beginPath();
  ctx.moveTo(16, 52);
  ctx.quadraticCurveTo(cx, 45, w - 16, 52);
  ctx.lineTo(w - 19, 60);
  ctx.quadraticCurveTo(cx, 62, 19, 60);
  ctx.closePath();
  ctx.fill();
  
  // Spoiler
  ctx.fillStyle = darkenHexColor(color, 0.3);
  ctx.beginPath();
  ctx.roundRect(12, h - 8, w - 24, 4, 2);
  ctx.fill();
  
  // Scheinwerfer (vorne)
  ctx.fillStyle = '#fff9c4';
  ctx.beginPath();
  ctx.ellipse(15, 8, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(w - 15, 8, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Rücklichter (hinten)
  ctx.fillStyle = '#ff1744';
  ctx.beginPath();
  ctx.ellipse(15, h - 6, 3, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(w - 15, h - 6, 3, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Seitenspalt (Renn-Look)
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx, 32);
  ctx.lineTo(cx, 50);
  ctx.stroke();
  
  return c;
}

// Zeichne Rennauto direkt auf Canvas (für Menü-Vorschau)
function drawRacerOnCanvas(ctx, x, y, w, h, color) {
  const cx = x + w / 2;
  
  // Schatten
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.roundRect(x + 6, y + 6, w - 12, h - 12, 10);
  ctx.fill();
  
  // Räder
  ctx.fillStyle = '#222';
  const wheelW = 8, wheelH = 14, wheelR = 2;
  ctx.beginPath();
  ctx.roundRect(x + 2, y + 12, wheelW, wheelH, wheelR);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(x + w - 10, y + 12, wheelW, wheelH, wheelR);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(x + 2, y + h - 26, wheelW, wheelH, wheelR);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(x + w - 10, y + h - 26, wheelW, wheelH, wheelR);
  ctx.fill();
  
  // Karosserie - Rennform
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, y + 4);
  ctx.quadraticCurveTo(x + 2, y + 10, x + 6, y + 20);
  ctx.quadraticCurveTo(x + 1, y + 30, x + 1, y + h / 2);
  ctx.quadraticCurveTo(x + 1, y + 55, x + 6, y + 70);
  ctx.quadraticCurveTo(x + 12, y + 76, cx, y + 78);
  ctx.quadraticCurveTo(w - 12, y + 76, w - 6, y + 70);
  ctx.quadraticCurveTo(w - 1, y + 55, w - 1, y + h / 2);
  ctx.quadraticCurveTo(w - 1, y + 30, w - 6, y + 20);
  ctx.quadraticCurveTo(w - 2, y + 10, cx, y + 4);
  ctx.closePath();
  ctx.fill();
  
  // Kontur
  ctx.strokeStyle = darkenHexColor(color, 0.3);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  
  // Rennstreifen
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(cx - 3, y + 8, 6, h - 16);
  
  // Windschutzscheibe (vorne)
  ctx.fillStyle = 'rgba(173,216,230,0.85)';
  ctx.beginPath();
  ctx.moveTo(x + 16, y + 18);
  ctx.quadraticCurveTo(cx, y + 12, x + w - 16, y + 18);
  ctx.lineTo(x + w - 19, y + 28);
  ctx.quadraticCurveTo(cx, y + 30, x + 19, y + 28);
  ctx.closePath();
  ctx.fill();
  
  // Heckscheibe
  ctx.fillStyle = 'rgba(173,216,230,0.6)';
  ctx.beginPath();
  ctx.moveTo(x + 18, y + 52);
  ctx.quadraticCurveTo(cx, y + 45, x + w - 18, y + 52);
  ctx.lineTo(x + w - 21, y + 60);
  ctx.quadraticCurveTo(cx, y + 62, x + 21, y + 60);
  ctx.closePath();
  ctx.fill();
  
  // Spoiler
  ctx.fillStyle = darkenHexColor(color, 0.3);
  ctx.beginPath();
  ctx.roundRect(x + 14, y + h - 8, w - 28, 4, 2);
  ctx.fill();
  
  // Scheinwerfer
  ctx.fillStyle = '#ffffaa';
  ctx.beginPath();
  ctx.ellipse(x + 14, y + 8, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + w - 14, y + 8, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Rücklichter
  ctx.fillStyle = '#ff1744';
  ctx.beginPath();
  ctx.ellipse(x + 14, y + h - 6, 4, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + w - 14, y + h - 6, 4, 2, 0, 0, Math.PI * 2);
  ctx.fill();
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

    // Zeichne Spieler-Auto als Sprite (Top-Down Rennauto)
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
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => resetGame(garage.selectedColor)}
                  onKeyDown={(e) => { if (e.key === 'Enter') resetGame(garage.selectedColor); }}
                  style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', borderRadius: '5px', border: 'none', backgroundColor: '#3b82f6', color: 'white' }}
                >
                  Nochmal spielen
                </div>
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
            
            {/* Top-Down Rennauto-Vorschau im Menü */}
            <canvas
              ref={(el) => {
                if (el) {
                  const ctx = el.getContext('2d');
                  const w = 120, h = 180;
                  el.width = w;
                  el.height = h;
                  ctx.clearRect(0, 0, w, h);
                  drawRacerOnCanvas(ctx, 0, 0, w, h, menuColor);
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
