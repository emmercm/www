---

title:
priority: 1.0

pageContainer: false

---

<section class="d-flex flex-column position-relative text-center w-100 vh-100 navbar-nspacer text-shadow-sm">
    <div class="container my-auto p-4">
        <h1 class="display-1">{{ sitename }}</h1>
        <h2>Software Engineer</h2>
        <p class="h1 mt-5">
            {{#each icons.header}}
                <a href="{{link}}" {{#if title}}title="{{title}}"{{/if}} class="link-dark">
                    <span class="fa-stack align-top">
                        <i class="fal fa-circle fa-stack-2x"></i>
                        <i class="{{icon}} fa-stack-1x"></i>
                    </span>
                </a>
            {{/each}}
        </p>
    </div>
    <div class="mouse-scroll position-absolute r-3 b-3 r-md-5 b-md-5"><div><div></div></div></div>
</section>

<section id="summary" class="d-flex flex-column text-center w-100 bg-light">
    <div class="position-absolute w-100 text-center" style="transform:translate(0%,-50%)">
        <a href="#" onclick="scrollToCenter('#summary'); return false;">
            {{>gravatar size=256 class="mw-50 rounded-circle img-thumbnail bg-dark border-dark og-image"}}
        </a>
    </div>
    <div style="height:128px; max-height:20vw;">&nbsp;</div> <!-- 256px/2 Gravatar spacer -->
    <div class="container mw-md-md my-6 mx-auto">
        <h2>
            <i class="far fa-map-marker-alt"></i>
            {{ github.profile.user.location }}
        </h2>
        <br>
        <h4>
            {{ sitedescription }}
            Skilled at distributed architecture and technical project management.
            Passionate about quality, mentoring, and leading by example.
        </h4>
    </div>
</section>

{{#if collections.blog}}<section class="container-xl py-3 py-md-4 py-lg-5 markdown">
    {{>blog_list_horizontal data=(first collections.blog 6)}}
</section>{{/if}}
