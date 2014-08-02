setup_repo:
  pkgrepo.managed:
    - humanname: RethinkDB Repo
    - name: deb http://download.rethinkdb.com/apt trusty main
    - file: /etc/apt/sources.list.d/rethinkdb.list
    - key_url: http://download.rethinkdb.com/apt/pubkey.gpg                     
    - require_in:
      - pkg: rethinkdb                                                          

rethinkdb:
  pkg:
    - installed
  service:
    - running
    - enable: True
    - require:
      - pkg: rethinkdb
    - watch:
      - file: /etc/rethinkdb/instances.d/instance1.conf

/etc/rethinkdb/instances.d:
  file.directory:
    - mode: 755

/etc/rethinkdb/instances.d/instance1.conf:
  file.managed:
    - source: salt://rethinkdb/instance1.conf
    - mode: 755
    - require:
      - file: /etc/rethinkdb/instances.d

rethinkdb-site:
  file.managed:
    - name: /etc/nginx/sites-available/rethinkdb
    - source: salt://rethinkdb/rethinkdb.nginx.conf
    - template: jinja
    - group: deploy
    - mode: 755
    - require:
      - pkg: nginx
      - group: deploy

enable-rethinkdb-site:
  file.symlink:
    - name: /etc/nginx/sites-enabled/rethinkdb
    - target: /etc/nginx/sites-available/rethinkdb
    - force: false
    - require:
      - pkg: nginx
  cmd.run:
    - name: service nginx restart
    - require:
      - pkg: nginx
