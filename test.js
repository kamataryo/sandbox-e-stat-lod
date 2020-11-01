const fetch = require("isomorphic-fetch");

const endpoint = "http://data.e-stat.go.jp/lod/sparql/alldata/query";
const PREFIXES = `
PREFIX sacs: <http://data.e-stat.go.jp/lod/terms/sacs#>
PREFIX sac: <http://data.e-stat.go.jp/lod/sac/>
PREFIX estat-measure: <http://data.e-stat.go.jp/lod/ontology/measure/>
PREFIX sdmx-dimension: <http://purl.org/linked-data/sdmx/2009/dimension#>
PREFIX cd-code: <http://data.e-stat.go.jp/lod/ontology/crossDomain/code/>
PREFIX rdf: <http://imi.go.jp/ns/core/rdf#>
`;

// predict
// - sacs:latestCode 最新のコードを求める
// - rdf:下位コード（都道府県コード -> 最新の市町村コードを求める）

const query = (prefCode) => {
  const query1 = encodeURIComponent(`${PREFIXES}
    SELECT ?p ?o WHERE {
       sacs:AllArea ?p ?o .
    } LIMIT 1000
  `);
  const url1 = `${endpoint}?query=${query1}`;

  fetch(url1, {
    // [IMPORTANT] 統計LOD のコンテントネゴシエーションのバグに見える
    // Accept ヘッダなしの場合は JSON を返却し、 Accept ヘッダありの場合はその値がなんであっても XML が返却される
    // headers: { Accept: "application/json" },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(
        JSON.stringify(
          data.results.bindings.map((binding) => binding.p.value),
          null,
          2
        ),
        data.results.bindings.length
      );
    });
};

query("01");
