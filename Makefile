build:
	@node scripts/make/build.js

deploy:
	@node scripts/make/deploy.js

reset:
	@echo > campaigns-shown.csv

.PHONY: build deploy reset
