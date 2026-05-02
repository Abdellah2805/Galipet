# Gali'Pet - Application Mobile de Services pour Animaux

Comptes test: 

professionnel :
contact@entreprise.com / mpd:123456

propriétaire :
moi1@gmail.com 
mdp : 123456

note: l inscription marche

## 📋 Concept du Projet

**Gali'Pet** est une plateforme mobile-first qui connecte les propriétaires d'animaux (chiens et chats) avec des professionnels du secteur animalier. L'application est conçue comme un écosystème complet permettant de gérer la vie quotidienne de ses compagnons à quatre pattes tout en accédant facilement à des services professionnels de qualité.

### Publics Cibles

L'application s'adresse à deux types d'utilisateurs distincts :

1. **Clients (Propriétaires d'animaux)** : Personnes possédant un ou plusieurs animaux (chiens ou chats) souhaitant gérer leurs profils, découvrir des services et réserver des prestations.

2. **Professionnels** : Éleveurs, vétérinaires, toiletteurs, petsitters, éducateurs canins et autres acteurs du monde animal souhaitant proposer leurs services et gérer leur activité.

### Fonctionnalités Principales

#### Pour les Clients

- **Exploration de services** : Découverte de professionnels par catégorie (Santé, Toilettage, Pet-sitting, Éducation)
- **Gestion des animaux** : Création de profils détaillés pour chaque animal avec :
  - Informations de base (nom, espèce, race, date de naissance, sexe)
  - Caractéristiques physiques (taille, type de poil, poids)
  - Informations de santé (allergies, vaccinations)
  - Tags de personnalité (joueur, calme, affectueux, etc.)
  - Photo de profil
- **Profil utilisateur** : Gestion des informations personnelles
- **Messagerie** : Communication avec les professionnels (en cours de développement)
- **Carte interactive** : Visualisation géographique des professionnels disponibles

#### Pour les Professionnels

- **Tableau de bord analytique** : Vue d'ensemble de l'activité avec KPIs en temps réel :
  - Revenus totaux
  - Nombre de réservations
  - Clients actifs
  - Heures travaillées
- **Graphiques de tendance** : Évolution des revenus par jour, semaine ou mois
- **Calendrier professionnel** : Gestion des rendez-vous et disponibilités
- **Profil public personnalisable** : Présentation de l'entreprise avec :
  - Horaires d'ouverture
  - Spécialisation
  - Bio et description
  - Image de couverture
- **Gestion des réservations** : Suivi des rendez-vous clients

#### Système de Réservation

- Prise de rendez-vous en ligne avec sélection de créneaux horaires
- Gestion des statuts (en attente, confirmé, complété, annulé)
- Tarification en EUR avec calcul automatique

---

## 🛠️ Stack Technique

### Frontend

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Expo SDK** | ~54.0.33 | Framework cross-platform (iOS, Android, Web) |
| **React** | 19.1.0 | Bibliothèque UI |
| **React Native** | 0.81.5 | Composants natifs mobiles |
| **React Native Web** | ~0.21.0 | Adaptation web des composants RN |
| **Expo Router** | ~6.0.23 | Navigation et routage |
| **React Navigation** | v7 | Navigation par pile et par onglets |
| **TypeScript** | ~5.9.2 | Typage statique |

### Backend & Base de Données

| Technologie | Rôle |
|-------------|------|
| **Supabase** | Backend-as-a-Service complet |
| **PostgreSQL** | Base de données relationnelle |
| **Supabase Auth** | Authentification (email/mot de passe) |
| **Supabase Storage** | Stockage des images (photos d'animaux) |
| **Row Level Security (RLS)** | Sécurisation des données au niveau des lignes |

### État et Données

| Technologie | Rôle |
|-------------|------|
| **SWR** | Gestion du cache et revalidation des données |
| **React Context** | Gestion de l'état d'authentification global |
| **AsyncStorage** | Persistance locale des sessions (mobile) |
| **localStorage** | Persistance locale des sessions (web) |

### UI / UX

| Technologie | Rôle |
|-------------|------|
| **Expo Vector Icons** | Icônes Ionicons |
| **Expo Image** | Chargement optimisé des images |
| **Expo Image Picker** | Sélection de photos depuis la galerie |
| **Expo Linear Gradient** | Dégradés visuels |
| **React Native Reanimated** | Animations fluides |

### Déploiement

| Plateforme | Configuration |
|------------|---------------|
| **Vercel** | Export statique web (`expo export -p web`) |
| **SPA Routing** | Redirection des routes vers `index.html` |

---

## 🏗️ Architecture de la Base de Données

### Tables Principales

| Table | Description |
|-------|-------------|
| `profiles` | Profils de base de tous les utilisateurs (email, rôle, téléphone, adresse) |
| `customer_profiles` | Informations spécifiques aux clients (nom complet) |
| `company_profiles` | Informations des professionnels (nom entreprise, SIRET, spécialisation, bio, horaires) |
| `pets` | Fiches animaux liées aux propriétaires |
| `pet_photos` | Photos additionnelles des animaux |
| `bookings` | Réservations liant clients et professionnels |

### Relations

```
auth.users
    │
    ├──► profiles (1:1)
    │       │
    │       ├──► customer_profiles (1:1) — rôle = 'customer'
    │       └──► company_profiles (1:1) — rôle = 'professional' | 'company'
    │
    └──► pets (1:N) — un propriétaire peut avoir plusieurs animaux
            │
            └──► pet_photos (1:N)

bookings lie customer_profiles ↔ company_profiles
```

### Contraintes Métier

- Les animaux sont limités aux espèces **chien** et **chat**
- Les montants sont stockés en centimes (integer) pour éviter les erreurs de flottants
- Les horaires des professionnels sont stockés en JSONB pour la flexibilité
- Les allergies, vaccinations et traits de personnalité sont des tableaux JSONB

---

## 🎨 Design System

### Palette de Couleurs Gali'Pet

| Couleur | Code | Usage |
|---------|------|-------|
| **Orange primaire** | `#E87A5D` | Header, boutons principaux, onglets actifs |
| **Orange foncé** | `#C75F45` | États pressés, accents |
| **Orange accent** | `#F4C28F` | Étoiles de notation, éléments secondaires |
| **Vert** | `#7BA988` | Badges blog, indicateurs de succès |
| **Fond** | `#FFF8F1` | Arrière-plan principal chaud |
| **Surface** | `#FFFFFF` | Cartes, modales |
| **Texte** | `#2E2A26` | Titres et contenu principal |
| **Texte atténué** | `#6B6660` | Sous-titres, descriptions |
| **Bordure** | `#EADBC8` | Contours, séparateurs |

### Rayons de Bordure

- `sm`: 8px — petits éléments
- `md`: 14px — boutons, inputs
- `lg`: 22px — cartes, modales
- `pill`: 999px — badges, tags

---

## 🚀 Scripts Disponibles

```bash
# Démarrage du serveur de développement
npm run start

# Lancement sur plateforme spécifique
npm run android
npm run ios
npm run web

# Export statique pour production (web)
npm run build        # équivalent à : npx expo export -p web

# Linting
npm run lint
```

---

## ⚠️ Problème Connu : Chargement Infini & Cache Navigateur

### Description

Dans certains cas, l'application peut rester bloquée sur un état de chargement infini au démarrage ou lors du rafraîchissement des données. Ce phénomène est généralement causé par un **conflit de cache navigateur** ou une **session Supabase corrompue** stockée localement.

### Scénarios d'Apparition

- Rafraîchissement de la page (F5) alors qu'une requête est en cours
- Changement rapide entre les onglets de navigation
- Déconnexion / reconnexion fréquente
- Mise à jour du code déployé sans invalidation du cache client

### Solution Immédiate

**Vider le cache et le stockage local du navigateur** :

1. **Chrome / Edge / Firefox** :
   - Ouvrir les outils de développement (F12)
   - Onglet **Application** (Chrome/Edge) ou **Stockage** (Firefox)
   - Cliquer sur **Local Storage** → Supprimer toutes les entrées
   - Cliquer sur **Session Storage** → Supprimer toutes les entrées
   - Cliquer sur **Cookies** → Supprimer les cookies du site
   - Rafraîchir la page avec `Ctrl + F5` (ou `Cmd + Shift + R` sur Mac)

2. **Raccourci rapide** :
   ```
   Ctrl + Shift + Suppr  → Cochez "Images et fichiers en cache" + "Cookies"
   ```

3. **Hard reload** (alternative) :
   ```
   Ctrl + F5  (Windows/Linux)
   Cmd + Shift + R  (macOS)
   ```

### Prévention Implémentée

Le code intègre déjà plusieurs mécanismes de protection :

- **Timeout de sécurité** (3 secondes) sur la récupération de session pour éviter le blocage infini
- **Détection des locks de session** Supabase avec déconnexion automatique en cas de corruption
- **Persistance conditionnelle** : la session n'est pas persistée pendant le build statique (SSR-safe)
- **Fallback sur état non authentifié** en cas d'erreur de récupération de session

### Notes Techniques

Le problème provient principalement de la manière dont Supabase stocke et rafraîchit ses tokens d'authentification dans le `localStorage`. Lorsque le token expire ou est invalidé côté serveur sans être correctement nettoyé côté client, les requêtes subséquentes peuvent entrer dans un état de boucle de rafraîchissement.

---

## 📁 Structure du Projet

```
galipet-mobile/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── PrimaryButton.tsx
│   │   ├── SecondaryButton.tsx
│   │   ├── TextField.tsx
│   │   ├── ScreenContainer.tsx
│   │   └── Icon.tsx
│   ├── screens/             # Écrans de l'application
│   │   ├── HomeScreen.tsx           # Accueil client (exploration)
│   │   ├── ProfileScreen.tsx        # Profil client
│   │   ├── PetProfileScreen.tsx     # Profil animal détaillé
│   │   ├── ProfessionalDashboard.tsx # Tableau de bord pro
│   │   ├── ProfessionalProfileScreen.tsx # Profil pro (édition/apercu)
│   │   ├── ProfessionalCalendarScreen.tsx # Calendrier pro
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterChoiceScreen.tsx
│   │   ├── RegisterCustomerScreen.tsx
│   │   └── RegisterCompanyScreen.tsx
│   ├── navigation/          # Configuration de la navigation
│   │   ├── RootNavigator.tsx      # Routeur racine (auth vs app)
│   │   ├── AuthNavigator.tsx      # Flux d'authentification
│   │   ├── AppNavigator.tsx       # Navigation client (bottom tabs)
│   │   └── ProfessionalNavigator.tsx # Navigation pro
│   ├── context/             # Contextes React globaux
│   │   └── AuthContext.tsx      # Gestion de la session
│   ├── hooks/               # Hooks personnalisés
│   │   └── useSupabase.ts       # Requêtes SWR vers Supabase
│   ├── lib/                 # Configuration services externes
│   │   └── supabase.tsx         # Client Supabase (SSR-safe)
│   └── theme/               # Design system
│       └── colors.tsx           # Palette et tokens
├── app/                     # Expo Router (fichiers de route)
├── scripts/                 # Scripts utilitaires
├── dist/                    # Export statique (build web)
├── package.json
├── tsconfig.json
├── vercel.json              # Configuration déploiement Vercel
└── .env*.local              # Variables d'environnement locales
```

---



---

## 🌐 Déploiement Web (Vercel)

L'application est configurée pour être exportée comme **Single Page Application (SPA)** statique :

1. **Build** : `npx expo export -p web` génère le dossier `dist/`
2. **Routing** : `vercel.json` redirige toutes les routes vers `index.html`
3. **Déploiement** : Connecter le repo GitHub à Vercel ou utiliser le CLI Vercel

---

## 📱 Roadmap Fonctionnelle

- [x] Authentification complète (inscription/connexion)
- [x] Gestion de profil client et professionnel
- [x] Création et édition de profils animaux
- [x] Tableau de bord professionnel avec KPIs
- [x] Calendrier de réservations
- [ ] Messagerie temps réel
- [ ] Paiement intégré (Stripe)
- [ ] Notifications push
- [ ] Recherche géolocalisée avancée
- [ ] Système d'avis et notation
- [ ] Application native iOS/Android (build EAS)

---

## 🤝 Contribution

Ce projet est actuellement en phase MVP. Les contributions sont les bienvenues, notamment sur :

- L'amélioration de la gestion d'état (remplacement du Context par Zustand/Redux si scaling)
- La mise en place de tests (Jest, React Native Testing Library)
- L'optimisation des requêtes Supabase et des index PostgreSQL
- L'implémentation de la messagerie temps réel (Supabase Realtime)

---

**Gali'Pet** - *Parce que nos compagnons méritent le meilleur.*
