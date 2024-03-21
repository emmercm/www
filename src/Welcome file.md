### Feature: ability to calculate and match MD5 & SHA1 checksums

A long missing feature of `igir` has been the ability to match ROMs to DATs based on something other than CRC32 + filesize. This brings `igir` ever closer to feature parity with other major ROM managers.

`igir` will now automatically determine all file checksums it needs to calculate to match ROMs to any DAT provided. This is important because not every DAT provides every checksum (MAME sometimes only provides SHA1, 
<!--stackedit_data:
eyJoaXN0b3J5IjpbMTY5NTA4MTYzN119
-->