---
title: Wireplumber下でオーディオルーティング
date: 2025-08-17
author: kinoko1943
layout: post
categories: [linux]
---

> コミックマーケットC106でとよぎぃそふとへ寄稿した記事です．
> 一部間違いがあり，頒布したものと変更点があります．

# pipewire/wireplumberを使用したオーディオリンク
## はじめに
はじめまして，B4のkinokoです．この記事ではlinuxディストリビューションでよく使用されるオーディオシステムであるwireplumber/pipewireの音声出力リンク構築方法について書きます．

本記事はオーディオ出力設定ファイルを変更するので，設定を間違えると途中で音が出力されなくなったり，音声入出力デバイスが消えたりします．自己責任で変更を行ってください．

## 動作環境
- pipewire 1:1.4.x
- wireplumber 0.5.x

基本的にディストリビューションの差はないと思います．検証環境にはArch Linuxを使用しました．
[wireplumberの設定ファイルの書き方が 0.4.xと 0.5.xでは異なります](https://pipewire.pages.freedesktop.org/wireplumber/daemon/configuration/migration.html#config-migration)．

## 動機
linuxでobsを利用した画面録画をする際にデフォルトだと，出力を全てキャプチャしてしまう(デフォルト出力sinkしか存在しない)ため個別に専用の仮想出力を作成して録画を見返したときに邪魔な音が入らないようにしたかったからです．

## 実装
今回はsystemdのtimerをトリガーとした方式とwireplumberのLua APIを使用した方式で実装します．

両方の方式でpipewireの仮想出力を設定する必要があります．

デフォルトの出力で出力を行っても問題はありませんが，単純に出力音量が2倍になりますし，肝心の**個別に出力させたいという目的**が達成できないため，仮想出力を新規で作成することをおすすめします．

仮想出力はpipewireの設定ファイル，
`~/.config/pipewire/pipewire.conf.d/`に書き込んだあと，再起動を行うことで，設定が読み込まれます．
また，ログアウト&ログイン もしくは，`systemctl --user restart wireplumber`でも読み込まれます．
`10-null-sink.conf`は，gitlabの[pipewireの設定例](https://gitlab.freedesktop.org/pipewire/pipewire/-/wikis/Virtual-Devices#single-nodes)そのままです．
```conf
context.objects = [
    {   factory = adapter
        args = {
            factory.name     = support.null-audio-sink
            node.name        = "my-sink"
            media.class      = Audio/Sink
            audio.position   = [ FL FR ]
            monitor.channel-volumes = true
            monitor.passthrough = true
            adapter.auto-port-config = {
                mode = dsp
                monitor = true
                position = preserve
            }
        }
    }
]
```

### リンクの確認方法
各ノードのリンクがどのようになっているかを知るためには，`pw-link -l`または`pw-top`を使用します．
```sh
$ pw-link -l
my-sink:playback_FL
  |<- ALSA plug-in [osu!]:output_FL
my-sink:playback_FR
  |<- ALSA plug-in [osu!]:output_FR
upmix-5.1-sink:playback_FL
  |<- ALSA plug-in [osu!]:output_FL
upmix-5.1-sink:playback_FR
  |<- ALSA plug-in [osu!]:output_FR
my-sink-2:playback_FL
  |<- ALSA plug-in [osu!]:output_FL
my-sink-2:playback_FR
  |<- ALSA plug-in [osu!]:output_FR
alsa_output.usb-Yamaha_Corporation_Yamaha_AG03MK2-00.analog-stereo:playback_FL
  |<- ALSA plug-in [osu!]:output_FL
alsa_output.usb-Yamaha_Corporation_Yamaha_AG03MK2-00.analog-stereo:playback_FR
  |<- ALSA plug-in [osu!]:output_FR
ALSA plug-in [osu!]:output_FL
  |-> alsa_output.usb-Yamaha_Corporation_Yamaha_AG03MK2-00.analog-stereo:playback_FL
  |-> my-sink:playback_FL
  |-> upmix-5.1-sink:playback_FL
  |-> my-sink-2:playback_FL
ALSA plug-in [osu!]:output_FR
  |-> alsa_output.usb-Yamaha_Corporation_Yamaha_AG03MK2-00.analog-stereo:playback_FR
  |-> my-sink:playback_FR
  |-> upmix-5.1-sink:playback_FR
  |-> my-sink-2:playback_FR
```

```sh
$ pw-top
```
![実行結果image][pw-link.png]

### systemdによる実装
前もって設定しておいた**アプリケーション名が含まれる音声ノード**を検知した際，自動で`pw-link`コマンドを打たせることで，仮想出力には設定されたアプリケーションからの音声だけを出力させます．


わからない場合は`top`などを使って探してください．

#### スクリプトの作成
監視をするスクリプトと`pw-link`を実行するスクリプトを分けて作成します．少なくとも，これらは分けずとも動作することを確認しています．



```
#!/bin/bash

# アプリケーション名
APP_NAME=""

# リンク先の出力ノード名（物理デバイスまたは仮想デバイス）
TARGET_NODE="my-sink"

# ノード情報を検索
while :; do
    NODE_ID=$(pw-cli list-objects | grep "node.name" | grep "$APP_NAME" | awk '{print$3}' | sed 's/"//g')
    if [[ -n "$NODE_ID" ]]; then
        echo "Audio node found: $NODE_ID"
        break
    fi
    sleep 1
done

# pw-link でリンクを作成
echo "Linking node $NODE_ID to $TARGET_NODE..."
pw-link "$NODE_ID" "$TARGET_NODE"

# debug output
echo pw-link "$NODE_ID" "$TARGET_NODE" 
```

`link-audio`内で，`pw-cli list-objects | grep ...`としている部分は，一度ターミナル上でも実行してみることをおすすめします．実行した結果が，目的のオーディオノード名になっていることを確認してください．

その後，スクリプトに実行許可を与えます．

```sh
$ chmod 755 $HOME/.config/systemd/user/watch-proc.sh
$ chmod 755 $HOME/.config/systemd/user/link-audio.sh
```

#### systemd ユニットファイルの作成
ユニットファイルを作成します．今回は，GUIターゲットのため，基本的に，ユーザー権限で動作させたほうが良いでしょう．

```
[Unit]
Description=Watch process and start pwlink
After=network.target pipewire.service pipewire-pulse.service

[Service]
ExecStart=%h/.config/systemd/user/scripts/watch-proc.sh
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=default.target
```

ユニットファイルの作成後，以下のようにコマンドを打って，サービスを有効化・起動します．

```sh
$ systemctl --user daemon-reload
$ systemctl --user enable --now watch-proc.service
```
何かエラーが出ている場合は，`journalctl`や`systemctl --user status`などを見て確認してください．


### wireplumberのLuaスクリプトで実装する
wireplumberは0.5.xから設定の書き方が変更され，[ユーザー設定の場所も変更されました](https://pipewire.pages.freedesktop.org/wireplumber/daemon/configuration/migration.html)．設定ファイルは，`~/.config/wireplumber/wireplumber.conf.d`，スクリプトは，`~/.local/share/wireplumber/scripts`に[配置します](https://pipewire.pages.freedesktop.org/wireplumber/daemon/locations.html)．

まずはスクリプトを読みこませる[設定ファイルを作成します](https://pipewire.pages.freedesktop.org/wireplumber/scripting/custom_scripts.html)．
```conf
wireplumber.components = [
    {
        name = "90-hello-world.lua", type = script/lua
        provides = hello-world
    }
    {
        name = "51-example.lua", type = script/lua
        provides = custom-policy
    }
]

wireplumber.profiles = {
    main = {
        hello-world = required
        custom-policy = required
    }
}
```

スクリプトを作成します．今回は，例として，Firefoxをmy-sinkにリンクさせています．
```
SimpleEventHook {
    name = "linking/auto-link-hook",
    interests = {
        EventInterest {
        Constraint { "event.type", "=", "session-item-added" },
        Constraint { "event.session-item.interface", "=", "linkable" },
        },
    },
    execute = function(event)
        local si = event:get_subject()
        local source = event:get_source()
        local om = source:call("get-object-manager", "session-item")
        local si_props = si.properties

        -- ターゲットノードにマッチするかチェック
        if si_props["node.name"] == "Firefox" then
        -- リンク作成を少しだけ遅延させる (レースコンディション回避)
        Core.timeout_add(1000, function()
            -- ターゲットノードを検索
            local target_node = om:lookup {
                type = "SiLinkable",
                Constraint { "node.name", "equals", "my-sink" },
            }

            if not target_node then
                print("One or more target sinks not found. Cannot link.")
                return
            end
            
            -- リンク作成のヘルパー関数
            local function create_and_activate_link(source_si, target_si, link_name, passthrough_enabled)
                local new_link = SessionItem("si-standard-link")
                if new_link:configure({
                    ["out.item"] = source_si,
                    ["in.item"] = target_si,
                    ["passthrough"] = passthrough_enabled,
                    ["out.item.port.context"] = "output",
                    ["in.item.port.context"] = "input",
                    ["link.name"] = link_name,
                }) then
                    new_link:register()
                    new_link:activate(Feature.SessionItem.ACTIVE)
                    print("Successfully created and activated link " .. tostring(link_name) .. "!")
                else
                    print("Failed to configure link to " .. tostring(link_name) .. ".")
                end
            end

            -- リンクを作成:  -> my-sink
            create_and_activate_link(si, target_node, "my-sink", false)
            
        end) -- Core.timeout_addの終わり
        end
    end
}:register()
```
このスクリプトは，オーディオセッションが追加されるたびに呼び出され，`if si_props["node.name"] == "Firefox" then`で目的のノードが存在するセッションかどうかを判定します．次に，仮想出力が存在するかを確認した後，`create_and_activate_link`関数でノード同士をリンクさせています．

すべて終わったら，再起動を行うことで，設定が読み込まれます．
こちらも，ログアウト&ログイン もしくは，`systemctl --user restart wireplumber`でも読み込まれます．



### その他，設定・小技
#### wireplumberで普段使用しない出力を消す
普段使用しない音声出力(物理)は，もしその出力が選択されてしまった場合に，混乱の原因になるため，デフォルトで出力の存在を消します．

まずは消したい出力の名前を調べます．
```sh
$ wpctl status
PipeWire 'pipewire-0' [1.4.6, kinoko@archlinux, cookie:3553775109]
 └─ Clients:
        38. xdg-desktop-portal-hyprland         [1.4.6, kinoko@archlinux, pid:1679]
        62. pipewire                            [1.4.6, kinoko@archlinux, pid:1825]
        69. WirePlumber                         [1.4.6, kinoko@archlinux, pid:1777145]
        80. WirePlumber [export]                [1.4.6, kinoko@archlinux, pid:1777145]
        83. Chromium input                      [1.4.6, kinoko@archlinux, pid:2313]
        84. WEBRTC VoiceEngine                  [1.4.6, kinoko@archlinux, pid:2202]
        85. WEBRTC VoiceEngine                  [1.4.6, kinoko@archlinux, pid:2202]
        86. Steam Voice Settings                [1.4.6, kinoko@archlinux, pid:2052]
        87. Chromium input                      [1.4.6, kinoko@archlinux, pid:2588]
        89. Firefox                             [1.4.6, kinoko@archlinux, pid:23232]
        91. Firefox                             [1.4.6, kinoko@archlinux, pid:23232]
        94. Steam                               [1.4.6, kinoko@archlinux, pid:2052]
       106. wpctl                               [1.4.6, kinoko@archlinux, pid:1777470]

Audio
 ├─ Devices:
 │      65. HDA ATI HDMI                        [alsa]
 │      88. Built-in Audio                      [alsa]
 │      92. Yamaha AG03MK2                      [alsa]
 │  
 ├─ Sinks:
 │      31. (null)                              [vol: 1.00]
 │      33. (null)                              [vol: 1.00]
 │      35. (null)                              [vol: 1.00]
 │      43. HDA ATI HDMI Digital Stereo (HDMI 2) [vol: 0.40]
 │      66. Built-in Audio Digital Stereo (IEC958) [vol: 0.40]
 │  *   68. Yamaha AG03MK2 Analog Stereo        [vol: 1.00]
 │  
 ├─ Sources:
 │      70. Built-in Audio Analog Stereo        [vol: 1.00]
 │  *  114. Yamaha AG03MK2 Analog Stereo        [vol: 1.00]
 │  
 ├─ Filters:
 │  
 └─ Streams:

Video
 ├─ Devices:
 │  
 ├─ Sinks:
 │  
 ├─ Sources:
 │  
 ├─ Filters:
 │  
 └─ Streams:

Settings
 └─ Default Configured Devices:
```

上記の出力結果から，消したい出力(43)について調べます．
```sh
$ wpctl inspect 43
id 43, type PipeWire:Interface:Node
    alsa.card = "1"
    alsa.card_name = "HDA ATI HDMI"
    alsa.class = "generic"
    alsa.components = "HDA:1002aa01,00aa0100,00100a00"
    alsa.device = "7"
    alsa.driver_name = "snd_hda_intel"
    alsa.id = "HDMI 1"
    alsa.long_card_name = "HDA ATI HDMI at 0x84aa0000 irq 232"
    alsa.mixer_name = "ATI R6xx HDMI"
    alsa.name = "ZOWIE XL LCD"
    alsa.resolution_bits = "16"
    alsa.subclass = "generic-mix"
    alsa.subdevice = "0"
    alsa.subdevice_name = "subdevice #0"
    alsa.sync.id = "00000000:00000000:00000000:00000000"
    api.alsa.card.longname = "HDA ATI HDMI at 0x84aa0000 irq 232"
    api.alsa.card.name = "HDA ATI HDMI"
    api.alsa.path = "hdmi:1,1"
    api.alsa.pcm.card = "1"
    api.alsa.pcm.stream = "playback"
    audio.channels = "2"
    audio.position = "FL,FR"
    card.profile.device = "7"
  * client.id = "80"
    clock.quantum-limit = "8192"
    device.api = "alsa"
    device.class = "sound"
    device.icon-name = "audio-card-analog"
  * device.id = "65"
    device.profile.description = "Digital Stereo (HDMI 2)"
    device.profile.name = "hdmi-stereo-extra1"
    device.routes = "1"
  * factory.id = "19"
    factory.name = "api.alsa.pcm.sink"
    iec958.codecs = "["PCM"]"
    library.name = "audioconvert/libspa-audioconvert"
  * media.class = "Audio/Sink"
  * node.description = "HDA ATI HDMI Digital Stereo (HDMI 2)"
    node.driver = "true"
    node.loop.name = "data-loop.0"
  * node.name = "alsa_output.pci-0000_03_00.1.hdmi-stereo-extra1"
  * node.nick = "ZOWIE XL LCD"
    node.pause-on-idle = "false"
  * object.path = "alsa:acp:HDMI:7:playback"
  * object.serial = "91632"
    port.group = "playback"
  * priority.driver = "632"
  * priority.session = "632"
```

この中の，`node.name`の`alsa_output.pci-0000_03_00.1`がこのnode.nameです．これを消す設定を書きます．

```
monitor.alsa.rules = [
  {
    matches = [
      {
        node.name = "alsa_card.pci-0000_03_00.1"
      }
    ]
    actions = {
      update-props = {
        node.disabled = true
      }
    }
  }
]
```

この設定で，出力を消すことができます．
```sh
$ wpctl status
...
Audio
 ├─ Devices:
 │      66. Yamaha AG03MK2                      [alsa]
 │      93. Built-in Audio                      [alsa]
 │  
 ├─ Sinks:
 │      31. (null)                              [vol: 1.00]
 │      33. (null)                              [vol: 1.00]
 │      35. (null)                              [vol: 1.00]
 │  *   40. Yamaha AG03MK2 Analog Stereo        [vol: 1.00]
 │      67. Built-in Audio Digital Stereo (IEC958) [vol: 0.40]
 │  
 ├─ Sources:
 │  *   63. Yamaha AG03MK2 Analog Stereo        [vol: 1.00]
 │     111. Built-in Audio Analog Stereo        [vol: 1.00]
 ...
```
ここではSinkに対して行ったので，`node.name`を使用しましたが，Devicesに対して行いたい場合は，Devicesの番号に対して`wpctl inspect`して，`device.name`を`device.disabled = true`としましょう．(1敗)
-# ここが変更点です．

#### pipewireのサンプルレートを上げる
[`~/.config/pipewire/pipewire.conf.d/10-rate.conf`のような設定を作成します](https://gitlab.freedesktop.org/pipewire/pipewire/-/wikis/Guide-Rates)．
```
# Adds more common rates
context.properties = {
    default.clock.allowed-rates = [ 44100 48000 88200 96000 192000 ]
}
```

[元の設定ファイル](https://gitlab.freedesktop.org/pipewire/pipewire/-/wikis/Config-PipeWire)のデフォルトサンプルレートを変更することで，サンプルレートを変更します．

```sh
$ ll /usr/share/pipewire/             
total 104
drwxr-xr-x   7 root root  4096 Jul 15 02:34 ./
drwxr-xr-x 207 root root  4096 Jul 19 05:36 ../
-rw-r--r--   1 root root  4538 Jun 27 20:22 client.conf
drwxr-xr-x   2 root root  4096 Jul 15 01:55 client.conf.avail/
drwxr-xr-x   2 root root  4096 Jul 15 02:22 filter-chain/
-rw-r--r--   1 root root  1925 Jun 27 20:22 filter-chain.conf
-rw-r--r--   1 root root  4505 Jun 27 20:22 jack.conf
drwxr-xr-x   2 root root  4096 Jul 15 02:34 media-session.d/
-rw-r--r--   1 root root 16879 Jun 27 20:22 minimal.conf
-rw-r--r--   1 root root  5973 Jun 27 20:22 pipewire-aes67.conf
-rw-r--r--   1 root root  2163 Jun 27 20:22 pipewire-avb.conf
-rw-r--r--   1 root root 14192 Jun 27 20:22 pipewire.conf
drwxr-xr-x   2 root root  4096 Jul 15 01:55 pipewire.conf.avail/
-rw-r--r--   1 root root  6872 Jun 27 20:22 pipewire-pulse.conf
drwxr-xr-x   2 root root  4096 Jul 15 01:55 pipewire-pulse.conf.avail/
```

`pipewire.conf`を`~/.config/pipewire/`へ，コピーして編集します．
```conf
context.properties = {
    ...
    default.clock.rate          = 96000
    default.clock.allowed-rates = [ 44100 48000 88200 96000 196000 ]
    default.clock.quantum       = 2048
    default.clock.min-quantum   = 64
    default.clock.max-quantum   = 16384
    ...
}
```
quantumも上げて余裕を持たせます．


## おわりに
Windowsなら，アプリケーション音声(Beta)を選択すれば済むようなことも，かなり面倒な設定を書かなければ実現することはできません．しかし，この面倒さが，linuxを使用する面白さである，とも感じています．今後も，こういった内部処理の細かな変更を楽しんでいきたいと思います．

ちなみに，私はバージョンごとの設定の書き方，置く場所の違いに特に混乱しました．みなさんもお気をつけください．
