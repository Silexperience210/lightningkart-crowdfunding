# 📘 Guide de Configuration LNbits pour LightningKart

Ce guide vous explique pas à pas comment configurer LNbits pour votre crowdfunding.

## 🎯 Objectifs

1. Recevoir des paiements de 600€ en Bitcoin via Lightning Network
2. Récupérer les informations du formulaire avec chaque paiement
3. Envoyer des notifications automatiques
4. Suivre les précommandes en temps réel

## 📝 Étape 1 : Créer votre Wallet LNbits

### Option A : Utiliser une instance publique
1. Allez sur https://legend.lnbits.com/
2. Cliquez sur "Add a new wallet"
3. Donnez un nom : "LightningKart Crowdfunding"
4. ⚠️ **IMPORTANT** : Sauvegardez votre URL de wallet ! Exemple :
   ```
   https://legend.lnbits.com/wallet?usr=xxxxxxxxxxxxx&wal=yyyyyyyyyyy
   ```
5. Notez aussi votre **Invoice/read key** (visible dans les paramètres)

### Option B : Héberger votre propre instance (Recommandé pour la production)

Si vous voulez plus de contrôle et de sécurité :

```bash
# Installation avec Docker
git clone https://github.com/lnbits/lnbits.git
cd lnbits
docker-compose up -d
```

Votre instance sera accessible sur `http://localhost:5000`

## ⚡ Étape 2 : Configurer LNURL-Pay

### 2.1 Activer l'extension

1. Dans votre wallet, cliquez sur "Manage Extensions"
2. Recherchez **"LNURLp"** ou **"Pay Link"**
3. Activez l'extension
4. Cliquez sur l'extension pour l'ouvrir

### 2.2 Créer un Pay Link

1. Cliquez sur "NEW PAY LINK"
2. Remplissez les champs :

```
Description: Précommande Console LightningKart
Min (sats): 1000000  (ajustez selon le taux BTC/EUR)
Max (sats): 1000000  (même montant pour un prix fixe)

☑️ Activez "Use webhook"
Webhook URL: https://votre-domaine.com/webhook/lnbits-payment

☑️ Activez "Success Message"
Success Message: 
"✅ Paiement confirmé ! Vous recevrez un email de confirmation avec votre numéro de commande. Livraison avant le 31 janvier 2026. Merci de soutenir LightningKart !"

☑️ Activez "Comment enabled"
Max comment length: 2000
```

3. Cliquez sur "CREATE PAY LINK"
4. **Copiez l'URL LNURL** générée (elle ressemble à : `lnurl1...`)

### 2.3 Convertir EUR → Satoshis

Pour 600€, vous devez calculer l'équivalent en satoshis :

```javascript
// Exemple de calcul (à adapter selon le taux actuel)
// Si 1 BTC = 40 000 €
// 600 € = 0.015 BTC = 1 500 000 sats

// Utilisez un service d'API pour le taux en temps réel
fetch('https://blockchain.info/ticker')
  .then(r => r.json())
  .then(data => {
    const btcPrice = data.EUR.last;
    const amountBTC = 600 / btcPrice;
    const amountSats = Math.round(amountBTC * 100000000);
    console.log(`600€ = ${amountSats} sats`);
  });
```

### 2.4 Obtenir l'URL de paiement

Votre URL LNURL-Pay devrait ressembler à :
```
https://legend.lnbits.com/lnurlp/link/xxxxxxxxxxxxx
```

Ou en format LNURL :
```
lnurl1dp68gurn8ghj7ampd3kx2ar0veekzar0wd5xjtnrdakj7tnhv4kxctttdehhwm30d3h82unvwqhkxetr943ksct5ypskwet5denxymty946ksttzd9nxgtt9d9jhgumrv9cx7um5vp682unsde3kjctz9uqc
```

## 💝 Étape 3 : Configurer le TipJar (Donations)

1. Dans votre wallet, activez l'extension **"TipJar"**
2. Créez un nouveau TipJar :

```
Name: Support LightningKart
Webhook URL: https://votre-domaine.com/webhook/donation
Minimum: 1000 sats
Maximum: Laissez vide (pour permettre tout montant)
```

3. Copiez l'URL du TipJar généré

## 🔗 Étape 4 : Intégrer dans votre site

### 4.1 Mettre à jour le HTML

Ouvrez `lightningkart-crowdfunding.html` et modifiez :

```javascript
// Remplacez cette ligne (vers la ligne 380)
const LNBITS_LNURL_PAY_URL = 'https://legend.lnbits.com/lnurlp/link/VOTRE_LINK_ID';

// Et cette ligne dans le HTML (vers la ligne 280)
<a href="https://legend.lnbits.com/tipjar/VOTRE_TIPJAR_ID" class="btn btn-secondary">
```

### 4.2 Méthode d'intégration du paiement

Il existe plusieurs façons d'intégrer le paiement :

#### Méthode 1 : Redirection simple (Plus facile)

```javascript
// Dans le formulaire submit
const lnurlPayUrl = 'https://legend.lnbits.com/lnurlp/link/xxxxx';
const comment = encodeURIComponent(JSON.stringify(formData));
window.location.href = `${lnurlPayUrl}?amount=1500000&comment=${comment}`;
```

#### Méthode 2 : Affichage du QR code sur place (Recommandé)

```html
<!-- Ajouter cette section dans votre HTML -->
<div id="paymentModal" style="display:none;">
    <div class="modal-content">
        <h2>⚡ Scannez pour payer</h2>
        <div id="qrcode"></div>
        <p>Montant : 600€ (≈ <span id="satAmount"></span> sats)</p>
        <button onclick="closePayment()">Annuler</button>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
<script>
async function showPayment(formData) {
    // Créer l'invoice
    const response = await fetch('https://legend.lnbits.com/api/v1/payments', {
        method: 'POST',
        headers: {
            'X-Api-Key': 'VOTRE_INVOICE_KEY',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            out: false,
            amount: 1500000, // en sats
            memo: JSON.stringify(formData)
        })
    });
    
    const invoice = await response.json();
    
    // Afficher le QR code
    document.getElementById('paymentModal').style.display = 'block';
    new QRCode(document.getElementById('qrcode'), {
        text: invoice.payment_request,
        width: 256,
        height: 256
    });
    
    // Vérifier le statut du paiement
    checkPaymentStatus(invoice.payment_hash);
}

function checkPaymentStatus(paymentHash) {
    const interval = setInterval(async () => {
        const response = await fetch(
            `https://legend.lnbits.com/api/v1/payments/${paymentHash}`,
            {
                headers: { 'X-Api-Key': 'VOTRE_INVOICE_KEY' }
            }
        );
        const payment = await response.json();
        
        if (payment.paid) {
            clearInterval(interval);
            showSuccess();
        }
    }, 2000); // Vérifier toutes les 2 secondes
}
</script>
```

## 🔔 Étape 5 : Configurer les Webhooks

### 5.1 Avec un serveur Node.js (fourni)

1. Déployez le serveur webhook fourni (`webhook-server.js`)
2. Utilisez un service comme :
   - **Railway** (https://railway.app/) - Gratuit pour commencer
   - **Fly.io** (https://fly.io/) - Gratuit aussi
   - **Heroku** (payant mais simple)

3. Une fois déployé, vous aurez une URL comme :
   ```
   https://votre-app.railway.app/webhook/lnbits-payment
   ```

4. Ajoutez cette URL dans LNbits comme Webhook URL

### 5.2 Alternative sans serveur : Google Apps Script

Si vous ne voulez pas gérer de serveur, utilisez Google Sheets :

```javascript
// Dans Google Apps Script
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  const orderData = JSON.parse(data.comment);
  
  // Ajouter une ligne dans la feuille
  sheet.appendRow([
    new Date(),
    orderData.name,
    orderData.email,
    orderData.address,
    data.amount,
    data.payment_hash
  ]);
  
  // Envoyer email
  MailApp.sendEmail({
    to: orderData.email,
    subject: "Précommande confirmée",
    body: "Votre commande a été confirmée..."
  });
  
  return ContentService.createTextOutput(JSON.stringify({success: true}));
}
```

## 📊 Étape 6 : Suivre les statistiques

### Mettre à jour le compteur automatiquement

```javascript
// Ajouter dans votre HTML
async function updateProgress() {
    try {
        // Si vous utilisez le serveur webhook
        const response = await fetch('https://votre-app.railway.app/api/stats');
        const stats = await response.json();
        
        const percentage = (stats.total_orders / 10) * 100;
        document.getElementById('progressBar').style.width = percentage + '%';
        document.getElementById('progressBar').textContent = 
            `${stats.total_orders} / 10 consoles`;
    } catch (error) {
        console.error('Erreur chargement stats:', error);
    }
}

// Actualiser toutes les 30 secondes
setInterval(updateProgress, 30000);
updateProgress(); // Appel initial
```

## 🧪 Étape 7 : Tester votre configuration

### Test avec un petit montant

1. Configurez un Pay Link de test avec un montant de 100 sats
2. Testez le flux complet :
   - Remplir le formulaire
   - Voir le QR code ou être redirigé
   - Payer avec votre wallet Lightning
   - Vérifier la réception du webhook
   - Vérifier l'email de confirmation

### Wallets pour tester

- **Phoenix** (mobile) - Très facile
- **Wallet of Satoshi** (mobile) - Le plus simple
- **Blue Wallet** (mobile) - Très populaire
- **Alby** (extension navigateur) - Pratique pour les tests

## 🔒 Sécurité

### Clés API à ne JAMAIS exposer

```javascript
// ❌ MAUVAIS - Ne JAMAIS faire ça
const API_KEY = 'votre_clé_secrète'; // dans le code HTML

// ✅ BON - Utiliser un backend
// Le frontend appelle votre API
// Votre API utilise la clé LNbits côté serveur
```

### Variables d'environnement

```bash
# Dans votre serveur webhook
LNBITS_API_KEY=votre_clé_admin
LNBITS_INVOICE_KEY=votre_clé_invoice
EMAIL_USER=votre@email.com
EMAIL_PASS=votre_mot_de_passe
```

## 📱 Notifications

### Email

Le serveur webhook envoie automatiquement :
- Email de confirmation au client
- Notification à l'admin

### Discord (optionnel)

```javascript
// Ajouter dans webhook-server.js
async function sendDiscordNotification(order) {
    const webhookUrl = 'VOTRE_WEBHOOK_DISCORD';
    await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: `🎮 Nouvelle précommande : ${order.name} - ${order.order_id}`
        })
    });
}
```

## 🐛 Dépannage

### Le webhook ne reçoit rien

1. Vérifiez que l'URL du webhook est accessible publiquement
2. Testez avec curl :
```bash
curl -X POST https://votre-app.railway.app/webhook/lnbits-payment \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Le paiement ne fonctionne pas

1. Vérifiez votre wallet LNbits a de la liquidité entrante
2. Testez d'abord avec legend.lnbits.com
3. Vérifiez les logs LNbits

### Les emails ne partent pas

1. Utilisez un "App Password" pour Gmail
2. Vérifiez vos limites d'envoi
3. Regardez les logs du serveur

## 🚀 Mise en production

### Checklist avant le lancement

- [ ] Wallet LNbits créé et sauvegardé
- [ ] Pay Link configuré avec le bon montant
- [ ] TipJar créé
- [ ] Serveur webhook déployé et testé
- [ ] URLs mises à jour dans le HTML
- [ ] Test de paiement complet effectué
- [ ] Emails de test reçus
- [ ] Statistiques fonctionnelles
- [ ] Backup des clés effectué
- [ ] Documentation d'urgence préparée

### Surveillance

Utilisez des outils pour surveiller :
- **UptimeRobot** : Vérifier que votre webhook est en ligne
- **Sentry** : Capturer les erreurs
- **Google Analytics** : Suivre le trafic

## 📞 Ressources

- Documentation LNbits : https://docs.lnbits.com/
- Forum LNbits : https://t.me/lnbits
- Lightning Network : https://lightning.network/
- Bitcoin Wiki : https://en.bitcoin.it/wiki/Lightning_Network

---

⚡ Bonne chance avec votre crowdfunding LightningKart ! ⚡
