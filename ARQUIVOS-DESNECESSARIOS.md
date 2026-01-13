# 🗑️ Arquivos que Podem Ser Removidos

## 📝 Arquivos de Documentação Duplicados/Desatualizados

Estes arquivos podem ser removidos ou consolidados:

- `conversa_gpt.md` - Conversa antiga (pode manter para referência ou remover)
- `exemplo_card_interface.md` - Exemplo antigo
- `GUIA-DEPLOY-GITHUB.md` - Substituído por `DEPLOY-SIMPLES.md`
- `deploy-implementation-guide.md` - Substituído por `DEPLOY-SIMPLES.md`
- `escrow-dapp/ai-agent/ALTERNATIVA-TUNEL.md` - Guia alternativo (manter se útil)
- `escrow-dapp/ai-agent/EXPOR-PC-PUBLICO.md` - Guia alternativo (manter se útil)
- `escrow-dapp/ai-agent/COMO-FUNCIONA.md` - Pode consolidar no README principal

## 🐍 Scripts Python de Teste/Utilitários

Estes podem ser removidos se não forem mais usados:

- `find_mojis.py` - Script utilitário
- `remove_mojis.py` - Script utilitário  
- `inverter_video.py` - Script utilitário (se não for mais usado)

## 📁 Pastas/Projetos Separados

- `simulacao_agente_sistemico/` - Projeto separado? Avaliar se deve estar aqui ou em outro repo

## 🔧 Arquivos de Configuração Duplicados

- `netlify.toml` (raiz) - Se não usar Netlify, pode remover
- `escrow-dapp/frontend/netlify.toml` - Se não usar Netlify, pode remover
- `_redirects` (raiz e frontend) - Se não usar Netlify, pode remover

## 🎨 Arquivos de Mídia/Assets

- `download-polygon logo.png` - Se já tem o logo em outro lugar
- `ChatGPT Image Sep 2, 2025, 09_24_31 AM.png` - Imagem de teste?
- `tatus` - Arquivo estranho, provavelmente pode remover

## ✅ Recomendação

**ANTES DE REMOVER:**
1. Verifique se não está sendo usado
2. Faça backup (commit no git já é backup)
3. Remova gradualmente

**PODE REMOVER COM SEGURANÇA:**
- Scripts Python de teste (`find_mojis.py`, `remove_mojis.py`)
- Arquivo `tatus` (se não souber o que é)
- Imagens de teste

**MANTER POR ENQUANTO:**
- Documentação (mesmo que duplicada, pode ser útil)
- `simulacao_agente_sistemico/` (avaliar depois)
