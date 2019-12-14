Input-cache
==
```
Author : Yugeta.Koji
Date   : 2019.12.12
```
README
- [system](docs/system.md)
- [sample](sample/index.html)

# Summary
- WEBページのinput入力フォームの入力値を保存しておいて、繰り返し入力を簡単にさせるツール
- 個人情報保護の観点から、キャッシュされたデータをクリアできるモードも入れる
- 既存サーバーのデータベースを利用しないシステム
- 使えば使うほど入力が楽になるシステム

# Version
- ver 0.1 : 拡縮機能、同値リスト表示、キャッシュ削除、入力値判定
- ver 0.2 : 回数登録機能、低回数キャッシュ優先削除機能

# Setting
- 保存対象項目 : 値を保存する対象項目
- 発動key項目 : array
- Max登録件数 : 100 (default)
- 起動処理    : function : 起動時のイベント処理

# Howto

# Issue
1. name="mode[]"などのような同一name値の対応（selectorで登録することも可能にする）同一form内で検索される
2. 動的フォームへの対応

# Introduction
```
Name : Yugeta.Koji
Company : MYNT Inc.,
Blog : https://wordpress.ideacompo.com/
Mail : yugeta@myntinc.com
```
