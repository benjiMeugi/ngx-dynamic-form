import { CountryCode } from "libphonenumber-js";
import { CountryDialCode } from "./country-dial-code.model";
import { CrossValidationRule } from "./form-config.model";

export type StandardFieldType = 'text' | 'email' | 'password' | 'number' | 'integer' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'time' | 'file' | 'tel' | 'array' | 'decimal' | 'toggle' | 'chips';
export type FieldType = StandardFieldType | (string & {});

export interface KeyValue {
    key: string;
    value: string;
}

export interface ChipsConfig {
  placeholder?: string;
  maxChips?: number;
  separatorKeys?: string[];       // touches déclenchant l'ajout (défaut : ['Enter', ','])
  allowDuplicates?: boolean;     // défaut : false
  transform?: 'lowercase' | 'uppercase' | 'trim';
  pattern?: string;              // regex de validation unitaire de chaque tag
  patternMessage?: string;
  duplicateMessage?: string;
  maxChipsMessage?: string;
}

export interface DecimalConfig {
  decimals?: number;             // nombre de chiffres après la virgule (défaut : 2)
  decimalSeparator?: ',' | '.';  // séparateur affiché (défaut : '.')
}

export interface ExistingFileItem {
  id?: string | number;
  name: string;
  url?: string;
  size?: number;
  type?: string;
}

export type FormFileItem = File | ExistingFileItem;

export interface FileConfig {
    multiple?: boolean;
    accept?: string;        // ex: '.pdf,.jpg,.png'
    maxSizeMb?: number;
    maxFiles?: number;
}

export interface PhoneConfig {
    defaultCountry?: CountryCode;  // code ISO, ex: 'TG'
    countries?: CountryDialCode[]; // pour restreindre/personnaliser la liste
}

export interface FieldAddonConfig {
  prefix?: string;
  suffix?: string;
}

export interface OptionSource {
    url?: string;
    options?: KeyValue[];
    lazy?: boolean;          // active pagination + recherche serveur
    pageSize?: number;       // défaut: 20
    searchParamName?: string; // ex: 'q' -> l'API doit accepter ?q=terme&page=1&pageSize=20
}

export type ValidationErrorKey = 'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'email' | 'integer' | 'pattern' | 'phone' | 'minDate' | 'maxDate' | 'minTime' | 'maxTime';

export interface ValidationConfig {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    email?: boolean;
    integer?: boolean;
    phone?: boolean;
    minDate?: string;
    maxDate?: string;
    minTime?: string;
    maxTime?: string;
    messages?: Partial<Record<ValidationErrorKey, string>>;
}

export interface VisibleCondition {
  field: string;        // nom du champ dont dépend la condition (même groupe)
  equals?: any;
  notEquals?: any;
  in?: any[];
  notIn?: any[];
  truthy?: boolean;      // true => le champ référencé doit être "vrai" (non vide/non false)
}

export interface FieldConfig {
    name: string;
    type: FieldType;
    label?: string;
    placeholder?: string;
    defaultValue?: any;
    order?: number;        // sert au tri ET au tabindex
    colClass?: string;     // ex: 'col-span-1', 'col-span-2', 'col-span-3'
    validation?: ValidationConfig;
    optionSource?: OptionSource; // pour select / radio
    showPasswordToggle?: boolean; // pour password
    fileConfig?: FileConfig;
    phoneConfig?: PhoneConfig; // pour le champ de type 'tel'
    arrayConfig?: ArrayFieldConfig; // utilisé seulement si type === 'array'
    decimalConfig?: DecimalConfig; // pour le champ de type 'decimal'
    multiple?: boolean; // pour type === 'select' : autorise la sélection multiple
    visibleWhen?: VisibleCondition | VisibleCondition[];
    disabled?: boolean;
    helpText?: string;
    addon?: FieldAddonConfig;
    chipsConfig?: ChipsConfig;
}

export interface ArrayFieldConfig {
  /** Les champs qui composent UN élément du tableau (répétés à chaque ajout) */
  fields: FieldConfig[];
  minItems?: number;
  maxItems?: number;
  defaultItems?: number; // Nombre d'éléments affichés au chargement initial (défaut: minItems ?? 1)
  addLabel?: string;    // défaut: "Ajouter"
  removeLabel?: string; // défaut: "Supprimer"
  messages?: {
    minItems?: string;
    maxItems?: string;
  };
  crossValidation?: CrossValidationRule[];
}