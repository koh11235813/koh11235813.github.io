# ライセンス調査記録

- 調査日: 2026-08-31
- 対象: koh11235813/koh11235813.github.io (PUBLIC, Jekyll + jekyll-theme-chirpy 7.5.0)
- 目的: LICENSE 不在の是正と、依存物のライセンス条件の確認

---

## 1. 調査前の状態

### LICENSE ファイル

存在しない。`git log --all -- LICENSE COPYING NOTICE` も空で、commit 履歴上も一度も無かった。

### サイト上のライセンス表明（2箇所）

`_includes/footer.html`（Chirpy 純正を上書きした自作版、1行目に `<!-- Custom Footer: CC + MIT License -->`）:

```
© 2026 koh11235813. CC BY 4.0
Source code licensed under the MIT License. Powered by Jekyll & Chirpy.
```

全5記事の末尾（Chirpy の `copyright.license.template` による自動出力）:

```
この投稿は投稿者によって CC BY 4.0 の下でライセンスされています。
```

`_posts/` の frontmatter にライセンス指定は無い（`title` / `date` / `author` / `layout` / `categories` のみ）。
author は `kinoko1943` が4本、`koh11235813` が1本で不統一。

### 問題の構造

宣言はあるが根拠ファイルが無い。GitHub 公式ドキュメント:

> If you don't include a license, the default copyright laws apply, meaning that you retain
> all rights to your source code and no one may reproduce, distribute, or create derivative
> works from your work.
> (https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)

choosealicense.com/no-permission/:

> the work is under exclusive copyright by default. Unless you include a license that
> specifies otherwise, nobody else can copy, distribute, or modify your work without being
> at risk of take-downs, shake-downs, or litigation.

GitHub ToS D.5（https://docs.github.com/en/site-policy/github-terms/github-terms-of-service）で
public repo に付与されるのは「GitHub 内での閲覧と fork」のみ。それ以上の許諾は LICENSE が要る。

---

## 2. 中核的な問題: Chirpy の MIT 通知保持義務の未充足

テーマは gem 利用（`_config.yml: theme: jekyll-theme-chirpy`、`Gemfile: "~> 7.3"`、
`Gemfile.lock: 7.5.0`、`vendor/bundle/` は gitignore 済み）だが、
gem からコピー・改変したファイルが repo に直接コミットされている。

`vendor/bundle/ruby/3.3.0/gems/jekyll-theme-chirpy-7.5.0/` との差分で確認した該当ファイル:

| ファイル | ローカル / gem の行数 |
|---|---|
| `_includes/footer.html` | 25 / 49 |
| `_includes/favicons.html` | 8 / 14 |
| `_includes/js-selector.html` | 89 / 86 |
| `_includes/sidebar.html` | 40 / 105 |
| `_includes/topbar.html` | 93 / 77 |
| `_layouts/default.html` | 88 / 86 |
| `_layouts/home.html` | 28 / 140 |
| `_sass/abstracts/_variables.scss` | 4 / 30 |
| `_sass/themes/_dark.scss` | 303 / 303（色値のみ変更） |
| `_sass/themes/_light.scss` | 309 / 309 |
| `assets/css/jekyll-theme-chirpy.scss` | 149 / 11（大幅拡張） |
| `_data/origin/cors.yml` | 54 / 54 |

合計 1,200 行超。オリジナルは `assets/js/aside-toggle.js` と `assets/img/**` のみ。

gem の LICENSE（`vendor/bundle/.../jekyll-theme-chirpy-7.5.0/LICENSE`）:

> The MIT License (MIT)
> Copyright (c) 2019 Cotes Chung

MIT の唯一の条件（https://raw.githubusercontent.com/cotes2020/jekyll-theme-chirpy/master/LICENSE）:

> The above copyright notice and this permission notice shall be included in all copies
> or **substantial portions** of the Software.

1,200 行超のコピーは substantial portion とみなすのが自然。
それが public repo で再配布されているのに `Copyright (c) 2019 Cotes Chung` の表示が
repo のどこにも無かった。footer の「Chirpy」リンクは credit であり、
MIT が要求する著作権表示＋許諾文の全文ではない。

なお **Chirpy 側に footer credit を必須とする記述は一次情報上存在しない**。
README の License 節は "This project is licensed under the [MIT License]" のみ。
wiki の raw エンドポイントは全て空を返した。credit 表示の削除自体は MIT 上許される。
要求されているのは通知の保持のほう。

---

## 3. 依存物のライセンス（一次情報で確認）

### Jekyll 本体

https://raw.githubusercontent.com/jekyll/jekyll/master/LICENSE

> The MIT License (MIT)
> Copyright (c) 2008-present Tom Preston-Werner and Jekyll contributors

MIT の条件は「the Software のコピーまたは実質的部分」への通知添付。
`jekyll build` が出力する HTML/CSS は Jekyll の Ruby ソースのコピーではないため、
**gem でビルドするだけなら on-site の attribution 義務は発生しない**。
「Powered by Jekyll」表記は任意。

### CDN 経由の第三者ライブラリ（`_data/origin/cors.yml`）

| ライブラリ | ライセンス |
|---|---|
| Bootstrap 5 | MIT (Copyright (c) 2011-2026 The Bootstrap Authors) |
| Mermaid 11 | MIT (Copyright (c) 2014-2022 Knut Sveidqvist) |
| Day.js 1 | MIT (Copyright (c) 2018-present, iamkun) |
| Tocbot 4 | MIT (Copyright (c) 2016 Tim Scanlin) |
| clipboard.js 2 | MIT (Copyright (c) Zeno Rocha) |
| GLightbox 3 | MIT (Copyright (c) 2018 Biati Digital) |
| loading-attribute-polyfill 2 | MIT (Copyright (c) 2019 Maximilian Franzke) |
| MathJax 4 | Apache License 2.0 |
| Font Awesome Free 7 | 三重（アイコン CC BY 4.0 / フォント SIL OFL 1.1 / コード MIT） |
| Simple-Jekyll-Search 1 | MIT（npm メタデータのみ。repo に LICENSE ファイル無し。未確定） |
| Google Fonts (Noto Sans JP 等) | SIL OFL 1.1（未検証） |

Font Awesome は attribution が必須だが、公式 LICENSE.txt がこう明記している。

> Downloaded Font Awesome Free files already contain embedded comments with sufficient
> attribution, so you shouldn't need to do anything additional when using these files
> normally.
> (https://raw.githubusercontent.com/FortAwesome/Font-Awesome/7.x/LICENSE.txt)

CDN から無改変で読む限り充足済み。
MathJax の Apache-2.0 は再配布時のみ NOTICE 要件が生じるため今回は対象外。

---

## 4. 記事本文のライセンス選択

choosealicense.com/non-software/:

> CC0-1.0, CC-BY-4.0, and CC-BY-SA-4.0 are open licenses used for non-software material
> ranging from datasets to videos.

Creative Commons はソフトウェアへの CC 適用を明確に非推奨としているため、
コードと記事でライセンスを分けるのが標準的な構成。

| ライセンス | 特性 | ブログ記事での評価 |
|---|---|---|
| CC BY 4.0 | 帰属表示のみ要求 | 到達範囲が最大。Chirpy のデフォルト（`_data/locales/*.yml` の `name: CC BY 4.0`） |
| CC BY-SA 4.0 | 派生物にも同ライセンス | 再利用のハードルが上がる |
| CC BY-NC 4.0 | 商用利用禁止 | 「非商用」の定義が曖昧。open license と見なされず Wikipedia 等で再利用不可 |
| CC0 1.0 | 権利放棄 | 帰属表示すら求めない |

**採用: CC BY 4.0（現状維持）**。理由:

1. footer と全記事末尾ですでに CC BY 4.0 を公に申し出ており、公開済み分は撤回できない。
   今から変更しても効くのは将来の記事のみで、中途半端な状態になる
2. Chirpy のデフォルトと一致し、エコシステムの標準に沿う
3. 技術記事に BY-NC を掛けると、守れる利益（商用転載の阻止）より
   失う利益（引用・翻訳・OER 再利用の萎縮）のほうが大きい

コード側は **MIT**。Chirpy が MIT なので互換性の検討が一切不要になる。

---

## 5. 実施した対応

1. `LICENSE` 新規作成。MIT 全文＋著作権2行
   （`Copyright (c) 2026 koh11235813` / `Portions Copyright (c) 2019 Cotes Chung`）＋
   Chirpy 由来ファイル12件を列挙した注記
2. `LICENSE-CONTENT` 新規作成。記事本文 CC BY 4.0 の適用範囲と正文 URL
3. `README.md` の「基本的にプライベートリポジトリとするつもり」という
   実態（PUBLIC）と矛盾する記述を削除し、ライセンス節に置き換え
4. `_config.yml` の `exclude` に `LICENSE-CONTENT` を追加

### 採らなかった選択肢

- **`NOTICE` を別ファイルに切る**: GitHub のライセンス自動判定から外れ参照されにくくなるため、
  `LICENSE` 内に統合した
- **各ファイル冒頭への著作権ヘッダ挿入**: MIT 上不要。12ファイルへの侵襲が対価に見合わない
- **`_config.yml` の `exclude: LICENSE` を外す**: chirpy-starter の標準 exclude リストのまま。
  LICENSE は repo に置くものであり `docs/` に出力する必要は無い

---

## 免責

これは法的助言ではない。MIT の「substantial portions」該当性の判断は
1,200 行超のコピーという事実に基づく保守的な読みであり、
厳密な結論が必要なら専門家に確認すること。

## 一次情報

- Jekyll LICENSE: https://raw.githubusercontent.com/jekyll/jekyll/master/LICENSE
- Chirpy LICENSE: https://raw.githubusercontent.com/cotes2020/jekyll-theme-chirpy/master/LICENSE
- Chirpy README: https://github.com/cotes2020/jekyll-theme-chirpy/blob/master/README.md
- choosealicense.com: https://choosealicense.com/
- non-software: https://choosealicense.com/non-software/
- no-permission: https://choosealicense.com/no-permission/
- GitHub ToS: https://docs.github.com/en/site-policy/github-terms/github-terms-of-service
- Licensing a repository: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository
- CC licenses: https://creativecommons.org/share-your-work/cclicenses/
- Font Awesome LICENSE: https://raw.githubusercontent.com/FortAwesome/Font-Awesome/7.x/LICENSE.txt
