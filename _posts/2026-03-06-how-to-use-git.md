---
title: gitの使い方とか
date: 2026-03-05
author: koh11235813
layout: post
categories: [linux,git,shell]
---


# gitの使い方とか

## まずgitとは？

> Git（ギット[2](https://www.youtube.com/watch?v=4XpnKHJAok8&t=90s)[3](https://e-words.jp/w/Git.html)[4](https://www.idcf.jp/words/git.html)[5](https://books.google.co.jp/books/about/%E5%85%A5%E9%96%80Git_%E3%82%AE%E3%83%83%E3%83%88.html?id=N2bQLbQRO6wC&redir_esc=y)）は、プログラムのソースコードなどの変更履歴を記録・追跡するための分散型バージョン管理システムである。Linuxカーネルのソースコード管理に用いるためにリーナス・トーバルズによって開発され、それ以降ほかの多くのプロジェクトで採用されている。Linuxカーネルのような巨大プロジェクトにも対応できるように、動作速度に重点が置かれている。現在のメンテナは濱野純 (英語: Junio C Hamano) で、2005年7月から担当している。
>
> Gitでは、各ユーザのワーキングディレクトリに、全履歴を含んだリポジトリの完全な複製が作られる。したがって、ネットワークにアクセスできないなどの理由で中心リポジトリにアクセスできない環境でも、履歴の調査や変更の記録といったほとんどの作業を行うことができる。これが「分散型」と呼ばれる理由である。
>
> 2025年、SCM市場で87%のシェアを占めている[6](https://japan.zdnet.com/article/35231917/2/)。
<small>[wikipedia](wikipedia.org/wiki/Git)より</small>

バージョン管理システム(Version Control System; eg.vcs)の1つです。
いつ誰がどのファイルをどの場所でどういう目的で作成・変更・削除したかの履歴を残すことができます。
削除したファイルの復元もできます。

複数人で利用するときに最も威力を発揮しますが、個人で利用しても便利なソフトウェアです。

`run.py`というファイルを編集しているとします。

```
total 28
drwxr-xr-x  2 kinoko kinoko 4096 Mar  5 22:05  ./
drwxr-xr-x 25 kinoko kinoko 4096 Mar  5 21:57  ../
-rw-r--r--  1 kinoko kinoko  352 Mar  1 21:58  run_copy.py
-rw-r--r--  1 kinoko kinoko  383 Fed 28 21:58  run_koh.py
-rw-r--r--  1 kinoko kinoko  330 Mar  1 21:59  run_latest.py
-rw-r--r--  1 kinoko kinoko  341 Fed 22 09:58  run.py
-rw-r--r--  1 kinoko kinoko  351 Mar  2 22:04  run_最新版.py
-rw-r--r--  1 kinoko kinoko  347 Mar  5 21:35 'run_最新版 - コピー(2).py'
-rw-r--r--  1 kinoko kinoko  319 Mar  5 22:04 'run_最新版 - コピー.py'
```

どれが本当の最新版でしょうか。

複数人で作業している場合や人に見せないといけない場合は
- どれが本当の最新版かわからない
- コードのどの部分を誰が変更したのかわからない
- 他の人の修正箇所を上書きしてなかったことにしてしまう

これらの問題を解決するためのソフトウェアがGitです。(あるいはvcsとよばれるソフトウェア群)

## 0. 準備

[github.com](https://github.com/)でアカウントを作成してください。既にアカウントを持っている場合はしなくて大丈夫です。

## 1. インストール

[git-scm.com](https://git-scm.com/)からダウンロードしてインストール。
インストールはデフォルトの状態でNext連打で大丈夫です。

`winget`を使用する場合はターミナルで

```sh
winget install Git.Git
```

と入力します。

MacでHome brewを使用する場合はターミナルで

```sh
brew install git
```

と入力します。

GNU/Linuxを使用している場合はそのOSのパッケージマネージャーを使用してください。
参考: [git-scm.com/install/linux](https://git-scm.com/install/linux)

### 動作確認

ターミナルを開いて

```sh
git --version
```

と入力して、正常にインストールされているか確認します。

期待される出力の例

```sh
$ git --version
git version 2.53.0
```

### 設定

Gitにユーザー名とメールアドレスを登録します。
Githubにpushしたときに**全世界に公開**されるので、公開されても構わないユーザー名とメールアドレスに設定します。

```sh
git config --global user.name "ユーザー名"
git config --global user.email "メールアドレス"

# example
git config --global user.name "koh11235813"
git config --global user.email "gh@kinoko1943.org"
```

公開されても問題ないメールアドレスを持っていない場合は
[github.com/settings/emails](https://github.com/settings/emails) を開き
![Keep my email addresses private](/assets/img/Keep-my-email-addresses-private.png)
画像の場所を見つけてKeep my email addresses private にチェックを入れ、ここに表示されているメールアドレスを設定します。画像の場合だと、`77713907+koh11235813@users.noreply.github.com`となります。

## 2. 基本操作

Gitがバージョン管理下に置く場所をリポジトリ(repository)と呼びます。
ユーザーが変更の履歴を記録する作業をコミット(commit)と呼びます。
コミットには前回との差分が保存されています。コミットには必ずコミットメッセージを言うコメントをつける必要があります。

基本的には コードを書く→コミットをする を繰り返します。

実際に作業中のファイル群をワーキングツリーと呼びます。
リポジトリにコミットしたいファイルは、まずステージ(Stage)に移動させなければなりません。作業中のディレクトリからステージに移動することを「ステージング」と呼び、`git add <ステージに移動したいファイル>` で移動できます。

つまりコミットを行なうと、ステージ領域に入っているファイルの変更履歴が残されます。変更履歴を残したくないファイルはステージに移動させなければ良いのです。

### リポジトリの作成

任意の場所に新しいディレクトリを作成します。
ターミナル上で`mkdir`を使用して作成してもいいですし、もちろんエクスプローラーやFinderで作成してもOK!
![mkdir git-practice](/assets/img/git-practice-mkdir.png)

ターミナルを開いて`cd`コマンドで作成したディレクトリに移動し、`git init`を実行。
![git init](/assets/img/git-practice-git-init.png)
`.git`という隠しディレクトリが生成されます。
これでローカルリポジトリの作成完了です。

### コミット

`.git`と同じ階層にテキストファイルを作成します。
ここでは、`hoge.txt`を作成します。`hoge.txt`には任意のなにかを書き込みます。(例: Hello Git!, hogehoge fugafuga)
`git status`を実行して、現在の状態を確認します。

```sh
$ git status
```

![git status unstaged](/assets/img/git-practice-git-unstaged.png)

`On branch main`
現在のブランチが`main`ブランチであることを示しています。

`Untracked files`
下の赤字のファイルがステージに移動されていないことを示しています。

`git add hoge.txt`を実行して、`hoge.txt`をステージに追加
`git status`を再度実行して、変化を見てみましょう。

```sh
$ git status
```

![git status staged](/assets/img/git-practice-git-staged.png)

`Changes to be committed`の下に`new file: hoge.txt`を確認できます。
ステージに新しく`hoge.txt`が登録されています。

`git commit -m "コミットメッセージ"`を実行して、コミットします。
コミットメッセージではどのような変更をしたかを簡潔に書きます。画像では"initial commit"(初めてのコミット)としています。
コミットしたら、`git status`を実行して変化を見てみましょう。また、`git log`を実行してコミット履歴を表示してみましょう。

![git commit -m "initial commit"](/assets/img/git-practice-initial-commit.png)

`git status`: `nothing to commit, working tree clean` コミットするものはなにもない
`git log`: コミットの履歴を表示

コミットを行ったら、`hoge.txt`を修正してみましょう。
好きな文字列を追加してもらって構いませんが、例では`Git 完全に理解した`と追記しています。
追記したら、`git status`を確認してみましょう。

![git diff](/assets/img/git-practice-git-diff.png)

`Changes not staged for commit`: 変更されたファイルがあり、ステージされていない。
`modified:   hoge.txt`: `hoge.txt`が変更されている。

`git diff`では差分を確認できます。。
`+Git 完全に理解した`: 追加された行。先頭に`+`が追加、`-`が削除された行。

再びコミットを行ってみましょう
`git add <ファイル名>`: ステージに移動
`git commit -m "コミットメッセージ"`: コミット
`git status`: 確認
`git log`: 今までのコミットを表示

![git commit -m "add content"](/assets/img/git-practice-add-content.png)

基本は何か作業→add→commit(→push)を繰り返します．

## 3. ブランチ

ブランチとは、履歴の流れを分岐して記録するためのものです。

あるコミットから枝分かれして、新しくコミットしていきます。
分岐したブランチは他のブランチの影響を受けないため、同じリポジトリ内で複数の変更を同時に進めていくことができます。

![branch figure](/assets/img/git-practice-git-branch-fig.png)
