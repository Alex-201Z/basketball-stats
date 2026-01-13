# Configuration des variables d'environnement

## Pour MySQL (Hostinger)

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# MySQL Database (Hostinger)
# Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="mysql://u123456789_user:MotDePasse@sql123.hostinger.com:3306/u123456789_basketball"

# Optionnel - API NBA (balldontlie.io)
NBA_API_KEY="votre-clé-api-nba"
```

## Comment obtenir les informations Hostinger

1. Connectez-vous à votre compte Hostinger
2. Allez dans **Hébergement** → **Gérer**
3. Dans le menu, cliquez sur **Bases de données** → **MySQL**
4. Créez une nouvelle base de données ou utilisez une existante
5. Notez les informations :
   - **Nom de la base** : `u123456789_basketball`
   - **Nom d'utilisateur** : `u123456789_user`
   - **Mot de passe** : celui que vous avez défini
   - **Serveur MySQL** : `sql123.hostinger.com` (visible dans les détails)
   - **Port** : `3306` (par défaut)

## Initialiser la base de données

Une fois le fichier `.env` configuré, exécutez :

```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables dans la base de données
npx prisma db push

# (Optionnel) Ajouter des données de test
npx prisma db seed
```

## Vérifier la connexion

```bash
# Ouvrir Prisma Studio pour voir les données
npx prisma studio
```

## En cas de problème de connexion

1. Vérifiez que l'accès distant MySQL est activé dans Hostinger
2. Vérifiez que votre IP est autorisée (ou activez l'accès pour toutes les IPs)
3. Testez la connexion avec un client MySQL externe
