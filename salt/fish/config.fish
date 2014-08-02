# Directories {{{ 

function l
    tree --dirsfirst -ChFL 1 $args
end
function ll
    tree --dirsfirst -ChFupDaL 1 $args
end

# }}}
# Directories {{{ 

set -g -x fish_greeting ''
set -g -x EDITOR vim

# }}}
# Git and Mercurial functions {{{

function gca 
    git commit -a $argv
end
function gco 
    git checkout $argv
end
function gd 
    git diff HEAD
end
function gl
    git pull $argv
end
function gp 
    git push $argv
end
function gst 
    git status $argv
end

# }}}
# Programs {{{ 

function logs
    sudo supervisorctl tail -f humanitybox stdout
end
function run
    sudo supervisorctl restart humanitybox
    sudo supervisorctl tail -f humanitybox stdout
end
function rs
    sudo supervisorctl restart humanitybox
end
function ssc 
    sudo supervisorctl $argv
end

# }}}
# Prompt {{{ 

set -x fish_color_command 005fd7\x1epurple
set -x fish_color_search_match --background=purple

function prompt_pwd --description 'Print the current working directory, shortend to fit the prompt'
    echo $PWD | sed -e "s|^$HOME|~|"
end

function fish_prompt
    z --add "$PWD"
    echo ' '
    printf '\033[0;31m%s\033[0;37m on ' (whoami)
    printf '\033[0;31m%s ' (hostname -f)
    printf '\033[0;32m%s' (prompt_pwd)
    echo
    printf '\033[0;37m> '
end

# }}}
# Z {{{ 

source /etc/z.fish

function j
    z $argv
end

# }}}
