---

title: 'SLIs, SLOs, and SLAs: What Are They?'
imageCredit: 'Photo by <a href="https://unsplash.com/@condorito1953">Arie Wubben</a> on <a href="https://unsplash.com/photos/MHIw0nSxCR4">Unsplash</a>'
date: 2020-05-11T18:03:00
tags:
- career

---

You might have heard these terms in reference to commitments with vendors or customers, but what are they, and why should you care?

First, I find it easier to understand if we talk about SLIs, SLOs, and SLAs in that order, as I'm coming from a developer's perspective. The reverse order might make more sense when coming from a leadership/manager perspective when talking about setting external commitments to clients or customers.

The tl;dr is:

- Service-Level Indicators (SLIs) - a set of metrics to measure service behavior/performance
- Service-Level Objectives (SLOs) - a set of targets for SLIs to meet some percent of the time over some time period
- Service-Level Agreements (SLAs) - a contractual obligation that some set of SLOs will be met, or a penalty will be faced

## Service-Level Indicators (SLIs)

**SLIs are _indicators_ of how a service is doing right now.** They don't specify any time period or goal, they just describe what is being measured.

The big three SLIs are:

- Uptime (availability) - what percent of requests are returned without error
- Latency (response time) - what is the median/p50/p90/p99 latency
- Throughput - what is the requests per second/minute being handled

Let's dive into each of those individually in more depth.

### 1. Uptime

Uptime is the big indicator that most people want to talk or hear about. It's usually what is advertised both internally and externally, more so than the other big SLIs. It's also not the easiest thing to measure.

You can define uptime as: **out of all requests sent/attempted, what percentage received a response without service error (HTTP 5xx)**. Note that HTTP 4xx errors are included in "success" as they indicate a failure of the requester, not the service.

This should be fairly easy to measure in your service's HTTP router or middleware, but what if requests (or some percentage of them) never make it to your service? What if there is a misconfigured ingress or general network congestion? A service may think it is "up," but it's not actually serving responses without error. That's why ideally you'd measure uptime externally, maybe at an edge layer or with a service mesh. Frequently that isn't possible though, so you may need to set up simulated tests in a third party service/vendor.

### 2. Latency

Latency can be defined as: **while a service is up, how fast is it responding to requests.** High latency can have a real impact on customers, and it's not always distributed evenly, so measuring percentile latencies (p50, p90, p99, etc.) is probably more meaningful than measuring the median.

### 3. Throughput

Throughput isn't as valuable of a metric externally, but it can really help internally with things like measuring capacity or seasonality of load. It can be defined as: **how many requests are being handled over some period (seconds, minutes, etc.).**

Current throughput can let you know how much capacity is left (based on load testing results), or if there is a significant change in service or customer behavior.

## Service-Level Objectives (SLOs)

**SLOs are _objectives_ (targets/goals) that an SLI will meet, some percent of the time, over some time period.** This sets the numbers that will be used when talking about service reliability and error budgeting.

Here are some examples:

- The uptime of a service (SLI) will be greater than 99.9% (objective), 100% of the time (percent), measured over the trailing 30 days (time period).
- The p95 latency of a service (SLI) will be less than 250ms (objective), 99% of the time (percent), measured over the trailing 7 days (time period).

SLOs are important for all services, not just ones that directly impact customers, as they give an indication of service health and highlight any problem areas. When discussing architectural changes to a service, the changes need to be talked about in terms of continuing to meet SLOs.

It's worth noting that the stronger the guarantee in an SLO the more expensive it will be to maintain, so it's worth going through an exercise of error budgeting to understand what is an acceptable amount of failure.

## Service-Level Agreements (SLAs)

**SLAs are _agreements_ that some set of SLOs will be met**, and breaking them usually comes with a financial consequence. These are the agreements that make SLOs actually mean something to a service team. If we're talking about a SaaS vendor, a high uptime is extremely important to clients, so the client/vendor contract may have it written that uptime will be above 99.9% or a discount will be given on the next bill.

Because breaking an SLA usually comes with a financial consequence, the "external" SLOs in it should have a weaker guarantee than other "internal" SLOs of the same SLI. In other words, if you have an external agreement of 99.9% uptime, you may want to increase that to 99.95% or higher for an internal goal, otherwise you'll be at a higher risk of losing money.

SLAs don't make sense for all companies or services, sometimes the consequence of a service being "down" or "slow" is that a company may not be able to process new orders, such as with an e-commerce company. In that case there isn't a contract to customers that a service is "up" necessarily, but the company is losing out on potential money every minute it's "down."

## More reading

- Google: [SRE fundamentals: SLIs, SLAs and SLOs](https://cloud.google.com/blog/products/gcp/sre-fundamentals-slis-slas-and-slos)
- Atlassian: [SLA vs. SLO vs. SLI: What’s the difference?](https://www.atlassian.com/incident-management/kpis/sla-vs-slo-vs-sli)
- New Relic: [Best Practices for Setting SLOs and SLIs For Modern, Complex Systems](https://blog.newrelic.com/engineering/best-practices-for-setting-slos-and-slis-for-modern-complex-systems/)
