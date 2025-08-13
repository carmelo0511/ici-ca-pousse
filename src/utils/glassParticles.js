/**
 * Glass Particles Animation System
 * Creates floating particles effect for glassmorphism background
 */

export class GlassParticles {
  constructor(containerSelector = 'body', particleCount = 25) {
    this.containerSelector = containerSelector;
    this.particleCount = particleCount;
    this.particles = [];
    this.animationId = null;
    this.container = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the particles system
   */
  init() {
    if (this.isInitialized) {
      return;
    }

    this.container = document.querySelector(this.containerSelector);
    if (!this.container) {
      console.warn('Glass particles container not found:', this.containerSelector);
      return;
    }

    this.createParticlesContainer();
    this.createParticles();
    this.startAnimation();
    this.isInitialized = true;
  }

  /**
   * Create the particles container element
   */
  createParticlesContainer() {
    // Remove existing container if it exists
    const existing = document.querySelector('.glass-particles');
    if (existing) {
      existing.remove();
    }

    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'glass-particles';
    particlesContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    `;

    document.body.appendChild(particlesContainer);
    this.particlesContainer = particlesContainer;
  }

  /**
   * Create individual particles
   */
  createParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      const particle = this.createParticle();
      this.particles.push(particle);
      this.particlesContainer.appendChild(particle.element);
    }
  }

  /**
   * Create a single particle with random properties
   */
  createParticle() {
    const element = document.createElement('div');
    const size = Math.random() * 4 + 2; // 2-6px
    const opacity = Math.random() * 0.05 + 0.01; // 0.01-0.06
    const speed = Math.random() * 20 + 10; // 10-30s animation duration
    const delay = Math.random() * 8; // 0-8s delay
    
    element.className = 'glass-particle';
    element.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: rgba(255, 255, 255, ${opacity});
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: 100vh;
      animation: glass-particle-float ${speed}s infinite linear;
      animation-delay: ${delay}s;
      will-change: transform, opacity;
    `;

    return {
      element,
      size,
      speed,
      delay,
      x: Math.random() * window.innerWidth,
      y: window.innerHeight,
      opacity
    };
  }

  /**
   * Start the animation system
   */
  startAnimation() {
    // CSS animations handle the particle movement
    // This method can be extended for custom physics if needed
    this.handleResize();
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  /**
   * Handle window resize
   */
  handleResize() {
    // Redistribute particles on resize
    this.particles.forEach(particle => {
      particle.element.style.left = Math.random() * 100 + '%';
    });
  }

  /**
   * Add more particles dynamically
   */
  addParticles(count = 5) {
    for (let i = 0; i < count; i++) {
      const particle = this.createParticle();
      this.particles.push(particle);
      this.particlesContainer.appendChild(particle.element);
    }
  }

  /**
   * Remove particles
   */
  removeParticles(count = 5) {
    for (let i = 0; i < count && this.particles.length > 0; i++) {
      const particle = this.particles.pop();
      if (particle && particle.element.parentNode) {
        particle.element.parentNode.removeChild(particle.element);
      }
    }
  }

  /**
   * Update particle count
   */
  setParticleCount(newCount) {
    const currentCount = this.particles.length;
    
    if (newCount > currentCount) {
      this.addParticles(newCount - currentCount);
    } else if (newCount < currentCount) {
      this.removeParticles(currentCount - newCount);
    }
    
    this.particleCount = newCount;
  }

  /**
   * Pause the animation
   */
  pause() {
    this.particles.forEach(particle => {
      particle.element.style.animationPlayState = 'paused';
    });
  }

  /**
   * Resume the animation
   */
  resume() {
    this.particles.forEach(particle => {
      particle.element.style.animationPlayState = 'running';
    });
  }

  /**
   * Clean up and destroy the particles system
   */
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.particlesContainer && this.particlesContainer.parentNode) {
      this.particlesContainer.parentNode.removeChild(this.particlesContainer);
    }

    window.removeEventListener('resize', this.handleResize.bind(this));
    
    this.particles = [];
    this.isInitialized = false;
  }

  /**
   * Create a burst effect at specific coordinates
   */
  createBurst(x, y, particleCount = 10) {
    const burstContainer = document.createElement('div');
    burstContainer.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      pointer-events: none;
      z-index: 1000;
    `;
    
    document.body.appendChild(burstContainer);

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 6 + 2;
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = Math.random() * 100 + 50;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity;

      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        animation: burst-particle 1s ease-out forwards;
        transform: translate(-50%, -50%);
      `;

      // Add custom animation for burst
      particle.style.setProperty('--vx', vx + 'px');
      particle.style.setProperty('--vy', vy + 'px');

      burstContainer.appendChild(particle);
    }

    // Clean up after animation
    setTimeout(() => {
      if (burstContainer.parentNode) {
        burstContainer.parentNode.removeChild(burstContainer);
      }
    }, 1000);
  }
}

/**
 * Create and initialize global particles instance
 */
export function initGlassParticles(particleCount = 25) {
  // Check if already initialized
  if (window.glassParticles && window.glassParticles.isInitialized) {
    return window.glassParticles;
  }

  const particles = new GlassParticles('body', particleCount);
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => particles.init());
  } else {
    particles.init();
  }

  // Store globally for access
  window.glassParticles = particles;
  
  return particles;
}

/**
 * Utility function to create burst effect on click
 */
export function addClickBurstEffect(selector = '.btn-primary, .nav-tab') {
  document.addEventListener('click', (e) => {
    const target = e.target.closest(selector);
    if (target && window.glassParticles) {
      const rect = target.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      window.glassParticles.createBurst(x, y, 8);
    }
  });
}

/**
 * Enhanced Glass Effects for Premium UI
 */

// Add ripple effect to buttons
export function addRippleEffect(element) {
  element.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: rippleAnimation 0.6s linear;
      pointer-events: none;
      z-index: 1;
    `;
    
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
}

// Auto-initialize ripple effects
export function initRippleEffects() {
  const selectors = [
    '.btn-primary',
    '.btn-secondary', 
    '.nav-tab',
    'button:not([data-no-ripple])',
    '.card[data-clickable="true"]'
  ];
  
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(addRippleEffect);
  });
  
  // Observer for dynamically added elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          selectors.forEach(selector => {
            if (node.matches && node.matches(selector)) {
              addRippleEffect(node);
            }
            node.querySelectorAll && node.querySelectorAll(selector).forEach(addRippleEffect);
          });
        }
      });
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
}

// Add floating animation to specific elements
export function addFloatingAnimation(selector, options = {}) {
  const { 
    duration = 3, 
    amplitude = 5, 
    delay = 0,
    direction = 'vertical' 
  } = options;
  
  const elements = document.querySelectorAll(selector);
  
  elements.forEach((element, index) => {
    const elementDelay = delay + (index * 0.2);
    
    if (direction === 'vertical') {
      element.style.animation = `floatVertical ${duration}s ease-in-out infinite ${elementDelay}s`;
    } else {
      element.style.animation = `floatHorizontal ${duration}s ease-in-out infinite ${elementDelay}s`;
    }
  });
  
  // Add keyframes if not exist
  addFloatingKeyframes(amplitude);
}

function addFloatingKeyframes(amplitude) {
  if (document.getElementById('floating-keyframes')) return;
  
  const style = document.createElement('style');
  style.id = 'floating-keyframes';
  style.textContent = `
    @keyframes floatVertical {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-${amplitude}px); }
    }
    
    @keyframes floatHorizontal {
      0%, 100% { transform: translateX(0px); }
      25% { transform: translateX(${amplitude}px); }
      75% { transform: translateX(-${amplitude}px); }
    }
  `;
  
  document.head.appendChild(style);
}

// Enhanced shimmer effect
export function addShimmerEffect(selector) {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach(element => {
    element.classList.add('shimmer-effect');
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
  });
}

// CSS for all glass animations
export const glassAnimationsCSS = `
@keyframes burst-particle {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% + var(--vx)), calc(-50% + var(--vy))) scale(0);
    opacity: 0;
  }
}

@keyframes rippleAnimation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

@keyframes glass-particle-float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-10vh) rotate(360deg);
    opacity: 0;
  }
}

@keyframes shimmer {
  from { left: -100%; }
  to { left: 100%; }
}

.shimmer-effect::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shimmer 3s infinite;
}

.phone-container {
  animation: phoneEntry 1s ease-out;
}

@keyframes phoneEntry {
  from { 
    opacity: 0; 
    transform: translateY(50px) scale(0.9);
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1);
  }
}
`;

// Initialize all glass effects
export function initAllGlassEffects(particleCount = 20) {
  // Add CSS animations
  if (!document.getElementById('glass-animations-style')) {
    const style = document.createElement('style');
    style.id = 'glass-animations-style';
    style.textContent = glassAnimationsCSS;
    document.head.appendChild(style);
  }
  
  // Initialize particles
  initGlassParticles(particleCount);
  
  // Initialize ripple effects
  initRippleEffects();
  
  // Add click burst effects
  addClickBurstEffect('.btn-primary, .btn-secondary, .nav-tab');
  
  // Add floating animations
  addFloatingAnimation('.workout-icon', { duration: 4, amplitude: 3 });
  addFloatingAnimation('.nav-icon', { duration: 5, amplitude: 2 });
  
  // Add shimmer effects
  addShimmerEffect('.header, .navbar');
  
  // All glass effects initialized
}

// Default export
export default GlassParticles;