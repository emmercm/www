---

title: Common Markdown Mistakes
date: 2020-11-10T02:12:00

---

Markdown provides simple syntax for writing structure documents, but most written markdown would not pass a linter check. Here's a list of 11 common syntax mistakes and how to fix them.

<!-- markdownlint-disable MD001 -->

## Empty lines and whitespace

##### **Missing empty lines surrounding blocks**

This is probably the most common mistake people make. Blocks of content such as headers, paragraph, lists, and code should have empty lines surrounding them:

Incorrect:

```markdown
# This header should have empty lines surrounding it
This paragraph should have empty lines surrounding it
- This list
- Should have empty lines surrounding it
This paragraph should have empty lines surrounding it
```

Correct:

```markdown
# This header has empty lines surrounding it

This paragraph has empty lines surrounding it

- This list
- Has empty lines surrounding it

This paragraph has empty lines surrounding it
```

##### **Missing empty lines between paragraphs**

Blocks of content need empty lines surrounding them, but it's especially important with paragraphs. Many markdown renderers won't separate paragraphs unless there's an empty line between them.

Incorrect:

```markdown
This is the first paragraph
This is still part of the first paragraph
```

Correct:

```markdown
This is the first paragraph

This is the second paragraph
```

##### **Too many empty lines surrounding blocks**

Blocks of content need empty lines surrounding them, but only one, even if having more usually doesn't affect rendering.

Incorrect:

```markdown
# Header


Paragraph


- List item
- List item
```

Correct:

```markdown
# Header

Paragraph

- List item
- List item
```

##### **No space after header declarations**

Without a space after the #'s in your header, markdown renderers may interpret the line as a paragraph rather than a header.

Incorrect:

```markdown
#This is a header?

This is a paragraph
```

Correct:

```markdown
# This is a header!

This is a paragraph
```

##### **Leading and trailing whitespace**

Markdown uses some [whitespace as syntax](https://en.wikipedia.org/wiki/Whitespace_character#Programming_languages), so extra whitespace could throw off your formatting. Or at best it's just unnecessary characters.

Incorrect:

```markdown
Paragraph␣

␣- List
␣- List
```

Correct:

```markdown
Paragraph

- List
- List
```

##### **Inconsistent indentation**

Because markdown uses some whitespace as syntax, mistakes such as inconsistent indentation can throw off rendering.

Incorrect:

```markdown
- An item
  - A sub item
  - A sub item
   - A sub item?

 8. Eighth item
 9. Ninth item
10. Tenth item
11. Eleventh item
```

Correct:

```markdown
- An item
  - A sub item
  - A sub item
  - A sub item

8. Eighth item
9. Ninth item
10. Tenth item
11. Eleventh item
```

## Ordering and incrementing

##### **Incorrect header incrementing**

Heading levels should only increment one level at a time (h1, h2, h3, etc.). There are times when someone might want to ignore this rule for stylistic reasons, but it is technically incorrect.

Incorrect:

```markdown
# Heading 1

### Heading 2

##### Heading 3

# Heading 1
```

Correct:

```markdown
# Heading 1

## Heading 2

### Heading 3

# Heading 1
```

##### **Incorrect ordered list prefix incrementing**

Markdown renderers are especially forgiving about this rule, but ordered lists should either be written with prefixes that increment one at a time, or prefixes of all 1's.

Incorrect:

```markdown
1. One
4. Two
7. Three

3. One
3. Two
3. Three
```

Correct:

```markdown
1. One
2. Two
3. Three

1. One
1. Two
1. Three
```

## Miscellaneous

##### **No language for fenced code blocks**

Defining a language for fenced code blocks helps renderers apply syntax highlighting, and without a language explicitly defined it'll either be guessed or defaulted as "text".

Incorrect:

`````markdown
```
console.log("Hello world!");
```
`````

Correct:

`````markdown
```javascript
console.log("Hello world!");
```
`````

##### **Using HTML tags**

Most markdown renderers will interpret HTML tags as syntax rather than content, so using unescaped HTML tags could give unexpected results. When using HTML tags for formatting, try to see if there's a native Markdown syntax to achieve the same thing instead.

Incorrect:

```markdown
In HTML, the <p> tag is used for paragraphs.

This is the first paragraph<br>
<br>
This is effectively the second paragraph
```

Correct:

`````markdown
In HTML, the `<p>` tag is used for paragraphs.

This is the first paragraph

This is the second paragraph
`````

##### **Using "bare" URLs**

Just like websites wouldn't list out an entire URL without hyperlink text, URLs shouldn't be written out in markdown, especially because renderers may treat them as content and not automatically hyperlink them.

Incorrect:

```markdown
https://www.reddit.com/
```

Correct:

```markdown
[Reddit](https://www.reddit.com/)
```

## Summary

Different markdown specs have different syntax rules, so these rules may not be 100% universal, but should fit for most specs.

Check out some of these different specs:

- [GitHub Flavored Markdown](https://github.github.com/gfm/)
- [CommonMark](https://spec.commonmark.org/current/)
- [Markdown Extra](https://michelf.ca/projects/php-markdown/extra/)
