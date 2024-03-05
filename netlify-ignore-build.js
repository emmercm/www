// https://docs.netlify.com/configure-builds/common-configurations/ignore-builds/

process.exitCode = 0;

if (process.env.BRANCH.includes('renovate')) {
    console.log('don\'t build for Renovate dependency updates');
    process.exitCode = 1;
}

if (process.env.BRANCH === 'emmercm/blog-drafts') {
    console.log('don\'t build for Renovate dependency updates');
    process.exitCode = 1;
}
