## Fixing the Nexus Mods update

I like some of the things about the new 2025 site update, and other things I don't like. Unfortunately, little to none of the feedback from beta testers was onboarded, so here's a shim to make it right. It's my hope that Nexus will take what's here and apply it to the site.

I've made this and maintain it as a gift to the community, but if you feel like showing appreciation you can visit my [Ko-fi page](https://ko-fi.com/lummoxjr). I'm also on Nexus if you want to check out [my mods for Skyrim](https://next.nexusmods.com/profile/LummoxJR/mods), which includes my book mod Little Library. Speaking of books, I'm an author as well, and you can [find my work on Amazon](https://www.amazon.com/stores/Lee-Gaiteri/author/B0711TP1VT).

## Installation

To use these styles, you will need the Stylus extension for Firefox or for Chromium browsers. Once installed, [open this link](https://github.com/LummoxJR/Nexusmods-style-fixes/raw/refs/heads/main/nexusmods-fixes.user.css).

## Overview and goals

During the beta I mainly worked with mod pages and the main mod listing page (for Skyrim Special Edition, not for all games), so the biggest changes are biased toward that. I've added support for more pages as I ran across issues or they got changed with the rollout. I'll update with more changes as needed, and I'm open to suggestions for further improvements.

## Reclaiming vertical space

The chief problem with the new design is the abuse of vertical space. In a list of mods, it's now possible to see only about 1.5 rows of results in the grid per scroll. Most of that is due to completely wasted space. Vertical space is also wasted in the headers and just about everywhere else. For anyone with a monitor on 16:9 or wider, which in 2025 is just about everyone, verticality is at a premium. It should be treated as such. With these changes the mod listing page can *nearly* show 2 rows per scroll, and you have more lines of description to read.

Vertical space was a problem on mod pages as well, so it's also been tightened up there. Almost the entire page was below the fold. Quite a lot of it is still below the fold, but it's more in line with the old site's tighter verticality.

On the main page for a game, the trending section has been reworked so it doesn't eat the entire screen.

## Re-condensing the title font

The new title font for mod pages (Inter) is way too wide. Many mods have long names, which caused some of them to actually wrap around to a second line. The old font, Bebas Neue, was pretty perfect for this since it was highly condensed. My stylesheet uses Cabin Condensed (but Saira Condensed is also a very good choice) which gives a new look but still keeps most long titles from wrapping.

## Game-specific colors

I don't know why the site switched to an orange color scheme for everything now. They basically just disabled the styles they had already, even though the classes needed to enable those styles are still there. I copied the colors from the old stylesheet. They might at some point remove the classes that make it possible to reactivate these colors, but hopefully a workaround can be found if that happens.

There are some other areas where game colors used to appear, like the Nexus logo at the top. On many pages this isn't an option anymore because of a lack of CSS classes to identify the game.

## Hiding the Share and Report buttons

I didn't want to hide these buttons on mod pages, but they were dumped in an extraordinarily bad place and there was nothing else to do about them but hide them. If you need to report a mod or need the Share button for some reason, you can disable the styles temporarily. If anyone has other solutions I'm game. Nexus *really* needs to move those buttons into the header.
