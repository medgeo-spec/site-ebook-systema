# Site e-book « Breathe & Relax » : gagner de l'argent avec le livre (pas à pas)

Aujourd'hui, le PDF est **offert** : le bouton « Download PDF » de `book.html` le télécharge directement.
Deux stratégies possibles. Choisissez-en une (dites-moi laquelle, je fais les modifications dans les 4 langues).

---

## Option A : Vendre le livre (revenu direct)

Utiliser une plateforme qui vend **à votre place** : elle encaisse, gère la TVA et envoie le PDF à l'acheteur.
| Plateforme | Frais | Particularité |
|---|---|---|
| **Payhip** (payhip.com) | 5 % (gratuit) | Très simple, paiement PayPal et carte, TVA UE gérée |
| **Lemon Squeezy** | 5 % + 0,50 $ | Paiement vers votre banque ou PayPal, TVA mondiale gérée |
| **Gumroad** | 10 % + 0,50 $ | Très connu, virement ou PayPal |
| **Amazon Kindle (KDP)** | 30 à 65 % | Énorme visibilité, format Kindle au lieu de PDF |

Étapes (exemple avec Payhip, 20 min) :
1. Créer un compte sur https://payhip.com → **Add product → Digital download**
2. Téléverser le PDF, la couverture (`ebook/book-cover.png`), un titre, un prix (4,99 à 9,99 € est courant pour un e-book)
3. Payhip → **Settings → Payouts** : relier PayPal ou votre compte bancaire
4. Copier le lien du produit (ex. `https://payhip.com/b/XXXX`)
5. Dans `book.html` (et `fr/`, `es/`, `ar/`) : remplacer le lien de téléchargement par ce lien d'achat
6. **Retirer le PDF du site** (`ebook/*.pdf`), sinon il reste téléchargeable gratuitement à son adresse

⚠️ Le PDF a déjà été publié sur GitHub et sur le site : des copies peuvent circuler. Pour une vente sérieuse,
publiez une **nouvelle édition** (révisée, bonus) plutôt que le fichier actuel.

## Option B : Offrir le livre contre un e-mail (revenu indirect)

Le livre sert à construire une **liste de lecteurs**, à qui vous proposez ensuite des produits payants
(cours d'exercices en vidéo, séances en ligne, 2ᵉ livre, accompagnement).
1. Créer un compte gratuit sur **Brevo** (brevo.com, jusqu'à 300 e-mails/jour) ou **MailerLite**
2. Créer un formulaire d'inscription et un e-mail automatique contenant le lien du PDF
3. Remplacer le bouton de téléchargement par ce formulaire (je peux le faire)
4. Ajouter un **produit payant** à proposer à la liste (voir option A pour les plateformes)

Complément possible dans les deux cas : un bouton de soutien **Ko-fi** ou **Buy Me a Coffee** (dons).

---

## Formulaire de contact
Il envoyait les messages vers `#` (perdus). Il utilise maintenant **Netlify Forms** :
1. Déployer le site sur Netlify (déjà configuré par `netlify.toml`)
2. Netlify → votre site → **Forms** : le formulaire `contact` apparaît (sinon **Enable form detection** puis redéployer)
3. **Form notifications → Email notification** : recevoir chaque message par e-mail

## Encaissement et impôts
- Les plateformes (Payhip, Lemon Squeezy, Gumroad) reversent l'argent **chaque semaine ou chaque mois**
  sur PayPal ou votre compte bancaire, **TVA déjà déduite** pour les ventes aux particuliers.
- Les revenus restent imposables dans votre pays : déclarez-les selon votre statut.
