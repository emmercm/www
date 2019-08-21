---

title: The Concept of Deployments
date:

---

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Pupils dilated. Sweaty palms. Tingly legs. You lean in. A world of opportunity lays before you. You close your eyes…and wait.<br><br>Deployments.</p>&mdash; I Am Devloper (@iamdevloper) <a href="https://twitter.com/iamdevloper/status/468132413433200640?ref_src=twsrc%5Etfw">May 18, 2014</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

A number of months ago I found myself teaching the same concept over and over to others at work -- deployments. Not what to deploy, that's usually pretty obvious. Not when to deploy, I'm a big believer of deploying early and often. And not even how to deploy, that's usually covered by repository READMEs or handled by CI/CD. But everything else involved that isn't obvious.

And this makes a lot of sense, I've never seen a computer science or bootcamp curriculum that covers this topic. It's the kind of thing you tend to learn from those around you at your first job. Do you know how to check the code is working? Do you know what could go wrong? Do you know how to fix things if they go wrong? Mindfulness plays a larger role than developers might think.

So I did my civic duty and wrote a Confluence article on the subject that I'm now posting here.


## When should you deploy?

A lot of this is up to your organization. Some release many times a day, once a day, once a week, once a sprint, or even once a quarter. It really depends on your type of software, the clients' needs, and your business model.

But I'm a big fan of deploy early, deploy often. The [GitHub Flow](http://scottchacon.com/2011/08/31/github-flow.html) was designed around making deployments easy and reliable enough that any developer could deploy with confidence. It defines "when" as immediately after merging code into a deployable branch (`master`, `staging`, etc.).

This does three things:

- It lets you catch smaller bugs earlier rather than larger bugs later. If you keep the amount of code you're merging smaller you reduce your risks.
- It enforces individual responsibility. If the merged code isn't deployed immediately it is left as a possible time bomb for the next person. There may be known risks with the code that only the authors know about and can monitor for.
- It keeps `master` clean. Only production-ready code is merged to `master`, and if the code isn't deployed in a short amount of time after merge it should be reverted out.


## Are you triple sure it's ready to deploy?

Get your code reviewed, get someone else to look over it, because it's easy to lose the forest for the trees in your own code.

Get your feature tested by QA, they're trained to find edge cases that your users will definitely find, and they help verify against acceptance criteria.

Give your final code diff a review before merging it in, there may be a gap of time between writing and merging so looking again with a fresh pair of eyes can be very helpful.

## Have you deployed code for this repository before?

If you haven't, it's a good idea to sit with an owner of the repository and have them walk you through the process.

Documentation is an ongoing process and will never be perfect, there may be steps missing or explained poorly in the readme.

## Do you know what needs to happen before the deploy?

There may be additional steps that need to be taken such as manual database migrations without a tool.

Most of the time there is nothing you need to do here but it is worth asking the question.

## Is there an "image" that needs to be built?

Any repository that uses Docker uses built images that include all code and code dependencies in a container.

Each repository should have their own build instructions. Many repositories have similar build instructions due to Docker but there may be small important differences such as the location of the Dockerfile.

Mobile apps also use images but this article won't cover them.

## Do you know how to deploy?

The deployment instructions should be in the repository's readme.

Some repositories may have multiple manual steps for deployment such as updating different deployments of the same codebase for things like cron jobs.

Many repositories have similar deploy instructions due to Kubernetes but there may be small important differences.

## Do you know what needs to happen immediately after the deploy?

A lot of repositories have steps that need to happen after deploy such as running a database migration tool manually.

Refer to the repository's readme for instructions.

## Do you know how to verify the deployed code is working?

Something that's easy to forget is verifying the new code is working as expected. Things like: runtime/memory cache, non-fatal build errors, edge cases found at scale, or deploying the wrong version are reasons to check this.

Do yourself a favor and check this before communicating it's live to others, it's embarrassing when someone else is the one to discover your deploy was wrong.

## Who should you notify after a successful deployment?

Are there any Scrum Masters or project managers you need to notify the change is live? Do you need to notify the stakeholders directly? Someone probably wants to know about the changes!

## Do you know how to determine if the deployed code is producing new errors?

This is a frequently missed step. As the deployer it is your responsibility to ensure the code being deployed does not introduce any new errors.

Where does your application log, does it get aggregated by a SaaS? Do you have performance or error monitors, and do they send Slack or email notifications? Those are the kinds of things to think of.

## Do you know how to determine if the deployed code caused any of its dependents to produce new errors?

It can be difficult to determine what depends on the repository being deployed, especially in a world of more and more new microservices being written.

See the section above about monitoring for new errors, and apply it to known dependent services.

## Do you know how to recover from a bad deploy?

This is the one of the most important things to know. Bad deploys happen, there's no faster way to find edge cases than release new code into the wild, and it happens to every developer regardless of attention to detail or skill level.

## Immediately deploy the last known "good" version:

Without hesitation, at the first sign of errors you can positively attribute to the new deploy you need to deploy the last known "good" version. Fixing errors in production is not acceptable to most businesses.

Many times the instructions for this are the same as a normal deploy but with an old version number, but the repository's readme should have instructions or should link to documentation that has the instructions.

Be mindful of any extra steps such as reversing database migrations if required.

## Then reverting out the "bad" code:

Immediately after the deploy you need to revert the "bad" code out of what you just deployed. This is not optional. This is to protect the next person who deploys the same code from including these errors again in their deploy, and this can be especially dangerous with the master or default branch.

In GitHub, at the bottom of the pull request page there exists a "revert" button on the same line as the merge status, this will create a new revert pull request for you. You need to immediately communicate with the repository code owners to get it approved and merged before anyone has a change to deploy that branch again.

After the "bad" code has been reverted out of the branch only then is it safe to start development to fix any errors seen during or after deployment.
