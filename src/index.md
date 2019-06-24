---

no_container: true

---

<section class="d-flex flex-column text-center w-100 vh-100 text-shadow-sm">
    <div class="my-auto">
        <h1 class="display-1">Christian Emmer</h1>
        <h2>Software Engineer</h2>
        <p class="h1 mt-5">
            {{#each icons.header}}
                <a href="{{link}}" target="_blank" class="text-dark text-decoration-none">
                    <span class="fa-stack align-top">
                        <i class="fal fa-circle fa-stack-2x"></i>
                        <i class="{{icon}} fa-stack-1x"></i>
                    </span>
                </a>
            {{/each}}
        </p>
    </div>
</section>
