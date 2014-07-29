build:
	@node scripts/make/build-js.js

deploy:
	@node scripts/make/deploy-to-s3.js

reset:
	@echo > campaigns-shown.csv

.PHONY: build deploy reset
