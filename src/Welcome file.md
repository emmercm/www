### Checksum cache updates

**Feature: checksums of non-archives are now cached**

This is most helpful when copying or moving large files such as ISOs, and when calculating MD5/SHA1/SHA256 hashes.

**Fix: test for cache write permissions**

### Fix: parent/clone inference with game "alternates"

@MrNoOneRed found that the GoodTools-style `[a]` and `[a#]` tags were not getting grouped together into parent/clones with TOSEC DATs. This has been fixed.

### Token updates

**Feature: added "cracked" game type.**

A new "cracked" game type has been added that will affect the `{gameType}` [output token](https://igir.io/output/tokens/). Games considered "cracked" have had some kind of copy protection removed, and by definition are not retail, so they will also be excluded by the [`--only-retail` option](https://igir.io/roms/filtering-preferences/#only-retail). Thank you @MrNoOneRed for the feature suggestion.

**Fix: "Famicom" and "Super Famicom" DATs.**

"Nintendo Entertainment System" and "Super Nintendo Entertainment System" have been supported for a long time, but @kerobaros pointed out that "Famicom" and "Super Famicom" were not. This has been fixed.
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTkyNjk4MTU4OSwtMTAyMTAwOTE3NCwtMT
k0NDQ2ODg4MywtMTg0MzExNzQxN119
-->