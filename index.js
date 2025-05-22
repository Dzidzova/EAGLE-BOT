// ✅ Décode la variable d'environnement (Render) et écrit le fichier credentials.json
const fs = require('fs');

const base64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
if (base64) {
    const json = Buffer.from(base64, 'base64').toString('utf-8');
    fs.writeFileSync('credentials.json', json);
}

const { Client, LocalAuth } = require('whatsapp-web.js');
const client = new Client({
    authStrategy: new LocalAuth(),
});

const {
    getRowsByNumber,
    addRow,
    updateRow,
    getRowsWithIndex,
} = require('./sheets');

const {
    choisirMessageAleatoire,
    messageEtape2,
    messageEtape3,
} = require('./messages');

client.on('ready', () => {
    console.log('✅ Bot WhatsApp connecté et prêt à l’emploi !');
});

function nettoyerMessage(msg) {
    return msg.trim().toLowerCase();
}

// 👇 Lorsque TU envoies un message
client.on('message_create', async (message) => {
    try {
        const body = nettoyerMessage(message.body);

        // Ne traiter que TES messages sortants
        if (!message.fromMe) return;

        const chat = await message.getChat();
        const numero = chat.id._serialized;

        // Déclencheur : "merci infiniment pour ton achat"
        if (body.includes('merci infiniment pour ton achat')) {
            console.log(`🚀 Message déclencheur envoyé à ${numero}`);

            const existants = await getRowsByNumber(numero);
            const enCours = existants.find(r => r.statut === 'en cours');

            if (enCours) {
                console.log(`ℹ️ Une séquence est déjà en cours pour ${numero}`);
                return;
            }

            const maintenant = new Date();
            const dans3h = new Date(maintenant.getTime() + 3 * 60 * 60 * 1000); // 3 heures plus tard

            await addRow([
                numero,
                '2', // Aller directement à l'étape 2
                maintenant.toISOString(),
                dans3h.toISOString(),
                'en cours'
            ]);

            console.log(`✅ ${numero} ajouté dans Google Sheets avec l’étape 2 planifiée dans 3h`);
        }
    } catch (error) {
        console.error('❌ Erreur dans message_create :', error);
    }
});

// ✅ NE FAIT RIEN quand le client répond (on ignore tout ici)
client.on('message', async (message) => {
    if (message.fromMe) return; // Ignorer tes propres messages
    // Ne rien faire ici car on attend plus aucune réponse manuelle
});

// ⏱ Vérifie et envoie les messages planifiés (étape 2 => 3)
async function verifierEtEnvoyerMessages() {
    try {
        const lignes = await getRowsWithIndex();
        const maintenant = new Date();

        for (const ligne of lignes) {
            const { index, numero, etape, dateStart, dateNext, statut } = ligne;

            if (statut !== 'en cours' || etape !== '2') continue;
            if (!dateNext) continue;

            const prevue = new Date(dateNext);
            if (maintenant >= prevue) {
                const msg2 = choisirMessageAleatoire(messageEtape2);
                await client.sendMessage(numero, msg2);
                await updateRow(index, [numero, '3', dateStart, '', 'terminé']);
                console.log(`📤 Étape 2 envoyée à ${numero}`);
            }
        }
    } catch (error) {
        console.error('❌ Erreur dans verifierEtEnvoyerMessages :', error);
    }
}

setInterval(verifierEtEnvoyerMessages, 600000); // toutes les 10 minutes
client.initialize();
