// webhook-server.js
// Serveur simple pour recevoir les notifications de paiement LNbits

const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;

const app = express();
app.use(bodyParser.json());

// Configuration email (à adapter avec vos identifiants)
const transporter = nodemailer.createTransport({
    service: 'gmail', // ou autre service
    auth: {
        user: 'votre-email@gmail.com',
        pass: 'votre-mot-de-passe-app' // Utilisez un mot de passe d'application
    }
});

// Fichier pour stocker les précommandes
const ORDERS_FILE = 'preorders.json';

// Endpoint webhook pour recevoir les notifications LNbits
app.post('/webhook/lnbits-payment', async (req, res) => {
    try {
        const paymentData = req.body;
        
        console.log('💰 Nouveau paiement reçu:', paymentData);

        // Extraire les données du formulaire depuis le commentaire
        let orderData;
        try {
            orderData = JSON.parse(paymentData.comment);
        } catch (e) {
            console.error('Erreur parsing commentaire:', e);
            return res.status(400).json({ error: 'Invalid comment format' });
        }

        // Ajouter les informations de paiement
        const fullOrder = {
            ...orderData,
            payment: {
                amount_sats: paymentData.amount,
                payment_hash: paymentData.payment_hash,
                paid_at: new Date().toISOString(),
                payment_request: paymentData.payment_request
            },
            order_id: `LK-${Date.now()}`,
            status: 'paid'
        };

        // Sauvegarder la précommande
        await saveOrder(fullOrder);

        // Envoyer email de confirmation au client
        await sendConfirmationEmail(fullOrder);

        // Envoyer notification à l'admin
        await sendAdminNotification(fullOrder);

        // Mettre à jour les statistiques
        await updateStats();

        res.status(200).json({ 
            success: true, 
            order_id: fullOrder.order_id 
        });

    } catch (error) {
        console.error('❌ Erreur traitement paiement:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Sauvegarder une précommande
async function saveOrder(order) {
    try {
        let orders = [];
        try {
            const data = await fs.readFile(ORDERS_FILE, 'utf8');
            orders = JSON.parse(data);
        } catch (e) {
            // Fichier n'existe pas encore
        }

        orders.push(order);
        await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
        console.log('✅ Précommande sauvegardée:', order.order_id);
    } catch (error) {
        console.error('Erreur sauvegarde:', error);
        throw error;
    }
}

// Envoyer email de confirmation au client
async function sendConfirmationEmail(order) {
    const emailContent = `
Bonjour ${order.name},

✅ Votre précommande LightningKart a été confirmée !

📦 Détails de votre commande :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Numéro de commande : ${order.order_id}
• Produit : Pack LightningKart Complet
• Montant : 600€ (${order.payment.amount_sats} sats)
• Date : ${new Date(order.payment.paid_at).toLocaleDateString('fr-FR')}

📬 Adresse de livraison :
${order.address}

⏰ Date de livraison prévue : 31 janvier 2026

🎮 Votre pack comprend :
• Mini PC Ryzen 5 - 32GB RAM
• LightningKart préinstallé
• 4 manettes sans fil
• Wallet Lightning intégré
• Configuration Plug & Play

Vous recevrez un email avec le numéro de suivi dès l'expédition de votre commande.

⚡ Merci de soutenir le projet LightningKart !

L'équipe LightningKart
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
contact@lightningkart.com
    `;

    try {
        await transporter.sendMail({
            from: '"LightningKart" <votre-email@gmail.com>',
            to: order.email,
            subject: `✅ Précommande confirmée - ${order.order_id}`,
            text: emailContent
        });
        console.log('📧 Email de confirmation envoyé à:', order.email);
    } catch (error) {
        console.error('Erreur envoi email client:', error);
    }
}

// Envoyer notification à l'admin
async function sendAdminNotification(order) {
    const adminEmail = `
🎉 NOUVELLE PRÉCOMMANDE LIGHTNINGKART !

Numéro : ${order.order_id}
Client : ${order.name}
Email : ${order.email}
Téléphone : ${order.phone || 'Non fourni'}

Adresse de livraison :
${order.address}

Montant : 600€ (${order.payment.amount_sats} sats)
Payment Hash : ${order.payment.payment_hash}

Commentaires :
${order.comments || 'Aucun'}

Date : ${new Date().toLocaleString('fr-FR')}
    `;

    try {
        await transporter.sendMail({
            from: '"LightningKart System" <votre-email@gmail.com>',
            to: 'admin@lightningkart.com', // Votre email admin
            subject: `🎮 Nouvelle précommande - ${order.order_id}`,
            text: adminEmail
        });
        console.log('📧 Notification admin envoyée');
    } catch (error) {
        console.error('Erreur envoi email admin:', error);
    }
}

// Mettre à jour les statistiques
async function updateStats() {
    try {
        const data = await fs.readFile(ORDERS_FILE, 'utf8');
        const orders = JSON.parse(data);
        
        const stats = {
            total_orders: orders.length,
            total_amount_eur: orders.length * 600,
            last_updated: new Date().toISOString()
        };

        await fs.writeFile('stats.json', JSON.stringify(stats, null, 2));
        console.log('📊 Stats mises à jour:', stats);
    } catch (error) {
        console.error('Erreur mise à jour stats:', error);
    }
}

// Endpoint pour obtenir les statistiques (accessible publiquement)
app.get('/api/stats', async (req, res) => {
    try {
        const data = await fs.readFile('stats.json', 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.json({ total_orders: 0, total_amount_eur: 0 });
    }
});

// Endpoint pour vérifier que le serveur fonctionne
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
⚡ Serveur webhook LightningKart démarré ⚡
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Port: ${PORT}
Webhook URL: http://localhost:${PORT}/webhook/lnbits-payment
Stats URL: http://localhost:${PORT}/api/stats
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
    console.error('❌ Erreur non gérée:', error);
});
