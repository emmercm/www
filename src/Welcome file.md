### Feature: ability to calculate and match MD5 & SHA1 checksums

A long missing feature of `igir` has been the ability to match ROMs to DATs based on something other than CRC32 + filesize. This brings `igir` ever closer to feature parity with other major ROM managers.

`igir` will now automatically determine all file checksums it needs to calculate to match input files to ROMs in every DAT provided. This is important because not every DAT provides every checksum (e.g. MAME sometimes only provides SHA1, [Hardware Target Game Database](https://github.com/frederic-mahe/Hardware-Target-Game-Database) doesn't always provide filesize).

You can control the minimum checksum algorithm used with the `--input-min-checksum <algorithm>` option.

### Feature: archive checksum cache

To support MD5 & SHA1 checksums, and as prep work for CHD support (#937), `igir` will now cache the checksums of any archived files that it had to compute itself.

Some archive formats such as `.zip` and `.7z` [include pre-calculated CRC32 information](https://igir.io/input/reading-archives/) such that `igir` doesn't need to calculate it. No supported archive format includes pre-calculated MD5 or SHA1 checksums, so any need to calculate them can greatly slow down ROM scanning. Having a cache file with `igir`-calculated checksums can greatly speed up subsequent scans.

### Fix: directories in ROM names

Up until now, `igir` rt
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTAwNTkxNTUwMiwtMTg0MzExNzQxN119
-->