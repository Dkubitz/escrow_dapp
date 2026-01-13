# 🚀 Guia de Deploy - Deal-Fi Frontend

## 📋 **Processo Completo para Atualizar o Site**

### **1. Navegar para a pasta frontend**
```bash
cd escrow-dapp/frontend
```

### **2. Verificar status das alterações**
```bash
git status
```
**O que você verá:**
- `modified: arquivo.js` - Arquivos alterados
- `untracked files:` - Arquivos novos
- `nothing to commit` - Nenhuma alteração

### **3. Adicionar todas as alterações**
```bash
git add .
```
**Resultado:** Todas as alterações são preparadas para commit

### **4. Criar commit com mensagem descritiva**
```bash
git commit -m "Descrição das alterações feitas"
```
**Exemplos de mensagens:**
- `"Fix: Corrigido bug no modal de criação"`
- `"Update: Adicionado novo ícone MetaMask"`
- `"Feature: Implementado sistema de cache para cards"`
- `"Style: Melhorado design dos botões"`

### **5. Enviar para o GitHub**
```bash
git push origin main
```
**Resultado:** Alterações enviadas para o repositório

### **6. Aguardar propagação do GitHub Pages**
- ⏱️ **Tempo:** 2-5 minutos
- 🔗 **URL:** https://dkubitz.github.io/Deal-FiV2/
- 🔄 **Atualizar:** F5 ou Ctrl+F5 para forçar refresh

---

## 🎯 **Comandos Rápidos (Copy & Paste)**

### **Sequência completa:**
```bash
cd escrow-dapp/frontend
git status
git add .
git commit -m "Sua mensagem aqui"
git push origin main
```

### **Verificar se foi enviado:**
```bash
git log --oneline -3
```

---

## 📊 **Status do Deploy**

### **✅ Sucesso:**
```
Enumerating objects: 6, done.
Counting objects: 100% (6/6), done.
Writing objects: 100% (6/6), 1.56 KiB | 1.56 MiB/s, done.
To https://github.com/Dkubitz/Deal-FiV2.git
   commit_hash..commit_hash  main -> main
```

### **❌ Erro comum:**
```
error: failed to push some refs to 'origin'
```
**Solução:** `git pull origin main` antes do push

---

## 🔧 **Comandos Úteis**

### **Ver histórico de commits:**
```bash
git log --oneline -10
```

### **Ver diferenças:**
```bash
git diff
```

### **Desfazer última alteração:**
```bash
git checkout -- arquivo.js
```

### **Ver arquivos não rastreados:**
```bash
git status --porcelain
```

---

## 🌐 **Links Importantes**

- **Repositório:** https://github.com/Dkubitz/Deal-FiV2
- **Site Live:** https://dkubitz.github.io/Deal-FiV2/
- **GitHub Pages:** https://github.com/Dkubitz/Deal-FiV2/settings/pages

---

## ⚠️ **Dicas Importantes**

### **1. Sempre teste localmente primeiro**
- Abra `index.html` no navegador
- Verifique se tudo funciona

### **2. Mensagens de commit claras**
- Use verbos no imperativo: "Fix", "Add", "Update"
- Seja específico sobre o que mudou

### **3. Se o site não atualizar**
- Aguarde 5 minutos
- Force refresh: Ctrl+F5
- Limpe cache do navegador

### **4. Backup automático**
- GitHub mantém histórico completo
- Sempre pode voltar a versões anteriores

---

## 🎉 **Checklist de Deploy**

- [ ] Alterações testadas localmente
- [ ] `git status` verificado
- [ ] `git add .` executado
- [ ] Commit com mensagem clara
- [ ] `git push origin main` executado
- [ ] Aguardado 2-5 minutos
- [ ] Site verificado em https://dkubitz.github.io/Deal-FiV2/

---

**💡 Dica:** Salve este guia como favorito para consulta rápida!
