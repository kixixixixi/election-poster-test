import { writeFile } from "fs/promises"

const fetchList = async () => {
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

  const sumidaPositionList = positionList.filter(({ area_id }) => area_id == 2)
  const result = await Promise.all(
    sumidaPositionList.map(async (position) => {
      const response = await fetch(
        `https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${position.lat}&lon=${position.long}`
      )
      const result: {
        results: {
          muniCd: string
          lv01Nm: string
        }
      } = await response.json()
      return {
        lat: position.lat,
        long: position.long,
        address: result.results.lv01Nm,
      }
    })
  )
  await writeFile(
    "out/sumida.csv",
    result
      .map(({ lat, long, address }) => [address, lat, long].join(","))
      .join("\n")
  )
}

fetchList()
