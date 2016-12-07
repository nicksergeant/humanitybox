JSHINT := node_modules/.bin/jshint
JSHINTFLAGS :=--config=.jshintrc --exclude=scripts/make/js-semicolon.js

css_files := $(shell node scripts/make/css-files.js)
js_files := $(shell node scripts/make/js-files.js)
js_src_files := $(shell find public/src server server.js scripts -name '*.js')

build:
	@node scripts/make/build.js

stats:
	@node scripts/make/stats.js

reset:
	@node scripts/make/reset.js

admin:
	@node scripts/make/create-admin-user.js

compile: js css

css: $(css_files)
	@cat $(css_files) > public/humanitybox.css

deploy:
	git push heroku

db:
	@node scripts/make/init-database.js

install:
	@npm install
	@cd public && bower install

js: $(js_files)
	@cat $(js_files) > public/humanitybox.js

jshint: $(js_src_files)
	@$(JSHINT) $(JSHINTFLAGS) $(js_src_files)

run: install jshint
	@vagrant up
	@vagrant ssh -c 'sudo supervisorctl restart humanitybox && sudo supervisorctl tail -f humanitybox stdout'

.PHONY: admin build compile css db deploy install js jshint reset run salt-server salt-vagrant server stats vagrant
