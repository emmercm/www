---

no_container: true

---

<section class="d-flex flex-column text-center w-100 vh-100 text-shadow-sm">
    <div class="my-auto">
        <h1 class="display-1">{{ sitename }}</h1>
        <h2>Software Engineer</h2>
        <p class="h1 mt-5">
            {{#each icons.header}}
                <a href="{{link}}" target="_blank" {{#if title}}title="{{title}}"{{/if}} class="text-dark text-decoration-none">
                    <span class="fa-stack align-top">
                        <i class="fal fa-circle fa-stack-2x"></i>
                        <i class="{{icon}} fa-stack-1x"></i>
                    </span>
                </a>
            {{/each}}
        </p>
    </div>
</section>

<section class="d-flex flex-column text-center w-100 bg-light">
    <div class="position-absolute w-100 text-center" style="transform:translate(0%,-50%)">
        <a href="#" onclick="document.getElementById('summary').scrollIntoView({behavior:'smooth'}); return false;">
            <img src="{{gravatar.main}}?r=g&d=mp&s=256" alt="{{ sitename }}" class="mw-50 rounded-circle img-thumbnail bg-dark border-dark">
        </a>
    </div>
    <div style="min-height:85px;">&nbsp;</div> <!-- 256px/3 Gravatar spacer -->
    <div id="summary" class="mw-md-75 my-6 mx-auto px-4">
        <h2>
            <i class="far fa-map-marker-alt"></i>
            Detroit, MI
        </h2>
        <br>
        <h4>
            Software engineer with {{subtract (date "today" "YYYY") (date "January 16 2012" "YYYY")}}+ years of experience developing full-stack solutions in PHP, Go, Node.js, Python, and Ruby on Rails.
            Skilled at distributed architecture and technical project management.
            Passionate about setting quality standards and leading by example.
        </h4>
    </div>
</section>
