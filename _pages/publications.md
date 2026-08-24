---
layout: page
permalink: /publications/
title: publications
description: In reverse chronological order. * denotes equal contribution.
nav: true
nav_order: 2
---

<!-- _pages/publications.md -->

<div class="publications" data-paper-areas="{{ site.data.paper_areas | jsonify | escape }}">

{% include area_filter.liquid %}

{% bibliography %}

<p class="area-empty" hidden>No publications in this area.</p>

</div>
