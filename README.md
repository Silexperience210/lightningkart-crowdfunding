# 🎮 LightningKart Crowdfunding

Site de précommande pour le projet LightningKart - Console de jeu propulsée par Bitcoin Lightning Network

## 🚀 Déploiement sur GitHub Pages

### 1. Créer un nouveau dépôt GitHub

1. Allez sur https://github.com/new
2. Nommez votre dépôt (ex: `lightningkart-crowdfunding`)
3. Sélectionnez "Public"
4. Cliquez sur "Create repository"

### 2. Uploader vos fichiers

```bash
# Dans votre terminal
git init
git add .
git commit -m "Initial commit - LightningKart crowdfunding site"
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/lightningkart-crowdfunding.git
git push -u origin main
```

### 3. Activer GitHub Pages

1. Allez dans les "Settings" de votre dépôt
2. Cliquez sur "Pages" dans le menu de gauche
3. Sous "Source", sélectionnez "main" branch
4. Cliquez sur "Save"
5. Votre site sera accessible à : `https://VOTRE-USERNAME.github.io/lightningkart-crowdfunding/`

## ⚡ Configuration LNbits

### Étape 1 : Créer un compte LNbits

1. Allez sur https://legend.lnbits.com/ (ou votre instance LNbits)
2. Créez un nouveau wallet
3. Sauvegardez précieusement votre clé de wallet !

### Étape 2 : Créer un LNURL-Pay

1. Dans votre wallet LNbits, activez l'extension **"LNURLp"**
2. Créez un nouveau "Pay Link"
   - **Description** : "LightningKart - Précommande Console"
   - **Min** : 600 (euros en sats au taux actuel)
   - **Max** : 600
   - **Comment** : Activez pour recevoir les données du formulaire
3. Copiez l'URL LNURL-Pay générée

### Étape 3 : Configurer le TipJar (Donations)

1. Dans LNbits, activez l'extension **"TipJar"**
2. Créez un nouveau TipJar
   - **Nom** : "Support LightningKart"
   - **Montant** : Laissez vide pour donation libre
3. Copiez l'URL du TipJar

### Étape 4 : Intégrer dans votre site

Ouvrez le fichier `lightningkart-crowdfunding.html` et modifiez :

```javascript
// Ligne ~380 environ
const LNBITS_LNURL_PAY_URL = 'VOTRE_URL_LNURL_PAY_LNBITS';
```

Et dans le HTML :

```html
<!-- Ligne ~280 environ -->
<a href="VOTRE_LIEN_TIPJAR" class="btn btn-secondary" target="_blank">
```

## 🔧 Configuration avancée avec Webhook

Pour automatiser la réception des précommandes, vous pouvez configurer un webhook :

### Option 1 : Google Sheets (Simple)

1. Créez un Google Sheet
2. Utilisez Google Apps Script pour créer un webhook
3. Configurez LNbits pour envoyer les données de paiement vers ce webhook

### Option 2 : Service Backend (Recommandé)

Créez un petit backend avec :
- **Node.js** + Express
- **Python** + Flask
- Ou tout service serverless (Vercel, Netlify Functions, etc.)

Exemple de webhook simple en Node.js :

```javascript
const express = require('express');
const app = express();

app.post('/webhook/preorder', express.json(), (req, res) => {
    const paymentData = req.body;
    
    // Récupérer les données du formulaire depuis le commentaire
    const formData = JSON.parse(paymentData.comment);
    
    // Sauvegarder dans votre base de données
    console.log('Nouvelle précommande:', formData);
    
    // Envoyer un email de confirmation
    // sendConfirmationEmail(formData.email);
    
    res.status(200).send('OK');
});

app.listen(3000);
```

## 📊 Suivi des précommandes

Pour afficher le nombre de consoles précommandées en temps réel :

1. Créez un fichier JSON accessible publiquement
2. Mettez à jour ce fichier à chaque précommande
3. Le site le lira via JavaScript :

```javascript
// Exemple dans votre HTML
fetch('https://votre-domaine.com/api/stats.json')
    .then(response => response.json())
    .then(data => {
        const soldConsoles = data.sold;
        const percentage = (soldConsoles / 10) * 100;
        document.getElementById('progressBar').style.width = percentage + '%';
        document.getElementById('progressBar').textContent = 
            soldConsoles + ' / 10 consoles';
    });
```

## 🎨 Personnalisation

### Couleurs principales
- Orange Bitcoin : `#f7931a`
- Violet Lightning : `#7c3aed`
- Fond sombre : `#0f0f1e`

### Modifier le texte
Tous les textes sont en français et facilement modifiables dans le HTML.

### Ajouter des images
Vous pouvez ajouter des images du produit en créant un dossier `/images` et en les référençant :

```html
<img src="images/lightningkart-console.jpg" alt="Console LightningKart">
```

## 📱 Responsive Design

Le site est entièrement responsive et s'adapte automatiquement aux :
- 📱 Mobiles
- 💻 Tablettes
- 🖥️ Ordinateurs

## 🔒 Sécurité

### HTTPS obligatoire
GitHub Pages fournit automatiquement HTTPS. Assurez-vous que :
- Tous vos liens LNbits utilisent HTTPS
- Les webhooks sont sécurisés

### Données personnelles
- Ne stockez jamais de données sensibles dans le code
- Utilisez un backend sécurisé pour traiter les paiements
- Respectez le RGPD pour les données européennes

## 📧 Notifications Email

Pour envoyer des emails de confirmation, vous pouvez utiliser :

1. **SendGrid** (gratuit jusqu'à 100 emails/jour)
2. **Mailgun** (gratuit jusqu'à 5000 emails/mois)
3. **EmailJS** (intégration client-side simple)

## 🐛 Dépannage

### Le paiement ne fonctionne pas
- Vérifiez que votre URL LNURL-Pay est correcte
- Testez avec un petit montant d'abord
- Assurez-vous que votre wallet LNbits a de la liquidité

### Les données du formulaire ne sont pas envoyées
- Vérifiez la console JavaScript (F12)
- Assurez-vous que le webhook est configuré
- Testez localement avant de déployer

### Le site ne s'affiche pas sur GitHub Pages
- Vérifiez que le fichier s'appelle exactement `index.html` ou utilisez le nom complet
- Attendez quelques minutes après l'activation de GitHub Pages
- Videz le cache de votre navigateur

## 📞 Support

Pour toute question sur :
- **GitHub Pages** : https://docs.github.com/pages
- **LNbits** : https://docs.lnbits.com/
- **Lightning Network** : https://lightning.network/

## 📄 Licence

Ce projet est open-source. Vous êtes libre de le modifier et de l'utiliser pour votre projet.

## 🙏 Crédits

Créé pour le projet LightningKart - Gaming sur Lightning Network

---

⚡ **Powered by Bitcoin & Lightning Network** ⚡

## 🎯 Checklist avant le lancement

- [ ] Compte LNbits créé et testé
- [ ] LNURL-Pay configuré avec le bon montant (600€)
- [ ] TipJar créé pour les donations
- [ ] URLs mises à jour dans le code HTML
- [ ] Site déployé sur GitHub Pages
- [ ] Test de précommande effectué
- [ ] Email de contact configuré
- [ ] Webhook configuré (optionnel mais recommandé)
- [ ] Plan de communication prêt
- [ ] Date de livraison confirmée (31 janvier 2026)

Bonne chance avec votre crowdfunding LightningKart ! 🎮⚡
