build:
	@node scripts/make/build-js.js

deploy:
	@node scripts/make/deploy-to-s3.js

reset:
	@node scripts/make/reset-campaigns.js

.PHONY: build deploy reset
