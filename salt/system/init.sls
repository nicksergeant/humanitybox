build-essential:
  pkg.installed:
    - pkgs:
      - build-essential

iptables:
  pkg.installed:
    - pkgs:
      - iptables

system:
  pkg.installed:
    - pkgs:
      - cmake
      - curl
      - exuberant-ctags
      - git
      - htop
      - mercurial
      - python-dev
      - tree
      - libpq-dev
  cmd.run:
    - name: apt-get -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" upgrade
