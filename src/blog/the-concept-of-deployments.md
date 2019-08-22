---

title: The Concept of Deployments
date: 2019-08-21

---

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Pupils dilated. Sweaty palms. Tingly legs. You lean in. A world of opportunity lays before you. You close your eyes…and wait.<br><br>Deployments.</p>&mdash; I Am Devloper (@iamdevloper) <a href="https://twitter.com/iamdevloper/status/468132413433200640?ref_src=twsrc%5Etfw">May 18, 2014</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js"></script>

A number of months ago I found myself teaching the same concept over and over to others at work -- deployments. Not what to deploy, that's usually pretty obvious. Not when to deploy, I'm a big believer of deploying early and often. And not even how to deploy, that's usually covered by repository READMEs or handled by CI/CD. But everything else involved that isn't obvious.

And this makes a lot of sense, I've never seen a computer science or bootcamp curriculum that covers this topic. It's the kind of thing you tend to learn from those around you at your first job. Do you know how to check the code is working? Do you know what could go wrong? Do you know how to fix things if they go wrong? Mindfulness plays a larger role than developers might think.

So I did my civic duty and wrote a Confluence article on the subject that I'm now rewriting here.

## When should you deploy?

A lot of this is up to your organization. Some release many times a day, once a day, once a week, once a sprint, or even once a quarter. It really depends on your type of software, the clients' needs, and your business model.

But I'm a big fan of deploy early, deploy often. The [GitHub Flow](http://scottchacon.com/2011/08/31/github-flow.html) was designed around making deployments easy and reliable enough that any developer could deploy with confidence. It defines "when" as immediately after merging code into a deployable branch (`master`, `staging`, etc.).

This does three things:

- It lets you catch smaller bugs earlier rather than larger bugs later. If you keep the amount of code you're merging smaller you reduce your risks.
- It enforces individual responsibility. If the merged code isn't deployed immediately it is left as a possible time bomb for the next person. There may be known risks with the code that only the authors know about and can monitor for.
- It keeps `master` clean. Only production-ready code is merged to `master`, and if the code isn't deployed in a short amount of time after merge it should be reverted out.

## Are you triple sure you're ready to deploy?

It might seem obvious, but you probably want a second and third pair of eyes on the code you're about to deploy. In the [GitHub Flow](http://scottchacon.com/2011/08/31/github-flow.html) this is done through pull requests.

Depending on your development environments it's a good idea to test your code in a prod-like staging environment. This will help highlight any errors in the code or deployment itself. This also allows stakeholders to test the acceptance criteria.

Depending on your organization's structure you may want a QA engineer to test your changes as well. They have the skills and training to look for issues such as validation errors and edge cases.

It's also a good idea to give your code diff one more review before merging, there may have been a gap of time between writing the code and merging it and reviewing it again with a fresh pair of eyes can be helpful.

## Is there an "image" that needs to be built?

It's popular for web services to be built into a Docker image that packages all code and code dependencies together. One of the main goals of containers is to provide consistency between environments.

The code you want to deploy may require a Docker image to be built, and those build instructions are going to vary slightly between codebases. If it does require a Docker image to be built it probably also requires pushing that image to a container registry such as Docker Hub or Quay.io. Consult your organization's instructions for containers.

## Do you know what needs to happen before deploying?

The code being deployed may depend on some new infrastructure or external services, it would be a good idea to make sure those are still working.

There may also be some additional steps that need to be taken such as manual database migrations without a tool.

## Do you know how to deploy this codebase?

I personally believe the deployment instructions for a codebase should live in its README. Your code may require updating a Kubernetes deployment or uploading files to an SFTP server, it really depends on your organization and its needs.

## Have you deployed this codebase before?

If you haven't, it's a good idea to sit with an existing code owner and have them walk you through the process. There could be some tribal knowledge of landmines you should be aware of.

Again, I personally believe the deployment instructions for a codebase should live in its README, but documentation is a continuous process that will never be perfect so there may be missing or inaccurate steps.


## Do you know what needs to happen immediately after the deploy?

A lot of repositories have steps that need to happen after deploy such as running a database migration tool manually.

Refer to the repository's readme for instructions.

## Do you know how to verify the deployed code is working?

Something that's easy to forget is verifying the new code is working as expected. Things like: runtime/memory cache, non-fatal build errors, edge cases found at scale, or deploying the wrong version are reasons to check this.

Do yourself a favor and check this before communicating it's live to others, it's embarrassing when someone else is the one to discover your deploy was wrong.

## Who should you notify after a successful deployment?

Are there any Scrum Masters or project managers you need to notify the change is live? Do you need to notify the stakeholders directly? Someone probably wants to know about the changes!

## Do you know how to determine if the deployed code is producing _new_ errors?

This is a frequently missed step. As the deployer it is your responsibility to ensure the code being deployed does not introduce any new errors.

Where does your application log, does it get aggregated by a SaaS? Do you have performance or error monitors, and do they send Slack or email notifications? Those are the kinds of things to think of.

## Do you know how to determine if the deployed code caused any of its _dependents_ to produce new errors?

It can be difficult to determine what depends on the repository being deployed, especially in a world of more and more new microservices being written.

See the section above about monitoring for new errors, and apply it to known dependent services.

## Do you know how to _recover_ from a bad deploy?

This is the one of the most important things to know. Bad deploys happen, there's no faster way to find edge cases than release new code into the wild, and it happens to every developer regardless of attention to detail or skill level.

### Immediately deploy the last known "good" version:

Without hesitation, at the first sign of errors you can positively attribute to the new deploy you need to deploy the last known "good" version. Fixing errors in production is not acceptable to most businesses.

Many times the instructions for this are the same as a normal deploy but with an old version number, but the repository's readme should have instructions or should link to documentation that has the instructions.

Be mindful of any extra steps such as reversing database migrations if required.

### Then reverting out the "bad" code:

Immediately after the deploy you need to revert the "bad" code out of what you just deployed. This is not optional. This is to protect the next person who deploys the same code from including these errors again in their deploy, and this can be especially dangerous with the master or default branch.

In GitHub, at the bottom of the pull request page there exists a "revert" button on the same line as the merge status, this will create a new revert pull request for you. You need to immediately communicate with the repository code owners to get it approved and merged before anyone has a change to deploy that branch again.

After the "bad" code has been reverted out of the branch only then is it safe to start development to fix any errors seen during or after deployment.
