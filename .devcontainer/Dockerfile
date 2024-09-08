# Copyright (C) 2024 Helmar Hutschenreuter
# 
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
# 
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

# Using an Alpine-based lightweight base image
FROM node:20.12-alpine

# - Install make, git, bash-completion for development
# - Install Angular CLI
# - Configure bash prompt, enable bash completion and set bash as default shell
RUN apk update \
    && apk add --no-cache \
       make \
       git \
       bash-completion \
       bash \
    && npm install -g @angular/cli@17 \
    && echo 'PS1=" \W ➜ "' >> ~/.bashrc \
    && echo "if [ -f /usr/share/bash-completion/bash_completion ]; then . /usr/share/bash-completion/bash_completion; fi" >> ~/.bashrc \
    && sed -i 's|/bin/ash|/bin/bash|' /etc/passwd