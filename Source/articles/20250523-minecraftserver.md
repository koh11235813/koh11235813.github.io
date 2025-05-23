---
title: minecraftのサーバーの設定とか
date: 2025-05-23
category: server
---

# minecraftの起動

systemdのデーモンとしてシステム起動時に自動起動するように設定している．
```
# /etc/systemd/system/minecraft.service
[Unit]
Description=bootstrap service
After=network-online.target

[Service]
Type=forking
User=kinoko
WorkingDirectory=/home/kinoko/minecraft-server/mc1.20.1
TimeoutStopSec=120
ExecStart=/bin/sh /home/kinoko/minecraft-server/mc1.20.1/run.sh
ExecStop=/bin/sh /home/kinoko/minecraft-server/mc1.20.1/stop_now.sh
Restart=always

[Install]
WantedBy=multi-user.target
```

その他，crontabで毎日6時，18時に停止スクリプトが走るようになっている
```
# minecraft
0 6 * * * /home/kinoko/minecraft-server/mc1.20.1/stop.sh
0 18 * * * /home/kinoko/minecraft-server/mc1.20.1/stop.sh
```

ExecStopを使用しないのはプレイしている途中であった場合に安全地帯まで行けるようにするため
```
kinoko@kinoko-server:~/minecraft-server/mc1.20.1$ cat stop.sh 
#!/bin/bash
/usr/bin/screen -S minecraft -X stuff "say this server will be shutdown in 60s\015"
/bin/sleep 30
/usr/bin/screen -S minecraft -X stuff "say this server will be shutdown in 30s\015"
/bin/sleep 15
/usr/bin/screen -S minecraft -X stuff "say this server will be shutdown in 15s\015"
/bin/sleep 5
/usr/bin/screen -S minecraft -X stuff "say this server will be shutdown in 10s\015"
/bin/sleep 5
/usr/bin/screen -S minecraft -X stuff "say this server will be shutdown in 5s\015"
/bin/sleep 5
/usr/bin/screen -S minecraft -X stuff "save-all\015"
/bin/sleep 5
/usr/bin/screen -S minecraft -X stuff "stop\015"
/bin/sleep 5
rm $HOME/minecraft-server/mc1.20.1/world.zip
/usr/bin/zip -r $HOME/minecraft-server/mc1.20.1/world.zip $HOME/minecraft-server/mc1.20.1/world
kinoko@kinoko-server:~/minecraft-server/mc1.20.1$ cat stop_now.sh 
/usr/bin/screen -S minecraft -X stuff "stop\015"
rm $HOME/minecraft-server/mc1.20.1/world.zip
/usr/bin/zip -r $HOME/minecraft-server/mc1.20.1/world.zip $HOME/minecraft-server/mc1.20.1/world
```


起動スクリプト
```
kinoko@kinoko-server:~/minecraft-server/mc1.20.1$ cat run.sh 
#!/usr/bin/env sh
# Forge requires a configured set of both JVM and program arguments.
# Add custom JVM arguments to the user_jvm_args.txt
# Add custom program arguments {such as nogui} to this file in the next line before the "$@" or
#  pass them to this script directly
# java user_jar_vim.txt @libraries/net/minecraftforge/forge/1.20.1-47.3.5/unix_args.txt "$@"
# git pull
screen -S minecraft -U -d -m java -Xms12G -Xmx12G @libraries/net/minecraftforge/forge/1.20.1-47.3.5/unix_args.txt "$@"
# $JAVA_HOME="~/../../usr/lib/jvm/java-1.21.0-openjdk-amd64/bin"
# java -Xms8G -Xmx10G -jar forge-1.20.1-47.3.5-server.jar --nogui
```

実質`screen ... `の一行だけである．