console.log('start');

// 캔버스 정의
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const scoreEl = document.querySelector('#scoreEl');
const gameoverEl = document.querySelector('#gameoverEl');
const resultEl = document.querySelector('#resultEl');
const retryEl = document.querySelector('#retryEl');
const startEl = document.querySelector('#startEl');

canvas.width = innerWidth;
canvas.height = innerHeight;

const x = canvas.width / 2;
const y = canvas.height / 2;

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
};

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
};

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
};

const friction = 0.97;
class Particle {
  constructor(x, y, radius, color, velocity, alpha) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.color = RandomColor();
    this.alpha -= 0.01;
  }
};

let player = new Player(x, y, 10, 'white'); 
let projectiles = [];
let enemies = [];
let particles = [];
let animateId = () => {};
let intervalId = () => {};
let score = 0;

const init = () => {
  player = new Player(x, y, 10, 'white'); 
  projectiles = [];
  enemies = [];
  particles = [];
  animateId = () => {};
  intervalId = () => {};
  score = 0;
  scoreEl.innerHTML = score;
}

player.draw();

const SpawnEnemy = () => {
  intervalId = setInterval(() => {
    const radius = Math.random() * (30 - 10) + 10;
    
    let x = 0;
    let y = 0;
    
    if(Math.random() < 0.5){
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;  
    }

    
    let newangle = Math.atan2(x - canvas.width / 2, y - canvas.height/2);
    const velocity = {
      x: Math.sin(newangle) * -1, 
      y: Math.cos(newangle) * -1,
    }
    
    const color = RandomColor();

    enemies.push(new Enemy(
      x,
      y,
      radius,
      color,
      {
        x:velocity.x,
        y:velocity.y
      }
    ))
  },1000)
}

const animate = () => {
  animateId = requestAnimationFrame(animate);
  c.fillStyle = 'rgba(0, 0, 0, 0.1)';
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();

  for(let particleIdx = particles.length - 1; particleIdx >=0; particleIdx--){
    const particle = particles[particleIdx];
    if(particle.alpha <= 0){
      particles.splice(particleIdx, 1);
    } else {
      particle.update();
    }
  }

  for(let projIdx = projectiles.length - 1; projIdx >= 0; projIdx--){
    const projectile = projectiles[projIdx];
    projectile.update();
    if(projectile.x < 0 - projectile.radius / 2 ||
      projectile.x > canvas.width + projectile.radius / 2 ||
      projectile.y < 0 - projectile.radius / 2 ||
      projectile.y > canvas.height + projectile.radius / 2
    ) {
      projectiles.splice(projIdx, 1);
    }
  }

  for(let enemyIdx = enemies.length - 1; enemyIdx >= 0; enemyIdx--){
    const enemy = enemies[enemyIdx];
    enemy.update();
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    if(dist <= player.radius + enemy.radius){
      resultEl.innerText = score;
      gsap.fromTo('#gameoverEl', {opacity:0.8, scale:0.8}, 
        {opacity:1, scale:1, ease:'expo'}
      )
      gameoverEl.style.display = 'flex';
      cancelAnimationFrame(animateId)
      clearInterval(intervalId);
    }
      
    for(let projIdx = projectiles.length - 1; projIdx >= 0; projIdx--){
        const projectile = projectiles[projIdx];
        const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
        
        if(dist <= projectile.radius + enemy.radius){
          for(let i = 0; i < enemy.radius * 2; i++){
            particles.push(new Particle(enemy.x, enemy.y, Math.random() * 2, 'red', 
            {
              x:(Math.random() - 0.5) * Math.random() * 7, 
              y:(Math.random() - 0.5) * Math.random() * 7
            }))
          }
          if(enemy.radius > 15){
            score += 50;
            scoreEl.innerHTML = score;
            gsap.to(enemy, {
              radius: enemy.radius - 10
            })
            projectiles.splice(projIdx,1);
          } else {
            score += 150;
            scoreEl.innerHTML = score;
            projectiles.splice(projIdx,1);
            enemies.splice(enemyIdx,1);
          }
        }
    }
  }
};

addEventListener('click', (e) => {
  const opp = e.clientX - canvas.width / 2 ;
  const adj = e.clientY - canvas.height / 2;
  const angle = Math.atan2(adj, opp);
  const velocity = {
    x: Math.cos(angle),
    y: Math.sin(angle),
  }

  projectiles.push(new Projectile(
    canvas.width / 2, 
    canvas.height / 2, 
    5, 
    'rbga(255,255,255,1)', 
    {
      x:velocity.x * 6,
      y:velocity.y * 6,
    }
  ))
});

startEl.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  init();
  SpawnEnemy();
  animate();
  gsap.to('#startEl', {
    opacity:0,
    scale:0.8,
    duration:0.2,
    ease:'expo.in',
    onComplete: () => {
      startEl.style.display = 'none';
    }
  })
})


retryEl.addEventListener('click', (e) => {
  e.stopPropagation();

  init();


  SpawnEnemy();
  animate();

  gsap.to('#gameoverEl', {
    opacity:0,
    scale:0.8,
    duration:0.2,
    ease:'expo.in',
    onComplete: () => {
      gameoverEl.style.display = 'none';
    }
  })
  // gsap.to('#gameoverEl', {
  //   opacity:0
  // })
  

})

const Random = (max) => {
  return Math.floor(Math.random() * max);
}

const rad2Deg = (x) => {
  return x * 180 / Math.PI
}

const RandomColor = () => {
  let arr = [];
  for(let i = 0; i < 3; i++){
    arr.push(Math.floor(Math.random() * 255));
  }
  let o = Math.round(Math.random() * 10) / 10;
  let result = `rgba(${arr[0]},${arr[1]},${arr[2]},1)`

  let test = `hsl(${Math.random() * 360}, 50%, 50%)`;

  return test;
}
