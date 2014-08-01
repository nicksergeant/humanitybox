build:
	@node scripts/make/build.js

stats:
	@node scripts/make/stats.js

reset:
	@node scripts/make/reset.js

.PHONY: build stats reset
