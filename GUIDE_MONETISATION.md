# Vendre « Breathing and Relaxation » : Amazon + votre site + cadeau YARAM (pas à pas)

Stratégie retenue :
| Canal | Rôle | Ce que vous touchez |
|---|---|---|
| **Amazon Kindle (KDP)** | Visibilité : Amazon amène des lecteurs qui ne vous connaissent pas | 70 % du prix (hors frais de livraison numérique, quelques centimes) |
| **Votre site** (achat direct via Paddle) | Meilleure marge, lecteurs fidèles, liste e-mail | ≈ 95 % du prix moins 0,50 $ |
| **YARAM** | Le livre est offert aux abonnés Premium : il fait vendre l'abonnement | Revenus d'abonnement |
| **Extrait gratuit** (site) | Donne envie d'acheter, alimente la liste e-mail | – |

> ⚠️ **Ne cochez pas « KDP Select »** lors de la publication sur Amazon. KDP Select exige que l'e-book soit
> **exclusif** à Amazon : vous n'auriez plus le droit de le vendre sur votre site ni de l'offrir dans YARAM.
> Sans KDP Select, vous gardez la redevance de 70 % (prix entre 2,99 $ et 9,99 $).

## Les fichiers prêts à l'emploi
Dans `private/ebook/` (non publié sur le site) :
| Fichier | Usage |
|---|---|
Le livre existe en **4 langues** (2e édition, même contenu) :
| Langue | PDF et EPUB (`private/ebook/`) | Couverture (`private/ebook/cover/`) | Extrait gratuit (`ebook/`, public) |
|---|---|---|---|
| Anglais | `Breathing-And-Relaxation-2nd-Edition-EN` | `cover-2560x1600.jpg` | `Breathing-And-Relaxation-Free-Sample-EN.pdf` |
| Français | `Respiration-et-Relaxation-2e-Edition-FR` | `cover-fr.jpg` | `Respiration-et-Relaxation-Extrait-Gratuit-FR.pdf` |
| Espagnol | `Respiracion-y-Relajacion-2a-Edicion-ES` | `cover-es.jpg` | `Respiracion-y-Relajacion-Muestra-Gratis-ES.pdf` |
| Arabe | `Breathing-And-Relaxation-2nd-Edition-AR` | `cover-ar.jpg` | `Breathing-And-Relaxation-Free-Sample-AR.pdf` |

- **Amazon KDP** : un livre par langue (envoyer l'EPUB et la couverture de chaque langue). KDP accepte le français,
  l'espagnol et l'arabe.
- **Votre site** : un seul achat Paddle donne accès aux 4 langues (PDF + EPUB). La page de remerciement propose la
  langue de l'acheteur, puis les autres.
- **Couvertures** : taille 1600 × 2560 (recommandée par KDP).

**Modifier le livre** : éditer `private/ebook/source/book-<langue>.html` (en, fr, es, ar), puis dans
`private/ebook/tools` : `npm install` (une fois) et `npm run build` (toutes les langues) ou `npm run build -- fr`
(une seule). Couverture, PDF, extrait et EPUB sont régénérés. Recopier ensuite les PDF et EPUB dans
`YARAM/private/ebook/`.

**Achat sur le site** : tant que `js/store-links.js` est en mode `sandbox`, le bouton d'achat n'apparaît qu'en local
et sur les aperçus Netlify ; le site public affiche « bientôt disponible ». Il apparaît partout dès le passage en
mode réel (`environment: 'production'`, étape Paddle ci-dessous).

---

## Étape 1 : Amazon KDP (1 h + 72 h de validation)
1. https://kdp.amazon.com → **Sign up** avec un compte Amazon
2. **Account → Getting paid** : choisir le pays de votre banque (Maroc), renseigner le RIB/IBAN et le SWIFT.
   Si le virement local n'est pas proposé pour le Maroc, Amazon paie par **virement international** une fois
   environ **100 $** cumulés (les seuils exacts sont indiqués à cette étape)
3. **Tax information** : questionnaire fiscal en ligne (formulaire **W-8BEN** pour une personne hors États-Unis).
   Il détermine la retenue d'impôt américaine sur vos ventes aux États-Unis : faites-le vérifier par votre comptable
4. **Create → Kindle eBook** :
   - Langue : anglais ; Titre : *Breathing and Relaxation* ; Sous-titre : *The Lost Innate Science* ; Édition : 2
   - Auteur : Mohamed Hassan Bouazzaoui
   - Description : reprendre celle du site (page « Le livre »)
   - Mots-clés (7) : breathing exercises, stress relief, relaxation response, Systema breathing, anxiety relief,
     breathwork for beginners, mind-body health
   - Catégories : *Health, Fitness & Dieting › Stress Management* et *Self-Help › Stress Management*
   - Droits de publication : « I own the copyright »
5. **Content** : envoyer l'**EPUB** et la **couverture JPG** ; vérifier le rendu dans le **Kindle Previewer** en ligne
6. **Pricing** : **ne pas** s'inscrire à KDP Select ; territoires : tous ; redevance **70 %** ; prix **4,99 $**
   (Amazon ajuste les autres devises)
7. **Publish** : le livre est en ligne sous 72 h. Copier le lien de la page du livre (`amazon.com/dp/...`)

## Étape 2 : Vente directe sur votre site (Paddle)
Lemon Squeezy n'accepte plus de nouveaux vendeurs : la vente directe passe par **Paddle**, le même compte que
WeightMyMeal et YARAM. Paddle encaisse et gère la TVA, mais **ne livre pas de fichiers** : c'est le site qui
s'en charge, ainsi :
1. Le bouton « Acheter l'e-book » ouvre la fenêtre de paiement Paddle (4,99 $, TVA incluse) sur la page du livre.
2. Après le paiement, l'acheteur arrive sur `thank-you.html` (dans sa langue), avec deux boutons : **PDF** et **EPUB**.
3. Chaque téléchargement passe par la fonction Netlify `netlify/functions/ebook-download.mjs`, qui vérifie auprès
   de Paddle que la commande est **payée** et concerne **le livre** avant d'envoyer le fichier. Le livre reste dans
   `private/ebook/`, jamais publié. L'adresse de la page de remerciement permet de retélécharger plus tard.

**Mise en place (déjà faite sur le compte de test) :**
1. Créer `.env` à la racine du site (il n'est jamais envoyé sur GitHub) avec `PADDLE_API_KEY` et `PADDLE_CLIENT_TOKEN`.
2. Lancer `node scripts/paddle-setup.mjs` : il crée le produit et le prix 4,99 $ dans Paddle, remplit
   `js/store-links.js` et écrit `PADDLE_EBOOK_PRICE` dans `.env`.
3. Dans **Netlify → Site configuration → Environment variables**, ajouter `PADDLE_API_KEY` et `PADDLE_EBOOK_PRICE`
   (pour la fonction de téléchargement).

**Pour le compte réel** : faire valider le compte Paddle (il demandera une preuve que vous êtes l'auteur : gardez
`private/ebook/source/`), créer les clés réelles, refaire les étapes 1 à 3, et demander à Paddle d'approuver la
catégorie fiscale **« ebooks »** (TVA réduite sur les livres numériques dans plusieurs pays ; sans approbation le
produit est en catégorie « standard »). Même prix qu'Amazon : Amazon peut s'aligner sur un prix plus bas trouvé
ailleurs, ce qui réduit votre redevance.

## Étape 3 : Brancher le bouton Amazon (2 min)
Ouvrir `js/store-links.js` et coller le lien Amazon :
```js
window.STORE_LINKS = {
  amazon: 'https://www.amazon.com/dp/XXXXXXXXXX',
  paddle: { ... },  // rempli par scripts/paddle-setup.mjs
};
```
Les boutons « Acheter sur Amazon Kindle » et « Acheter l'e-book » apparaissent dans les 4 langues ;
tant qu'un canal n'est pas configuré, son bouton reste caché et le site affiche « bientôt disponible » + l'extrait gratuit.

## Étape 4 : Lancer les ventes
- Écrire à votre **liste e-mail** (inscriptions reçues dans Netlify → Forms → `newsletter`) le jour de la sortie
- Demander des **avis Amazon** aux premiers lecteurs : c'est ce qui fait décoller un livre sur Amazon
- Publier de courtes vidéos des exercices (TikTok, Instagram, YouTube Shorts) avec le lien vers le site
- Plus tard : **version brochée** (KDP Paperback, le PDF est déjà au format 6 × 9 pouces ; il faudra une
  couverture complète avec dos) et **éditions française et arabe**

---

## Formulaire de contact
Il utilise **Netlify Forms** : Netlify → votre site → **Forms** → **Form notifications → Email notification**
pour recevoir chaque message par e-mail.

## Encaissement et impôts (Maroc)
- Amazon et Paddle vous versent l'argent, TVA des acheteurs déjà gérée par eux (Paddle est « merchant of
  record » ; Amazon collecte la TVA sur les e-books). Vérifiez à l'inscription que leurs versements arrivent sur
  votre compte bancaire marocain.
- Au Maroc, ce sont des revenus d'export imposables : statut **auto-entrepreneur** pour démarrer ; les devises
  doivent être rapatriées au Maroc.
- À faire valider par un comptable marocain : la retenue américaine (formulaire W-8BEN) et le plafond de chiffre
  d'affaires par client de l'auto-entrepreneur (vos « clients » officiels sont Amazon et Paddle).
