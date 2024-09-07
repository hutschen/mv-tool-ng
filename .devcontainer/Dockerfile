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

# Using a Debian-based lightweight base image
FROM node:20.12-slim

# - Install make, git, bash-completion for development
# - Install Angular CLI
# - Configure bash prompt and enable bash completion
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       make \
       git \
       bash-completion \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g @angular/cli@17 \
    && echo 'PS1=" \W ➜ "' >> ~/.bashrc \
    && echo "if [ -f /etc/bash_completion ]; then . /etc/bash_completion; fi" >> ~/.bashrc
