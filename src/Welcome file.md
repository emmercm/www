### Feature: ability to calculate and match MD5 & SHA1 checksums

A long missing feature of `igir` has been the ability to match ROMs to DATs based on something other than CRC32 + filesize. This brings `igir` ever closer to feature parity with other major ROM managers.

`igir` will now automatically determine all file checksums it needs to calculate to match input files to ROMs in every DAT provided. This is important because not every DAT provides every checksum (e.g. MAME sometimes only provides SHA1, [Hardware Target Game Database](https://github.com/frederic-mahe/Hardware-Target-Game-Database) doesn't always provide filesize).

You can control the minimum checksum algorithm used with the `--input-min-checksum <algorithm>` option.

### Feature: file checksum cache

To support MD5 & SHA1 checksums, and as prep work for CHD support (#937), `igir` will now cache 
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTEzNzg1MDI2OTAsLTE4NDMxMTc0MTddfQ
==
-->