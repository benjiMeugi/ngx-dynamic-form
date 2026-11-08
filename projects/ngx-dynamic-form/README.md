# @benjimeugi/ngx-dynamic-form

Librairie Angular (standalone, Angular 19+) permettant de générer des formulaires dynamiques à partir d'une configuration JSON : types de champs variés, validation déclarative, chargement d'options distantes avec pagination, tableaux de champs répétables (FormArray), extensibilité par templates personnalisés et support natif du Dark Mode avec Tailwind CSS.

---

## Sommaire

- [@benjimeugi/ngx-dynamic-form](#benjimeugingx-dynamic-form)
  - [Sommaire](#sommaire)
  - [Installation](#installation)
    - [Tailwind — scanner les classes de la librairie](#tailwind--scanner-les-classes-de-la-librairie)
  - [Démarrage rapide](#démarrage-rapide)
    - [Alternative : passer la configuration directement (sans fichier JSON)](#alternative--passer-la-configuration-directement-sans-fichier-json)
  - [Structure d'un formulaire](#structure-dun-formulaire)
    - [`FieldConfig`](#fieldconfig)
  - [Types de champs supportés](#types-de-champs-supportés)
  - [Validation](#validation)
  - [Champs à options distantes (select / radio)](#champs-à-options-distantes-select--radio)
    - [Mode simple (liste statique ou chargée une fois)](#mode-simple-liste-statique-ou-chargée-une-fois)
    - [Mode `lazy` (grandes listes, recherche + pagination serveur)](#mode-lazy-grandes-listes-recherche--pagination-serveur)
  - [Champs répétables (FormArray)](#champs-répétables-formarray)
  - [Personnalisation des messages d'erreur](#personnalisation-des-messages-derreur)
  - [Styles (Tailwind)](#styles-tailwind)
  - [Tester la librairie en local avec yalc](#tester-la-librairie-en-local-avec-yalc)
  - [Simuler une API pour les champs lazy](#simuler-une-api-pour-les-champs-lazy)
  - [Limitations connues](#limitations-connues)

---

## Installation

```bash
npm install @benjimeugi/ngx-dynamic-form @angular/cdk libphonenumber-js
```

L'application consommatrice doit avoir configuré :
- **Tailwind CSS** (les templates de la librairie utilisent des classes utilitaires Tailwind)
- **`provideHttpClient()`** dans `app.config.ts` (nécessaire pour charger les formulaires JSON et les options distantes)

```typescript
// app.config.ts
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    // ...
  ],
};
```

### Tailwind — scanner les classes de la librairie

Comme les classes Tailwind utilisées dans les templates de `ngx-dynamic-form` vivent dans `node_modules`, il faut explicitement dire à Tailwind de les scanner, sinon elles ne seront pas générées dans le CSS final.

**Tailwind v3** (`tailwind.config.js`) :
```javascript
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/ngx-dynamic-form/**/*.{mjs,js}",
  ],
};
```

**Tailwind v4** (dans le fichier CSS d'entrée) :
```css
@import "tailwindcss";
@source "../node_modules/ngx-dynamic-form/**/*.{mjs,js}";
```

---

## Démarrage rapide

```typescript
import { Component } from '@angular/core';
import { DynamicFormComponent } from 'ngx-dynamic-form';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DynamicFormComponent],
  template: `
    <lib-dynamic-form
      jsonUrl="/forms.json"
      formId="contact-form"
      (formSubmit)="onSubmit($event)"
    />
  `,
})
export class AppComponent {
  onSubmit(values: Record<string, any>) {
    console.log('Valeurs soumises :', values);
  }
}
```

Le fichier `forms.json` doit être placé dans le dossier **`public/`** du projet (convention Angular 19), et sera donc accessible à la racine (`/forms.json`), et non sous `/assets/`.

### Alternative : passer la configuration directement (sans fichier JSON)

```typescript
<lib-dynamic-form [formConfig]="monFormulaire" (formSubmit)="onSubmit($event)" />
```

```typescript
monFormulaire: FormConfig = {
  id: 'inline-form',
  title: 'Mon formulaire',
  fields: [ /* ... */ ],
};
```

---

## Structure d'un formulaire

```json
{
  "forms": [
    {
      "id": "contact-form",
      "title": "Formulaire de contact",
      "submitLabel": "Envoyer",
      "fields": [ /* FieldConfig[] */ ]
    }
  ]
}
```

| Propriété | Description |
|---|---|
| `id` | Identifiant unique, utilisé via l'input `formId` du composant |
| `title` | Titre affiché en haut du formulaire (optionnel) |
| `submitLabel` | Libellé du bouton (défaut : `"Enregistrer"`) |
| `fields` | Tableau de `FieldConfig` (voir ci-dessous) |

### `FieldConfig`

| Propriété | Type | Description |
|---|---|---|
| `name` | `string` | Clé du champ dans le formulaire (et dans les valeurs soumises) |
| `type` | `FieldType` | Voir tableau des types ci-dessous |
| `label` | `string` | Libellé affiché |
| `placeholder` | `string` | Texte indicatif |
| `defaultValue` | `any` | Valeur initiale |
| `order` | `number` | Ordre d'affichage et `tabindex` |
| `colClass` | `string` | Classe Tailwind de largeur, ex. `col-span-1`, `col-span-2`, `col-span-3` (grille en 3 colonnes) |
| `validation` | `ValidationConfig` | Règles de validation (voir plus bas) |
| `optionSource` | `OptionSource` | Pour `select` / `radio` |
| `fileConfig` | `FileConfig` | Pour `file` |
| `phoneConfig` | `PhoneConfig` | Pour `tel` |
| `arrayConfig` | `ArrayFieldConfig` | Pour `array` |
| `showPasswordToggle` | `boolean` | Affiche l'œil pour `password` |

---

## Types de champs supportés

| `type` | Rendu | Remarques |
|---|---|---|
| `text` | `<input type="text">` | |
| `email` | `<input type="email">` | + validation `email` disponible |
| `password` | Input avec œil optionnel | `showPasswordToggle: true` |
| `integer` | Input texte filtré | Bloque `e`, `+`, `.`, `,` à la saisie ; clavier numérique sur mobile |
| `textarea` | `<textarea>` | |
| `select` | Dropdown personnalisé | Recherche intégrée, désélection si non requis, mode `lazy` disponible |
| `radio` | Boutons radio | Options statiques ou via URL |
| `checkbox` | Case à cocher | |
| `date` | Saisie libre + calendrier natif | Formatage auto `jj/mm/aaaa`, bornes `minDate`/`maxDate` |
| `tel` | Sélecteur pays + numéro | Basé sur `libphonenumber-js` (tous pays, formatage en direct, validation réelle) |
| `file` | Zone drag & drop | Upload simple ou multiple, preview image, icônes par type |
| `decimal` | Input décimal formaté | Précision et séparateur configurable (ex: monétaire) |
| `toggle` | Interrupteur moderne (Switch) | Idéal pour activer/désactiver des options (Urgent, RGPD...) |
| `array` | Groupe répétable | Voir section dédiée |
| *Custom* | Template personnalisé | Utiliser la directive `dfCustomField` (voir ci-dessous) |

---

## Validation

```typescript
interface ValidationConfig {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;      // regex, ex: "^0[0-9]{9}$"
  email?: boolean;
  integer?: boolean;
  phone?: boolean;
  minDate?: string;       // format ISO yyyy-mm-dd
  maxDate?: string;       // format ISO yyyy-mm-dd
  messages?: Partial<Record<string, string>>; // voir section messages personnalisés
}
```

Exemple :

```json
{
  "name": "age",
  "type": "integer",
  "label": "Âge",
  "validation": { "required": true, "integer": true, "min": 18, "max": 65 }
}
```

---

## Champs à options distantes (select / radio)

### Mode simple (liste statique ou chargée une fois)

```json
{
  "name": "pays",
  "type": "select",
  "optionSource": {
    "options": [
      { "key": "fr", "value": "France" },
      { "key": "be", "value": "Belgique" }
    ]
  }
}
```

Ou via une URL retournant directement un tableau `[{key, value}]` :

```json
{
  "optionSource": { "url": "/assets/pays.json" }
}
```

### Mode `lazy` (grandes listes, recherche + pagination serveur)

```json
{
  "name": "ville",
  "type": "select",
  "optionSource": {
    "url": "https://api.exemple.com/villes",
    "lazy": true,
    "pageSize": 20,
    "searchParamName": "q"
  }
}
```

Contrat attendu côté API :
```
GET /villes?q=paris&page=1&pageSize=20
→ { "items": [{ "key": "...", "value": "..." }], "total": 235 }
```

Le composant gère automatiquement : debounce de la recherche (300ms), rechargement depuis la page 1 à chaque recherche, et chargement de la page suivante au scroll (infinite scroll), via `@angular/cdk` (virtual scrolling).

---

## Champs répétables (FormArray)

Le type `array` permet de répéter un groupe de champs (ex. plusieurs expériences, plusieurs contacts). Chaque type de champ standard est utilisable à l'intérieur (y compris `select` lazy, `file`, `tel`, etc.), à l'exception d'un `array` imbriqué (non supporté).

```json
{
  "name": "experiences",
  "type": "array",
  "label": "Expériences professionnelles",
  "arrayConfig": {
    "minItems": 1,
    "maxItems": 5,
    "defaultItems": 1,
    "addLabel": "Ajouter une expérience",
    "removeLabel": "Retirer",
    "fields": [
      { "name": "entreprise", "type": "text", "label": "Entreprise", "validation": { "required": true } },
      { "name": "poste", "type": "text", "label": "Poste", "validation": { "required": true } },
      { "name": "dureeAnnees", "type": "integer", "label": "Durée (années)" }
    ]
  }
}
```

Les valeurs soumises pour ce champ seront un tableau d'objets :
```json
{
  "experiences": [
    { "entreprise": "Acme", "poste": "Développeur", "dureeAnnees": 3 }
  ]
}
```

---

## Personnalisation des messages d'erreur

Chaque règle de validation a un message par défaut, remplaçable via `validation.messages` (champs simples) ou `arrayConfig.messages` (tableaux). Les valeurs `{min}`, `{max}`, etc. sont interpolées automatiquement selon la règle concernée.

```json
{
  "name": "age",
  "type": "integer",
  "validation": {
    "required": true,
    "min": 18,
    "messages": {
      "required": "L'âge est obligatoire",
      "min": "Vous devez avoir au moins {min} ans"
    }
  }
}
```

Clés disponibles : `required`, `min`, `max`, `minLength`, `maxLength`, `email`, `integer`, `pattern`, `phone`, `minDate`, `maxDate`. Pour les tableaux : `minItems`, `maxItems`.

---

## Champs personnalisés (Slots avec `dfCustomField`)

Pour insérer un composant tiers (éditeur de texte riche Tiptap, sélecteur d'adresse, signature...) ou un champ métier spécifique :

```typescript
import { DynamicFormComponent, CustomFieldDirective } from 'ngx-dynamic-form';

@Component({
  standalone: true,
  imports: [DynamicFormComponent, CustomFieldDirective, ReactiveFormsModule],
  template: `
    <lib-dynamic-form [formConfig]="monFormulaire" (formSubmit)="onSubmit($event)">
      <!-- Slot pour le champ de type "rich-text" -->
      <ng-template dfCustomField="rich-text" let-field let-control="control">
        <mon-editeur-tiptap [formControl]="control" [placeholder]="field.placeholder" />
      </ng-template>

      <!-- Slot d'actions personnalisées (bouton Annuler, Enregistrer brouillon...) -->
      <div formActions class="flex gap-2">
        <button type="button" class="btn-secondary" (click)="onCancel()">Annuler</button>
      </div>
    </lib-dynamic-form>
  `
})
```

---

## Personnalisation de la grille & Thème

### Grille flexible

Par défaut, le formulaire utilise une grille responsive sur 4 colonnes (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`). Vous pouvez la surcharger librement :

```html
<lib-dynamic-form [formConfig]="form" [gridClass]="'grid grid-cols-1 md:grid-cols-2 gap-6'" />
```

### Thème et Design Tokens (Variables CSS)

La librairie utilise des variables CSS personnalisables pour s'adapter à la charte graphique de votre projet :

```css
:root {
  --primary: #4f46e5;         /* Couleur primaire (ex: Indigo) */
  --primary-hover: #4338ca;   /* Survol */
  --ring: rgba(79, 70, 229, 0.25); /* Focus ring */
  --radius: 0.5rem;           /* Arrondi des bordures */
}
```

---

## Styles (Tailwind)

La librairie n'embarque **aucun CSS Tailwind compilé** — seules les classes utilitaires sont présentes dans les templates. C'est à l'application consommatrice de :
1. Avoir Tailwind installé et configuré
2. Scanner le dossier `node_modules/ngx-dynamic-form` (voir section [Installation](#installation))

Le SCSS propre à la librairie (`dynamic-form.component.scss`) ne contient que du style structurel non couvert par Tailwind (ex. l'état `.drag-over` du champ file).

---

## Tester la librairie en local avec yalc

```bash
npm install -g yalc
```

Depuis le workspace de la librairie :
```bash
ng build ngx-dynamic-form
cd dist/ngx-dynamic-form
yalc push
```

`yalc push` republie **et** met à jour automatiquement tous les projets ayant fait `yalc add` de ce package — c'est la commande à privilégier pendant le développement itératif (contrairement à `yalc publish`, qui republie sans propager la mise à jour).

Dans l'application de test :
```bash
yalc add ngx-dynamic-form
npm install
```

**Après chaque mise à jour du package**, pense à vider le cache Angular avant de relancer le serveur, sinon les changements peuvent ne pas apparaître :
```bash
rm -rf .angular
npm start
```

---

## Simuler une API pour les champs lazy

Un petit serveur mock Node (zéro dépendance) est disponible pour tester le mode `lazy` des champs `select` en local, reproduisant le format `{ items, total }` attendu :

```bash
node mock-server.js
# → écoute sur http://localhost:3001/villes?q=...&page=...&pageSize=...
```

---

## Limitations connues

- Pas de champ `array` imbriqué dans un autre `array`.
- Le mode `select` en `lazy` partage son état de recherche entre toutes les instances utilisant la même clé `name` (pertinent si le même champ apparaît plusieurs fois, ex. dans un `array` : la liste d'options est partagée, ce qui est généralement le comportement souhaité).
- La validation de fichiers (`maxSizeMb`, `maxFiles`) s'applique après sélection ; aucune limite de débit d'upload n'est gérée par la librairie (à traiter côté backend/API d'envoi).