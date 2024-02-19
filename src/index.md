---

title:
priority: 1.0

pageContainer: false

---

<section class="d-flex flex-column position-relative text-center w-100">
    <div style="height:64px; max-height:10vw;">&nbsp;</div> <!-- 256px/4 Gravatar spacer -->
    <div class="container-md my-6">
        <h1 class="display-1">{{ sitename }}</h1>
        <h2>Software Engineering Professional</h2>
        <p class="h1 mt-5">
            {{#each icons.header}}
                <a href="{{link}}" {{#if title}}title="{{title}}"{{/if}} class="link-body-emphasis">
                    <span class="fa-stack align-top">
                        <i class="fa-light fa-circle fa-stack-2x"></i>
                        <i class="{{icon}} fa-stack-1x"></i>
                    </span>
                </a>
            {{/each}}
        </p>
    </div>
    <!-- <div class="mouse-scroll position-absolute r-3 b-3 r-md-5 b-md-5"><div><div></div></div></div> -->
    <div style="height:128px; max-height:20vw;">&nbsp;</div> <!-- 256px/2 Gravatar spacer -->
</section>

<section id="summary" class="d-flex flex-column text-center w-100 bg-body-tertiary border-top">
    <div class="position-absolute w-100 text-center" style="transform:translate(0%,-50%)">
        <a href="#" onclick="scrollToCenter('#summary'); return false;">
            {{>gravatar size=256 class="mw-50 rounded-circle img-thumbnail bg-border border og-image"}}
        </a>
    </div>
    <div style="height:128px; max-height:20vw;">&nbsp;</div> <!-- 256px/2 Gravatar spacer -->
    <div class="container-md mw-md-md my-6 mx-auto">
        <div class="fs-2 mb-3">
            <i class="fa-regular fa-location-dot"></i>
            {{#if github.profile.user.location}}
                {{ github.profile.user.location }}
            {{else}}
                Somewhere, USA
            {{/if}}
        </div>
        <div class="fs-4">
            {{ sitedescription }}
            Skilled at distributed architecture and technical project management.
            Passionate about quality, mentoring, and leading by example.
        </div>
    </div>
</section>

{{#if collections.blog}}<div class="pt-5 bg-body-tertiary border-top">
  <div class="container-md mw-md-lg markdown">
    {{>blog_list_horizontal data=(first collections.blog 6)}}
  </div>
</div>{{/if}}
