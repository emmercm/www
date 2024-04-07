### Feature: checksums of non-archives are now cached

This is most helpful when copying or moving large files such as ISOs, and when calculating MD5/SHA1/SHA256 hashes.

### Feature: added "cracked" game type

Games considered "cracked" have had some kind of copy prote

### Fix: parent/clone inference with game "alternates"

@MrNoOneRed found that the GoodTools-style `[a]` and `[a#]` tags were not getting grouped together into parent/clones with TOSEC DATs. This has been fixed.

### Token updates

**Fix: "Famicom" and "Super Famicom" DATs.**

"Nintendo Entertainment System" and "Super Nintendo Entertainment System" have been supported for a long time, but @kerobaros pointed out that "Famicom" and "Super Famicom" were not. This has been fixed.
<!--stackedit_data:
eyJoaXN0b3J5IjpbMjM1MjUxMDc4LC0xMDIxMDA5MTc0LC0xOT
Q0NDY4ODgzLC0xODQzMTE3NDE3XX0=
-->