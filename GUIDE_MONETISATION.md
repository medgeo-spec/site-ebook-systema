# Vendre « Breathing and Relaxation » : Amazon + votre site + cadeau YARAM (pas à pas)

Stratégie retenue :
| Canal | Rôle | Ce que vous touchez |
|---|---|---|
| **Amazon Kindle (KDP)** | Visibilité : Amazon amène des lecteurs qui ne vous connaissent pas | 70 % du prix (hors frais de livraison numérique, quelques centimes) |
| **Votre site** (achat direct via Lemon Squeezy) | Meilleure marge, lecteurs fidèles, liste e-mail | ≈ 95 % du prix moins 0,50 $ |
| **YARAM** | Le livre est offert aux abonnés Premium : il fait vendre l'abonnement | Revenus d'abonnement |
| **Extrait gratuit** (site) | Donne envie d'acheter, alimente la liste e-mail | – |

> ⚠️ **Ne cochez pas « KDP Select »** lors de la publication sur Amazon. KDP Select exige que l'e-book soit
> **exclusif** à Amazon : vous n'auriez plus le droit de le vendre sur votre site ni de l'offrir dans YARAM.
> Sans KDP Select, vous gardez la redevance de 70 % (prix entre 2,99 $ et 9,99 $).

## Les fichiers prêts à l'emploi
Dans `private/ebook/` (non publié sur le site) :
| Fichier | Usage |
|---|---|
| `Breathing-And-Relaxation-2nd-Edition-EN.epub` | À envoyer sur Amazon KDP, et à vendre sur votre site |
| `Breathing-And-Relaxation-2nd-Edition-EN.pdf` | À vendre sur votre site (et offert dans YARAM) |
| `cover/cover-2560x1600.jpg` | Couverture pour Amazon (taille recommandée 2560 × 1600) |

Sur le site (public) : `ebook/Breathing-And-Relaxation-Free-Sample-EN.pdf`, l'extrait gratuit (introduction + chapitres 1 et 2).

**Modifier le livre** : éditer `private/ebook/source/book-en.html`, puis dans `private/ebook/tools` :
`npm install` (une fois) et `npm run build`. Les trois fichiers sont régénérés. Recopier ensuite le PDF et l'EPUB
dans `YARAM/private/ebook/`.

👉 **Avant de publier** : relire les passages « New in the 2nd edition » et compléter « About the Author »
(`private/ebook/source/book-en.html`), puis relancer `npm run build`.

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

## Étape 2 : Vente directe sur votre site (Lemon Squeezy, 20 min)
1. https://app.lemonsqueezy.com (même compte que pour WeightMyMeal et YARAM si déjà créé)
2. **Products → New product** → « Breathing and Relaxation (e-book) » → **Single payment** → prix **4,99 $**
   (même prix qu'Amazon : Amazon peut s'aligner sur un prix plus bas trouvé ailleurs, ce qui réduit votre redevance)
3. Onglet **Files** : ajouter le **PDF** et l'**EPUB** : l'acheteur les reçoit automatiquement par e-mail
4. Copier le lien d'achat (bouton **Share**)

## Étape 3 : Brancher les boutons du site (2 min)
Ouvrir `js/store-links.js` et coller les deux liens :
```js
window.STORE_LINKS = {
  amazon: 'https://www.amazon.com/dp/XXXXXXXXXX',
  direct: 'https://votreboutique.lemonsqueezy.com/buy/xxxx',
};
```
Les boutons « Acheter sur Amazon Kindle » et « Acheter l'e-book » apparaissent aussitôt dans les 4 langues ;
tant qu'un lien est vide, son bouton reste caché et le site affiche « bientôt disponible » + l'extrait gratuit.

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
- Amazon et Lemon Squeezy versent l'argent **sur votre compte bancaire marocain**, TVA des acheteurs déjà gérée
  par eux (Lemon Squeezy est « merchant of record » ; Amazon collecte la TVA sur les e-books).
- Au Maroc, ce sont des revenus d'export imposables : statut **auto-entrepreneur** pour démarrer, rapatriement des
  devises automatique puisque les virements arrivent au Maroc.
- À faire valider par un comptable marocain : la retenue américaine (formulaire W-8BEN) et le plafond de chiffre
  d'affaires par client de l'auto-entrepreneur (vos « clients » officiels sont Amazon et Lemon Squeezy).
