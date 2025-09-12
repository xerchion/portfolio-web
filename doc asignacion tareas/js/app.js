// ===== ESTADO Y CONFIGURACIÓN =====
const AppState = {
    // Configuración de navegación
    navIsOpen: false,
    currentSection: 'hero',

    // Configuración de scroll
    scrollOffset: 80,
    scrollDuration: 800,

    // Configuración de animaciones
    animationDuration: 300,
    observerThreshold: 0.1,

    // Cache de elementos DOM
    elements: {},

    // Configuración de ejemplos
    examples: {
        simple: {
            input: `3
10 15 20
12 8 14
9 13 11`,
            output: `Solución óptima encontrada:
Persona 1 → Tarea 3 (costo: 20)
Persona 2 → Tarea 2 (costo: 8)
Persona 3 → Tarea 1 (costo: 9)
Costo total: 37`,
            trace: `[PASO 1] Inicializando con cota superior: 999999
[PASO 2] Explorando nodo raíz
[PASO 3] Persona 1 → Tarea 1: costo parcial = 10
[PASO 4] Persona 1 → Tarea 2: costo parcial = 15
[PASO 5] Persona 1 → Tarea 3: costo parcial = 20
[PASO 6] Evaluando ramas más prometedoras...
[PASO 7] Podando rama con cota inferior > 37
[RESULTADO] Solución óptima: 37`
        },
        medium: {
            input: `4
9 2 7 8
6 4 3 7
5 8 1 8
7 6 9 4`,
            output: `Solución óptima encontrada:
Persona 1 → Tarea 2 (costo: 2)
Persona 2 → Tarea 3 (costo: 3)
Persona 3 → Tarea 4 (costo: 8)
Persona 4 → Tarea 1 (costo: 7)
Costo total: 20`,
            trace: `[INICIAL] Matriz de costos 4x4 cargada
[PASO 1] Calculando cota inferior inicial con reducción
[PASO 2] Fila 1: reducir por 2, Fila 2: reducir por 3
[PASO 3] Fila 3: reducir por 1, Fila 4: reducir por 4
[PASO 4] Columna 1: reducir por 4, Columna 2: reducir por 0
[PASO 5] Columna 3: reducir por 0, Columna 4: reducir por 2
[PASO 6] Cota inferior inicial: 16
[PASO 7] Expandiendo desde nodo raíz...
[PASO 8] Explorando asignación Persona 1 → Tarea 2
[PASO 9] Nuevas reducciones en submatriz 3x3
[PASO 10] Cota actual: 18, continúa siendo prometedora
[...] Proceso completo de ramificación y poda
[RESULTADO] Solución óptima encontrada: 20`
        }
    }
};

// ===== UTILIDADES =====
const Utils = {
    // Selector de elementos con cache
    $(selector) {
        if (!AppState.elements[selector]) {
            AppState.elements[selector] = document.querySelector(selector);
        }
        return AppState.elements[selector];
    },

    // Selector múltiple
    $$(selector) {
        return document.querySelectorAll(selector);
    },

    // Debounce para optimizar eventos
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle para scroll
    throttle(func, limit) {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Animación de scroll suave
    smoothScrollTo(target, duration = AppState.scrollDuration) {
        const targetElement = typeof target === 'string' ? Utils.$(target) : target;
        if (!targetElement) return;

        const targetPosition = targetElement.offsetTop - AppState.scrollOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        function easeInOutQuad(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    },

    // Formatear números con separadores
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },

    // Generar ID único
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    },

    // Copiar texto al portapapeles
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            NotificationManager.show('Texto copiado al portapapeles', 'success');
        } catch (err) {
            // Fallback para navegadores sin soporte
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                NotificationManager.show('Texto copiado al portapapeles', 'success');
            } catch (fallbackErr) {
                NotificationManager.show('Error al copiar texto', 'error');
            }
            document.body.removeChild(textArea);
        }
    }
};

// ===== GESTOR DE NAVEGACIÓN =====
const NavigationManager = {
    init() {
        this.setupNavigation();
        this.setupScrollTracking();
        this.setupSmoothScrolling();
        this.setupMobileMenu();
    },

    setupNavigation() {
        const navToggle = Utils.$('.nav-toggle');
        const navMenu = Utils.$('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                AppState.navIsOpen = !AppState.navIsOpen;
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
                document.body.style.overflow = AppState.navIsOpen ? 'hidden' : '';
            });
        }
    },

    setupScrollTracking() {
        const sections = Utils.$$('section[id]');
        const navLinks = Utils.$$('.nav-link');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    AppState.currentSection = entry.target.id;
                    this.updateActiveNavLink(entry.target.id);
                }
            });
        }, {
            threshold: AppState.observerThreshold,
            rootMargin: `-${AppState.scrollOffset}px 0px -50% 0px`
        });

        sections.forEach(section => observer.observe(section));
    },

    updateActiveNavLink(sectionId) {
        const navLinks = Utils.$$('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    },

    setupSmoothScrolling() {
        const navLinks = Utils.$$('a[href^="#"]');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = Utils.$(targetId);

                if (targetElement) {
                    Utils.smoothScrollTo(targetElement);
                    this.closeMobileMenu();
                }
            });
        });
    },

    setupMobileMenu() {
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            const navMenu = Utils.$('.nav-menu');
            const navToggle = Utils.$('.nav-toggle');

            if (AppState.navIsOpen &&
                !navMenu.contains(e.target) &&
                !navToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Cerrar menú con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && AppState.navIsOpen) {
                this.closeMobileMenu();
            }
        });
    },

    closeMobileMenu() {
        const navToggle = Utils.$('.nav-toggle');
        const navMenu = Utils.$('.nav-menu');

        if (navToggle && navMenu) {
            AppState.navIsOpen = false;
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
};

// ===== GESTOR DE ANIMACIONES =====
const AnimationManager = {
    init() {
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupCounterAnimations();
    },

    setupScrollAnimations() {
        const animatedElements = Utils.$$('.component-card, .step-card, .complexity-card, .structure-card, .example-card, .memory-card, .principle, .conclusion-section');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(element);
        });
    },

    setupHoverEffects() {
        // Efecto hover para tarjetas interactivas
        const interactiveCards = Utils.$$('.step-card, .component-card, .complexity-card, .memory-card');

        interactiveCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
                card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.boxShadow = '';
            });
        });
    },

    setupCounterAnimations() {
        const counterElements = Utils.$$('[data-counter]');

        const animateCounter = (element) => {
            const target = parseInt(element.dataset.counter);
            const duration = 2000;
            const start = Date.now();
            const startValue = 0;

            const update = () => {
                const now = Date.now();
                const progress = Math.min((now - start) / duration, 1);
                const value = Math.floor(progress * target);
                element.textContent = Utils.formatNumber(value);

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            };

            update();
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        counterElements.forEach(element => observer.observe(element));
    }
};

// ===== GESTOR DE EJEMPLOS =====
const ExamplesManager = {
    init() {
        this.setupExampleInteractions();
        this.setupCodeCopyButtons();
        this.createTraceViewer();
    },

    setupExampleInteractions() {
        const exampleCards = Utils.$$('.example-card');

        exampleCards.forEach(card => {
            const toggleBtn = this.createToggleButton();
            const header = card.querySelector('.example-header');
            const content = card.querySelector('.example-content');

            if (header && content) {
                header.appendChild(toggleBtn);

                toggleBtn.addEventListener('click', () => {
                    const isExpanded = content.style.display !== 'none';
                    content.style.display = isExpanded ? 'none' : 'block';
                    toggleBtn.innerHTML = isExpanded ?
                        '<i class="fas fa-chevron-down"></i>' :
                        '<i class="fas fa-chevron-up"></i>';
                });
            }
        });
    },

    createToggleButton() {
        const button = document.createElement('button');
        button.className = 'toggle-btn';
        button.innerHTML = '<i class="fas fa-chevron-up"></i>';
        button.style.cssText = `
            background: rgba(255, 255, 255, 0.2);
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
        `;

        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            button.style.transform = 'scale(1.1)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            button.style.transform = 'scale(1)';
        });

        return button;
    },

    setupCodeCopyButtons() {
        const codeBlocks = Utils.$$('pre');

        codeBlocks.forEach(block => {
            const copyBtn = this.createCopyButton();
            block.style.position = 'relative';
            block.appendChild(copyBtn);

            copyBtn.addEventListener('click', () => {
                const code = block.querySelector('code');
                const text = code ? code.textContent : block.textContent;
                Utils.copyToClipboard(text);
            });
        });
    },

    createCopyButton() {
        const button = document.createElement('button');
        button.className = 'copy-btn';
        button.innerHTML = '<i class="fas fa-copy"></i>';
        button.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            background: var(--primary-color);
            border: none;
            border-radius: 4px;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            font-size: 12px;
            opacity: 0.7;
            transition: all 0.3s ease;
        `;

        button.addEventListener('mouseenter', () => {
            button.style.opacity = '1';
            button.style.transform = 'scale(1.1)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.opacity = '0.7';
            button.style.transform = 'scale(1)';
        });

        return button;
    },

    createTraceViewer() {
        const traceOutputs = Utils.$$('.trace-output pre');

        traceOutputs.forEach(pre => {
            const lines = pre.textContent.split('\n').filter(line => line.trim());
            pre.innerHTML = '';

            lines.forEach((line, index) => {
                const lineElement = document.createElement('div');
                lineElement.textContent = line;
                lineElement.style.cssText = `
                    opacity: 0;
                    transform: translateX(-20px);
                    animation: fadeInLeft 0.5s ease forwards;
                    animation-delay: ${index * 0.1}s;
                    padding: 2px 0;
                `;

                if (line.includes('[RESULTADO]') || line.includes('[FINAL]')) {
                    lineElement.style.fontWeight = 'bold';
                    lineElement.style.color = 'var(--primary-color)';
                }

                pre.appendChild(lineElement);
            });
        });

        // Agregar estilos de animación
        if (!document.querySelector('#trace-animations')) {
            const style = document.createElement('style');
            style.id = 'trace-animations';
            style.textContent = `
                @keyframes fadeInLeft {
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
};

// ===== GESTOR DE NOTIFICACIONES =====
const NotificationManager = {
    container: null,

    init() {
        this.createContainer();
    },

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(this.container);
    },

    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        notification.style.cssText = `
            background: ${colors[type]};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            font-size: 14px;
            font-weight: 500;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        notification.innerHTML = `
            <i class="${icons[type]}"></i>
            <span>${message}</span>
        `;

        this.container.appendChild(notification);

        // Animación de entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto-remove
        setTimeout(() => {
            this.remove(notification);
        }, duration);

        // Click para cerrar
        notification.addEventListener('click', () => {
            this.remove(notification);
        });
    },

    remove(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
};

// ===== GESTOR DE RENDIMIENTO =====
const PerformanceManager = {
    init() {
        this.setupLazyLoading();
        this.optimizeImages();
        this.preloadCriticalResources();
    },

    setupLazyLoading() {
        // Lazy loading para elementos no críticos
        const lazyElements = Utils.$$('[data-lazy]');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const src = element.dataset.lazy;

                    if (element.tagName === 'IMG') {
                        element.src = src;
                    } else {
                        element.style.backgroundImage = `url(${src})`;
                    }

                    element.removeAttribute('data-lazy');
                    observer.unobserve(element);
                }
            });
        });

        lazyElements.forEach(element => observer.observe(element));
    },

    optimizeImages() {
        const images = Utils.$$('img');

        images.forEach(img => {
            img.loading = 'lazy';
            img.decoding = 'async';
        });
    },

    preloadCriticalResources() {
        // Precargar recursos críticos
        const criticalResources = [
            'css/styles.css',
            // Agregar más recursos según necesidad
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = resource.endsWith('.css') ? 'style' : 'script';
            link.href = resource;
            document.head.appendChild(link);
        });
    }
};

// ===== GESTOR DE ACCESIBILIDAD =====
const AccessibilityManager = {
    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupAriaLabels();
        this.setupReducedMotion();
    },

    setupKeyboardNavigation() {
        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    },

    setupFocusManagement() {
        // Gestión de foco para elementos interactivos
        const focusableElements = Utils.$$('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');

        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                element.classList.add('focused');
            });

            element.addEventListener('blur', () => {
                element.classList.remove('focused');
            });
        });
    },

    setupAriaLabels() {
        // Configurar etiquetas ARIA
        const navToggle = Utils.$('.nav-toggle');
        if (navToggle) {
            navToggle.setAttribute('aria-label', 'Abrir menú de navegación');
            navToggle.setAttribute('aria-expanded', 'false');
        }

        const navMenu = Utils.$('.nav-menu');
        if (navMenu) {
            navMenu.setAttribute('aria-label', 'Menú principal de navegación');
        }
    },

    setupReducedMotion() {
        // Respetar preferencias de movimiento reducido
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        if (prefersReducedMotion.matches) {
            document.body.classList.add('reduced-motion');

            // Agregar estilos para movimiento reducido
            const style = document.createElement('style');
            style.textContent = `
                .reduced-motion * {
                    animation-duration: 0.001s !important;
                    transition-duration: 0.001s !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
};

// ===== INICIALIZACIÓN PRINCIPAL =====
class AlgorithmDocumentationApp {
    constructor() {
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        try {
            // Inicializar gestores en orden
            NavigationManager.init();
            AnimationManager.init();
            ExamplesManager.init();
            NotificationManager.init();
            PerformanceManager.init();
            AccessibilityManager.init();

            // Configurar eventos globales
            this.setupGlobalEvents();

            // Marcar como inicializado
            this.isInitialized = true;

            console.log('✅ Aplicación inicializada correctamente');

        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            NotificationManager.show('Error al cargar la aplicación', 'error');
        }
    }

    setupGlobalEvents() {
        // Prevenir comportamientos no deseados
        document.addEventListener('dragstart', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
            }
        });

        // Gestión de redimensionamiento
        window.addEventListener('resize', Utils.debounce(() => {
            // Reajustar elementos según el nuevo tamaño
            NavigationManager.closeMobileMenu();
        }, 250));

        // Gestión de scroll
        window.addEventListener('scroll', Utils.throttle(() => {
            const header = Utils.$('.header');
            if (header) {
                if (window.scrollY > 100) {
                    header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
                    header.style.backdropFilter = 'blur(20px)';
                } else {
                    header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                    header.style.backdropFilter = 'blur(10px)';
                }
            }
        }, 100));

        // Gestión de errores globales
        window.addEventListener('error', (e) => {
            console.error('Error global capturado:', e.error);
        });

        // Gestión de promesas rechazadas
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promesa rechazada:', e.reason);
            e.preventDefault();
        });
    }
}

// ===== PUNTO DE ENTRADA =====
document.addEventListener('DOMContentLoaded', () => {
    const app = new AlgorithmDocumentationApp();
    app.init();
});

// También inicializar si el DOM ya está cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const app = new AlgorithmDocumentationApp();
        app.init();
    });
} else {
    const app = new AlgorithmDocumentationApp();
    app.init();
}

// ===== EXPORTAR PARA USO GLOBAL =====
window.AppState = AppState;
window.Utils = Utils;
window.NavigationManager = NavigationManager;
window.AnimationManager = AnimationManager;
window.ExamplesManager = ExamplesManager;
window.NotificationManager = NotificationManager;