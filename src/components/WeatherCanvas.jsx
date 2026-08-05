import React, { useEffect, useRef } from 'react';
import { getWeatherTheme, getSeason, getSeasonPalette } from '../utils/weatherHelpers';

function WeatherCanvas({ condition = 'Clear', isNight = false, windSpeed = 3, latitude = 51.5 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initElements();
    };

    window.addEventListener('resize', handleResize);

    const theme = getWeatherTheme(condition, isNight);
    const season = getSeason(latitude);
    const palette = getSeasonPalette(season);

    // Weather condition parameters
    const isCloudy = theme.includes('cloud') || theme.includes('rain') || theme.includes('thunder') || theme.includes('snow') || theme.includes('fog');
    const isSunny = !isCloudy && !isNight;

    // Wind amplitude factor (1 to 5 scale)
    const windForce = Math.max(1, Math.min((windSpeed || 3) / 2.5, 5));

    // Particle objects
    let grassBlades = [];
    let trees = [];
    let clouds = [];
    let particles = [];

    const initElements = () => {
      // Initialize Grass Blades along screen bottom
      grassBlades = [];
      const grassCount = Math.floor(width / 6);
      for (let i = 0; i < grassCount; i++) {
        grassBlades.push({
          x: Math.random() * width,
          height: Math.random() * 35 + 25,
          width: Math.random() * 3 + 2,
          color: palette.grass[Math.floor(Math.random() * palette.grass.length)],
          phaseOffset: Math.random() * Math.PI * 2,
        });
      }

      // Initialize Horizon Trees and Shrubs
      trees = [];
      const treeCount = Math.max(5, Math.floor(width / 220));
      for (let i = 0; i < treeCount; i++) {
        trees.push({
          x: (width / (treeCount + 1)) * (i + 1) + (Math.random() * 80 - 40),
          height: Math.random() * 80 + 100,
          trunkWidth: Math.random() * 6 + 10,
          type: i % 3 === 0 ? 'shrub' : 'tree',
          phaseOffset: Math.random() * Math.PI * 2,
        });
      }

      // Initialize Drifting Clouds
      clouds = [];
      const cloudCount = isCloudy ? 7 : 3;
      for (let i = 0; i < cloudCount; i++) {
        clouds.push({
          x: Math.random() * width,
          y: Math.random() * (height * 0.35) + 30,
          radius: Math.random() * 40 + 50,
          speed: (Math.random() * 0.4 + 0.2) * (windForce * 0.5 + 0.5),
          opacity: isCloudy ? Math.random() * 0.3 + 0.4 : Math.random() * 0.15 + 0.1,
        });
      }

      // Initialize Rain/Snow/Stars particles
      particles = [];
      const particleCount = theme.includes('rain') ? 160 : theme.includes('snow') ? 100 : isNight ? 80 : 25;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          length: Math.random() * 22 + 10,
          speed: Math.random() * 9 + 6,
          radius: Math.random() * 3 + 1,
          opacity: Math.random() * 0.7 + 0.3,
          dx: Math.random() * 1 - 0.5,
          dy: Math.random() * 1.5 + 0.5,
          twinkle: Math.random() * 0.05,
        });
      }
    };

    initElements();

    let frame = 0;

    const render = () => {
      frame++;
      const time = frame * 0.03;
      ctx.clearRect(0, 0, width, height);

      const horizonY = height - 70;

      // 1. Draw Visible Sun or Moon
      if (isSunny) {
        // Glowing Sun Disk
        const sunX = width * 0.8;
        const sunY = height * 0.2;

        const radial = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 120);
        radial.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
        radial.addColorStop(0.3, 'rgba(253, 224, 71, 0.4)');
        radial.addColorStop(1, 'rgba(253, 224, 71, 0)');

        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 120, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 32, 0, Math.PI * 2);
        ctx.fill();
      } else if (isNight && !isCloudy) {
        // Glowing Moon
        const moonX = width * 0.8;
        const moonY = height * 0.2;

        const radial = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 80);
        radial.addColorStop(0, 'rgba(224, 231, 255, 0.6)');
        radial.addColorStop(1, 'rgba(224, 231, 255, 0)');

        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 80, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.arc(moonX, moonY, 26, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw Cloud Layers
      for (let c of clouds) {
        c.x += c.speed;
        if (c.x - c.radius * 2 > width) {
          c.x = -c.radius * 2;
          c.y = Math.random() * (height * 0.35) + 30;
        }

        ctx.fillStyle = isNight ? `rgba(148, 163, 184, ${c.opacity * 0.4})` : `rgba(255, 255, 255, ${c.opacity})`;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.arc(c.x + c.radius * 0.6, c.y - c.radius * 0.3, c.radius * 0.75, 0, Math.PI * 2);
        ctx.arc(c.x - c.radius * 0.6, c.y - c.radius * 0.2, c.radius * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Draw Rolling Field Hills
      const hillGradient = ctx.createLinearGradient(0, horizonY - 40, 0, height);
      hillGradient.addColorStop(0, palette.fieldGround[0]);
      hillGradient.addColorStop(1, palette.fieldGround[1]);

      ctx.fillStyle = hillGradient;
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, horizonY);
      ctx.quadraticCurveTo(width * 0.25, horizonY - 20, width * 0.5, horizonY);
      ctx.quadraticCurveTo(width * 0.75, horizonY + 15, width, horizonY - 10);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // 4. Draw Trees & Shrubs with Wind Sway
      for (let t of trees) {
        const swayAngle = Math.sin(time * 1.8 + t.phaseOffset) * (0.05 * windForce);
        const topX = t.x + Math.sin(time * 2.2 + t.phaseOffset) * (4 * windForce);

        if (t.type === 'shrub') {
          // Shrub Bush
          const shrubRadius = t.height * 0.3;
          const shrubY = horizonY + 10;

          ctx.save();
          ctx.translate(t.x, shrubY);
          ctx.rotate(swayAngle);

          if (!palette.isBare) {
            ctx.fillStyle = palette.foliagePrimary;
            ctx.beginPath();
            ctx.arc(0, -shrubRadius, shrubRadius, 0, Math.PI * 2);
            ctx.arc(-shrubRadius * 0.6, -shrubRadius * 0.7, shrubRadius * 0.7, 0, Math.PI * 2);
            ctx.arc(shrubRadius * 0.6, -shrubRadius * 0.7, shrubRadius * 0.7, 0, Math.PI * 2);
            ctx.fill();

            // Spring Blossom Accents
            if (season === 'spring') {
              ctx.fillStyle = palette.foliageAccent;
              ctx.beginPath();
              ctx.arc(-shrubRadius * 0.3, -shrubRadius * 1.1, 4, 0, Math.PI * 2);
              ctx.arc(shrubRadius * 0.4, -shrubRadius * 0.8, 3, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            // Winter Bare Shrub
            ctx.strokeStyle = palette.trunk;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-12, -shrubRadius * 1.2);
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -shrubRadius * 1.5);
            ctx.moveTo(0, 0);
            ctx.lineTo(12, -shrubRadius * 1.1);
            ctx.stroke();
          }
          ctx.restore();
        } else {
          // Tree Trunk
          const trunkBaseY = horizonY + 20;

          ctx.strokeStyle = palette.trunk;
          ctx.lineWidth = t.trunkWidth;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(t.x, trunkBaseY);
          ctx.quadraticCurveTo(t.x, trunkBaseY - t.height * 0.5, topX, trunkBaseY - t.height);
          ctx.stroke();

          // Tree Foliage or Bare Branches
          if (!palette.isBare) {
            const canopyY = trunkBaseY - t.height;
            const canopyRadius = t.height * 0.45;

            ctx.save();
            ctx.translate(topX, canopyY);
            ctx.rotate(swayAngle);

            // Foliage Layers
            ctx.fillStyle = palette.foliageSecondary;
            ctx.beginPath();
            ctx.arc(0, 0, canopyRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = palette.foliagePrimary;
            ctx.beginPath();
            ctx.arc(-canopyRadius * 0.3, -canopyRadius * 0.2, canopyRadius * 0.7, 0, Math.PI * 2);
            ctx.arc(canopyRadius * 0.3, -canopyRadius * 0.2, canopyRadius * 0.7, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = palette.foliageAccent;
            ctx.beginPath();
            ctx.arc(0, -canopyRadius * 0.4, canopyRadius * 0.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
          } else {
            // Winter Bare Branches
            ctx.strokeStyle = palette.trunk;
            ctx.lineWidth = t.trunkWidth * 0.4;
            ctx.beginPath();
            ctx.moveTo(topX, trunkBaseY - t.height);
            ctx.lineTo(topX - 25 + Math.sin(time * 2) * (3 * windForce), trunkBaseY - t.height - 35);
            ctx.moveTo(topX, trunkBaseY - t.height);
            ctx.lineTo(topX + 25 + Math.sin(time * 2 + 1) * (3 * windForce), trunkBaseY - t.height - 30);
            ctx.moveTo(topX, trunkBaseY - t.height * 0.7);
            ctx.lineTo(topX - 35 + Math.sin(time * 2 + 0.5) * (4 * windForce), trunkBaseY - t.height * 0.9);
            ctx.stroke();

            // Frosted Snow Cap on Branch
            if (theme.includes('snow')) {
              ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
              ctx.beginPath();
              ctx.arc(topX, trunkBaseY - t.height, 6, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // 5. Draw Animated Swaying Grass Field
      for (let g of grassBlades) {
        const bladeSway = Math.sin(time * 2.5 + g.phaseOffset + g.x * 0.01) * (3.5 * windForce + 1.5);
        const baseY = height;

        ctx.strokeStyle = g.color;
        ctx.lineWidth = g.width;
        ctx.beginPath();
        ctx.moveTo(g.x, baseY);
        ctx.quadraticCurveTo(g.x, baseY - g.height * 0.5, g.x + bladeSway, baseY - g.height);
        ctx.stroke();
      }

      // 6. Precipitation & Particles (Rain, Snow, Thunderstorm, Stars)
      if (theme.includes('rain') || theme.includes('thunderstorm')) {
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let p of particles) {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - (windForce * 0.8), p.y + p.length);
          p.y += p.speed;
          p.x -= windForce * 0.5;

          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        }
        ctx.stroke();

        // Thunderstorm Lightning Flash
        if (theme.includes('thunderstorm') && Math.random() < 0.015) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
          ctx.fillRect(0, 0, width, height);
        }
      } else if (theme.includes('snow')) {
        for (let p of particles) {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          p.y += p.dy;
          p.x += Math.sin(frame * 0.02 + p.radius) * 0.8 + (windForce * 0.4);

          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
        }
      } else if (isNight || theme.includes('night')) {
        for (let p of particles) {
          const currentOpacity = Math.abs(Math.sin(frame * p.twinkle + p.x));
          ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.8 + 0.2})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Sun Dust particles
        for (let p of particles) {
          ctx.fillStyle = `rgba(253, 224, 71, ${p.opacity * 0.4})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);
          ctx.fill();

          p.y -= 0.3;
          p.x += Math.sin(frame * 0.01 + p.y) * 0.4 + (windForce * 0.2);

          if (p.y < 0) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [condition, isNight, windSpeed, latitude]);

  return <canvas ref={canvasRef} className="weather-canvas" />;
}

export default WeatherCanvas;
