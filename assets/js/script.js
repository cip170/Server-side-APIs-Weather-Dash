var APIKey = "3be65c41f433942560887b079237f6e8"


fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=51&lon=0&appid=${APIKey}`)
    .then((result) => {
        return result.json()
    }).then(function (data) {
        console.log(data)
    }).catch((err) => {
        console.log(err)
    })