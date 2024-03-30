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
FROM node:18.14.1-slim

# - Install general tools
# - Update CA certificates to use SSL connections with git and curl
# - Install Angular CLI
# - Set zsh as default shell
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       make \
       git \
       zsh \
       curl \
       ca-certificates && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g @angular/cli@17 \
    && sed -i 's|/bin/bash|/usr/bin/zsh|' /etc/passwd

# Install Oh-My-Zsh
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended