// messages.js

const messageEtape2 = [
  "J’espère que tu es bien rentré. Encore merci pour la confiance.",
  "Coucou ! Bien arrivé(e) chez toi, j’espère ? Merci encore ton achat 🤗",
  "Salut salut, ce fut un plaisir de t'avoir servi aujourd'hui. Bonne suite 💫"
];

const messageEtape3 = [
  "Cela fait quelques jours depuis ton achat. Que penses-tu du produit ?",
  "Ton avis nous intéresse ! N'hésite pas à nous faire un retour sur la qualité ou les défauts du produit.",
  "Hello ! 👋 Le produit que tu as pris chez nous a-t-il comblé tes attentes ?",
  "Te satisfaire est une priorité pour nous, alors dis-nous tout : est-ce que notre produit t’a satisfait ? 😊",
  "3 jours déjà que nous t'avons servi, nous aimerions savoir si tu es satisfait après utilisation du produit ?"
];

function choisirMessageAleatoire(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
}

module.exports = {
  messageEtape2,
  messageEtape3,
  choisirMessageAleatoire
};
