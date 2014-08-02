env_name: production
hostname: humanitybox.com
deploy_user: deploy

users:
  -
    name: deploy
    groups:
      - deploy
      - wheel
  -
    name: nick
    groups:
      - deploy
      - wheel

ssh:
    port: 55555
