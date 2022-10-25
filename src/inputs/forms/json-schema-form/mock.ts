import { faker } from '@faker-js/faker';

export const getDefaultSchema = () => ({
    type: 'object',
    properties: {
        user_name: {
            minLength: 4,
            title: 'Name',
            description: 'Your name',
            type: 'string',
            examples: [
                faker.name.firstName(),
            ],
            default: faker.name.firstName(),
            disabled: true,
        },
        user_nickname: {
            title: 'Nickname',
            description: 'Nick name',
            minLength: 1,
            type: 'string',
            examples: [
                'Genie',
            ],
        },
        user_id: {
            title: 'ID',
            format: 'generate_id',
            markdown: '[How to generate ID?](https://www.google.com)',
        },
        password: {
            title: 'Password',
            minLength: 8,
            format: 'password',
            default: '12345678',
        },
        country_code: {
            examples: ['82'],
            description: 'Country code to call. Only numbers without special characters. Not mandatory, 82(Korea country code) is default.',
            title: 'Country Code',
            pattern: '^[0-9\\-]{1,5}$',
            minLength: 1,
            type: 'string',
            default: '82',
            enum: ['82', '333', '232'],
        },
        age: {
            title: 'Age',
            type: 'number',
            examples: ['27'],
        },
        emails: {
            description: 'Email addresses',
            title: 'Email Addresses',
            type: 'array',
            items: {
                type: 'string',
                minLength: 10,
                pattern: '^[\\W]*([\\w+\\-.%]+@[\\w\\-.]+\\.[A-Za-z]{2,4}[\\W]*,{1}[\\W]*)*([\\w+\\-.%]+@[\\w\\-.]+\\.[A-Za-z]{2,4})[\\W]*$',
            },
            examples: [
                'user1@test.com, user2@test.com',
            ],
            uniqueItems: true,
        },
        homepage: {
            type: 'string',
            minLength: 4,
            examples: [
                'https://myjira.atlassian.net',
            ],
            title: 'Homepage',
            description: 'Homepage URL',
        },
        phone: {
            pattern: '^(01([0|1|6|7|8|9]?)\\d{7,8}(, |,|$))*',
            description: 'The phone number to receive alerts. Must insert the cell phone numbers format without special characters.',
            title: 'Phone',
            examples: [
                '0104445566, 01077778888',
            ],
            type: 'string',
            minLength: 10,
        },
        additional: {
            title: 'Additional Information',
            type: 'object',
            json: true,
            properties: {
                gender: {
                    type: 'string',
                },
            },
            required: ['gender'],
        },

    },
    required: ['user_id', 'password', 'user_name', 'age', 'homepage', 'phone', 'additional', 'emails'],
    order: ['user_id', 'password', 'user_name', 'user_nickname', 'country_code', 'age', 'phone', 'homepage', 'additional'],
});

export const getDefaultFormData = () => ({
    user_name: faker.name.firstName(),
    user_nickname: faker.random.word(),
    age: faker.datatype.number(),
    phone: faker.phone.number(),
});


export const getJsonInputSchema = () => {
    const schema: any = getDefaultSchema();
    schema.json = true;
    return schema;
};
