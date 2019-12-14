Input-cache / System
==
```
Author : Yugeta.Koji
Date : 2019.12.14
```
[README](../README.md) > System

# Flow
1. js読み込み時に各種モジュールを読み込みセット(css等)
2. データの確認(cacheデータがnullの場合は、取り込み処理を実行※任意)
3. 対象項目にイベントセット : keyupイベント、blurイベント、任意コマンド、でcacheデータ検索機能を登録
4. cacheデータ検索機能
5. cacheデータがある場合にリスト（レコメンド）表示処理
6. リスト表示をクリックした際の実行処理 : 対象項目に自動入力
7. 