// https://docs.netlify.com/configure-builds/common-configurations/ignore-builds/
process.exitCode = process.env.BRANCH.includes("renovate") ? 0 : 1
