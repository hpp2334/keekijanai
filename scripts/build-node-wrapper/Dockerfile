FROM centos:7

# Install node 14, pnpm
RUN curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n && bash n 14
RUN npm i -g pnpm

# Install rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs > rust-init.sh
RUN /bin/sh rust-init.sh -q -y --default-toolchain nightly
ENV PATH="/root/.cargo/bin:${PATH}"

# Install compiler toolchain
RUN yum -y install perl perl-IPC-Cmd automake autoconf libtool make gcc gcc-c++

CMD [ "/bin/bash" ]