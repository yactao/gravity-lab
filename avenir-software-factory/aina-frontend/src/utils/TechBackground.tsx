'use client';
import { useEffect } from 'react';

export default function TechBackground() {
  useEffect(() => {
    const canvas = document.getElementById('tech-bg') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    class Line {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      color: string;

      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.length = Math.random() * 100 + 50;
        this.speed = Math.random() * 1 + 0.5;
        this.angle = Math.random() * Math.PI * 2;
        this.color = `hsla(${Math.random() * 360}, 80%, 60%, 0.7)`;
      }

      draw() {
        ctx.beginPath();
        const x2 = this.x + Math.cos(this.angle) * this.length;
        const y2 = this.y + Math.sin(this.angle) * this.length;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.stroke();
      }

      update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        if (this.x < 0) this.x = w;
        if (this.x > w) this.x = 0;
        if (this.y < 0) this.y = h;
        if (this.y > h) this.y = 0;

        this.draw();
      }
    }

    const lines: Line[] = Array.from({ length: 80 }, () => new Line());

    function animate() {
      ctx.fillStyle = 'rgba(10, 10, 20, 0.2)';
      ctx.fillRect(0, 0, w, h);
      lines.forEach((line) => line.update());
      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  return <canvas id="tech-bg" className="fixed top-0 left-0 w-full h-full -z-10" />;
}
