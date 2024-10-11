import { writeFile } from "fs/promises"

const fetchList = async ({
  areaId,
  name,
}: {
  areaId: number
  name: string
}) => {
  const response = await fetch(
    "https://anno-poster-map.netlify.app/data/block/23-east.json"
  )
  const positionList: {
    area_id: number
    name: string
    lat: number
    long: number
    status: number
    note: null | string
  }[] = await response.json()
  const selectedPostionList = positionList.filter(
    ({ area_id }) => area_id == areaId
  )

  let results: { lat: number; long: number; address: string }[] = []
  for (const position of selectedPostionList) {
    const response = await fetch(
      `https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${position.lat}&lon=${position.long}`
    )
    const result: {
      results: {
        muniCd: string
        lv01Nm: string
      }
    } = await response.json()
    results = [
      ...results,
      {
        lat: position.lat,
        long: position.long,
        address: result.results.lv01Nm,
      },
    ]
  }
  await writeFile(
    `out/${name}.csv`,
    results
      .map(({ lat, long, address }) =>
        [
          address,
          lat,
          long,
          `"https://www.google.com/maps?q=${lat},${long}`,
        ].join(",")
      )
      .join("\n")
  )
  await writeFile(`out/${name}.json`, JSON.stringify(results))
}

;(async () => {
  await fetchList({ areaId: 2, name: "sumida" })
  await fetchList({ areaId: 5, name: "edoagwa" })
})()
