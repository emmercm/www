### Feature: ability to calculate and match MD5 & SHA1 checksums

A long missing feature of `igir` has been the ability to match ROMs to DATs based on something other than CRC32 + filesize. This addition brings `igir` ever closer to feature parity with other major ROM managers.

`igir` will now automatically determine all file checksums it needs to calculate to match input files to ROMs in every DAT provided. This is important because not every DAT provides every checksum (e.g. MAME sometimes only provides SHA1, [Hardware Target Game Database](https://github.com/frederic-mahe/Hardware-Target-Game-Database) doesn't always provide filesize).

You can control the minimum checksum algorithm used with the `--input-min-checksum <algorithm>` option.

### Feature: archive checksum cache

To support MD5 & SHA1 checksums, and as prep work for CHD support (#937), `igir` will now cache the checksums of any archived files that it had to compute itself.

Some archive formats such as `.zip` and `.7z` [include pre-calculated CRC32 information](https://igir.io/input/reading-archives/) so `igir` doesn't need to calculate it. No supported archive format includes pre-calculated MD5 or SHA1 checksums, so any need to calculate them can greatly slow down ROM scanning. Having a cache file with `igir`-calculated checksums can greatly speed up subsequent scans.

### Fix: directories in ROM names

Up until now, `igir` tried to intelligently guess if a DAT used `/` or `\` path separators in ROM names intentionally. This led to the issue that was fixed in [v2.5.3](https://github.com/emmercm/igir/releases/tag/v2.5.3) for some No-Intro DATs. [No-Intro doesn't allow these characters](https://wiki.no-intro.org/index.php?title=Naming_Convention#Characters) in game names, and [Redump also follows No-Intro's naming conventions](http://wiki.redump.org/index.php?title=Useful_Links#Naming_Convention).

From now on, `igir` won't try to be smart about game or ROM names, and will instead trust the DAT groups that they know what they're doing.
<!--stackedit_data:
eyJoaXN0b3J5IjpbNjM2Nzc1ODk1LC0xOTQ0NDY4ODgzLC0xOD
QzMTE3NDE3XX0=
-->