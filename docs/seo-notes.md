# Notes SEO et publication

## Conventions d’URL

- Domaine canonique : https://www.votezbien2027.fr.
- Les pages d’information utilisent des chemins minuscules, courts et terminés par une barre oblique : `/a-propos/`, `/methode/`, `/mentions-legales/` et `/confidentialite/`. Elles sont liées dans le pied de page, sans entrée supplémentaire dans la navigation principale.
- Chaque page publique déclare une balise canonical absolue sur le domaine `www` en HTTPS. Les liens internes utilisent ces URLs canoniques ou des chemins relatifs pour les ressources.
- L’accueil de l’application reste à `/`. Les vues interactives sont des routes par fragment (par exemple `/#quizStart`) ; elles ne sont pas énumérées séparément dans le sitemap.
- `404.html` retourne la page d’erreur GitHub Pages, reste en `noindex` et n’est pas dans le sitemap.
- Le fichier `CNAME` à la racine contient déjà exactement `www.votezbien2027.fr`. Les domaines `.com`, `.store` et `.info` doivent continuer à rediriger vers le `.fr` chez le registrar; cette redirection ne peut pas être créée dans les fichiers de ce dépôt.

## Mettre à jour le sitemap

Le script `scripts/seo-maintenance.js` parcourt les fichiers HTML publics, dérive leurs URLs canoniques et génère un sitemap sans URL d’erreur ni date artificielle.

```sh
npm run seo:sitemap
npm run seo:check
npm run seo:dist
```

Après l’ajout, le retrait ou le déplacement d’une page, exécuter ces commandes puis commiter le sitemap généré. Le workflow GitHub « SEO maintenance » régénère le sitemap en mémoire de travail et échoue si le fichier commité diffère; il vérifie aussi la présence des pages, les métadonnées, les liens internes, le domaine canonique et les ressources référencées.

## État Pages et contrôle avant publication

- Le dépôt contient un fichier `CNAME` correct et GitHub indique que Pages est activé.
- L’API disponible n’expose pas ici le domaine configuré ni l’option HTTPS forcée. Dans `Settings → Pages`, vérifier que le domaine personnalisé est `www.votezbien2027.fr`, que la source de publication correspond à la racine de `main` (ou à la source réellement choisie) et que `Enforce HTTPS` est activé.
- Vérifier après déploiement que les URLs `/robots.txt`, `/sitemap.xml` et `/404.html` répondent depuis le domaine canonique.
- Aucun dossier publié commençant par un souligné n’est nécessaire actuellement; `.nojekyll` n’est donc pas ajouté.

## Checklist avant une publication

1. Vérifier l’exactitude et la fraîcheur des positions politiques et de leurs sources.
2. Pour chaque page HTML ajoutée, rédiger un titre et une description distincts, un H1 unique, une canonical en HTTPS et des liens contextuels.
3. Lancer `npm run seo:sitemap`, `npm run seo:check`, `npm test`, `npm run build` et `npm run seo:dist`.
4. Vérifier le workflow « SEO maintenance » ainsi que le workflow CI, notamment le contrôle des fichiers copiés dans dist/.
5. Contrôler le rendu mobile, le clavier, les textes alternatifs, le contraste, les erreurs de console et les URLs publiées.
6. Compléter puis faire relire les mentions légales et la politique de confidentialité avant de présenter leurs informations comme définitives.
7. Confirmer le domaine personnalisé, le HTTPS forcé et les redirections registrar.

## Informations restant à compléter

Le dépôt ne fournit pas le nom, l’adresse ou le contact de l’éditeur, ni le directeur de publication. Ces informations, ainsi que l’identité du responsable de traitement, la base juridique, les durées applicables et le moyen d’exercer les droits, restent signalées « À compléter » dans les mentions légales et la politique de confidentialité. Il faut les renseigner avant de présenter ces pages comme définitives.
