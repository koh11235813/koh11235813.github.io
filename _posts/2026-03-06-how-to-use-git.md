---
title: gitの使い方とか
date: 2026-03-06 00:00:00 +0900
author: koh11235813
layout: post
toc: true
comments: false
categories: [git,shell]
---


## まずgitとは？

> Git（ギット<small>[[2]](https://www.youtube.com/watch?v=4XpnKHJAok8&t=90s)[[3]](https://e-words.jp/w/Git.html)[[4]](https://www.idcf.jp/words/git.html)[[5]](https://books.google.co.jp/books/about/%E5%85%A5%E9%96%80Git_%E3%82%AE%E3%83%83%E3%83%88.html?id=N2bQLbQRO6wC&redir_esc=y)</small>）は、プログラムのソースコードなどの変更履歴を記録・追跡するための分散型バージョン管理システムである。Linuxカーネルのソースコード管理に用いるためにリーナス・トーバルズによって開発され、それ以降ほかの多くのプロジェクトで採用されている。Linuxカーネルのような巨大プロジェクトにも対応できるように、動作速度に重点が置かれている。現在のメンテナは濱野純 (英語: Junio C Hamano) で、2005年7月から担当している。
>
> Gitでは、各ユーザのワーキングディレクトリに、全履歴を含んだリポジトリの完全な複製が作られる。したがって、ネットワークにアクセスできないなどの理由で中心リポジトリにアクセスできない環境でも、履歴の調査や変更の記録といったほとんどの作業を行うことができる。これが「分散型」と呼ばれる理由である。
>
> 2025年、SCM市場で87%のシェアを占めている<small>[[6]](https://japan.zdnet.com/article/35231917/2/)</small>。
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
-rw-r--r--  1 kinoko kinoko  383 Feb 28 21:58  run_koh.py
-rw-r--r--  1 kinoko kinoko  330 Mar  1 21:59  run_latest.py
-rw-r--r--  1 kinoko kinoko  341 Feb 22 09:58  run.py
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

コミットには前回との差分が保存されています。コミットには必ずコミットメッセージというコメントをつける必要があります。

![commit](/assets/img/git-practice-repo.png)

基本的には コードを書く→コミットをする を繰り返します。

実際に作業中のファイル群をワーキングツリーと呼びます。
リポジトリにコミットしたいファイルは、まずステージ(Stage)に移動させなければなりません。作業中のディレクトリからステージに移動することを「ステージング」と呼び、`git add <ステージに移動したいファイル>` で移動できます。

![working tree](/assets/img/git-practice-working-tree.png)

つまりコミットを行なうと、ステージ領域に入っているファイルの変更履歴が残されます。変更履歴を残したくないファイルはステージに移動させなければ良いのです。

### リポジトリの作成

任意の場所に新しいディレクトリを作成します。
ターミナル上で`mkdir`を使用して作成してもいいですし、もちろんエクスプローラーやFinderで作成してもOK。

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

`git diff`では差分を確認できます。
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

ブランチの変更を他のブランチに統合することをマージ(merge)といいます。下の図で矢印の先が別のブランチを指しているものはマージを行なっています。

![branch merge](/assets/img/git-practice-git-branch-merge.png)

#### ブランチを分ける意味
- 複数の作業を並列して進めることができます。
- ブランチ名を予め決めておいたルールに沿って命名することで作業内容がわかりやすくなります。

### コンフリクト (Conflict)

マージの際に、同じファイルの同じ場所に両方のブランチで修正が行われていた場合に、コンフリクト(Conflict、衝突)が発生する。

Gitがどちらのブランチの変更箇所が正しいのか判断できないため、作業者が修正する必要がある。

![Conflict](/assets/img/git-practice-merge-conflict.png)

#### コンフリクトを発生させてみましょう！

`git branch <ブランチ名>`で現在のブランチから新しくブランチを作成します。ここでは、`git branch huga`でブランチ「huga」を作成しています。

`git checkout <ブランチ名>`でブランチを切り替えます。

テキストファイルの内容を変更します。

![just a little](/assets/img/git-practice-a-little.png)

`add`, `commit`を行います。

`git checkout main`でmainブランチへ戻ります。

ちなみに、この時点でhugaブランチをマージするとテキストファイルの内容はhugaブランチの内容になります。

mainブランチで、hugaブランチで変更した場所と同じ場所を変更してみます。画像では、「Gitなにもわからない」に書き換えています。

![I dont know](/assets/img/git-practice-i-dont-know.png)

`git merge huga`でhugaブランチをマージします。

#### コンフリクト発生！

マージに失敗したので直してコミットしろと言われます。

テキストファイルにはなにやら追記がされています。

![merge](/assets/img/git-practice-merge.png)

作業者が修正する必要があります。該当部分を修正して、`add`, `commit`します。

![fix conflict](/assets/img/git-practice-fix-conflict.png)

ログを見ると、hugaブランチのコミットも含まれています。

`git log --graph` でグラフ表示をしてみましょう。

( `git log --graph --oneline` でコミットを1行にしてグラフ表示できます。)

枝分かれしてたブランチがmainブランチに統合されているのが確認できます。hugaブランチは消えているわけではないことに注意が必要です。(またhugaブランチで作業して同じようにマージすることもできる)

![git log --graph](/assets/img/git-practice-log-graph.png)

何がいけなかったか？→ 同じファイルの修正

- 複数人で作業する時は同じファイルを編集しないようにファイル分割すべき
- 自分だけ触れてる場所なら修正は楽
- 複数人かつブランチで作業量が多い(複数のファイルの複数の箇所を同時編集)ほど深刻


## 4. GitHub

Gitによるバージョン管理する場所をリポジトリと呼びます。

自分1人だけでプログラムを組むならば、リポジトリは自分のPC内だけで問題ありません。しかし、ネットワークを介して別のPCからどこからでも利用したい、または複数人で利用したい場合は、リポジトリをサーバー上に用意する必要があります。

サーバー上にあるリポジトリを「リモートリポジトリ」と呼び、自分のPC内で完結するリポジトリを「ローカルリポジトリ」と呼びます。

![remote repository](/assets/img/git-practice-remote-repository.png)

自前のサーバー上にリモートリポジトリを構築するには知識が要り、サーバー管理も必要です。ありがたいことに、GitHub、Bitbucket, GitLabなどリモートリポジトリを提供するサービスが存在します。

今回はGitHubを使います。

### GitHubとは

- 開発者のためのプラットフォーム
- 世界中の人々の優れたコードが公開されていて、 コミュニケーションをとれる

利点
issue、PullRequest、Projects等の機能によりチーム開発がしやすい
リポジトリを公開してればポートフォリオになる (GitHub選考など)
github.ioによる静的サイトの公開が可能

### CloneとPushとPull

#### Clone

`git clone <リモートリポジトリ>`: リモートリポジトリを複製して新しくローカルリポジトリとして作成できます。新しいマシンで作業する時に使います。

#### Push

`git push`: リモートリポジトリにローカルリポジトリの変更履歴をアップロードすることを指します。

#### Pull

`git pull`: リモートリポジトリからローカルリポジトリに変更履歴をダウンロードして取り込みます。


### リモートリポジトリの作成

![new repository](/assets/img/git-practice-new-repository.png)

![create repository](/assets/img/git-practice-create-new-repository.png)

![setup repository](/assets/img/git-practice-setup-remote-repository.png)

#### 最初のpushまで

先ほどまで使用していたディレクトリで行います。[画像の一番下のコマンド(...or push an existing repository from the command line)](#リモートリポジトリの作成)を順に打ち込んでいきます。

![git remote add](/assets/img/git-practice-git-remote-add.png)

途中でユーザー名とパスワードを聞かれていますが、この認証はOSによって異なります。
Windowsの場合はブラウザで認証できるはずです。

アップロードが終わってブラウザをリロードすると以下のようなページになっているはずです。

![git remote repository](/assets/img/git-practice-git-remote-repository.png)

### コマンド解説

`git branch -M main`: 現在のブランチ名をmainブランチに強制変更

`git remote add origin https://github.com/koh11235813/git-practice.git`: リモートリポジトリの追加、originという名前でURLの場所がリモートリポジトリとして追加される。

`git push -u origin main` :

`git push origin main`はmainブランチをoriginにpushするコマンド
`-u`オプションは上流ブランチ(upstream)を設定するオプション

リモートにあるブランチのことを上流ブランチ(upstream)と呼ぶ。

ローカルブランチが更新を追いかけるリモートブランチのこと

今回の場合、以降はmainブランチ内で `git push`だけでローカルのmainブランチをリモートのmainブランチにpushできるが、本来は `git push origin <リモートブランチ名>`

`git remote -v`: 設定されているリモートリポジトリのURLを参照できる。

### GitHubを使ってみる

`README.md` を適当に追加して、add、commitします。

`git push origin main`

originのmainブランチに現在のブランチをpush

リモートのmainブランチはローカルのmainブランチの上流ブランチなので `git push`でも同じ

![git push](/assets/img/git-practice-readme.png)

GitHubのリモートリポジトリに変更が反映されます。

![git remote view](/assets/img/git-practice-remote-view.png)

README.mdなどのテキストファイルはGitHub上で編集できます。リポジトリのREADME.mdの右上にあるペンマークをクリックして編集します。

![readme edit](/assets/img/git-practice-readme-edit.png)

右上の`Commit changes...`をクリックするとコミットメッセージを入力できるダイアログが表示されます。

![remote commit](/assets/img/git-practice-remote-commit.png)

このようにWebブラウザ上からでも編集できます。

![remote changed](/assets/img/git-practice-remote-changed.png)

ローカルリポジトリにリモートリポジトリの変更を持って来てみましょう。 `git pull origin main`を実行して、originのmainブランチの変更を現在のブランチに反映しましょう。ログを確認すると、GitHub上で変更したリモートリポジトリの内容がローカルリポジトリに取り込まれていることがわかります。(`git push`と同じように`git pull`をmainブランチ上で行った場合も`git pull origin main`と同じ意味を持ちます。)

![git pull](/assets/img/git-practice-git-pull.png)

### PullRequest

- リモートリポジトリのブランチを別のブランチにmergeする要求を送ることができます。
- 変更箇所、コミット履歴の表示
- 複数人で開発しているときに、ソースコードに関するコミュニケーションが発生します。
- コードレビューを必須にし、一定の承認が無いとマージ出来ないような設定にできます。

画像は卒研のリポジトリでGPGPUサポートを行った時のPullRequestです。

![pull request](/assets/img/git-practice-pull-request.png)

### Issue

- プロジェクトのバグ、機能追加、要望、問題点等について発言する場所
- issueに基づいてブランチを切ったりする、タスク管理としての運用

![issue](/assets/img/git-practice-issue.png)

### Contribution

- GitHubの機能を使うと、Contributionが増えます。

    masterへのコミット

    Issue、Pull requestの作成

    review?

- 毎日作業したくなり、モチベになります
- 日にち毎に合計され、1つでもContributionしていれば緑色になります。

多いほど明るい色

別名「草を生やす」

- 偽装可能
- ハロウィンの日だけ色が変わります

![contribution](/assets/img/git-practice-contribution.png)

### Gitクライアント

コマンドを入力せずにGUI上でGitの操作可能なツール
GitGUI、GitHub Desktop、SourceTree、GitKrakenなど
