<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demonstração do Aurora Card</title>
    <style>
        /* --- INÍCIO DO CSS DO NOVO AURORA CARD --- */
        body {
            background-color: #f0f2f5; /* NOVO: Fundo branco/cinza claro */
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1c1c1e;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }

        .background-content {
            padding: 20px;
            text-align: center;
            max-width: 600px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 15px;
            margin-bottom: 40px;
        }

        h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            color: #1c1c1e;
        }

        p {
            line-height: 1.6;
            opacity: 0.8;
            color: #1c1c1e;
        }

        .aurora-card {
            width: 320px;
            height: 140px; /* Altura inicial */
            position: relative;
            padding: 24px;
            box-sizing: border-box;
            border-radius: 28px;
            background-color: rgba(255, 255, 255, 0.2); /* NOVO: Transparência aumentada para 0.2 */
            border: 1px solid rgba(255, 255, 255, 0.3); /* NOVO: Borda mais transparente */
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            overflow: hidden;
            cursor: grab; /* NOVO: Cursor de arrastar */
            transition: all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1); /* Animação suave para tudo */
            user-select: none; /* NOVO: Previne seleção de texto durante o arraste */
        }

        /* NOVO: Cursor quando estiver arrastando */
        .aurora-card:active {
            cursor: grabbing;
        }

        /* O fundo líquido "Aurora" */
        .aurora-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, 
                rgba(102, 126, 234, 0.4) 0%, 
                rgba(118, 75, 162, 0.4) 50%, 
                rgba(231, 8, 8, 0.4) 100%);
            filter: blur(50px); /* Desfoque forte para criar o brilho suave */
            transition: all 0.8s ease;
            animation: rotate-aurora 20s infinite linear;
        }

        @keyframes rotate-aurora {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        /* Efeito de hover no card */
        .aurora-card:hover {
            width: 380px; /* NOVO: Expande a largura de 320px para 380px */
            height: 320px; /* Expande a altura */
            transform: scale(1.05) translateY(-10px);
            box-shadow: 0 20px 45px rgba(0, 0, 0, 0.2);
        }

        .aurora-card:hover .aurora-background {
            transform: scale(1.5); /* Aumenta o brilho da aurora */
        }

        /* Conteúdo do card */
        .card-content {
            position: relative;
            z-index: 2;
            color: #1c1c1e;
            height: 100%;
        }

        .card-summary, .card-details {
            position: absolute;
            width: calc(100% - 48px); /* Largura total menos o padding */
            transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
            /* NOVO: Centraliza o conteúdo horizontalmente */
            left: 50%;
            transform: translateX(-50%);
        }

        .card-summary {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }

        /* ANIMAÇÃO COERENTE: O resumo sobe e some */
        .aurora-card:hover .card-summary {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
            transition-delay: 0s;
        }

        .card-details {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
            text-align: center;
            /* NOVO: Posição inicial dos detalhes para uma transição suave */
            top: 100px; 
        }

        /* ANIMAÇÃO COERENTE: Os detalhes surgem no lugar do resumo */
        .aurora-card:hover .card-details {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
            transition-delay: 0.2s; /* Atraso para aparecer depois que o resumo some */
        }

        /* Estilos do texto */
        .card-header { font-size: 13px; font-weight: 600; opacity: 0.7; }
        .card-value { font-size: 26px; font-weight: 700; }
        .card-subtext { font-size: 11px; opacity: 0.6; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px;}
        .details-grid div { background: rgba(255, 255, 255, 0.2); padding: 10px; border-radius: 12px; }
        .details-grid span { display: block; font-size: 11px; opacity: 0.7; }
        .details-grid strong { font-size: 1.1em; font-weight: 600; }
        /* --- FIM DO CSS DO NOVO AURORA CARD --- */
    </style>
</head>
<body>

    <div class="background-content">
        <h1>Conteúdo de Fundo</h1>
        <p>Este é um conteúdo que ficará atrás do card. Observe como ele fica embaçado quando o card é expandido. Isso demonstra o efeito de "vidro fosco" (backdrop-filter).</p>
    </div>

    <!-- NOVO: Container para posicionar o card sobre o conteúdo de fundo -->
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10;">
        <div id="cardValorTotalOCs" class="aurora-card">
        <!-- O efeito de "aurora" líquida no fundo -->
        <div class="aurora-background"></div>
        
        <!-- O conteúdo visível do card -->
        <div class="card-content">
            <div class="card-summary">
                <div class="card-header">💼 Valor Total das OCs</div>
                <div id="valorTotalOCs" class="card-value">R$ 3.734.923,40</div>
                <div id="infoOCs" class="card-subtext">205 pedidos com OC</div>
            </div>
            <div class="card-details">
                <div class="details-grid">
                    <div>
                        <span>Valor Médio / OC</span>
                        <strong id="detalhesValorMedio">R$ 18.219,14</strong>
                    </div>
                    <div>
                        <span>Maior OC</span>
                        <strong id="detalhesMaiorOC">R$ 535.721,93</strong>
                    </div>
                    <div>
                        <span>Menor OC</span>
                        <strong id="detalhesMenorOC">R$ 24,38</strong>
                    </div>
                     <div>
                        <span>Total Pedidos</span>
                        <strong id="detalhesTotalPedidos">205</strong>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>

    <script>
        // NOVO: Funcionalidade de arrastar o card
        document.addEventListener('DOMContentLoaded', () => {
            const card = document.getElementById('cardValorTotalOCs');
            const container = card.parentElement;
            
            let isDragging = false;
            let startX, startY;
            let startLeft, startTop;
            
            // Função para iniciar o arraste
            function startDrag(e) {
                // Previne o hover durante o arraste
                if (e.target.closest('.card-content')) return;
                
                isDragging = true;
                startX = e.clientX || e.touches[0].clientX;
                startY = e.clientY || e.touches[0].clientY;
                
                // Captura a posição atual do card
                const rect = container.getBoundingClientRect();
                startLeft = rect.left;
                startTop = rect.top;
                
                // Adiciona classe para feedback visual
                card.style.cursor = 'grabbing';
                card.style.transition = 'none'; // Remove transição durante arraste
                
                // Previne seleção de texto
                e.preventDefault();
            }
            
            // Função para mover o card
            function drag(e) {
                if (!isDragging) return;
                
                const currentX = e.clientX || e.touches[0].clientX;
                const currentY = e.clientY || e.touches[0].clientY;
                
                const deltaX = currentX - startX;
                const deltaY = currentY - startY;
                
                // Calcula nova posição
                const newLeft = startLeft + deltaX;
                const newTop = startTop + deltaY;
                
                // Aplica nova posição
                container.style.left = `${newLeft}px`;
                container.style.top = `${newTop}px`;
                container.style.transform = 'none'; // Remove o transform de centralização
                
                e.preventDefault();
            }
            
            // Função para parar o arraste
            function stopDrag() {
                if (!isDragging) return;
                
                isDragging = false;
                card.style.cursor = 'grab';
                card.style.transition = 'all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)'; // Restaura transição
            }
            
            // Event listeners para mouse
            card.addEventListener('mousedown', startDrag);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
            
            // Event listeners para touch (mobile)
            card.addEventListener('touchstart', startDrag, { passive: false });
            document.addEventListener('touchmove', drag, { passive: false });
            document.addEventListener('touchend', stopDrag);
            
            console.log("Card Aurora pronto! Agora é arrastável.");
        });
    </script>
</body>
</html>