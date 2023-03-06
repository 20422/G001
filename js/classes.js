class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = {
      x:0,
      y:0
    }
    this.powerUp = 'default';
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update(key) {

    const friction = 0.95;

    this.velocity.x *= friction;
    this.velocity.y *= friction;

    this.draw();

    if(this.x + this.radius + this.velocity.x <= canvas.width && this.x - this.radius + this.velocity.x >= 0){
      this.x += this.velocity.x;
    } else {
      this.velocity.x = 0; 
    }

    if(this.y + this.radius + this.velocity.y <= canvas.height && this.y - this.radius + this.velocity.y >= 0){
      this.y += this.velocity.y;
    } else {
      this.velocity.y = 0; 
    }
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
    this.type = 'linear';
    this.radians = 0;
    this.center = {
      x,y
    }

    if(Math.random() < 0.5){
      this.type = 'homing';
      if(Math.random() < 0.5){
        this.type = 'spinning';
        if(Math.random() < 0.5){
          this.type = 'homing spinning'
        }
      }
    }
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();
    if(this.type === 'homing'){
      let newangle = Math.atan2(player.y - this.y, player.x - this.x);

      let velocity = {
        x: Math.cos(newangle), 
        y: Math.sin(newangle),
      }

      this.velocity.x = velocity.x;
      this.velocity.y = velocity.y;

      this.x = this.x + this.velocity.x;
      this.y = this.y + this.velocity.y;
    } else if(this.type === 'spinning'){
      this.radians += 0.1;
    
      this.center.x += this.velocity.x; 
      this.center.y += this.velocity.y; 
  
      this.x = this.center.x + Math.cos(this.radians) * 10;
      this.y = this.center.y + Math.sin(this.radians) * 10;
    } else if(this.type === 'homing spinning'){
      this.radians += 0.1;
      let newangle = Math.atan2(player.y - this.center.y, player.x - this.center.x);

      this.velocity.x = Math.cos(newangle), 
      this.velocity.y = Math.sin(newangle),
      
      this.center.x += this.velocity.x; 
      this.center.y += this.velocity.y; 
  
      this.x = this.center.x + Math.cos(this.radians) * 10;
      this.y = this.center.y + Math.sin(this.radians) * 10;
    } else {
      this.x = this.x + this.velocity.x;
      this.y = this.y + this.velocity.y;
    }


  

  }
};

const friction = 0.99;
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

class PowerUp {
  constructor({position = { x: 0, y: 0}, velocity}){
    this.position = position;
    this.velocity = velocity;
    this.img = new Image();
    this.img.src = './img/lightningBolt.png'

    this.alpha = 1;
    gsap.to(this, {
      alpha: 0,
      duration: .5,
      repeat: -1,
      yoyo: true
    })

    this.radians = 0;
  }

  draw(){
    c.save();
    c.globalAlpha = this.alpha;
    c.translate(
      this.position.x + this.img.width / 2,
      this.position.y + this.img.height / 2,
      );
    c.rotate(this.radians)
    c.translate(
      -this.position.x - this.img.width / 2,
      -this.position.y - this.img.height / 2,
      );
    c.drawImage(this.img, this.position.x, this.position.y);
    c.restore();
  }

  update(){
    this.draw();
    this.radians += 0.01;
    this.position.x += this.velocity.x;
  }
}

class BackGroundParticle {
  constructor({position = {x: 0,y: 0}, color, radius}){
    this.position = position;
    this.color = color;
    this.radius = radius;
    this.alpha = 0.1;    
  }

  draw(){
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }
}

