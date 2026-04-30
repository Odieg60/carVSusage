# V12 Flex Generator

Générateur de graphique "I Drive A CAR" 
Saisie manuelle des valeurs année par année, rendu live, export PNG.

## Stack

- HTML + CSS + JS vanilla
- [Chart.js 4.5.1](https://www.chartjs.org/) via CDN jsDelivr
- Aucun backend, aucun build, aucun tracking

## Utilisation locale

Ouvre simplement `index.html` dans ton navigateur. Pas de serveur nécessaire.

```bash
# Ou pour servir avec un mini-serveur HTTP (utile pour clipboard API):
python3 -m http.server 8000
# puis http://localhost:8000
```

## Déploiement GitHub Pages

1. Crée un repo GitHub (ex: `v12-flex-generator`)
2. Push le contenu de ce dossier à la racine
3. Settings → Pages → Source: `Deploy from a branch` → Branch: `main` / `/root`
4. URL disponible sous `https://<user>.github.io/v12-flex-generator/`

## Fonctionnalités

- ✅ Tableau éditable année par année (valeur véhicule + maintenance cumulée)
- ✅ Graphique mis à jour en live à chaque modification
- ✅ Titre, labels et devise personnalisables
- ✅ Ajout/suppression de lignes à la volée
- ✅ Export PNG haute résolution (2x retina)
- ✅ Export/copie JSON pour sauvegarder ses datasets
- ✅ Responsive (desktop + mobile)

## Structure

```
v12-flex/
├── index.html      # Markup + canvas + form
├── style.css       # Dark theme, chart card aspect 9:16 (format Instagram)
├── app.js          # State management, Chart.js, PNG export
└── README.md
```

## Pourquoi vanilla ?

Pas de dépendance npm, pas de build step, pas de bundle 200KB. Ça se déploie en 30 secondes sur GitHub Pages et ça reste maintenable dans 5 ans.

## Idées d'évolution (si besoin)

- Graphique en mode "comparaison" : 2-3 véhicules sur le même chart
- Ajout d'une 3e courbe : carburant ou TCO total
- Sauvegarde locale via `localStorage` (note : ne marche pas dans certains environnements sandboxés)
- Partage par URL (encoder le dataset en query params, ~base64)
- Templates pré-remplis (S65 AMG, Range Rover, 911 GT3...) chargeables en 1 clic
