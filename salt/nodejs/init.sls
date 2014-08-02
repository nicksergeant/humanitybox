nodejs:
  pkgrepo.managed:
    - ppa: chris-lea/node.js
    - require_in:
      - pkg: nodejs
  pkg.latest:
    - name: nodejs
    - refresh: True

global-npm-packages:
  npm.installed:
    - names:
      - bower
      - supervisor
    - require:
      - pkg: nodejs
