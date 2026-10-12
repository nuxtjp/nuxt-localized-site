# OSSダッシュボードと製品LP

[English](public-showcase.md)

`@nuxtjp/localized-site/showcase`がfeedの型・validator・download集計を所有し、`NuxtJpOssShowcase`が検証した公開dataをslotとCSS変数で描画します。組織siteへのリンクと、同じdataをCoelaテーマで描画する方法の両方に対応します。認証やlive通信、他組織への必須依存は追加しません。

```ts
import { validateShowcaseFeed, summarizeDownloads } from '@nuxtjp/localized-site/showcase'
const feed = validateShowcaseFeed(publicOwnerFeed)
const groups = summarizeDownloads(feed, Date.now())
```

componentに`feed`、`locale`、明示的な`now`を渡します。個別LPには`entry-id`を指定し、route・SEO/head・承認済みcontent・domainは利用siteが所有します。`heading`/`entry` slotと`--showcase-text/background/card/border/accent`でテーマを変更できます。静的紹介に不要なprojection workerや永続storeは接続しません。

playgroundの`/oss`と`/oss/workspace?lang=en`で一覧・ダッシュボード・詳細・製品LP・日英切替・テーマ・未取得/古い統計を確認します。dataは架空でoffline動作します。`pnpm build`の後、`NITRO_HOST=127.0.0.1`と未使用`NITRO_PORT`を指定して`node playground/.output/server/index.mjs`を実行します。

## 公開feedと集計

Schemaは`nuxtjp://showcase/v1`です。日英contentを両方用意し、欠落翻訳・未知field・URL内credential・非公開製品のsource URL・不正date・同じpackage/期間の重複・安全整数を超える合計を拒否します。OSSにはGitHub repoとlicenseを、非公開製品には紹介リンクだけを持たせます。validatorは形の検査であり、公開ownerがrepo公開状態とlicenseのallowlistを別途検証します。URLだけでOSS公開・再配布許諾を証明しません。

registry/package/開始終了日/観測時刻/出典/statusを持つ統計を使います。npm出典はpackageと期間を特定するendpoint、crates.io出典はcrateのdownloads endpointで、collectorが日別観測から指定期間を算出します。異なるregistryと期間は別集計です。未取得は`unavailable`/`null`、実測0は`available`/`0`です。既定鮮度は48時間で、未来の観測も古いものとして除外します。部分集計は未取得/古い件数を表示し、取得済みがないgroupはダッシュ表示です。

取得は各ownerの公開data専用workflowで実施します。user tokenやprivate運用台帳を混ぜず、応答に上限を設けて検証後に書込みます。失敗時の前feedは本来の観測時刻を維持します。承認した静的artifactを配備し、Coelaは同じ公開feedを任意で描画します。各ownerの公開・rollbackにCoelaReleaseを必須にしません。

## 公開・配備前の確認

0.2.0候補は既存のstage公開workflowを維持します。source SHAと`REGISTRY_SECURITY_APPROVED_SHA`、versionとtagの一致が必要です。source/archive確認後にOIDC stageへ進め、npm ownerが該当stageを2FA承認します。CI候補を公開済みとは扱いません。Trusted Publisherのworkflow/environmentを変えず、正式archive確認の後にsite依存更新と既存content/host承認を経て配備します。

## 上限付き公開registry統計取得

`./showcase/collectors` の `collectDownloads(registry, packageName, { start, end }, { now: Date.now() })` でnpmまたはcrates.ioの一つの公開endpointを読みます。管理対象Crowsi transport 0.11.2のHTTPS origin束縛・redirect拒否・128 KiB上限・15秒deadlineを再利用し、同等処理を複製しません。匿名の公開統計なのでcredential/account grantは不要です。純粋UIはcollectorを実行しません。

観測日前に終了した1–31日間のUTC日を指定します。npmのpackage/開始終了日を照合し、crates.ioはversion別とextra日別数を合計して重複・欠落日を拒否します。不正応答・denial・上限超過・timeoutは未取得/nullであり0件ではありません。入力不正は通信前に拒否します。自動retry/paging/pollingはありません。owner workflowがallowlist・request budget/rate・schedule・前feedを管理し、testではfake fetchを注入します。

[crates.io API型の正本](https://github.com/rust-lang/crates.io/blob/main/crates/crates_io_api_types/src/lib.rs)を参照し、実cloud accountの受入とは分けます。
