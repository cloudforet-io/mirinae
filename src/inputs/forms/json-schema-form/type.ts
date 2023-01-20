import type { JSONSchemaType } from 'ajv';

import type { AutocompleteHandler } from '@/inputs/dropdown/filterable-dropdown/type';
import type { SelectDropdownMenu } from '@/inputs/dropdown/select-dropdown/type';
import type { InputAppearanceType } from '@/inputs/input/text-input/type';
import type { SupportLanguage } from '@/translations';

const TEXT_INPUT_TYPES = ['password', 'text', 'number'] as const;
export type TextInputType = typeof TEXT_INPUT_TYPES[number];

const COMPONENTS = ['PTextInput', 'GenerateIdFormat', 'PJsonSchemaForm', 'PSelectDropdown', 'PFilterableDropdown'] as const;
export type ComponentName = typeof COMPONENTS[number];

export type JsonSchema<Properties = object> = JSONSchemaType<Properties> & {
    title?: string;
    order?: string[];
    disabled?: boolean;
    json?: boolean;
};

export const VALIDATION_MODES = ['input', 'all', 'none'] as const;
export type ValidationMode = typeof VALIDATION_MODES[number];

export type InnerJsonSchema = JsonSchema & {
    propertyName: string;
    componentName: ComponentName;
    inputType?: TextInputType;
    inputPlaceholder?: string;
    menuItems?: SelectDropdownMenu[];
    referenceMenuItems?: boolean;
    multiInputMode?: boolean;
    appearanceType?: InputAppearanceType;
};

export type CustomErrorMap = Record<string, string>;
export interface JsonSchemaFormProps {
    schema?: JsonSchema;
    formData?: object;
    language?: SupportLanguage;
    validationMode?: ValidationMode; // default: input
    isRoot?: boolean;
    resetOnSchemaChange?: boolean;
    customErrorMap?: CustomErrorMap;
    handler?: AutocompleteHandler;
}
