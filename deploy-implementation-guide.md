# Deploy de Smart Contracts via Frontend JavaScript (Polygon + MetaMask)

## Contexto do Projeto
- **dApp:** Escrow DeFi com MetaMask conectado
- **Rede:** Polygon Mainnet (Chain ID: 137)
- **Contrato:** `EscrowUSDC_Dynamic_Production.sol` (pronto para deploy)
- **Frontend:** Interface completa com formulário "Criar Novo Contrato"
- **Status:** Sistema funcionando, faltando apenas implementar deploy

## Resposta da IA sobre Implementação

### 1. **Preparar o Frontend**
- **MetaMask:** Usuário conecta a carteira (web3 modal ou manual)
- **Importar ABI e Bytecode:** ABI e bytecode devem estar disponíveis no frontend, compilados com ferramentas como HardHat/Remix
- **Coletar parâmetros:** Pegue os valores do formulário (pagador, recebedor, valor, duração, milestones)

### 2. **Configurar ethers.js e MetaMask**
```js
import { ethers } from 'ethers';
import contractABI from './EscrowUSDC_ABI.json';
import contractBytecode from './EscrowUSDC_Bytecode.json';

// Conectar MetaMask
const provider = new ethers.BrowserProvider(window.ethereum);
await provider.send('eth_requestAccounts', []);
const signer = await provider.getSigner();
```

### 3. **Criar a ContractFactory e Deployar**
```js
const factory = new ethers.ContractFactory(contractABI, contractBytecode, signer);
const contract = await factory.deploy(
  pagador,
  recebedor,
  valor,
  duracao,
  milestones, // todos os parâmetros do constructor
  {
    gasLimit: 3000000 // ajustar para o contrato desejado
  }
);
await contract.waitForDeployment(); 
// Exibir endereço do contrato na tela
```

### 4. **Aprovação de USDC e Depósito**
- Antes de efetivar o depósito, chame o método `approve` diretamente no contrato do USDC:
```js
const usdc = new ethers.Contract(usdcAddress, usdcAbi, signer);
await usdc.approve(contract.target, valor); // contract.target é o endereço do contrato deployado
```
- Em seguida, execute a função de depósito do seu contrato recém-criado

### 5. **Feedback Visual e Progresso**
- Implemente controles de estado do tipo "carregando", "sucesso", "erro" e exiba a transação hash ou o endereço do contrato após o deploy
- Utilize loading spinners, barras de progresso ou modais por etapa

### 6. **Tratamento de Erros**
- Use `try/catch` para capturar falhas no deploy ou falta de gas
- Exiba mensagens amigáveis para erros comuns, como rede errada (verifique chainId da Polygon — 137), saldo insuficiente, ou erro no formulário
- Sugira trocas de rede ou recarregar saldo no MetaMask se necessário

## Fluxo Resumido
1. Usuário conecta MetaMask
2. Preenche todos os campos do formulário
3. Confirma deploy: frontend cria a ContractFactory e faz deploy, passando os campos do formulário para o constructor
4. Após deploy, exibe o endereço e pede aprovação de USDC e depósito, guiando o usuário etapa por etapa
5. Frontend mostra progresso e erros quando necessário

## Próximos Passos Identificados

### Pergunta para Implementação
**Qual ferramenta você usou para compilar o bytecode e ABI do `EscrowUSDC_Dynamic_Production.sol`? Consegue salvar ambos para importar no frontend?**

### Necessidades Técnicas
- [ ] Compilar contrato e extrair ABI + Bytecode
- [ ] Integrar ContractFactory no formulário existente
- [ ] Implementar fluxo de aprovação USDC
- [ ] Adicionar feedback visual de progresso
- [ ] Tratamento de erros específicos da Polygon

### Arquivos Atuais do Projeto
- **Contrato:** `escrow-dapp/backend/EscrowUSDC_Dynamic_Production.sol`
- **Formulário:** `escrow-dapp/frontend/src/components/create-contract-form.js`
- **ABI atual:** `escrow-dapp/frontend/src/contracts/escrowABI.js` (para contrato original)

### Observações Técnicas
- Sistema já tem MetaMask integrado e funcionando
- Formulário já coleta todos os parâmetros necessários
- Falta apenas a lógica de deploy e integração com bytecode
- USDC address na Polygon: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`

## Implementação Técnica Detalhada (Resposta da IA)

### 1. **Estrutura Geral e Conexão com MetaMask**
```js
import { ethers } from 'ethers';

async function connectWallet() {
  if (!window.ethereum) throw new Error('MetaMask não encontrada.');

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();

  const network = await provider.getNetwork();
  if (network.chainId !== 137) throw new Error('Conecte à Polygon Mainnet.');

  return { provider, signer };
}
```

### 2. **Incluir ABI e Bytecode do Contrato**
```js
import EscrowABI from './EscrowUSDC_Dynamic_Production_ABI.json';
import EscrowBytecode from './EscrowUSDC_Dynamic_Production_Bytecode.json';
```
> **Dica:** mantenha esses arquivos versionados e carregados pelo build, jamais recompile no frontend.

### 3. **Deploy do Contrato (ContractFactory)**
```js
async function deployEscrowContract(formData) {
  const { signer } = await connectWallet();

  const factory = new ethers.ContractFactory(EscrowABI, EscrowBytecode, signer);

  // Parâmetros vindos do formulário
  const { pagador, recebedor, valor, duracao, milestones } = formData;

  try {
    // Mostra progresso: "Enviando transação..."
    const deployTx = await factory.deploy(pagador, recebedor, valor, duracao, milestones);

    // Espera a confirmação do deploy
    const contract = await deployTx.waitForDeployment();

    // Mostra endereço do contrato na tela
    return contract.target;
  } catch (err) {
    throw new Error(`Falha no deploy: ${err.message}`);
  }
}
```
> ⚙️ **Gas:** deixe ethers.js estimar gasLimit automaticamente; evite fixar manualmente, exceto em testes.

### 4. **Aprovação de USDC + Depósito**
```js
async function approveUSDC(usdcAddress, contractAddress, amount, signer) {
  const usdcAbi = ["function approve(address spender, uint256 amount) public returns (bool)"];
  const usdc = new ethers.Contract(usdcAddress, usdcAbi, signer);
  await usdc.approve(contractAddress, amount);
}
```

### 5. **Feedback Visual e Progresso**
Estados de frontend:
- 🔵 **Conectando carteira**
- 🟡 **Realizando deploy...**
- 🟢 **Contrato criado! Endereço:** `0x..`
- 🔴 **Erro:** mensagem amigável

### 6. **Tratamento de Erros e Gas/Network**
Use `try/catch` ao redor de **todas as transações**:
- Se o erro for `ACTION_REJECTED`, informe que o usuário cancelou
- Se for `INSUFFICIENT_FUNDS`, recomende verificar o MATIC disponível
- Valide `chainId` e oriente o usuário a mudar de rede pelo MetaMask

### 7. **Fluxo Completo Integrado**
```js
async function handleCreateContract(formData) {
  setStatus('Conectando carteira...');
  try {
    const { signer } = await connectWallet();
    setStatus('Fazendo deploy do contrato...');
    const contractAddress = await deployEscrowContract(formData);

    setStatus('Aprovando USDC...');
    await approveUSDC('0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', contractAddress, formData.valor, signer);

    setStatus('Contrato criado com sucesso!');
    setContractAddress(contractAddress);
  } catch (err) {
    setStatus(`Erro: ${err.message}`);
  }
}
```

### 8. **Resumo da Abordagem Técnica**
1. Conectar MetaMask e verificar rede
2. Importar ABI/bytecode e criar `ContractFactory`
3. Passar parâmetros do formulário ao `deploy()`
4. Esperar confirmação (`waitForDeployment`)
5. Executar `approve()` no token USDC
6. Atualizar UI continuamente com mensagens de status e erros

## Próximos Passos de Implementação

### Arquivos a Criar/Modificar
- [ ] `EscrowUSDC_Dynamic_Production_ABI.json` - ABI compilado
- [ ] `EscrowUSDC_Dynamic_Production_Bytecode.json` - Bytecode compilado
- [ ] Modificar `create-contract-form.js` para incluir lógica de deploy
- [ ] Adicionar estados visuais de progresso
- [ ] Implementar tratamento de erros específicos

### Compilação Necessária
- [ ] Compilar `EscrowUSDC_Dynamic_Production.sol` via HardHat ou Remix
- [ ] Extrair ABI e Bytecode para arquivos JSON
- [ ] Integrar no frontend existente

## Referências
- [Ethers.js Contract Factory](https://www.wtf.academy/course/ethers101/DeployContract)
- [Integração MetaMask](https://www.luiztools.com.br/post/integracao-com-metamask-via-js/)
- [Deploy na Polygon](https://www.quicknode.com/guides/other-chains/polygon/how-to-deploy-a-smart-contract-on-maticpolygon)
- [Guia Completo Polygon](https://www.rapidinnovation.io/post/step-by-step-guide-deploying-your-first-smart-contract-on-polygon)
- [Remix + Polygon](https://docs.polygon.technology/tools/dApp-development/common-tools/remix/)
