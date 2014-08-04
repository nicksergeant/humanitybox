node /var/www/humanitybox/scripts/make/build.js > /tmp/cron.build:
  cron.present:
    - user: deploy
    - hour: 3
    - minute: 0
    - require:
      - user: deploy
