/var/www:
  file.directory:
    - user: {{ pillar.deploy_user }}
    - group: deploy
    - mode: 775
    - require:
      - user: {{ pillar.deploy_user }}
      - group: deploy

{% if pillar.env_name != 'vagrant' %}

/var/www/humanitybox:
  file.directory:
    - user: {{ pillar.deploy_user }}
    - group: deploy
    - mode: 775
    - require:
      - group: deploy

  git.latest:
    - name: git@github.com:nicksergeant/humanitybox.git
    - target: /var/www/humanitybox
    - user: deploy

{% endif %}

/home/{{ pillar.deploy_user }}/tmp:
  file.absent

npm-install:
  npm.bootstrap:
    - name: /var/www/humanitybox
    - runas: {{ pillar.deploy_user }}
    - require:
      - pkg: build-essential
      - pkg: nodejs
      - pkg: system

bower:
  cmd.run:
    - user: {{ pillar.deploy_user }}
    - cwd: /var/www/humanitybox/public
    - names:
      - bower install

/etc/supervisor/conf.d/humanitybox.conf:
  file.managed:
    - source: salt://application/humanitybox.supervisor.conf
    - template: jinja
    - makedirs: True
  cmd.run:
    - name: supervisorctl restart humanitybox

humanitybox-site:
  file.managed:
    - name: /etc/nginx/sites-available/humanitybox
    - source: salt://application/humanitybox.nginx.conf
    - template: jinja
    - group: deploy
    - mode: 755
    - require:
      - pkg: nginx
      - group: deploy

enable-humanitybox-site:
  file.symlink:
    - name: /etc/nginx/sites-enabled/humanitybox
    - target: /etc/nginx/sites-available/humanitybox
    - force: false
    - require:
      - pkg: nginx
  cmd.run:
    - name: service nginx restart
    - require:
      - pkg: nginx
