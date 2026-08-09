# Smoke test IA locale — grille + PV

## Objet

Valider en conditions réelles la tranche verticale :

`texte grille + texte PV → IA locale → faits sourcés → rapprochement → contrôle déterministe`

Ce test est obligatoire avant de présenter l'extraction et le rapprochement IA comme **démontrés** dans le dossier GovTech.

## Pré-requis

1. Installer Ollama.
2. Télécharger le modèle local quantifié :

```bash
ollama pull qwen2.5:1.5b-instruct-q4_K_M
```

3. Lancer Ollama :

```bash
ollama serve
```

4. Démarrer ATHAR depuis la branche `feature/ia-extraction-rapprochement`.
5. Vérifier que l'inférence reste CPU uniquement (`num_gpu: 0` dans le client local).

## Corpus de validation

Utiliser de préférence :

- une vraie grille de notation ;
- un vrai PV correspondant au même marché ;
- un couple dont l'attributaire attendu est connu à l'avance.

Le texte doit être obtenu par le pipeline PDF existant. Pour chaque extrait utilisé dans la vue `/ai-ranking-poc`, renseigner :

- le nom exact du document ;
- la page réelle ;
- le texte extrait de cette page.

## Test principal

Ouvrir :

```text
/ai-ranking-poc
```

Puis lancer la tranche IA et vérifier les points suivants.

### A. Extraction factuelle

- les notes par soumissionnaire sont correctes ;
- le classement n'est extrait que s'il est explicitement présent ;
- l'attributaire déclaré est correct ;
- aucune valeur absente du texte n'est inventée ;
- chaque fait affiche le bon document et la bonne page.

### B. Garde-fou anti-hallucination

Pour chaque fait retenu, vérifier que `passage_exact` existe réellement, à l'identique, dans le texte source de la page.

Le code rejette déjà automatiquement toute proposition IA dont la citation exacte n'est pas retrouvée dans la page fournie.

Critère : **zéro fait retenu avec une citation absente de la source**.

### C. Rapprochement

Vérifier que les relations retournées sont cohérentes :

- `confirme` si deux faits décrivent la même réalité de manière compatible ;
- `contredit` si les deux sources portent des valeurs incompatibles ;
- `insuffisant` lorsque les éléments ne permettent pas une conclusion fiable.

Une faible confiance doit conduire à `insuffisant`, pas à une conclusion forcée.

### D. Contrôle déterministe

Vérifier que :

- les notes extraites alimentent le contrôle existant ;
- l'attributaire extrait du PV alimente le même contrôle ;
- le classement est recalculé par `detectRankingAttributionInconsistency` ;
- aucune logique métier de classement n'est dupliquée dans la couche IA.

## Test dégradé obligatoire

Rejouer le test avec un PV ou une grille volontairement incomplet, par exemple en supprimant la mention explicite de l'attributaire ou une note nécessaire.

Résultat attendu :

```text
status = insuffisant
```

ATHAR ne doit pas fabriquer la donnée manquante ni déclencher artificiellement un contrôle métier.

## Critère PASS

Le smoke test est considéré comme validé si, sur au moins un vrai couple grille + PV :

- notes correctement extraites ;
- attributaire correctement extrait ;
- passages sources exacts vérifiés ;
- rapprochement cohérent ;
- contrôle déterministe correctement alimenté ;
- cas incomplet renvoyé comme `insuffisant`.

## Critère FAIL

Le test échoue si l'un des cas suivants est observé :

- valeur inventée ;
- fausse citation acceptée ;
- mauvaise page ou mauvaise source attribuée au fait ;
- ambiguïté transformée en certitude ;
- contrôle lancé malgré des données insuffisantes ;
- résultat IA présenté comme qualification juridique.

## Formulation autorisée après validation

Une fois le smoke test réel réussi, le dossier peut dire :

> ATHAR démontre, sur le scénario ciblé grille de notation + PV, une extraction de faits assistée par IA locale et un rapprochement prudent entre sources. Chaque fait retenu conserve son document, sa page et son passage exact. Une proposition du modèle dont la citation ne peut pas être retrouvée à l'identique dans la source est rejetée avant d'alimenter le moteur de contrôle déterministe.

Avant ce smoke test, cette formulation doit rester au futur ou être présentée comme composant implémenté mais non encore validé en inférence réelle.
