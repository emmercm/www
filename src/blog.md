---

title: Blog
priority: 0.9

pageWide: true
pageBackground: false

---

<div class="d-flex justify-content-between align-items-center br-1 mb-3 p-4 p-md-5 bg-light">
    <h1 class="m-0">Blog Posts</h1>
    <h5 class="m-0">
        <a href="/blog/rss.xml" class="text-dark">
            <span class="fa-stack align-top">
                <i class="fal fa-circle fa-stack-2x"></i>
                <i class="fas fa-rss fa-stack-1x"></i>
            </span>
        </a>
    </h5>
</div>

{{>blog_list data=collections.blog}}
