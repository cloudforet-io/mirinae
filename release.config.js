module.exports = {
    branches: ['master',
        { name: '1.1.x', range: '1.1.x', channel: '1.1.x' },
        { name: 'beta', prerelease: true, channel: 'beta' }],
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        '@semantic-release/npm',
        '@semantic-release/git',
        '@semantic-release/github',
    ],
};
