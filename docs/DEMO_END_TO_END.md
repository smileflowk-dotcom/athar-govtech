# Démonstration ATHAR — parcours complet

## Objectif

Montrer sur un seul dossier cohérent la chaîne de valeur ATHAR :

`document / données → contrôle → alerte → règle → attendu → observé → preuve → décision humaine → fiche de constat`

Le dossier intégré **« Dossier PoC complet — parcours de contrôle »** utilise volontairement des **données fictives explicites**. Il ne doit pas être présenté comme un marché réel ni comme une conclusion juridique.

## Parcours de démonstration

1. Ouvrir le dossier **Dossier PoC complet — parcours de contrôle**.
2. Parcourir les quatre alertes avec les points de navigation.
3. Pour chaque alerte, montrer :
   - la page/source associée ;
   - la règle de contrôle ;
   - l’attendu ;
   - l’observé ;
   - la preuve ;
   - l’action recommandée.
4. Confirmer une ou plusieurs alertes comme contrôleur humain.
5. Cliquer sur **Générer la fiche de constat**.
6. Vérifier que seuls les constats confirmés apparaissent et que chaque constat conserve la chaîne règle → attendu → observé → preuve → décision humaine.
7. En mode Docker, redémarrer les conteneurs sans supprimer le volume et vérifier que les décisions sont conservées dans SQLite.

## Quatre familles de contrôles réunies

- délai de publication potentiellement insuffisant ;
- clause potentiellement restrictive ;
- absence déclarative d’une déclaration de probité pour un membre de commission ;
- incohérence entre notation finale, classement recalculé et attributaire déclaré.

## Ce que cette démonstration prouve

- plusieurs contrôles déterministes peuvent alimenter un même dossier ;
- chaque alerte reste explicable et rattachée à une preuve ;
- la décision finale reste humaine ;
- la fiche de constat est construite uniquement à partir des alertes confirmées ;
- l’état du dossier et les décisions peuvent être persistés localement en SQLite dans le packaging Docker.

## Limites à annoncer

- Le dossier complet intégré est fictif et sert à démontrer le parcours fonctionnel.
- L’import PDF réel est déjà disponible pour les PDF texte et alimente aujourd’hui le contrôle de clause restrictive ; les autres contrôles du dossier complet utilisent encore des données structurées de démonstration.
- Les scans nécessitant OCR ne sont pas encore pris en charge.
- Le signal de probité porte uniquement sur l’absence déclarative d’une déclaration ; il ne détecte pas à lui seul un conflit d’intérêts.
- Le contrôle de classement suppose que la note fournie est la note finale réellement utilisée pour classer les offres.
- ATHAR ne produit aucune conclusion juridique automatique.

## Formulation dossier GovTech

> Le démonstrateur ATHAR permet désormais de parcourir un dossier cohérent réunissant quatre familles de contrôles déterministes. Chaque signal expose sa source, la règle appliquée, l’attendu, l’observé et la preuve, puis requiert une décision humaine avant d’être repris dans une fiche de constat. Ce parcours complet est démontré sur des données fictives explicites ; l’import local de PDF texte a par ailleurs été confronté séparément à un CPS réel de 60 pages pour le contrôle de clause restrictive.
