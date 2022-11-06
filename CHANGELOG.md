# Changelog

## v2.0.0
- improved efficiency of compiled picker
- ***BREAKING CHANGE***: with this improvement the order of picked items is no longer preserved, so a pseudo random number generator that return 0 or less or 1 or more is no longer necessarily returns the first or last item in the list, respectively
## v1.3.0 *2022-7-23*
- made `rando` reseedable
## v1.2.1 *2022-4-30*
- fixed typo in README
## v1.2.0 *2022-4-17*
- some efficiency improvements in edge cases
## v1.1.1 *2022-4-16*
- fixed some project configuration
## v1.1.0 *2022-4-16*
- factored `pickMeToo` out of `pickMe`