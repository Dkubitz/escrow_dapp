/**
 * Serviço de Animações Avançadas
 * Controla animações complexas de expansão e transição
 */
class AnimationService {
    constructor() {
        this.isAnimating = false;
        this.animationQueue = [];
    }

    /**
     * Animação de gota d'água que se expande e limpa a tela
     * @param {HTMLElement} button - Botão que será expandido
     * @param {string|HTMLElement} newContent - Novo conteúdo a ser exibido
     * @param {Object} options - Opções de personalização
     */
    async expandAndTransition(button, newContent, options = {}) {
        if (this.isAnimating) {
            this.animationQueue.push({ button, newContent, options });
            return;
        }

        this.isAnimating = true;

        try {
            // 1. Obter posição do clique
            const buttonRect = button.getBoundingClientRect();
            const clickX = buttonRect.left + buttonRect.width / 2;
            const clickY = buttonRect.top + buttonRect.height / 2;
            
            // 2. Criar efeito de gota d'água
            const waterDrop = this.createWaterDrop(clickX, clickY);
            
            // 3. Preparar container do novo conteúdo
            const contentContainer = this.createContentContainer();
            
            // 4. Iniciar expansão da gota
            await this.expandWaterDrop(waterDrop);
            
            // 5. Mostrar novo conteúdo
            await this.prepareAndShowContent(contentContainer, newContent);
            
            // 6. Limpeza
            this.cleanup(button, waterDrop, contentContainer);

        } catch (error) {
            console.error('Erro na animação:', error);
            this.cleanup(button, null, contentContainer);
        } finally {
            this.isAnimating = false;
            this.processQueue();
        }
    }

    /**
     * Cria o container para o novo conteúdo
     */
    createContentContainer() {
        const container = document.createElement('div');
        container.className = 'new-content-container';
        document.body.appendChild(container);
        return container;
    }

    /**
     * Cria a gota d'água no ponto clicado
     */
    createWaterDrop(clickX, clickY) {
        const waterDrop = document.createElement('div');
        waterDrop.className = 'water-drop-effect';
        
        // Calcular o tamanho necessário para cobrir toda a tela
        const maxDistance = Math.sqrt(
            Math.pow(Math.max(clickX, window.innerWidth - clickX), 2) +
            Math.pow(Math.max(clickY, window.innerHeight - clickY), 2)
        );
        const size = maxDistance * 2.2; // Margem extra para garantir cobertura total
        
        // Posicionar a gota no ponto clicado
        waterDrop.style.width = size + 'px';
        waterDrop.style.height = size + 'px';
        waterDrop.style.left = (clickX - size / 2) + 'px';
        waterDrop.style.top = (clickY - size / 2) + 'px';
        
        document.body.appendChild(waterDrop);
        return waterDrop;
    }

    /**
     * Expande a gota d'água com alta performance
     */
    async expandWaterDrop(waterDrop) {
        return new Promise((resolve) => {
            // Usar requestAnimationFrame para melhor performance
            requestAnimationFrame(() => {
                // Forçar reflow para garantir que o elemento está pronto
                waterDrop.offsetHeight;
                
                // Adicionar classe de expansão
                waterDrop.classList.add('expanding');
                
                // Resolver após a animação completar (reduzido para 600ms)
                setTimeout(resolve, 600);
            });
        });
    }

    /**
     * Prepara e mostra o novo conteúdo
     */
    async prepareAndShowContent(container, newContent) {
        return new Promise((resolve) => {
            // Adicionar conteúdo
            if (typeof newContent === 'string') {
                container.innerHTML = newContent;
            } else {
                container.appendChild(newContent);
            }
            
            // Mostrar container
            container.classList.add('visible');
            
            // Animar elementos de conteúdo
            setTimeout(() => {
                const contentElements = container.querySelectorAll('.new-content');
                contentElements.forEach((element, index) => {
                    setTimeout(() => {
                        element.classList.add('fade-in');
                    }, index * 100);
                });
                
                setTimeout(resolve, 600);
            }, 200);
        });
    }

    /**
     * Limpeza suave dos elementos temporários
     */
    cleanup(button, waterDrop, contentContainer) {
        // Remover gota d'água após um tempo
        if (waterDrop && waterDrop.parentNode) {
            setTimeout(() => {
                waterDrop.parentNode.removeChild(waterDrop);
            }, 1000);
        }
    }

    /**
     * Processa a fila de animações
     */
    processQueue() {
        if (this.animationQueue.length > 0) {
            const nextAnimation = this.animationQueue.shift();
            this.expandAndTransition(nextAnimation.button, nextAnimation.newContent, nextAnimation.options);
        }
    }

    /**
     * Animação de partículas flutuantes
     */
    createFloatingParticles(count = 10) {
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-element';
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                pointer-events: none;
                z-index: 10001;
                left: ${Math.random() * window.innerWidth}px;
                top: ${Math.random() * window.innerHeight}px;
                animation-delay: ${Math.random() * 3}s;
            `;
            
            document.body.appendChild(particle);
            particles.push(particle);
        }
        
        // Remover partículas após 5 segundos
        setTimeout(() => {
            particles.forEach(particle => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            });
        }, 5000);
        
        return particles;
    }

    /**
     * Animação de loading com spinner
     */
    createLoadingSpinner() {
        const spinner = document.createElement('div');
        spinner.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 10002;
                color: white;
                font-size: 18px;
                text-align: center;
            ">
                <div style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid rgba(255,255,255,0.3);
                    border-top: 4px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 10px;
                "></div>
                Carregando...
            </div>
        `;
        
        // Adicionar keyframes para spinner
        if (!document.querySelector('#spinner-styles')) {
            const style = document.createElement('style');
            style.id = 'spinner-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(spinner);
        return spinner;
    }
}

// Instância global do serviço
window.animationService = new AnimationService();
