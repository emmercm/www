---

title: Links
private: true

pageContainer: false

---

<div class="container mw-md py-5 w-100 text-center">
    <img src="{{gravatar.main}}?r=g&d=mp&s=256" alt="{{sitename}}" class="mw-50 rounded-circle img-thumbnail bg-dark border-dark og-image" style="width:128px;">
    <h4 class="mt-4">{{ sitename }}</h4>
    {{#each links}}
        <h5 class="mt-4 mb-2">{{ title }}</h5>
        {{#each icons}}
            <div class="py-2">{{#if link}}<a href="{{link}}" title="{{title}}" class="text-dark">{{/if}}
                <div class="row d-flex justify-content-between align-items-center no-gutters bg-light br-2 py-2">
                    <div class="col-1">
                        <h2>
                            <i class="{{icon}}"></i>
                        </h2>
                    </div>
                    <div class="col-10">
                        <h6>{{ title }}</h6>
                    </div>
                    <div class="col-1 text-right pr-3">
                        {{#if link}}
                            <i class="far fa-external-link"></i>
                        {{/if}}
                    </div>
                </div>
            {{#if link}}</a>{{/if}}</div>
        {{/each}}
    {{/each}}
</div>
