---

title: Hash a String to a Number in Bash
date: 2023-03-06T05:16:00
tags:
- shell

---

Sometimes you need to turn a stable string ID into a stable number ID, and it's relatively easy to do in Bash.

I recently had the need to generate a deterministic number from a string ID in Bash, in order to generate a semi-random port number. The idea was to take some base number (e.g. 10,000) and then add a generated number in some predetermined range (e.g. 0-9,999) to get a final port number.

Here is a Bash function that uses MD5 to help generate a number:

```bash
# @param {string} $1 String to hash to a positive number
stringsum() {
    echo "md5sum,md5" | tr ',' '\n' | while read -r cmd; do
        if [[ -x "$(command -v "${cmd}")" ]]; then
            num=$(( 0x$(echo "$1" | command "${cmd}" | cut -d ' ' -f 1 | head -c 15) ))
            [[ $num -lt 0 ]] && num=$((num * -1))
            echo $num
            return 0
        fi
    done
    return 1
}
```

It tries to use `md5sum` and then `md5`, in that order, to be macOS compatible in case [coreutils](https://formulae.brew.sh/formula/coreutils) isn't installed.

Here are a few examples:

```shell
$ stringsum "foo"
953363684511530718

$ stringsum "bar"
870736763127995456

$ stringsum "hello world"
501465446843089483
```

In my original use case, because I wanted numbers in a clamped range, I used the typical `number % (max - min + 1) + min` formula with a minimum of zero:

```shell
$ echo $(( $(stringsum "some ID") % 10000 ))
8315

$ echo $(( $(stringsum "another ID") % 10000 ))
1185
```

You can read more about arithmetic expansion in Bash on [The Linux Documentation Project](https://tldp.org/LDP/abs/html/arithexp.html).
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTkxNDcyMDUzMV19
-->