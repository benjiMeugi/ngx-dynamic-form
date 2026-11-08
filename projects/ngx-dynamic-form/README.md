# @benjimeugi/ngx-dynamic-form

[![npm version](https://img.shields.io/badge/npm-v1.0.0-blue.svg)](https://www.npmjs.com/package/@benjimeugi/ngx-dynamic-form)
[![Angular](https://img.shields.io/badge/Angular-19%2B-DD0031.svg)](https://angular.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4%20%7C%20v3-38B2AC.svg)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/tests-60%2F60%20passing-success.svg)](https://github.com/benjiMeugi/ngx-dynamic-form)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Moteur de formulaires dynamiques hautement performant pour **Angular 19+**, stylisé avec **Tailwind CSS**, piloté par schéma JSON et optimisé pour le **Dark Mode**.

Ce package permet de générer des formulaires riches, fluides et esthétiques en quelques lignes de configuration pour des applications métier exigeantes (ex: gestion d'employés, gestion de crèches, webmail, portails d'administration).

---

## 🚀 Fonctionnalités Clés

- **⚡ Standalone & Angular 19+** : Conçu avec le nouveau Control Flow (`@if`, `@for`, `@switch`) et `ChangeDetectionStrategy.OnPush` pour des performances optimales.
- **🎨 Design System Tailwind & Dark Mode** : Interface moderne "Style Doux / Friendly" avec hauteurs harmonisées (`h-10`), icônes SVG accessibles et support natif du mode sombre via classes ou variables CSS.
- **📦 Types de champs variés** :
  - **Classiques** : texte, email, mot de passe avec bascule de visibilité, zone de texte (`textarea`).
  - **Numériques** : entiers (`integer`), décimaux avec séparateur personnalisable (`decimal`), entrées avec préfixes/suffixes (`inputGroup`).
  - **Sélecteurs & Listes** : `select` statique ou asynchrone paginé (`lazy`), boutons radio, cases à cocher.
  - **Temps & Dates** : sélecteur de date (`date`), sélecteur d'heure (`time`) avec validation `minTime` / `maxTime`.
  - **Booléens modernes** : switch interactif (`toggle`).
  - **Tags / Destinataires** : saisie de chips (`chips`) avec validation par regex (emails), raccourcis clavier (`Entrée`, `,`, `Backspace`) et détection de doublons.
  - **Téléphone international** : sélecteur d'indicatif avec drapeaux et validation stricte (`libphonenumber-js`).
  - **Fichiers & Documents** : glisser-déposer (`drag & drop`), prévisualisation d'images, support de fichiers distants existants (mode édition) et téléchargement direct.
  - **FormArray dynamique** : répétition de sous-formulaires imbriqués avec ajout/suppression dynamique et contrôles de bornes (`minItems`, `maxItems`).
- **🧩 Extensibilité par Slots** : Directive `[dfCustomField]` pour brancher vos composants tiers (WYSIWYG, signature manuscrite, Google Maps) et template d'actions `[actionsTemplate]`.
- **🛡️ Validation robuste** : Validateurs unitaires déclaratifs (`required`, `min`, `max`, `minLength`, `pattern`, etc.) et validation croisée entre champs (`matchFields`, `dateRange`).

---

## 📥 Installation

```bash
npm install @benjimeugi/ngx-dynamic-form @angular/cdk libphonenumber-js
```

### 1. Configuration Tailwind CSS

Assurez-vous que Tailwind scanne les fichiers de la librairie pour inclure les classes utilitaires.

**Tailwind v4 (`styles.css`) :**
```css
@import "tailwindcss";

/* Active le Dark Mode basé sur la classe .dark */
@custom-variant dark (&:where(.dark, .dark *));

/* Scanne la librairie dans node_modules */
@source "../node_modules/@benjimeugi/ngx-dynamic-form";
```

**Tailwind v3 (`tailwind.config.js`) :**
```javascript
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/@benjimeugi/ngx-dynamic-form/**/*.{mjs,js,html,ts}"
  ],
  // ...
};
```

### 2. Configuration Angular (`app.config.ts`)

La librairie requiert `provideHttpClient()` pour le chargement des schémas JSON et des options distantes :

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
  ],
};
```

---

## 💡 Utilisation Rapide

### Dans votre composant standalone :

```typescript
import { Component } from '@angular/core';
import { DynamicFormComponent } from '@benjimeugi/ngx-dynamic-form';

@Component({
  selector: 'app-mon-formulaire',
  standalone: true,
  imports: [DynamicFormComponent],
  template: `
    <lib-dynamic-form
      jsonUrl="/assets/forms/contact-form.json"
      (formSubmit)="onSuccess($event)"
    />
  `
})
export class MonFormulaireComponent {
  onSuccess(data: any): void {
    console.log('Données soumises :', data);
  }
}
```

---

## 🛠️ Scripts du Workspace

- **Compiler la librairie** : `npm run build`
- **Lancer les 60 tests unitaires** : `npm run test`
- **Compiler et empaqueter** : `npm run pack:lib`
- **Publier sur npm** : `npm run publish:lib`

---

## 📄 Licence

Distribué sous la licence [MIT](LICENSE). Créé par **benjimeugi** (<benbosspayaro@gmail.com>).
