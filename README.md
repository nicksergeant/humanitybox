Humanity Box
============

Humanity Box is a free ad network designed to increase exposure to individuals
raising funds for personal medical needs.

What does it do?
----------------

Humanity Box works similarly to how paid ad networks work (such as
[The Deck](http://decknetwork.net/), [Carbon Ads](http://carbonads.net/),
[BSA One](http://bsaone.com/), etc). You install an ad code onto your website,
and it delivers advertisements on each page load.

The difference is that ads in the Humanity Box network are funding campaigns
for people are who sick and experiencing financial hardship as a result. The
campaigns are sourced from [GiveForward](http://www.giveforward.com/).

The ads link directly to the sourced campaign. No money ever changes hands
with Humanity Box. It is simply an experimental project for the sake of being
good.

Why does it exist?
------------------

No one should have to choose between bankruptcy or death.

Campaign providers such as [GiveForward](http://www.giveforward.com/) are
providing a vital service by allowing people to create funding campaigns to
help pay for medical treatments.  Oftentimes, however, the campaigns never
reach beyond friends, family, and other people specifically browsing the
platform looking to make donations.  While this is amazing in and of itself,
many campaigns never reach their goal.

Humanity Box's aim is to bring exposure to these campaigns to as many sites on
the internet as possible. We hope that by simply increasing traffic to these
campaigns we can help them get funded when they otherwise might not.

How does it work?
-----------------

*Note: We are still working on the implementation details of this service.*

We will source funding campaigns from [GiveForward](http://www.giveforward.com/).

The ad code will be asynchronously loaded and all assets will be delivered via
[Amazon CloudFront](http://aws.amazon.com/cloudfront/).

At the start, we will simply randomize campaigns on each page load, but the
goal is to be smarter about ensuring campaigns get distributed evenly.

Want to help?
-------------

Our greatest need right now is design related. If you know someone interested
in helping us build out a brand and marketing site, let us know
[here](https://github.com/nicksergeant/humanitybox/issues/1).

Code-wise, pull requests are encouraged. Check the
[open issues](https://github.com/nicksergeant/humanitybox/issues) to see what
we need help with.
