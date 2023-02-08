const config = {
    branches: [
        'master',
        { name: 'beta', prerelease: true, channel: 'beta' },
        { name: 'v([0-9]+)(.[0-9]+)(.[0-9]+)-beta(.[0-9]+)', prerelease: true },
    ],
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        '@semantic-release/npm',
        '@semantic-release/git',
        '@semantic-release/github',
    ],
};

module.exports = config;
