# TP3 - Cluster MongoDB Replica Set

## Prérequis
- Docker et Docker Compose installés
- Ports 27017, 27018, 27019 disponibles

## Démarrage

### 1. Cloner le projet
git clone https://github.com/Enraya/mongodb-cluster.git
cd mongodb-cluster

### 2. Créer les dossiers de données
mkdir -p data/mongo1 data/mongo2 data/mongo3

### 3. Démarrer le cluster
docker compose up -d

### 4. Attendre que les conteneurs soient healthy (30-60 secondes)
docker compose ps

### 5. Initialiser le Replica Set
docker exec -it mongo1 mongosh

# Dans mongosh :
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1:27017", priority: 2 },
    { _id: 1, host: "mongo2:27017", priority: 1 },
    { _id: 2, host: "mongo3:27017", priority: 1 }
  ]
})

### 6. Connexion via Compass
mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0

## Arrêt
docker compose down
