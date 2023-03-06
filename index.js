console.log('start');

// 캔버스 정의
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const scoreEl = document.querySelector('#scoreEl');
const gameoverEl = document.querySelector('#gameoverEl');
const resultEl = document.querySelector('#resultEl');
const retryEl = document.querySelector('#retryEl');
const startEl = document.querySelector('#startEl');
const volumeEl = document.querySelector('#volumeEl');
const muteEl = document.querySelector('#muteEl');

canvas.width = innerWidth;
canvas.height = innerHeight;



let player;
let projectiles = [];
let enemies = [];
let particles = [];
let animateId = () => {};
let intervalId = () => {};
let score = 0;
let powerups = [];
let frames = 0;
let BackGroundParticles = [];
let bgmInit = false;

const init = () => {
  const x = canvas.width / 2;
  const y = canvas.height / 2;
  player = new Player(x, y, 10, 'white'); 
  projectiles = [];
  enemies = [];
  particles = [];
  powerups = [];
  animateId = () => {};
  intervalId = () => {};
  score = 0;
  scoreEl.innerHTML = score;
  frames = 0;
  BackGroundParticles = []
  bgmInit = false;
  volumeEl.parentNode.style.display = 'block';

  const spacing = 20;

  for(let x = 0; x < canvas.width + spacing; x += spacing){
    for(let y = 0; y < canvas.height + spacing; y += spacing){
      BackGroundParticles.push(
        new BackGroundParticle({position:{x:x,y:y}, color:'grey', radius:2})
        )
    }
  }
}



const SpawnEnemy = () => {
  intervalId = setInterval(() => {
    const radius = Math.random() * (20 - 10) + 10;
    
    let x = 0;
    let y = 0;
    
    if(Math.random() < 0.5){
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;  
    }

    let newangle = Math.atan2(x - player.x, y - player.y);
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

const SpawnPowerup = () => {
  intervalPower = setInterval(() => {
    powerups.push(new PowerUp({
      position: { 
        x:-30,
        y:Math.random()*(canvas.height - 50) + 30,
      },
      velocity: {
        x:Math.random() + 1,
        y:2 * Math.random()
      }
    }))
  }, 2000)
}

const CreateScoreLabel = ({position, score}) => {
  const scoreLabel = document.createElement('label');
  scoreLabel.innerHTML = score;
  scoreLabel.style.position = 'absolute';
  scoreLabel.style.left = position.x + 'px';
  scoreLabel.style.top = position.y + 'px';
  scoreLabel.style.zIndex = 100;
  scoreLabel.style.color = 'white';
  scoreLabel.style.userSelect = 'none';

  gsap.to(scoreLabel,{
    opacity:0,
    y:-30,
    duration:0.75,
    onComplete: () => {
      scoreLabel.parentNode.removeChild(scoreLabel)
    }
  })

  document.body.appendChild(scoreLabel);
}

const animate = () => {
  player.draw();
  frames++;
  animateId = requestAnimationFrame(animate);
  c.fillStyle = 'rgba(0, 0, 0, 0.2)';
  c.fillRect(0, 0, canvas.width, canvas.height);

  for(let i = 0; i < BackGroundParticles.length; i++){
    const backgroundParticle = BackGroundParticles[i];
    backgroundParticle.draw();
    
    const dist = Math.hypot(
      player.x - backgroundParticle.position.x, 
      player.y - backgroundParticle.position.y);

    if(dist < 100){
      backgroundParticle.alpha = 0;
      if(dist > 70){
        backgroundParticle.alpha = 0.5;
      }
    } else if(dist > 100 && backgroundParticle.alpha < 0.1){
      backgroundParticle.alpha += 0.01;
    } else if(dist > 100 && backgroundParticle.alpha > 0.1){
      backgroundParticle.alpha -= 0.01;
    }
  }
  player.update();

  for(let powerupIdx = powerups.length - 1; powerupIdx >= 0; powerupIdx--){
    const powerup = powerups[powerupIdx];

    if(powerup.position.x >= canvas.width + 30){
      powerups.splice(powerupIdx, 1);
    } else {
      powerup.update();
    }
    const dist = Math.hypot(player.x - powerup.position.x, player.y - powerup.position.y);
    if(dist <= player.radius + Math.sqrt((powerup.img.width * powerup.img.width) + (powerup.img.height * powerup.img.height)) / 2){
      audio.powerupNoise.play();
      powerups.splice(powerupIdx, 1);
      player.powerUp = 'MachineGun'
      player.color = 'yellow';
      setTimeout(() => {
        player.powerUp = 'null';
        player.color = 'white';
      },5000) 
    }
    

  }


  if(player.powerUp === 'MachineGun'){
    const opp = mouse.position.x - player.x;
    const adj = mouse.position.y - player.y;
    const angle = Math.atan2(adj, opp);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    }
  
    
    if(frames % 2 === 0){
      projectiles.push(new Projectile(
        player.x + player.velocity.x, 
        player.y + player.velocity.y, 
        3, 
        'yellow', 
        {
          x:velocity.x * 6,
          y:velocity.y * 6,
        }
      ))
    }
    if(frames % 8 === 0)audio.shoot.play();
  }

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
      audio.death.play();
      resultEl.innerText = score;
      gsap.fromTo('#gameoverEl', {opacity:0.8, scale:0.8}, 
        {opacity:1, scale:1, ease:'expo'}
      )
      gameoverEl.style.display = 'flex';
      cancelAnimationFrame(animateId)
      clearInterval(intervalId);
      clearInterval(intervalPower);
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
            audio.damageTaken.play();
            score += 50;
            scoreEl.innerHTML = score;
            gsap.to(enemy, {
              radius: enemy.radius - 10
            })
            projectiles.splice(projIdx,1);
            CreateScoreLabel({
              position:{
                x:enemy.x,
                y:enemy.y,
              },
              score: 50
            });
          } else {
            audio.explode.play();
          
            score += 150;
            scoreEl.innerHTML = score;
            projectiles.splice(projIdx,1);
            enemies.splice(enemyIdx,1);
            CreateScoreLabel({
              position:{
                x:enemy.x,
                y:enemy.y,
              },
              score: 150
            });
          }

          BackGroundParticles.forEach(backgroundParticle => {
            gsap.set(backgroundParticle, {
              color:'white',
              alpha: 0.8
            })

            gsap.to(backgroundParticle, {
              color:enemy.color,
              alpha: 0.1
            })
          });


          
        }
    }
  }
};

const mouse = {
  position:{
    x:0,
    y:0,
  }
}

addEventListener('mousemove', (e) => {

  mouse.position = {
    x:e.clientX,
    y:e.clientY,
  }
})

addEventListener('click', (e) => {
  audio.shoot.play();
  const opp = e.clientX - player.x;
  const adj = e.clientY - player.y;
  const angle = Math.atan2(adj, opp);
  const velocity = {
    x: Math.cos(angle),
    y: Math.sin(angle),
  }

  projectiles.push(new Projectile(
    player.x + player.velocity.x, 
    player.y + player.velocity.y, 
    5, 
    'rbga(255,255,255,1)', 
    {
      x:velocity.x * 6,
      y:velocity.y * 6,
    }
  ))
});


startEl.addEventListener('click', (e) => {
  audio.select.play();
  e.preventDefault();
  e.stopPropagation();
  init();

  if(!audio.background.playing() && !bgmInit === true){
    audio.background.play();
    bgmInit = true;
  }
  SpawnEnemy();
  SpawnPowerup();
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

volumeEl.addEventListener('click', (e) => {
  audio.background.pause();
  volumeEl.parentNode.style.display = 'none';
  muteEl.parentNode.style.display = 'block';
})

muteEl.addEventListener('click', (e) => {
  audio.background.play();
  volumeEl.parentNode.style.display = 'block';
  muteEl.parentNode.style.display = 'none';
})

document.addEventListener('visibilitychange', (e) => {
  if(document.hidden) {
    clearInterval(intervalId);
    clearInterval(intervalPower);
  } else {
    SpawnEnemy();
    SpawnPowerup();
  }
  console.log('fuck')
})

retryEl.addEventListener('click', (e) => {
  audio.select.play();
  clearInterval(intervalPower);
  e.stopPropagation();
  init();
  SpawnEnemy();
  SpawnPowerup();
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

addEventListener('resize', (e) => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  init();
})

addEventListener('keydown', (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  switch(e.key){
    case 'ArrowDown' :
      player.velocity.y += 1;
      break;
    case 'ArrowUp' :
      player.velocity.y -= 1;
      break;
    case 'ArrowLeft' :
      player.velocity.x -= 1;
      break;
    case 'ArrowRight' :
      player.velocity.x += 1;
      break;
    case ' ' :
      break;
  }
})

//UTIL
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
