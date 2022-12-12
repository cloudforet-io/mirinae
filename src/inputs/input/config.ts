export const INPUT_SIZE = {
    sm: 'sm',
    md: 'md',
} as const;
export type INPUT_SIZE = typeof INPUT_SIZE[keyof typeof INPUT_SIZE];
