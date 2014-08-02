env_name: vagrant
hostname: local.humanitybox.com
deploy_user: vagrant

users:
  -
    name: vagrant
    groups:
      - deploy
      - wheel

ssh:
    port: 22
