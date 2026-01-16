# Guide de Deploiement - Hostinger

## Prerequis

- Compte Hostinger avec hebergement Web
- Base de donnees MySQL creee sur Hostinger
- Node.js 18+ installe localement
- Git installe

---

## 1. Configuration de la Base de Donnees Hostinger

### 1.1 Creer la base de donnees

1. Connectez-vous a votre **Panel Hostinger**
2. Allez dans **Bases de donnees** > **MySQL**
3. Cliquez sur **Creer une nouvelle base de donnees**
4. Notez les informations :
   - Nom de la base de donnees (ex: `u123456789_basketball`)
   - Nom d'utilisateur (ex: `u123456789_user`)
   - Mot de passe
   - Serveur MySQL (ex: `mysql.hostinger.com`)

### 1.2 Configurer l'acces distant (optionnel pour dev local)

Si vous voulez tester avec la BDD Hostinger depuis votre PC :
1. Panel Hostinger > Bases de donnees > Acces distant
2. Ajoutez votre IP publique

---

## 2. Configuration des Variables d'Environnement

### 2.1 En local (developpement)

Copiez `.env.example` vers `.env.local` :

```bash
cp .env.example .env.local
```

Remplissez les valeurs :

```env
DATABASE_HOST=mysql.hostinger.com
DATABASE_PORT=3306
DATABASE_USER=u123456789_user
DATABASE_PASSWORD=votre_mot_de_passe
DATABASE_NAME=u123456789_basketball

AUTH_SECRET=votre-cle-secrete-generee
AUTH_URL=http://localhost:3000
```

### 2.2 Generer AUTH_SECRET

```bash
openssl rand -base64 32
```

Ou utilisez : https://generate-secret.vercel.app/32

---

## 3. Initialiser la Base de Donnees

```bash
# Generer le client Prisma
npx prisma generate

# Creer les tables dans la BDD
npx prisma db push

# (Optionnel) Voir les donnees
npx prisma studio
```

---

## 4. Deploiement sur Hostinger

### Option A : VPS Hostinger (Recommande)

Si vous avez un VPS Hostinger :

```bash
# Sur le VPS
git clone https://github.com/votre-user/basketball-stats.git
cd basketball-stats

# Installer les dependances
npm install

# Configurer l'environnement
cp .env.example .env.local
nano .env.local  # Remplir les valeurs

# Build de production
npm run build

# Demarrer avec PM2
npm install -g pm2
pm2 start npm --name "basketball-stats" -- start
pm2 save
```

### Option B : Hebergement Web Hostinger (Premium/Business avec Node.js)

Les plans Premium/Business supportent Node.js !

#### Etape 1 : Preparer les fichiers

```bash
# Build local pour tester
npm run build
```

#### Etape 2 : Configurer Node.js sur hPanel

1. Connectez-vous a votre **hPanel Hostinger**
2. Allez dans **Avance** > **Node.js**
3. Cliquez sur **Creer une application**
4. Configurez :
   - **Version Node.js** : 20.x (ou 18.x)
   - **Repertoire racine** : `/public_html` ou `/public_html/basketball`
   - **Fichier de demarrage** : `server.js`
   - **Mode** : Production

#### Etape 3 : Variables d'environnement

Dans la section Node.js, ajoutez les variables :

| Variable | Valeur |
|----------|--------|
| `NODE_ENV` | `production` |
| `DATABASE_HOST` | `localhost` |
| `DATABASE_PORT` | `3306` |
| `DATABASE_USER` | votre_user |
| `DATABASE_PASSWORD` | votre_mdp |
| `DATABASE_NAME` | votre_bdd |
| `AUTH_SECRET` | votre_cle_32_chars |
| `AUTH_URL` | `https://votre-domaine.com` |

#### Etape 4 : Deployer via Git

Dans hPanel > **Avance** > **Git** :

1. Connectez votre repo GitHub
2. Selectionnez la branche `main`
3. Deployez

Ou via FTP/File Manager :
1. Uploadez tous les fichiers du projet
2. Dans le terminal SSH ou via hPanel Node.js :
   ```bash
   npm install
   npm run build
   ```
3. Redemarrez l'application Node.js

#### Etape 5 : Initialiser la BDD

Via SSH ou le terminal Node.js de hPanel :
```bash
npx prisma db push
```

### Option C : Vercel (Alternative gratuite)

Si Hostinger pose probleme :
- **Vercel** (gratuit) : https://vercel.com
- **Railway** : https://railway.app
- **Render** : https://render.com

---

## 5. Variables d'Environnement en Production

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_HOST` | Serveur MySQL Hostinger | `mysql.hostinger.com` |
| `DATABASE_PORT` | Port MySQL | `3306` |
| `DATABASE_USER` | Utilisateur BDD | `u123456789_user` |
| `DATABASE_PASSWORD` | Mot de passe BDD | `***` |
| `DATABASE_NAME` | Nom de la BDD | `u123456789_basketball` |
| `AUTH_SECRET` | Cle secrete NextAuth | `abc123...` |
| `AUTH_URL` | URL de l'application | `https://votre-app.vercel.app` |

---

## 6. Commandes Utiles

```bash
# Developpement
npm run dev

# Build production
npm run build

# Demarrer en production
npm start

# Synchroniser le schema avec la BDD
npx prisma db push

# Voir les donnees
npx prisma studio

# Reset complet de la BDD (ATTENTION: supprime les donnees!)
npx prisma db push --force-reset
```

---

## 7. Troubleshooting

### Erreur de connexion MySQL

```
Error: connect ECONNREFUSED
```

- Verifiez que l'acces distant est active sur Hostinger
- Verifiez les credentials dans `.env.local`
- Verifiez que votre IP est autorisee

### Erreur Prisma "Table does not exist"

```bash
npx prisma db push
```

### Erreur AUTH_SECRET

```
[auth][error] MissingSecret
```

Assurez-vous que `AUTH_SECRET` est defini dans vos variables d'environnement.

---

## 8. Architecture de Deploiement Recommandee

```
┌─────────────────┐     ┌──────────────────┐
│   Vercel/VPS    │────▶│  MySQL Hostinger │
│  (Application)  │     │  (Base de donnees)│
└─────────────────┘     └──────────────────┘
        │
        ▼
┌─────────────────┐
│   Utilisateurs  │
└─────────────────┘
```

Cette architecture separe l'hebergement de l'application (Vercel/VPS)
de la base de donnees (Hostinger MySQL), ce qui est une bonne pratique.
