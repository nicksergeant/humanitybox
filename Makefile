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
	git push dokku
	dokku run humanitybox.com make install
	dokku run humanitybox.com make compile
	dokku ps:restart humanitybox.com

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

salt-server:
	@scp -q -P 55555 -r ./salt/ nick@humanitybox.com:salt
	@scp -q -P 55555 -r ./pillar/ nick@humanitybox.com:pillar
	@ssh nick@humanitybox.com -p 55555 'sudo rm -rf /srv'
	@ssh nick@humanitybox.com -p 55555 'sudo mkdir /srv'
	@ssh nick@humanitybox.com -p 55555 'sudo mv ~/salt /srv/salt'
	@ssh nick@humanitybox.com -p 55555 'sudo mv ~/pillar /srv/pillar'
	@ssh nick@humanitybox.com -p 55555 'sudo salt-call --local state.highstate'

salt-vagrant:
	@scp -q -P 2222 -i ~/.vagrant.d/insecure_private_key -r ./salt/ vagrant@localhost:salt
	@scp -q -P 2222 -i ~/.vagrant.d/insecure_private_key -r ./pillar/ vagrant@localhost:pillar
	@ssh vagrant@localhost -p 2222 -i ~/.vagrant.d/insecure_private_key 'sudo rm -rf /srv'
	@ssh vagrant@localhost -p 2222 -i ~/.vagrant.d/insecure_private_key 'sudo mkdir /srv'
	@ssh vagrant@localhost -p 2222 -i ~/.vagrant.d/insecure_private_key 'sudo mv ~/salt /srv/salt'
	@ssh vagrant@localhost -p 2222 -i ~/.vagrant.d/insecure_private_key 'sudo mv ~/pillar /srv/pillar'
	@ssh vagrant@localhost -p 2222 -i ~/.vagrant.d/insecure_private_key 'sudo salt-call --local state.highstate'

server:
	@ssh root@humanitybox.com 'sudo apt-get update'
	@ssh root@humanitybox.com 'sudo apt-get install -y software-properties-common python-software-properties'
	@ssh root@humanitybox.com 'sudo add-apt-repository -y ppa:saltstack/salt'
	@ssh root@humanitybox.com 'sudo apt-get update'
	@ssh root@humanitybox.com 'sudo apt-get install -y salt-minion'
	@scp -q -P 22 -r ./salt/ root@humanitybox.com:salt
	@scp -q -P 22 -r ./pillar/ root@humanitybox.com:pillar
	@ssh root@humanitybox.com 'sudo rm -rf /srv'
	@ssh root@humanitybox.com 'sudo mkdir /srv'
	@ssh root@humanitybox.com 'sudo mv ~/salt /srv/salt'
	@ssh root@humanitybox.com 'sudo mv ~/pillar /srv/pillar'
	@ssh root@humanitybox.com 'sudo salt-call --local state.highstate'
	@ssh deploy@humanitybox.com -p 55555 'cd /var/www/humanitybox; make db'
	@ssh deploy@humanitybox.com -p 55555 'cd /var/www/humanitybox; make admin'

vagrant:
	@vagrant up
	@ssh vagrant@localhost -p 2222 -i ~/.vagrant.d/insecure_private_key 'sudo apt-get update'
	@ssh vagrant@localhost -p 2222 -i ~/.vagrant.d/insecure_private_key 'sudo apt-get install -y software-properties-common python-software-properties'
	@ssh vagrant@localhost -p 2222 -i ~/.vagrant.d/insecure_private_key 'sudo add-apt-repository -y ppa:saltstack/salt'
	@ssh vagrant@localhost -p 2222 -i ~/.vagrant.d/insecure_private_key 'sudo apt-get update'
	@ssh vagrant@localhost -p 2222 -i ~/.vagrant.d/insecure_private_key 'sudo apt-get install -y salt-minion'
	@scp -q -P 2222 -i ~/.vagrant.d/insecure_private_key -r ./salt/ vagrant@localhost:salt
	@scp -q -P 2222 -i ~/.vagrant.d/insecure_private_key -r ./pillar/ vagrant@localhost:pillar
	@ssh vagrant@localhost -p 2222 -i ~/.vagrant.d/insecure_private_key 'sudo rm -rf /srv'
	@ssh vagrant@localhost -p 2222 -i ~/.vagrant.d/insecure_private_key 'sudo mkdir /srv'
	@ssh vagrant@localhost -p 2222 -i ~/.vagrant.d/insecure_private_key 'sudo mv ~/salt /srv/salt'
	@ssh vagrant@localhost -p 2222 -i ~/.vagrant.d/insecure_private_key 'sudo mv ~/pillar /srv/pillar'
	@ssh vagrant@localhost -p 2222 -i ~/.vagrant.d/insecure_private_key 'sudo salt-call --local state.highstate'
	@ssh vagrant@localhost -p 2222 -i ~/.vagrant.d/insecure_private_key 'cd /var/www/humanitybox; make db'
	@ssh vagrant@localhost -p 2222 -i ~/.vagrant.d/insecure_private_key 'cd /var/www/humanitybox; make admin'

.PHONY: admin build compile css db deploy install js jshint reset run salt-server salt-vagrant server stats vagrant
