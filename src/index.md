---

title:

---

<section class="d-flex flex-column text-center w-100 vh-100 text-shadow-sm">
    <div class="my-auto p-4">
        <h1 class="display-1">{{ sitename }}</h1>
        <h2>Software Engineer</h2>
        <p class="h1 mt-5">
            {{#each icons.header}}
                <a href="{{link}}" {{#if title}}title="{{title}}"{{/if}} class="text-dark text-decoration-none">
                    <span class="fa-stack align-top">
                        <i class="fal fa-circle fa-stack-2x"></i>
                        <i class="{{icon}} fa-stack-1x"></i>
                    </span>
                </a>
            {{/each}}
        </p>
    </div>
</section>

<section id="summary" class="d-flex flex-column text-center w-100 bg-light">
    <div class="position-absolute w-100 text-center" style="transform:translate(0%,-50%)">
        <a href="#" onclick="scrollToCenter('#summary'); return false;">
            <img src="{{gravatar.main}}?r=g&d=mp&s=256" alt="{{ sitename }}" class="mw-50 rounded-circle img-thumbnail bg-dark border-dark">
        </a>
    </div>
    <div style="height:128px; max-height:20vw;">&nbsp;</div> <!-- 256px/2 Gravatar spacer -->
    <div class="mw-md-75 my-6 mx-auto px-4">
        <h2>
            <i class="far fa-map-marker-alt"></i>
            Detroit, MI
        </h2>
        <br>
        <h4>
            {{{ sitedescription }}}
            Skilled at distributed architecture and technical project management.
            Passionate about quality, mentoring, and leading by example.
        </h4>
    </div>
</section>

{{#if collections.blog}}<section class="p-5 p-md-6 markdown">
    {{>blog_list data=(first collections.blog 3) br_breakpoint="xs"}}
</section>{{/if}}
