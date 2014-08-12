node /var/www/humanitybox/scripts/make/build.js > /tmp/cron.build:
  cron.present:
    - user: deploy
    - hour: 3
    - minute: 0
    - require:
      - user: deploy

node /var/www/humanitybox/scripts/make/stats.js > /tmp/cron.stats:
  cron.present:
    - user: deploy
    - hour: *
    - minute: 0
    - require:
      - user: deploy
