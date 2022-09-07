import type Ajv from 'ajv';


export const addCustomFormats = (ajv: Ajv): void => {
    ajv.addFormat('generate_id', true);
};


export const addCustomKeywords = (ajv: Ajv): void => {
    ajv.addKeyword({
        keyword: 'markdown',
        schemaType: 'string',
    });
};
