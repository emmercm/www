---

title: Common Markdown Mistakes
image:
date: 2030-01-01

---

Markdown is a simple and flexible format for writing structured documents and it's also very forgiving with syntax errors. Here's a list of common markdown mistakes and how to fix them.

<!-- markdownlint-disable MD001 -->

## Empty lines and whitespace

##### **Missing empty lines surrounding blocks**

This is probably the largest mistake people make. Blocks of content such as headers, paragraph, lists, and code blocks should have empty lines surrounding them:

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

Like mentioned above, blocks of content need empty lines surrounding them, but that's especially true with paragraphs. Many markdown renderers won't separate paragraphs unless there's an empty line between them.

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

Blocks of content need empty lines surrounding them, but only one, even if having more generally doesn't affect rendering.

Incorrect:

```markdown
# Header


Paragraph


- List
- List
```

Correct:

```markdown
# Header

Paragraph

- List
- List
```

##### **Leading and trailing whitespace**

Markdown uses some [whitespace as syntax](https://en.wikipedia.org/wiki/Whitespace_character#Programming_languages), so extra whitespace could throw off your formatting. Or at best it's just unnecessary information.

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

Like mentioned above, because markdown uses some whitespace as syntax, mistakes such as inconsistent indentation can throw off rendering.

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

## Ordering and progression

##### **Incorrect header progression**

Heading levels should follow numerical progression (h1, h2, h3, etc.). There are times when someone might want to ignore this rule for stylistic reasons, but it is technically incorrect.

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

##### **Incorrect ordered list progression**

Markdown renderers are especially forgiving about this rule, but ordered lists should either be written with correctly increasing numbers, or with all 1's.

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

Most markdown renderers will interpret HTML tags as syntax rather than content, so using unescaped HTML tags could give unexpected results. When using HTML tags for formatting, try to see if there's native markdown syntax to achieve the same thing instead.

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

Just like websites wouldn't list out an entire URL without some hyperlink text, URLs shouldn't be written out in markdown, especially because renderers may treat them as content and not links.

Incorrect:

```markdown
https://www.reddit.com/
```

Correct:

```markdown
[Reddit](https://www.reddit.com/)
```
