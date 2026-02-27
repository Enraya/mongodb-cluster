db = db.getSiblingDB("nosqlshop")

// ============================================
// EXERCICE 1 : Requêtes simples
// ============================================

print("\n=== EX1.1 - Produits avec prix > 500€ ===")
db.products.find({ price: { $gt: 500 } }).forEach(p =>
  print(`${p.name} - ${parseFloat(p.price)}€`)
)

print("\n=== EX1.2 - Produits catégorie 'Computers' avec stock < 15 (Je suis monté à 15, il y a avait rien sous 10)===")
db.products.find({
  category: "Computers",
  stock: { $lt: 15 }
}).forEach(p =>
  print(`${p.name} - Stock: ${p.stock}`)
)

print("\n=== EX1.3 - Utilisateurs créés en 2026 ===")
db.users.find({
  created_at: {
    $gte: ISODate("2026-01-01"),
    $lt: ISODate("2027-01-01")
  }
}).forEach(u =>
  print(`${u.profile?.firstName} ${u.profile?.lastName} - ${u.email} - ${u.created_at}`)
)

// ============================================
// EXERCICE 2 : Agrégation
// ============================================

print("\n=== EX2.1 - Prix moyen par catégorie ===")
db.products.aggregate([
  { $unwind: "$category" },
  {
    $group: {
      _id: "$category",
      prixMoyen: { $avg: { $toDouble: "$price" } }
    }
  },
  { $sort: { prixMoyen: -1 } }
]).forEach(r =>
  print(`${r._id} : ${r.prixMoyen.toFixed(2)}€`)
)

print("\n=== EX2.2 - Top 5 produits les plus commandés ===")
db.orders.aggregate([
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.sku",
      nom: { $first: "$items.name" },
      totalCommandes: { $sum: "$items.quantity" }
    }
  },
  { $sort: { totalCommandes: -1 } },
  { $limit: 5 }
]).forEach(r =>
  print(`${r.nom} (${r._id}) - Quantité commandée: ${r.totalCommandes}`)
)

print("\n=== EX2.3 - Panier moyen ===")
db.orders.aggregate([
  {
    $group: {
      _id: null,
      panierMoyen: { $avg: { $toDouble: "$total" } }
    }
  }
]).forEach(r =>
  print(`Panier moyen : ${r.panierMoyen.toFixed(2)}€`)
)

// ============================================
// EXERCICE 3 : Index
// ============================================

print("\n=== EX3.1 - Création index sur users.email ===")
db.users.createIndex({ email: 1 }, { unique: true })
print("Index créé")

print("\n=== EX3.2 - explain() recherche par email AVEC index ===")
const explain = db.users.find({ email: "jean.dupont@example.com" }).explain("executionStats")
print(`Stage: ${explain.queryPlanner.winningPlan.stage}`)
print(`Index utilisé: ${JSON.stringify(explain.queryPlanner.winningPlan.inputStage?.indexName ?? "N/A")}`)
print(`Documents examinés: ${explain.executionStats.totalDocsExamined}`)
print(`Clés examinées: ${explain.executionStats.totalKeysExamined}`)

print("\n=== EX3.3 - Comparaison avant/après index ===")
print("--- SANS index (COLLSCAN forcé) ---")
const sans = db.users.find({ email: "jean.dupont@example.com" })
  .hint({ $natural: 1 })
  .explain("executionStats")
print(`Stage: ${sans.queryPlanner.winningPlan.stage}`)
print(`Documents examinés: ${sans.executionStats.totalDocsExamined}`)
print(`Temps d'exécution: ${sans.executionStats.executionTimeMillis}ms`)

print("--- AVEC index (IXSCAN) ---")
const avec = db.users.find({ email: "jean.dupont@example.com" })
  .hint({ email: 1 })
  .explain("executionStats")
print(`Stage: ${avec.queryPlanner.winningPlan.inputStage?.stage ?? avec.queryPlanner.winningPlan.stage}`)
print(`Documents examinés: ${avec.executionStats.totalDocsExamined}`)
print(`Temps d'exécution: ${avec.executionStats.executionTimeMillis}ms`)
