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

const getCityCodes = async (prefCode) => {
  const query1 = encodeURIComponent(`${PREFIXES}
    SELECT ?code WHERE {
      sac:C${prefCode}000 sacs:latestCode ?code .
    } LIMIT 1
  `);
  const url1 = `${endpoint}?query=${query1}`;

  const prefCodeData = await fetch(url1, {
    // [IMPORTANT] 統計LOD のコンテントネゴシエーションのバグに見える
    // Accept ヘッダなしの場合は JSON を返却し、 Accept ヘッダありの場合はその値がなんであっても XML が返却される
    // headers: { Accept: "application/json" },
  }).then((res) => res.json());

  const latestPrefCodeUri = prefCodeData.results.bindings[0].code.value;

  const cityCodeUriList = [];
  let cityCodes = [];
  do {
    const query2 = encodeURIComponent(`${PREFIXES}
      SELECT ?p ?cityCode WHERE {
          <${latestPrefCodeUri}> ?p ?cityCode .
      } LIMIT 1000
    `);
    const url2 = `${endpoint}?query=${query2}`;
    const cityCodesData = await fetch(url2).then((res) => res.json());
    cityCodes = cityCodesData.results.bindings.map(
      (binding) => binding.cityCode.value
    );
    cityCodeUriList.push(...cityCodes);
  } while (cityCodes.length === 1000);

  console.log(prefCode, cityCodeUriList);
};

for (let index = 1; index < 47; index++) {
  const prefCode = index.toString().padStart(2, "0");
  getCityCodes(prefCode);
}
