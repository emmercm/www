// https://docs.netlify.com/configure-builds/common-configurations/ignore-builds/

if (process.env.BRANCH.includes('renovate')) {
    console.log('don\'t build for Renovate dependency updates');
    process.exit(1);
}

if (process.env.BRANCH === 'emmercm/blog-drafts') {
    console.log('don\'t build for Renovate dependency updates');
    process.exit(1);
}

process.exit(0);
