# Site e-book « Breathe & Relax » : gagner de l'argent avec le livre (pas à pas)

Aujourd'hui, le PDF est **offert** : le bouton « Download PDF » de `book.html` le télécharge directement.
Deux stratégies possibles. Choisissez-en une (dites-moi laquelle, je fais les modifications dans les 4 langues).

---

## Option A : Vendre le livre (revenu direct)

Vendeur établi au Maroc, clients en Europe et aux États-Unis : il faut une plateforme qui vend **à votre
place** (« merchant of record »). Elle encaisse, gère la TVA européenne et les taxes américaines, envoie le
PDF à l'acheteur, puis vous verse l'argent au Maroc.
| Plateforme | Frais | Pour vous |
|---|---|---|
| **Lemon Squeezy** (recommandé) | ≈ 5 % + 0,50 $ | Accepte les vendeurs marocains, **virement sur compte bancaire marocain**, livre le fichier automatiquement |
| **Amazon Kindle (KDP)** | 30 à 65 % | Énorme visibilité, format Kindle au lieu de PDF, paiement par virement |
| Payhip, Gumroad | 5 à 10 % | Déconseillé : ils utilisent votre propre compte PayPal ou Stripe, difficile à obtenir depuis le Maroc |

Étapes (Lemon Squeezy, 20 min) :
1. Créer un compte sur https://app.lemonsqueezy.com et une boutique
2. **Products → New product** → type **Single payment**, téléverser le PDF (onglet **Files**), la couverture
   (`ebook/book-cover.png`), un titre, un prix (4,99 à 9,99 € est courant pour un e-book)
3. **Settings → Payouts** : votre compte bancaire marocain (RIB/IBAN et code SWIFT) ; puis **Activate store**
4. Copier le lien de partage du produit (bouton **Share**)
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

---

## Formulaire de contact
Il envoyait les messages vers `#` (perdus). Il utilise maintenant **Netlify Forms** :
1. Déployer le site sur Netlify (déjà configuré par `netlify.toml`)
2. Netlify → votre site → **Forms** : le formulaire `contact` apparaît (sinon **Enable form detection** puis redéployer)
3. **Form notifications → Email notification** : recevoir chaque message par e-mail

## Encaissement et impôts (Maroc)
- Lemon Squeezy et Amazon versent l'argent **sur votre compte bancaire marocain**, **TVA et taxes étrangères
  déjà réglées** par eux.
- Au Maroc, ce sont des revenus d'export imposables : statut **auto-entrepreneur** pour démarrer, et
  rapatriement des devises (automatique ici, puisque le virement arrive au Maroc).
- Faites valider votre statut par un comptable marocain : votre client officiel est la plateforme, et
  l'auto-entrepreneur est plafonné par client au-delà d'un certain montant.
