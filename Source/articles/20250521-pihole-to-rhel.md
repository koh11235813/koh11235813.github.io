---
title: pihole を RHEL9 へ移管したときのメモ
date: 2025-05-21
category: server
---


# pihole を RHEL9 へ移管したときのメモ

## [pihole のために開けておくポート](https://docs.pi-hole.net/main/prerequisites/#ports)

|port|protocol|service name|Notes|
|----|----|----|----|
|53|udp,tcp|dns|DNSサーバーとして使用されるポート.|
|67|udp|ipv4 dhcp|dhcpサーバーとして使用することを選択したとき，ipv4アドレスのために使用されるポート.|
|80|tcp|http|すでに使用されている場合，8080ポートを代替として使用する.もしくはwebserver.portオプションで変更できる.|
|123|udp|NTP|ntpサーバーとして使用することを選択したときに使用するポート.|
|443|tcp|https|すでに使用されている場合，8443ポートを代替として使用する.もしくはwebserver.portオプションで変更できる.|
|547|udp|ipv6 dhcp|dhcpサーバーとして使用することを選択したとき，ipv6アドレスのために使用されるポート.|

最低限開けないといけないのは53, 80, 443ポート．


これらを開けておかないとpiholeのwebページ(?)にアクセスできない．

```
sudo firewall-cmd --add-port=53/tcp --permanent
sudo firewall-cmd --add-port=80/tcp --permanent
sudo firewall-cmd --add-port=443/tcp --permanent
```
再読込
`sudo firewall-cmd --reload`
確認
`sudo firewall-cmd --list-ports`

設定できていれば以下のような表示を確認できるはずです．
```
ports: 53/tcp 53/udp 80/tcp 443/tcp
```

## [SELinuxの無効化またはPermissiveモードに変更](https://docs.redhat.com/ja/documentation/red_hat_enterprise_linux/7/html/selinux_users_and_administrators_guide/sect-security-enhanced_linux-working_with_selinux-changing_selinux_modes)

piholeはインストールするときにSELinuxかどうかをチェックし，SELinuxが`Enforcing`である場合はインストールが途中で止まる．
```
sudo vim /etc/selinux/config
# もしくは
sudo nano /etc/selinux/config
```
```
# This file controls the state of SELinux on the system.
# SELINUX= can take one of these three values:
#       enforcing - SELinux security policy is enforced.
#       permissive - SELinux prints warnings instead of enforcing.
#       disabled - No SELinux policy is loaded.
SELINUX=permissive
# SELINUXTYPE= can take one of these two values:
#       targeted - Targeted processes are protected,
#       mls - Multi Level Security protection.
SELINUXTYPE=targeted
```
`SELINUX`を`permissive`または`disabled`に設定する

## piholeのインストール[*](https://discourse.pi-hole.net/t/unsupported-os-cant-skip-os-check/35686)
```bash
curl -sSL https://install.pi-hole.net | export PIHOLE_SKIP_OS_CHECK=true sudo bash
```
上記を実行するだけ．
何かエラーが出たらメッセージをググるなりすると解決策が見つかると思います．

インストールが最後までできたらログインするパスワード<pwd>を変えます．


piholeはデフォルトで/usr/local/bin/に配置される．sudoするときはPATHが通っていないことが多いのでフルパスでコマンドを入れるか、自分で設定する必要がある．

```
sudo /usr/local/bin/pihole setpassword <pwd>
```

ここまでできたらwebブラウザからpiholeを入れたサーバーのipアドレス:443/adminでwebページが見えると思う．

`<ip address>:443/admin`
自分がやったときは80番(HTTP)ではssl証明書がないなどと言われてアクセスできなかったので443番(HTTPS)でログインした．

### adblock list をリロードする
このままでもいいが，adblock listのリロードにはCLIを叩く必要がある．
```
sudo /usr/local/bin/pihole -g
```

めんどくさいので`crontab`に入れる
```
$ sudo su
root # crontab -e
```

```crotab
0 1 * * * /usr/local/bin/pihole -g
```
毎日午前1時に更新
```
root # exit
$
```

rootの`crontab`に入れることでsudoしないといけないのを回避．

## おまけ
### piholeのポート変更
piholeの設定ファイルは`/etc/pihole/pihole.toml`にある．
```
$ cat /etc/pihole/pihole.toml |grep 'port ='
  port = 53
  DBimport = true
  port = "80o,443os,[::]:80o,[::]:443os"
$ 
```
このポート`port = "80o,443os,[::]:80o,[::]:443os"`を変更することで(特にウェブページのポートを変更したい場合)開放するポートを変更できる．
設定が終わったらpiholeを再起動する．
```
sudo service pihole-FTL restart
# もしくは
sudo systemctl restart pihole-FTL.service
```

### adblock するリストを追加する
適当に検索すると色々出てくるが，とりあえずここだけ追加すればいい


[悪いインターネット](https://warui.intaa.net/adhosts/)