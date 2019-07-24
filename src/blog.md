---

title: Blog
no_padding: true
background: transparent

---

<div class="row d-flex justify-content-center align-items-stretch">
    {{#each collections.blog}}
        <div class="col-12 col-md-6 p-2 p-md-3">
            <div class="card h-100 bg-light">
                <div class="card-body">
                    <h1 class="card-title">{{ title }}</h1>
                    <h5 class="mt-0"><small class="text-muted">{{moment this.date "MMMM M, YYYY"}} by {{ ../sitename }}</small></h5>
                    <p class="card-text">{{sanitize excerpt}}</p>
                    <p class="card-text"><a href="{{ path.href }}">Read more</a></p>
                </div>
            </div>
        </div>
    {{/each}}
</div>
