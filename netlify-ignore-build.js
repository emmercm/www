// https://docs.netlify.com/configure-builds/common-configurations/ignore-builds/
console.log('checking build ignore rules ...');

if (process.env.BRANCH.includes('renovate')) {
    console.log('don\'t build for Renovate dependency updates');
    process.exit(0);
}

if (process.env.BRANCH === 'emmercm/blog-drafts') {
    console.log('don\'t build for blog drafts');
    process.exit(0);
}

console.log('not ignoring this build, proceeding')
process.exit(1);
