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
- Le domaine personnalisé doit être `www.votezbien2027.fr`, la source de publication doit correspondre à la racine de `main` (ou à la source effectivement choisie) et `Enforce HTTPS` doit être activé.
- Vérifier après déploiement que les URLs `/robots.txt`, `/sitemap.xml` et `/404.html` répondent depuis le domaine canonique.
- Aucun dossier publié commençant par un souligné n’est nécessaire actuellement; `.nojekyll` n’est donc pas ajouté.

## Checklist avant une publication

1. Vérifier l’exactitude et la fraîcheur des positions politiques et de leurs sources.
2. Pour chaque page HTML ajoutée, rédiger un titre et une description distincts, un H1 unique, une canonical en HTTPS et des liens contextuels.
3. Lancer `npm run seo:sitemap`, `npm run seo:check`, `npm test`, `npm run build` et `npm run seo:dist`.
4. Vérifier le workflow « SEO maintenance » ainsi que le workflow CI, notamment le contrôle des fichiers copiés dans dist/.
5. Contrôler le rendu mobile, le clavier, les textes alternatifs, le contraste, les erreurs de console et les URLs publiées.
6. Maintenir les pages légales et de confidentialité alignées avec le fonctionnement réel du site et les services externes chargés.
7. Confirmer le domaine personnalisé, le HTTPS forcé et les redirections registrar.

## Mentions légales et confidentialité

Les pages publiques décrivent le projet comme une initiative bénévole publiée à titre non professionnel. Elles ne publient pas de nom, d’adresse personnelle ou de courriel inventés. La page des mentions légales explique l’exception d’anonymat prévue à l’article 1-1, II de la LCEN et indique les coordonnées publiées par GitHub. Cette exception suppose que les renseignements d’identification de l’éditeur aient été communiqués à l’hébergeur.

La politique de confidentialité distingue les réponses conservées dans le stockage local du navigateur, les journaux de sécurité de GitHub Pages et les requêtes vers Google Fonts, Wikimedia Commons et OnParticipe. Elle doit être revue si l’application ou ses fournisseurs changent.
