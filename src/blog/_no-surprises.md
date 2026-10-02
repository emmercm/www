---

title: No Surprises

---

Examples:

- DynamoDB partial failures return an HTTP 200
- User properties V2 can fail processing and not return anything indicating that
- Uncommunicated setting defaults (especially when not configurable)
	- kinesis2 had a hard-coded shutdown timeout
	- kinesis2 puts event production on an async thread with no guarantees of delivery or retries

Ask yourself the question:

> Would this behavior surprise my client?
<!--stackedit_data:
eyJoaXN0b3J5IjpbNzMxNzQ2MDU4XX0=
-->