/**
 * Biology Dash: Immune Patrol
 * Juice, Screen Shake, Floating Callouts & Kawaii Particle Bursts
 */

export interface FloatingCallout {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
  vy: number;
  life: number;
}

export interface StarParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  spin: number;
  life: number;
}

let nextJuiceId = 1;

export class JuiceEngine {
  public shakeIntensity: number = 0;
  public shakeDuration: number = 0;
  public callouts: FloatingCallout[] = [];
  public particles: StarParticle[] = [];

  public triggerScreenShake(intensity: number = 6, duration: number = 0.25): void {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
  }

  public spawnCallout(text: string, x: number, y: number, color: string = '#ffeaa7'): void {
    this.callouts.push({
      id: nextJuiceId++,
      text,
      x,
      y,
      color,
      alpha: 1.0,
      scale: 1.25,
      vy: -55,
      life: 0.8,
    });
  }

  public spawnStarBurst(x: number, y: number, count: number = 8, colors: string[] = ['#ffeaa7', '#55efc4', '#ff7675', '#a29bfe']): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 70 + Math.random() * 110;
      this.particles.push({
        id: nextJuiceId++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 5,
        color: colors[i % colors.length],
        alpha: 1.0,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 8,
        life: 0.6 + Math.random() * 0.3,
      });
    }
  }

  public update(dt: number): void {
    // Screen shake decay
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      if (this.shakeDuration <= 0) {
        this.shakeIntensity = 0;
      }
    }

    // Callout lifecycles
    for (let i = this.callouts.length - 1; i >= 0; i--) {
      const c = this.callouts[i];
      c.life -= dt;
      c.y += c.vy * dt;
      c.scale = Math.max(0.9, c.scale - dt * 0.5);
      c.alpha = Math.max(0, c.life / 0.8);
      if (c.life <= 0) {
        this.callouts.splice(i, 1);
      }
    }

    // Particle lifecycles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 120 * dt; // gentle gravity
      p.rotation += p.spin * dt;
      p.alpha = Math.max(0, p.life / 0.8);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public getShakeOffset(): { x: number; y: number } {
    if (this.shakeIntensity <= 0 || this.shakeDuration <= 0) {
      return { x: 0, y: 0 };
    }
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * this.shakeIntensity;
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
    };
  }
}

export const globalJuice = new JuiceEngine();
