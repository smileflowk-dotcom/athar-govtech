# PoC IA ciblé — extraction et rapprochement grille + PV

## Finalité

Cette tranche verticale est une **preuve de concept ciblée**, pas un moteur d'extraction généralisé.

Elle démontre uniquement le chemin :

`texte grille + texte PV → pré-filtrage local → faits sourcés par IA locale → rapprochements prudents → contrôle déterministe existant → preuve`

Le scénario est limité au contrôle déjà présent **cohérence notation / classement / attribution**.

## Responsabilités

- **Pré-filtrage déterministe** : réduire localement le texte transmis au petit modèle sans modifier la source de référence.
- **IA locale — extraction** : notes par soumissionnaire, rangs explicitement présents et attributaire déclaré.
- **IA locale — rapprochement** : `confirme`, `contredit` ou `insuffisant`, avec confiance explicite.
- **Déterministe** : recalcul du classement et comparaison avec l'attributaire via `detectRankingAttributionInconsistency` ; aucune duplication de cette logique.
- **Humain** : qualification finale et décision de contrôle.

Chaque fait IA retenu conserve obligatoirement :

- nom du document ;
- page ;
- passage exact ;
- confiance d'extraction ;
- version du prompt.

Un garde-fou rejette tout fait dont l'ancre source n'existe pas dans le document original. Le passage exact est ensuite reconstruit par ATHAR depuis la source originale, jamais repris du texte généré par le modèle.

## Pré-filtrage local

Le PoC ne transmet plus systématiquement tout le texte d'une page au LLM. Avant l'appel IA, ATHAR sélectionne localement les lignes contenant des signaux pertinents pour le scénario : notes, points, classement/rang, ou mentions d'attributaire. Les ancres restent celles du document original (`P4-L12`, etc.).

Cette étape est volontairement déterministe : elle ne produit aucune conclusion métier et ne remplace pas la preuve source.

Le but est double :

1. réduire le temps d'inférence CPU du modèle 1.5B ;
2. conserver la traçabilité exacte des faits retenus.

## Runtime local

Le client IA appelle uniquement un runtime Ollama local via HTTP. Le code refuse les hôtes externes.

Valeurs par défaut :

```env
ATHAR_LOCAL_MODEL_URL=http://127.0.0.1:11434
ATHAR_LOCAL_MODEL=qwen2.5:1.5b-instruct-q4_K_M
```

Le modèle par défaut est un Qwen2.5 1.5B Instruct quantifié Q4_K_M, choisi pour ce PoC afin de rester compatible avec une exécution CPU sur une VM 8–16 Go sans GPU. Le modèle est téléchargé une première fois, puis l'inférence se fait localement sans appel API externe.

Exemple d'installation avec Ollama :

```bash
ollama pull qwen2.5:1.5b-instruct-q4_K_M
ollama serve
```

Une fois le modèle présent localement, ATHAR n'a pas besoin d'Internet pour cette tranche IA.

## Lancer la démonstration

Démarrer ATHAR puis ouvrir :

```text
/ai-ranking-poc
```

La page accepte le **texte déjà extrait** d'une grille de notation et d'un PV. Elle appelle :

```text
POST /api/ai/ranking-attribution
```

Exemple de charge utile :

```json
{
  "grille": {
    "document_source": "grille.pdf",
    "pages": [
      { "page": 4, "text": "Atlas Services — 92 points\nRif Solutions — 84 points" }
    ]
  },
  "pv": {
    "document_source": "pv.pdf",
    "pages": [
      { "page": 7, "text": "Attributaire déclaré : Rif Solutions" }
    ]
  }
}
```

La réponse distingue explicitement :

1. les faits issus de l'**extraction IA** ;
2. les relations issues du **rapprochement IA** ;
3. le résultat du **calcul déterministe** ;
4. l'absence de qualification juridique automatique.

## Prompts et traçabilité

Les prompts sont versionnés et conservés dans le code :

- `FACT_EXTRACTION_PROMPT_VERSION = athar-fact-extraction-v4` ;
- `FACT_RECONCILIATION_PROMPT_VERSION = athar-fact-reconciliation-v3`.

Le prompt exact utilisé est inclus dans la trace d'exécution retournée par les fonctions internes. Les prompts imposent notamment :

- aucune invention de donnée absente ;
- ancre source obligatoire ;
- vérification de l'ancre contre le document original ;
- `insuffisant` en cas d'ambiguïté ;
- aucune qualification juridique.

## Limites assumées

Cette branche ne cherche pas encore à :

- classifier tous les documents d'un dossier ;
- faire de l'OCR ;
- traiter l'arabe ;
- construire un graphe général de faits ;
- rapprocher tous les types de faits du marché ;
- détecter des patterns de fraude ;
- générer automatiquement un constat institutionnel.

Ces capacités relèvent de la trajectoire du PoC institutionnel. Ici, la priorité est de prouver une seule tranche verticale fiable et traçable.

## Tests

Les tests unitaires couvrent :

- pré-filtrage déterministe des lignes pertinentes ;
- extraction de notes claires ;
- rejet d'un fait dont la preuve source est absente et conservation de l'incertitude ;
- rapprochement `confirme` ;
- rapprochement `contredit` ;
- rapprochement forcé à `insuffisant` lorsque la confiance est trop faible ;
- alimentation du contrôle déterministe existant à partir des faits IA.
