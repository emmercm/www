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

I'm reviving an API migration project that stalled out a year and a half ago. A new version of all endpoints were added for to leak less internal information to callers, and to reduce the number of calls they need to coordinate. More than half the callers had code written to start calling the new endpoints, but it was left behind feature flags that were never fully enabled. Some of the feature flags had been enabled at some point, but caused a regression, so they were rolled back. Even after fixing the regressions individually, the feature flags were not enabled again, for fear of what else might regress. We lacked confidence in the caller migration.

So we ended up with Schrödinger's migration: we didn't know if the migration was safe or not until we tried it in production. The classic push-and-pray method, a surefire way to erode customer trust. So the code languished for a year and a half without being exercised.

The path forward was clear: we needed as much confidence in the change as we could get (keeping in mind it would never be 100%). We needed to know that endpoints that should be functionally equivalent actually were. The approach that I took was evaluating all side-effects between the two endpoints were identical:

- The endpoints should perform the same create, update, and delete operations on the underlying data store
- The endpoints should call the same write endpoints of other services with the same request bodies

I ended up writing more than 40 integration tests for 7 pairs of endpoints that had spies for 11 DBs, message brokers, and other services. The tests exercised both versions of the same endpoint and then compared theI found that one of the pairs of endpoints had multiple behavior differences that would have been client-visible.

The rest of the endpoints? Entirely fine, no changes were necessary, the new endpoint behaved like the old. We _hoped_ that was the case, but we didn't _know_ that. We needed _confidence_.

## Future
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTE4Mjc4MDI1ODIsNzU5NTI2MTMzLDIxMD
k2NTcxMzAsMTg1NDU2Nzc3MCwxNzA3NDMwNzkwLC00OTYyOTY1
MSwtMzM5Nzk4MjY3LC0yMzEzNDAyODIsLTE2NDEyNTY3OTEsLT
EwMDYxNDA0NjRdfQ==
-->