---

title: Heimdall: Attentive’s Event Tracing Platform
date: 2024-08-28T16:00:00

---

[Attentive](https://www.attentive.com/careers?utm_source=website&utm_medium=tech-blog) loves event streaming. We have more than 100 services collectively processing more than 100 billion events every day. Adopting event streaming so widely allows us to keep our architecture loosely coupled and independently scaled. Streaming allows our teams to receive the data they need in real time with minimal effort or impact on the rest of our system.

However, streaming architectures are more difficult to reason about than a single service doing synchronous processing. When an expected outcome of a process doesn’t happen it can be difficult to pinpoint exactly where in the pipeline an error occurred and why. Much like other microservice architectures, it is imperative to instrument these services with observability tools. In this article, we'll discuss our work to implement a sophisticated observability platform called Heimdall.

## Observability of streams

The definition of observability is how well one can understand the internal state of their system using the tracing, metrics, logs, and other outputs that the system emits. Applying that definition of observability to streams means the ability to understand what _types_ of data are flowing _where_ and at what _rate_.

Aside from metrics emitted from a streaming broker itself such as the incoming rate of messages and message queue depth, observability of streams is typically achieved with distributed tracing that has been instrumented in services. These "traces" are pieces of structured information that include an ID, timestamp, service name, action (i.e. event produced or consumed), and any other metadata you add. Web APIs typically emit traces for each incoming RPC call they handle, while event streaming services typically emit traces for each event they consume and produce. Traces are emitted by services, ingested by typically a separate local process (an "agent"), and then aggregated and stored by a remote service (a "collector").

For event streaming services, information about what streams they’re consuming from or producing to is particularly important, as it helps establish the _lineage_ of events in your system.

Lineage of events is useful for a few reasons:

-   It helps you determine the downstream impact a change may have
-   It can help you identify the source of issues during an incident
-   Visualization of lineage helps you spot redundancies or inefficiencies in your system

## Attentive’s event architecture

Attentive uses a set of shared Protocol Buffer contracts to enforce schemas in our event payloads. This is helpful for a few reasons:

-   Many tools can generate code from Protocol Buffer contracts, which helps reduce engineer toil.
-   Our events all carry a standardized set of metadata such as event type, ID, event timestamp, publish timestamp, and origin information.
-   Automated tooling can catch common problems such as backward incompatibility during CI.

We then centralize these contracts so that all services can reference them. This allows us to reuse common message types across different event types.

We intentionally made it easy for teams to use streams at Attentive, even having multiple platform teams fully dedicated to its infrastructure and tooling. But all of this adoption led to the common observability needs mentioned above.  

## Attentive’s observability problem statement

There were a few streaming observability problems that we wanted to solve:

1.  Understanding what services originate an event type.
2.  Understanding what services consume an event type, to help understand the impact of changes to event schemas.
3.  Understanding the throughput of different event types, to aid in capacity planning and incident investigation.
4.  Understanding what streams contain what event types, to help establish a data catalog.

Exposing this information for programmatic access would also allow us to build additional tools on top of it.

We gave ourselves some additional requirements related to our unique architecture:

-   Event tracing should be integrated into our existing streaming libraries, such that teams do not need to spend any time adopting it.
-   Event tracing failures should not negatively impact event processing.
-   Implementation should not require any changes to our event schemas.

This combination of needs led us to implement our own tracing emission, ingestion, and analysis platform–which we call Heimdall.

#### Who is Heimdall?

Heimdall is a Marvel character based on Norse mythology from Asgard who has extrasensory sight and hearing that even transcends time. Much of Attentive’s event platform is named after Marvel characters, which helps give the organization a unique identity.

## Attentive’s implementation

![](https://cdn.prod.website-files.com/662ae63d0306bdfd5a66b3af/66d765834894a379bc2291c0_66d76516ebdfb594c3a22670_Graphic1.jpeg)

Attentive uses an in-house, shared streaming library for the majority of our services. This library and its abstractions have helped us with migrations between different streaming technologies, and it has features such as automatic serialization and deserialization of our shared event schemas. You can read more about our learned pain points working with Amazon Kinesis at [Maestro: Attentive's Event Platform](https://tech.attentive.com/articles/maestro-attentives-event-platform). This library made a natural place to add hooks for emitting event traces, and this architecture met our goal of making adoption a low effort for teams.

The tracing library emits structured logs at a sampled rate, which our existing log aggregator then ingests. The trace logs are indexed separately so that they don’t intermix with normal service logs and cause service owners confusion. These logs are then archived to Amazon S3, where we then ingest the files into Apache Druid hourly using Apache Airflow as the orchestrator. We expose common queries of the trace data via RPC endpoints in a dedicated service which can be called programmatically. We also allow humans to query this data manually via the Druid web UI to aid in support requests and incident triage.

#### A tale of two libraries

While the majority of Attentive’s services use the same in-house library for stream interaction, there are other technologies we use that come with their own stream connectors, such as Apache Flink. Unfortunately, the actively maintained Pulsar connector for Flink doesn’t offer easy ways to get detailed information about events being consumed and produced. We had to fork the Pulsar connector and add the functionality we needed to get access to information such as message IDs and offsets. This decision wasn’t taken lightly; it added a non-trivial maintenance burden for our teams. But Flink is so central to our streaming architecture that if it didn’t emit traces we would have an extremely difficult time establishing event lineage.

#### Cost tradeoffs

Because we have more than 100 services processing more than 100 billion events every day, we had to make some tradeoff decisions to keep the cost of event tracing low.

First, our rate of more than 1 million traces/sec for every produced and consumed event would be extremely expensive to ingest, store, and query. So we chose to heavily sample trace emission to roughly 2% of all events. We use a consistent sampling conditional of `hash(event_id) % 100 < sampling_rate` to ensure that the same event IDs get traced across every service. We can control the sampling rate per event type per service so that high-priority events remain at a 100% sampling rate while lower-priority events can have tracing turned off entirely.

Second, more than 100 services emitting more than 20k sampled traces/sec is still a lot of data to ingest and store in real time. As described above, we use Apache Airflow to periodically ingest data into Apache Druid in batches. To aid with live debugging, we also can switch traces to produce to a Pulsar topic in real time for a single service at a time, which then gets read and written to the same datastore.

One of our initial goals was to understand event throughput, but sampling event types at different rates in different services means we can’t simply count traces ingested. So we also added a metric called "event seen" that is incremented any time an event is consumed or produced. The metric is tagged by service name, event type, action (consumed vs. produced), type (Kinesis, Pulsar, SQS, etc.), and stream name, and we actively encourage teams to use it in their observability dashboards. We use this metric more than any other trace information during incident triage.

#### Centralized configuration

We created a new service to both centrally manage tracing configuration (such as the sampling rates mentioned above), as well as provide programmatic access to ingested traces. This service has several CRUD endpoints that engineers in our Event Platform organization use to manage configurations and a single endpoint that services use to retrieve their specific configuration values. The tracing library fetches this config at startup, and then non-Flink services refresh it every minute so that config changes don’t require service restarts or redeployments.

#### Datastore choice

We chose to use Apache Druid for our trace datastore because of the time series nature of the trace data, but also because we wanted to trial the technology for other future use cases. After the initial implementation, we also made use of Druid’s retention policies to keep storage size constrained. Druid supports direct ingestion from Apache Kafka and Amazon Kinesis, but unfortunately not Apache Pulsar, so we used a Flink application to copy the trace events from Pulsar to Kinesis for real-time ingestion.

#### Why not use OpenTelemetry?

We already use an observability and monitoring vendor for application performance monitoring, custom metrics, and log aggregation. This vendor’s ingestion agent also supports OpenTelemetry trace ingestion, so we could have used it for ingestion and storage, but decided against it for a couple of reasons:

-   The vendor’s web UI didn’t allow for the query patterns laid out our the requirements above
-   It didn’t solve tracing serverless event producers because the serverless functions wouldn’t have an agent running

We also considered using an OpenTelemetry SDK so we wouldn’t have to write our own trace emitter library. This would have needed a new agent installed on every machine to send traces to a collector we would have needed to create and operate. This design was primarily ruled out due to the deployment complexity of the agent.  
‍

## Use cases for traces

Our most common use case for trace data is to understand the downstream impact of making an event schema change. Forward-compatible schema changes help keep services loosely coupled–but if a service needs to deserialize, modify, and reserialize an event then it needs to always be using the newest event schema.

Our second most common use case for trace data is to aid in incident triage. Some common investigation questions in our streaming incident runbooks are:

-   Was there a significant change in the throughput of events?
    -   If the throughput significantly increased, what service originated the traffic?
    -   If the throughput significantly decreased, is that true for all event types?
-   Was there a significant change in the mixture of event types?
-   Was an incompatible event schema change made?
    -   Is it a new event type?
    -   If it is an existing event type, what service produced the incompatible change?

Most of these questions can be answered with the "event seen" metric mentioned above, but it has been helpful to also have the next use case.

Our third most common use case for the trace data is to create event lineage diagrams. It can be much easier to reason about data visualizations, and architecture diagrams with streams visualize well. We created an endpoint to query all of the unique service, stream, and action (consumed vs. produced) tuples, and then use that data to construct a [Mermaid](https://mermaid.js.org/) flowchart diagram. We store the generated diagrams in our version control system, and their plaintext nature makes it easy to spot-check diffs in pull requests.

![](https://cdn.prod.website-files.com/662ae63d0306bdfd5a66b3af/66d765834894a379bc2291ba_66d76532f18deae243db31b0_Graphic2.jpeg)
#### Cataloging streams for migration

As mentioned at the end of [Maestro: Attentive's Event Platform](https://tech.attentive.com/articles/maestro-attentives-event-platform), Attentive has moved away from Amazon Kinesis for our event streaming needs. We used trace data and metrics to help identify Kinesis streams that needed to be migrated, and then we used the trace data and metrics to track our progress of the migration.  

## Future considerations

While our custom trace ingestion and storage system met our goals stated above, it doesn’t solve distributed tracing within our application performance monitoring tool. We’re actively working on maintaining APM trace IDs across services processing the same event so that developers can better understand the downstream effects of their services. Streaming technologies such as Pulsar can carry metadata information separate from its message payload, which is perfect for use cases like this.

Other pieces of information we want to add to each message’s metadata are event ID, event type, and timestamp. Right now, all of our event consumers have to deserialize message payloads to get the information needed to construct a trace. The compute time of this is negligible, but we have some Flink processors that wouldn’t otherwise need to deserialize the data–they only ferry the raw bytes between data stores. As mentioned above, event serializers need to always be using the most up-to-date version of the event schema, but copying some fields in the event metadata could prevent needless deserialization and re-serialization.

And to that point about differentiating services that only read an event vs. actually modifying it, we want traces to include that information. Only services that modify event bodies need to be redeployed when an event schema updates, so understanding this difference could save a lot of cross-team coordination effort.

One last piece that has been on our wishlist for a while is automating the generation of the Mermaid visualizations. Right now a human runs the script that generates the files, manually creates the pull request, and needs another human’s approval. We’d like to automate this process and run it on a regular cadence using our continuous integration tooling.

Ready to hit the ground running and make a big impact? Attentive’s hiring! [Explore our open roles](https://www.attentive.com/careers?utm_source=website&utm_medium=tech-blog).
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTg2NTk5OTM2NV19
-->