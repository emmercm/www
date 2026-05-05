---

title: Confidence is a Requirement
date: 2026-03-23T17:10:00
tags:
- career
- opinion
- testing

---

You should not ship changes that you aren't confident in. Full stop.

## Past

Years ago, I was leading a time-sensitive cross-team project and got into an argument with a senior leader. A mobile app team was code complete on a change, but had low confidence in it, and wanted more time to test it. I said yes, we obviously should not ship changes that have a realistic chance of causing regressions. The argument I was making was that confidence in a change has inherent value, that it is tangible. My senior leader overruled me and had them ship the build, as the project was time-sensitive. That app version had a more than 10% crash rate on customer devices.

You can't tell me the _lack_ of confidence wasn't _also_ tangible in that situation.

## Present

I'm reviving an API migration project that stalled out a year and a half ago. Most of the code was completed previously, left behind feature flags that were never fully enabled. Some of them were enabled at some point, but caused a regression, and were rolled back. Even after fixing the regressions individually, the feature flags were not enabled again, for fear of what else might regress. We lacked confidence in the changes.

We ended up with Schrödinger's migration: we didn't know if the migration was safe or not until we tried it in production. The deeply flawed push-and-pray method. So the code languished for a year and a half without being exercised.
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTcwNzQzMDc5MCwtNDk2Mjk2NTEsLTMzOT
c5ODI2NywtMjMxMzQwMjgyLC0xNjQxMjU2NzkxLC0xMDA2MTQw
NDY0XX0=
-->