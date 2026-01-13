# 🎬 Roteiro de Apresentação - Deal-Fi Escrow dApp
**Duração: 2-3 minutos**

---

## 📋 ESTRUTURA DO VÍDEO

### **INTRODUÇÃO (0:00 - 0:20) - 20s**
> *"Olá! Hoje vou apresentar o Deal-Fi, um dApp de Escrow descentralizado que desenvolvi para trazer transparência e confiança a pagamentos por marcos em transações comerciais."*

**Tela:** Logo Deal-Fi + Interface do projeto

---

### **PARTE 1: O QUE É O DEAL-FI? (0:20 - 0:50) - 30s**

> *"O Deal-Fi é uma aplicação descentralizada, ou dApp, que traz transparência total para pagamentos por marcos usando Smart Contracts. Imagine que você precisa fazer um pagamento por etapas - por exemplo, em uma obra ou projeto de desenvolvimento. Com o Deal-Fi, você pode verificar publicamente na blockchain que o dinheiro está disponível e bloqueado no contrato antes mesmo de começar a trabalhar."*

**Tela:** Interface do Deal-Fi mostrando cards de contratos

> *"O Deal-Fi funciona assim: o pagador deposita o valor em USDC no contrato inteligente. Ambas as partes podem ver, de forma transparente e verificável, que o dinheiro está lá, bloqueado. Mas atenção: isso não é uma garantia de recebimento - é uma garantia de disponibilidade. O dinheiro só é liberado quando ambas as partes concordam que um marco foi atingido. Isso elimina intermediários e cria confiança através de código, não de promessas."*

**Tela:** Fluxo visual: Cliente → Contrato (dinheiro bloqueado) → Fornecedor (vê disponibilidade)

---

### **PARTE 2: ARQUITETURA E TECNOLOGIAS (0:50 - 1:30) - 40s**

> *"A aplicação foi construída seguindo arquitetura limpa e separação de responsabilidades. O frontend é uma SPA em JavaScript vanilla com componentes modulares, e o backend principal é um Smart Contract escrito em Solidity."*

**Tela:** Estrutura de pastas do projeto (código fonte)

> *"O contrato principal, o EscrowUSDC_Dynamic.sol, gerencia todo o fluxo: depósitos em USDC, liberação por marcos dinâmicos configuráveis, cancelamento bilateral quando ambas as partes concordam, e até mesmo refund unilateral antes do primeiro marco - pensado para casos de arrependimento rápido."*

**Tela:** Trecho do código Solidity (contrato EscrowUSDC_Dynamic.sol)

---

### **PARTE 3: POLYGON E A REDE ETHEREUM (1:30 - 2:20) - 50s**

> *"Por que Polygon? O Deal-Fi roda na rede Polygon, que é uma Layer 2 da Ethereum. Isso significa que ele aproveita toda a segurança e descentralização da Ethereum mainnet, mas com custos de transação muito menores - literalmente centavos em vez de dólares."*

**Tela:** Logo Polygon + comparativo de custos (ETH vs Polygon)

> *"A Ethereum é a base. O Polygon é como uma extensão que mantém a compatibilidade total com a Ethereum - mesmo padrão de tokens ERC-20, mesmo formato de contratos, mas processando transações de forma mais eficiente. O USDC usado no Deal-Fi é o mesmo token padrão, mas implantado na Polygon para aproveitar essa economia de custos."*

**Tela:** Diagrama mostrando Ethereum Mainnet → Polygon L2 → Contrato Deal-Fi

> *"Isso é crucial para uma aplicação de escrow, porque queremos que as transações sejam frequentes e acessíveis. Se cada liberação de marco custasse 50 dólares em gas, ninguém usaria a plataforma!"*

---

### **PARTE 4: FUNCIONALIDADES PRINCIPAIS (2:20 - 2:50) - 30s**

> *"O Deal-Fi suporta marcos dinâmicos - você define quantos marcos precisa e a porcentagem de cada um. Tem cancelamento bilateral seguro, onde ambas as partes precisam aprovar. E ainda integra com MetaMask para uma experiência Web3 nativa."*

**Tela:** Demo rápida: criar contrato → definir marcos → conectar carteira

> *"Além disso, tem um agente de IA integrado que ajuda na navegação pela interface usando linguagem natural."*

**Tela:** Chat do AI Agent

---

### **CONCLUSÃO (2:50 - 3:00) - 10s**

> *"Em resumo, o Deal-Fi combina a transparência e imutabilidade dos Smart Contracts da Ethereum, a economia da Polygon, e uma interface moderna para tornar escrows descentralizados uma realidade prática e acessível - onde o código garante que o dinheiro está disponível, mas não promete recebimentos automáticos."*

**Tela:** Logo Deal-Fi + redes (Polygon, Ethereum, MetaMask)

> *"O código está disponível no GitHub. Obrigado e até a próxima!"*

**Tela:** Link GitHub + Fade out

---

## 🎥 DICAS PARA GRAVAÇÃO

### **Visuals Sugeridos:**
1. **Screen recordings** da interface funcionando
2. **Code snippets** dos arquivos principais (.sol, .js)
3. **Diagramas simples** (Ethereum → Polygon → Contrato)
4. **Comparativos visuais** (custos ETH vs Polygon)

### **Ritmo:**
- Falar pausadamente, mas mantendo energia
- 2-3 segundos de pausa entre seções
- Enfatizar termos técnicos importantes

### **Tom:**
- Profissional, mas acessível
- Explicar termos técnicos quando necessário
- Mostrar entusiasmo pelo projeto

---

## 📝 TERMOS-CHAVE A ENFATIZAR

- **dApp (aplicação descentralizada)**
- **Smart Contract**
- **Escrow**
- **Polygon (Layer 2)**
- **Ethereum mainnet**
- **USDC (ERC-20)**
- **Marcos dinâmicos**
- **Arquitetura Limpa**

---

## 🔗 PONTOS A DESTACAR NO CÓDIGO

### **Contrato EscrowUSDC_Dynamic.sol:**
- Linha 18: Declaração do contrato
- Linhas 46-76: Constructor com validações
- Linhas 100-116: Função deposit() - fluxo principal
- Linhas 119-142: Função approveRelease() - liberação por marcos

### **Frontend:**
- `index.html` - Estrutura modular
- `wallet-service.js` - Integração MetaMask
- `real-contract-service.js` - Interação com blockchain

---

**Tempo Total Estimado: ~3 minutos**

